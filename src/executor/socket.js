import { io } from 'socket.io-client';
import { rotate } from '../entity/utils';
import { useGameStore } from '../stores/store'
import { useRef } from 'react';

const apiURL = 'https://yonin-shogi-r.ht177970.repl.co/game';

function convertToPiece(pieceData, rotation) {
  const { id, facing, promoted } = pieceData;
  if (id === -1 || facing === -1) return {id: 'None', facing: -1, promoted: false};
  return {id: id, facing: facing, promoted: promoted};
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
    const { piecesInHand, checkmated } = playersData[(i+rotation)%4]
    players.push({facing: i, pieceInHand: convertToholding(piecesInHand), checkmated: checkmated})
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


const useSocket = () => {
  const { viewer, setHistory, setPlayers, setCurrentMove, setCurrentPlayer } = useGameStore();

  // 使用 useRef 保持 socket 和 Setup 的持久性
  const socketRef = useRef(null);
  const setupRef = useRef(null);
  const first = useRef(true);

  // 初始化 socket 和监听事件的 Setup 函数
  function initializeSocket() {
    first.current = true;
    if(socketRef.current !== null){
      socketRef.current.off('update');
    }
    socketRef.current = io(apiURL);
    setupRef.current = () => {
      setCurrentMove(0);
      setHistory((prevHistory) => [prevHistory[0]]);
      socketRef.current.on('update', (res) => {
        // 注意这里使用函数形式来更新 history，以保证正确的顺序和更新
        setHistory((prevHistory) => [...prevHistory, convertToBoard(res[0], viewer.current.facing)]);
        setPlayers(convertToPlayers(res[1], viewer.current.facing));
        setCurrentPlayer({facing: (res[2] - viewer.current.facing + 4) % 4});
      });
      socketRef.current.emit('join');
    };
    setupRef.current(); // 调用 Setup 函数开始监听
  }

  function Move(origin, destination, promotion) {
    socketRef.current.emit('move', [
      rotate(origin, [4, 4], viewer.facing),
      rotate(destination, [4, 4], viewer.facing),
      promotion,
    ]);
  }

  function Drop(destination, pieceID) {
    socketRef.current.emit('drop', [
      rotate(destination, [4, 4], viewer.facing),
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