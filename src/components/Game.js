import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import Board from './Board';
import { useGameStore } from './stores/store';
import useSocket from './executor/socket';
import './Game.css'
import '../index.css';
import InfoBar from './InfoBar';
import Dashboard from './Dashboard';

function Game({roomId, nickname, setUrl, rejoin}){
  const muted = useRef(true);
  const { history, currentMove, setCurrentMove, isPlayer, historyPlayers, deselect } = useGameStore();
  const { gameStarted, token, setup, move, drop, reconnect, disconnect, inactive, leaveRoom } = useSocket(roomId, nickname, muted);
  const scroller = useRef(null);
  const board = useRef(null);
  const currentBoard = history[currentMove >= history.length ? history.length - 1 : currentMove];

  const movable = (currentMove === history.length - 1);

  const appState = useRef(AppState.currentState);
  const received = useRef(1);

  function handleAppStateChange(nextAppState){
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        disconnect();
        reconnect(received.current);
      }else{
        inactive();
      }
      appState.current = nextAppState;
  }

  function jumpTo(move){
    deselect();
    setCurrentMove(move);
  }

  function leave(){

    function isGameEnded(){
      const players = historyPlayers.slice(-1)[0];
      let cu = 0;
      for(const i in players){
        if(players[i].checkmated){
          cu++;
        }
      }
      return cu === 3;
    }

    if(!gameStarted.current || !isPlayer.current || isGameEnded()){
      localStorage.setItem('roomId', null);
      localStorage.setItem('token', null);
      leaveRoom();
      setUrl(null);
    }
  }

  useEffect(() => {
    function onWheel(event){
      event.preventDefault();
      if (event.wheelDelta > 0) {
        setCurrentMove((prev) => {
          if(prev - 1 >= 0)
            return prev - 1;
          return prev;
        });
      } else {
        setCurrentMove((prev) => prev + 1);
      }
    }
    if(rejoin){
      muted.current = true;
      token.current = localStorage.getItem('token');
      reconnect(0);
      setTimeout(() => {
        muted.current = false;
        setCurrentMove(1000);
        scroller.current.scrollTop = scroller.current.scrollHeight;
      }, 100);
    }
    else{
      muted.current = false;
      setup();
    }
    AppState.addEventListener("change", handleAppStateChange);
    board.current.addEventListener('wheel', onWheel, {passive: false});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if(currentMove >= history.length){
      setCurrentMove(history.length - 1);
      return;
    }
    if(currentMove < history.length - 1){
      deselect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMove]);

  useEffect(() => {
    if(currentMove === history.length - 2){
      setCurrentMove(currentMove + 1);
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
    received.current = history.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const infos = [];
  for(let i = 0;i < 4;i++){
    infos.push(
      <InfoBar key={i} facing={i}/>
    )
  }

  return(
    <>
      <div className='background' ref={board}>
        <Board currentBoard={currentBoard} movable={movable} move={move} drop={drop}/>
      </div>
      <div className='piece-moves' ref={scroller}>
        <ul className='move-list'>
          {
            history.map((board, move) => {
              return(
                <li className='movement' onClick={() => {jumpTo(move);}}
                style={{backgroundColor: move === currentMove && 'aqua'}} key={move}>
                  {"第" + move + "手"}
                </li>
              )
            })
          }
        </ul>
      </div>
      <div>
        {infos}
      </div>
      <Dashboard/>
      <div className='button' onClick={() => {leave();}}>離開房間</div>
    </>
  );
}
export default Game;