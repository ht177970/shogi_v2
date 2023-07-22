import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import Board from './Board';
import { initBoard, useGameStore } from './stores/store';
import useSocket from './executor/socket';
import './Game.css'
import '../index.css';
import InfoBar from './InfoBar';
import Dashboard from './Dashboard';

function Game({roomId, nickname}){
  const [audio, setAudio] = useState(null);
  const { history, currentMove, setCurrentMove, deselect } = useGameStore();
  const { setup, move, drop, reconnect, disconnect } = useSocket(roomId, nickname, setAudio);
  const scroller = useRef(null);
  const board = useRef(null);
  let currentBoard = history[currentMove];
  if(!currentBoard){
    currentBoard = initBoard();
  }
  const movable = (currentMove === history.length - 1);

  const appState = useRef(AppState.currentState);

  const _handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        reconnect();
      }else{
        disconnect();
      }
      appState.current = nextAppState;
      console.log("AppState", appState.current);
  }

  useEffect (() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    setup();
  }, []);

  function jumpTo(move){
    deselect();
    setCurrentMove(move);
  }

  useEffect(() =>{
    function onWheel(event){
      event.preventDefault();
      if (event.wheelDelta > 0) {
        if(currentMove - 1 >= 0){
          deselect();
          setCurrentMove(currentMove - 1);
        }
      } else {
        deselect();
        if(currentMove + 1 < history.length){
          setCurrentMove(currentMove + 1);
        }
        else{
          setCurrentMove(history.length - 1);
        }
      }
    }
    board.current?.addEventListener('wheel', onWheel, {passive: false});
  }, [currentMove, history, setCurrentMove, deselect]);

  useEffect(() => {
    if(currentMove === history.length - 2){
      setCurrentMove(currentMove + 1);
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
    audio?.play();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const moves = history.map((board, move) => {
    return(
      <li className='movement' onClick={() => jumpTo(move)}
      style={{backgroundColor: move === currentMove && 'aqua'}} key={move}>
        {"第" + move + "手"}
      </li>
    )
  });

  const infos = []
  for(let i = 0;i < 4;i++){
    infos.push(
      <InfoBar key={i} facing={i}/>
    )
  }

  //test for board first
  //it should be lobby at done
  return(
    <>
      <div className='background' ref={board}>
        <Board currentBoard={currentBoard} movable={movable} move={move} drop={drop}/>
      </div>
      <div className='piece-moves' ref={scroller}>
        <ul className='move-list'>
          {moves}
        </ul>
      </div>
      <div>
        {infos}
      </div>
      <Dashboard/>
    </>
  );
}
//<div className='button' onClick={() => setup()}>連接至Server</div>
export default Game;