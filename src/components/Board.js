import { useState } from 'react';
import { useGameStore } from './stores/store';
import { canPromote } from './validator';
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
    <div className='bg-white absolute w-full h-[200%] top-0 origin-[50%_25%] flex flex-col rounded-[1vmin] z-30 promotionDialog' style={{transform: 'rotate(' + facing + 'deg)'}}>
      <Piece selected={false} piece={{id: promotionDialog.id, facing: facing, promoted: true}} onClick={() => {confirm(true);}}/>
      <Piece selected={false} piece={{id: promotionDialog.id, facing: facing, promoted: false}} onClick={() => {confirm(false);}}/>
    </div>
  )
}

function Board({currentBoard, movable, move, drop}){
  const [ promotionDialog, setPromotionDialog ] = useState({x: -1, y: -1, facing: -1, id: 'None'});
  const { selection, select, deselect, isSelected, currentPlayer } = useGameStore();

  function handleClick(pos){
    if(!movable){
      return;
    }
    if(isSelected()){
      if(selection.dropPiece){
        drop([pos.x, pos.y], selection.dropPiece.id);
      }
      else{
        if(canPromote([pos.x, pos.y], currentBoard, selection, currentPlayer)){
          setPromotionDialog({x: pos.x, y: pos.y, facing: currentPlayer.facing, id: currentBoard[selection.x][selection.y].id})
          return;
        }
        else{
          move([selection.x, selection.y], [pos.x, pos.y], false);
        }
      }
      deselect();
    }
    else{
      select(pos.x, pos.y, null);
    }
  }

  let rows = [];
  for(let i = 0;i < 9;i++){
    let tmp = []
    for(let j = 0;j < 9;j++){
      const pos = {x: i, y: j}
      let isSelected = false
      if(selection.dropPiece === null && selection.x === pos.x && selection.y === pos.y)
        isSelected = true;
      if(i === promotionDialog.x && j === promotionDialog.y){
        tmp.push(
          <div className='relative'>
            <Square selected={isSelected}
            piece={currentBoard[i][j]} onSquareClick={() => {handleClick(pos);}} key={'pos' + i + j}/>
            <PromoteDialog facing={promotionDialog.facing}
            pos={{x: i, y: j}} promotionDialog={promotionDialog} setPromotionDialog={setPromotionDialog}
            move={move}/>
          </div>
        )
      }
      else{
        tmp.push(
          <div className='relative'>
            <Square selected={isSelected}
            piece={currentBoard[i][j]} onSquareClick={() => {handleClick(pos);}} key={'pos' + i + j}/>
          </div>
        )
      }
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