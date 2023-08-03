import { connect, io } from 'socket.io-client';
import { rotate } from '../entity/utils';
import { initBoard, useGameStore } from '../stores/store';
import { useRef } from 'react';

const apiURL_prefix = 'https://ryanmsg.myftp.biz:8080/';

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
    const { piecesInHand, checkmated, nickname, inactive, time } = playersData[(i+rotation)%4]
    players.push({facing: i, piecesInHand: convertToholding(piecesInHand), checkmated: checkmated, nickname: nickname, inactive: inactive, time: time})
  }
  return players
}

function convertToBoard(arr, rotation) {
  const length = 9;
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

function isSameBoard(prevBoard, nextBoard){
  const length = 9;
  for(let i = 0;i < length;i++){
    for(let j = 0;j < length;j++){
      if((prevBoard[i][j] && nextBoard[i][j]) && (prevBoard[i][j].id !== nextBoard[i][j].id || prevBoard[i][j].facing !== nextBoard[i][j].facing || prevBoard[i][j].promoted !== nextBoard[i][j].promoted)){
        return false;
      }
    }
  }
  return true;
}

const getSoundURL = (path) => {
  return new URL(`https://ht177970.github.io/shogi_v2/assets/sound/${path}Sound.mp3`, import.meta.url).href
}


const useSocket = (roomId, nickname, setAudio) => {
  const { viewer, setHistory, setPlayers, setCurrentMove, setCurrentPlayer, isPlayer } = useGameStore();

  const socketRef = useRef(null);
  const gameStarted = useRef(false);
  const token = useRef('');
  const YourTurnAudio = new Audio(getSoundURL('YourTurn'));
  const TimeAudio = new Audio(getSoundURL('time3'));

  function onBoardUpdate(res){
    gameStarted.current = true;
    setAudio(new Audio(getSoundURL(res[2])));
    setHistory((prevHistory) => {
      const nextBoard = convertToBoard(res[0], viewer.current.facing);
      if(isSameBoard(prevHistory[prevHistory.length - 1], nextBoard)){
        return [...prevHistory];
      }
      if(isPlayer.current && res[1] === viewer.current.facing){
        YourTurnAudio?.play();
      }
      if(prevHistory.length === 1 && prevHistory[0][8][4].id === 'None'){
        return [nextBoard];
      }
      return [...prevHistory, nextBoard];
    });
    setCurrentPlayer({facing: (res[1] - viewer.current.facing + 4) % 4});
  }

  function onRoomUpdate(res){
    setPlayers(convertToPlayers(res[0], viewer.current.facing));
    const { time } = res[0][viewer.current.facing]
    if(time <= 3){
      TimeAudio?.play();
    }
  }

  function onFirstUpdate(res){
    viewer.current.facing = res[0];
    isPlayer.current = res[1];
    token.current = res[2];
  }

  function connect(){
    socketRef.current = io(apiURL_prefix + roomId);
    socketRef.current.on('boardUpdate', onBoardUpdate);
    socketRef.current.on('firstUpdate', onFirstUpdate);
    socketRef.current.on('roomUpdate', onRoomUpdate);
  }

  function initializeSocket() {
    setCurrentMove(0);
    setHistory([initBoard()]);
    connect();
    socketRef.current.emit('join', [nickname]);
  }

  function move(origin, destination, promotion) {
    socketRef.current.emit('move', [
      rotate(origin, [4, 4], viewer.current.facing),
      rotate(destination, [4, 4], viewer.current.facing),
      promotion
    ]);
  }

  function drop(destination, pieceID) {
    socketRef.current.emit('drop', [
      rotate(destination, [4, 4], viewer.current.facing),
      pieceID
    ]);
  }

  function inactive(){
    socketRef.current.emit('inactive');
  }

  function reconnect(){
    connect();
    if(!isPlayer.current){
      socketRef.current.emit('join', [nickname]);
    }
    else{
      socketRef.current.emit('rejoin', [nickname, token.current]);
    }
  }

  function disconnect(){
    socketRef.current.disconnect();
  }

  function leaveRoom(){
    socketRef.current.emit('leave');
    disconnect();
  }

  return { gameStarted, socket: socketRef.current, setup: initializeSocket, move, drop, reconnect, disconnect, inactive, leaveRoom };
};

export default useSocket;