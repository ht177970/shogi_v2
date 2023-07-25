import { useState } from 'react';
import { useGameStore } from './stores/store';
import { canPromote, canSelect } from './validator';
import Square from './Square';
import Piece from './Piece';
import './Dashboard.css';

function PromoteDialog({ facing, pos, promotionDialog, setPromotionDialog, move }){
  const { selection, deselect } = useGameStore();

  const confirm = (choice) => {
    move([selection.x, selection.y], [pos.x, pos.y], choice);
    setPromotionDialog({x: -1, y: -1, facing: -1, id: 'None'});
    deselect();
  }

  return(
    <div className='bg-white absolute w-full h-[200%] top-0 origin-[50%_25%] flex flex-col rounded-[1vmin] z-30 promotionDialog' style={{transform: 'rotate(' + facing * 90 + 'deg)'}}>
      <Piece selected={false} piece={{id: promotionDialog.id, facing: facing, promoted: true}} onClick={() => {confirm(true);}}/>
      <Piece selected={false} piece={{id: promotionDialog.id, facing: facing, promoted: false}} onClick={() => {confirm(false);}}/>
    </div>
  )
}

function Hint({onHintClick}){
  return(
    <div className='absolute w-full h-full flex top-0 z-10' onClick={onHintClick}>
      <div className='m-auto top-1/2 w-[20%] h-[20%] rounded-[50%] bg-slate-500 bg-opacity-70'/>
    </div>
  )
}

function Board({currentBoard, movable, move, drop}){
  const [ promotionDialog, setPromotionDialog ] = useState({x: -1, y: -1, facing: -1, id: 'None'});
  const { selection, select, deselect, isSelected, currentPlayer, hint, isPlayer } = useGameStore();

  function handleClick(pos){
    if(!movable || !isPlayer.current){
      return;
    }
    if (!isSelected() && canSelect(currentBoard[pos.x][pos.y], currentPlayer))
        select(pos.x, pos.y, null)
    else
        deselect()
    /*if(promotionDialog.id !== 'None'){
      setPromotionDialog({x: -1, y: -1, facing: -1, id: 'None'});
      deselect();
      return;
    }
    setPromotionDialog({x: -1, y: -1, facing: -1, id: 'None'});
    if(isSelected()){
      if(selection.dropPiece){
        drop([pos.x, pos.y], selection.dropPiece.id);
      }
      else{
        if(canPromote([pos.x, pos.y], currentBoard, selection)){
          setPromotionDialog({x: pos.x, y: pos.y, facing: currentBoard[selection.x][selection.y].facing, id: currentBoard[selection.x][selection.y].id})
          return;
        }
        else{
          move([selection.x, selection.y], [pos.x, pos.y], false);
        }
      }
      deselect();
    }
    else{
      if(canSelect(currentBoard[pos.x][pos.y], currentPlayer)){
        select(pos.x, pos.y, null);
      }
    }*/
  }

  function handleHintClick(x, y){
    setPromotionDialog({x: -1, y: -1, facing: -1, id: 'None'});
    if (selection.dropPiece)
        drop([x, y], selection.dropPiece.id);
    else if (canPromote([x, y], currentBoard, selection)) {
        setPromotionDialog({x: x, y: y, facing: currentBoard[selection.x][selection.y].facing, id: currentBoard[selection.x][selection.y].id});
        return
    } else
        move([selection.x, selection.y], [x, y], false);
    deselect()
  }

  let rows = [];
  for(let i = 0;i < 9;i++){
    let tmp = [];
    for(let j = 0;j < 9;j++){
      const pos = {x: i, y: j}
      let isSelected = false;
      let child = [];
      if(selection.dropPiece === null && selection.x === pos.x && selection.y === pos.y)
        isSelected = true;
      child.push(
        <Square selected={isSelected} key={'sq' + i + j}
        piece={currentBoard[i][j]} onSquareClick={() => {handleClick(pos);}}/>
      )
      if(i === promotionDialog.x && j === promotionDialog.y){
        child.push(
          <PromoteDialog facing={promotionDialog.facing} key={'prom' + i + j}
          pos={{x: i, y: j}} promotionDialog={promotionDialog} setPromotionDialog={setPromotionDialog}
          move={move}/>
        )
      }
      if(hint[i][j]){
        child.push(
          <Hint onHintClick={() => {handleHintClick(i, j);}} key={'hint' + i + j}/>
        )
      }
      tmp.push(
        <div className='relative' key={'pos' + i + j}>
          {child}
        </div>
      )
    }
    rows.push(
      <div className='grid grid-cols-9' key={'row' + i}>
        {tmp}
      </div>
    )
  }

  return(
    <div className='grid content'>
      {rows}
    </div>
  );
}

export default Board;