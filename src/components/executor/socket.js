import { io } from 'socket.io-client';
import { rotate } from '../entity/utils';
import { initBoard, useGameStore } from '../stores/store';
import { useRef } from 'react';

const apiURL_prefix = 'https://ryanmsg.myftp.biz2:8080/';

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
    const { piecesInHand, checkmated, turn } = playersData[(i+rotation)%4]
    players.push({facing: i, piecesInHand: convertToholding(piecesInHand), checkmated: checkmated, turn: turn})
  }
  return players
}

function convertToSocketPlayers(playersData, rotation) {
  const players = []
  for (let i = 0; i < 4; ++i){
    const { nickname, inactive, time } = playersData[(i+rotation)%4]
    players.push({facing: i, nickname: nickname, inactive: inactive, time: time})
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

function isSamePlayers(prevPlayers, nextPlayers){
  const length = 4;
  for(let i = 0;i < length;i++){
    if(prevPlayers[i] && nextPlayers[i] && prevPlayers[i].turn !== nextPlayers[i].turn){
      return false;
    }
  }
  return true;
}

const getSoundURL = (path) => {
  return new URL(`https://ht177970.github.io/shogi_v2/assets/sound/${path}Sound.mp3`, import.meta.url).href
}


const useSocket = (roomId, nickname, muted) => {
  const { viewer, setHistory, setHistoryPlayers, setSocketPlayers, setCurrentMove, isPlayer } = useGameStore();

  const socketRef = useRef(null);
  const gameStarted = useRef(false);
  const isMyTurn = useRef(false);
  const token = useRef('');
  const yourTurnAudio = new Audio(getSoundURL('YourTurn'));
  const timeAudio = new Audio(getSoundURL('time3'));
  const sounds = {'move': new Audio(getSoundURL('move')), 'drop': new Audio(getSoundURL('drop'))};

  function onBoardUpdate(res){
    gameStarted.current = true;
    //setAudio(sounds[res[2]]);
    setHistory((prevHistory) => {
      const nextBoard = convertToBoard(res[0], viewer.current.facing);
      /*if(isSameBoard(prevHistory[prevHistory.length - 1], nextBoard)){
        return [...prevHistory];
      }*/
      if(!muted.current)
        sounds[res[1]]?.play();
      if(prevHistory.length === 1 && prevHistory[0][8][4].id === 'None'){
        return [nextBoard];
      }
      return [...prevHistory, nextBoard];
    });
    setHistoryPlayers((prevPlayers) => {
      const nextPlayers = convertToPlayers(res[2], viewer.current.facing);
      isMyTurn.current = false;
      if(nextPlayers[0].turn){
        if(!muted.current)
          yourTurnAudio?.play();
        isMyTurn.current = true;
      }
      if('first' in prevPlayers[0][0])
        return [nextPlayers];
      /*if(isSamePlayers(prevPlayers[prevPlayers.length - 1], nextPlayers)){
        return [...prevPlayers];
      }*/
      return [...prevPlayers, nextPlayers];
    });
  }

  function onRoomUpdate(res){
    setSocketPlayers(convertToSocketPlayers(res[0], viewer.current.facing));
    const { time } = res[0][viewer.current.facing]
    if(time <= 3 && isMyTurn.current){
      if(!muted.current)
        timeAudio?.play();
    }
  }

  function onFirstUpdate(res){
    viewer.current.facing = res[0];
    isPlayer.current = res[1] === 1;
    token.current = res[2];
    localStorage.setItem('token', res[2]);
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
    socketRef.current.emit('join', [nickname, 0]);
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

  function reconnect(received){
    connect();
    if(!isPlayer.current){
      socketRef.current.emit('join', [nickname, received]);
    }
    else{
      console.log(nickname);
      socketRef.current.emit('rejoin', [nickname, token.current, received]);
    }
  }

  function disconnect(){
    socketRef.current.disconnect();
  }

  function leaveRoom(){
    socketRef.current.emit('leave');
    disconnect();
  }

  return { gameStarted, token, socket: socketRef.current, setup: initializeSocket, move, drop, reconnect, disconnect, inactive, leaveRoom };
};

export default useSocket;