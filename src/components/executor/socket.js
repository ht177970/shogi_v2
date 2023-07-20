import { io } from 'socket.io-client';
import { rotate } from '../entity/utils';
import { initBoard, useGameStore } from '../stores/store';
import { useRef } from 'react';

const apiURL_prefix = 'https://yonin-shogi-r.ht177970.repl.co/';

function convertToPiece(pieceData, rotation) {
  const { id, facing, promoted } = pieceData;
  if (id === -1 || facing === -1) return {id: 'None', facing: -1, promoted: false};
  return {id: id, facing: (facing - rotation + 4) % 4, promoted: promoted};
}

function convertToPlayers(playersData, rotation) {

  function convertToholding(pieceDatas){
    let val = {};
    for(let i = 0;i < pieceDatas.length;i++){
      val[pieceDatas[i][0]] = pieceDatas[i][1];
    }
    return val;
  }

  const players = []
  for (let i = 0; i < 4; ++i){
    const { piecesInHand, checkmated, nickname } = playersData[(i+rotation)%4]
    players.push({facing: i, piecesInHand: convertToholding(piecesInHand), checkmated: checkmated, nickname: nickname})
  }
  return players
}

function convertToBoard(arr, rotation) {
  const length = 9; // Math.sqrt(arr.length)
  const board = [];

  for (let i = 0; i < length; i++) {
    const row = [];
    for (let j = 0; j < length; j++) {
      let index;
      if (rotation === 0) {
        index = i * length + j;
      } else if (rotation === 1) {
        index = length - 1 - i + j * length;
      } else if (rotation === 2) {
        index = (length - 1 - i) * length + (length - 1 - j);
      } else {
        index = i + (length - 1 - j) * length;
      }
      row.push(convertToPiece(arr[index], rotation));
    }
    board.push(row);
  }
  return board;
}


const useSocket = (roomId, nickname) => {
  const { viewer, setHistory, setPlayers, setCurrentMove, setCurrentPlayer, isPlayer } = useGameStore();

  // 使用 useRef 保持 socket 和 Setup 的持久性
  const socketRef = useRef(null);
  const setupRef = useRef(null);
  const first = useRef(true);

  // 初始化 socket 和监听事件的 Setup 函数
  function initializeSocket() {

    function onUpdate(res){
      // 注意这里使用函数形式来更新 history，以保证正确的顺序和更新
      setHistory((prevHistory) => {
        const nextBoard = convertToBoard(res[0], viewer.current.facing);
        if(prevHistory.length === 1 && prevHistory[0][8][4].id === 'None'){
          return [nextBoard];
        }
        return [...prevHistory, nextBoard];
      });
      setPlayers(convertToPlayers(res[1], viewer.current.facing));
      setCurrentPlayer({facing: (res[2] - viewer.current.facing + 4) % 4});
    }

    function onRoomUpdate(res){
      setPlayers(convertToPlayers(res[0], viewer.current.facing));
    }

    function onFirstUpdate(res){
      viewer.current.facing = res[0];
      isPlayer.current = res[1];
    }

    first.current = true;
    if(socketRef.current !== null){
      socketRef.current.off('update');
    }
    socketRef.current = io(apiURL_prefix + roomId);
    setupRef.current = () => {
      setCurrentMove(0);
      setHistory([initBoard()]);
      socketRef.current.on('update', onUpdate);
      socketRef.current.on('firstUpdate', onFirstUpdate);
      socketRef.current.on('roomUpdate', onRoomUpdate);
      socketRef.current.emit('join', [nickname]);
    };
    setupRef.current(); // 调用 Setup 函数开始监听
  }

  function Move(origin, destination, promotion) {
    socketRef.current.emit('move', [
      rotate(origin, [4, 4], viewer.current.facing),
      rotate(destination, [4, 4], viewer.current.facing),
      promotion,
    ]);
  }

  function Drop(destination, pieceID) {
    socketRef.current.emit('drop', [
      rotate(destination, [4, 4], viewer.current.facing),
      pieceID,
    ]);
  }

  return { socket: socketRef.current, Setup: initializeSocket, Move, Drop };
};

export default useSocket;

/*
[
  [Chess ... {type:Number, owner:Number}],
  [Player ... { id:Number, piecesInHand:[count_type_0, count_type_1 ...] } ]
]
*/