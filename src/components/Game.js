import { useEffect, useRef } from 'react';
import Board from './Board';
import { useGameStore } from '../stores/store';
import useSocket from '../executor/socket';
import './Game.css'
import '../index.css';
import InfoBar from './InfoBar';

function Game(){
  const { history, currentMove, setCurrentMove, selection, select, deselect, isSelected } = useGameStore();
  const { Move, Drop, Setup } = useSocket();
  const scroller = useRef(null);
  const board = useRef(null);
  const currentBoard = history[currentMove];

  function handleClick(pos){
    if(currentMove !== history.length - 1){
      return;
    }
    if(isSelected()){
      if(selection.dropPiece){
        Drop([pos.x, pos.y], selection.dropPiece.id);
      }
      else{
        Move([selection.x, selection.y], [pos.x, pos.y], false);
      }
      deselect();
    }
    else{
      select(pos.x, pos.y, null);
    }
    //Move([from.x, from.y], [to.x, to.y], false);
    //setHistory([...history.slice(0, currentMove + 1), nextBoard])
    //setCurrentMove(currentMove + 1)
  }

  function jumpTo(move){
    setCurrentMove(move);
  }

  function setup(){
    Setup();
  }

  useEffect(() =>{
    function onWheel(event){
      event.preventDefault();
      if (event.wheelDelta > 0) {
        if(currentMove - 1 >= 0){
          setCurrentMove(currentMove - 1);
        }
      } else {
        if(currentMove + 1 < history.length){
          setCurrentMove(currentMove + 1);
        }
      }
      return false;
    }
    board.current?.addEventListener('wheel', onWheel, {passive: false});
  }, [currentMove, history.length, setCurrentMove]);

  useEffect(() => {
    if(currentMove === history.length - 2){
      setCurrentMove(currentMove + 1);
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
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
        <Board currentBoard={currentBoard} onPlay={handleClick}/>
      </div>
      <div className='piece-moves' ref={scroller}>
        <ul className='move-list'>
          {moves}
        </ul>
      </div>
      <div className='button' onClick={() => setup()}>連接至Server</div>
      {infos}
    </>
  );
}

export default Game;