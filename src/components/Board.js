import { useGameStore } from "../stores/store";
import Square from "./Square"

function Board({currentBoard, movable, Move, Drop}){
  const { selection, select, deselect, isSelected } = useGameStore();

  function handleClick(pos){
    if(!movable){
      return;
    }
    if(isSelected()){
      if(selection.dropPiece){
        Drop([pos.x, pos.y], selection.dropPiece.id);
      }
      else{
        if(canPromote()){
          
        }
        else{
          Move([selection.x, selection.y], [pos.x, pos.y], false);
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
    let tmp = [];
    for(let j = 0;j < 9;j++){
    const pos = {x: i, y: j}
    let isSelected = false
    if(selection.dropPiece === null && selection.x === pos.x && selection.y === pos.y)
      isSelected = true;
    tmp.push(
      <Square selected={isSelected}
      piece={currentBoard[i][j]} onSquareClick={() => {handleClick(pos);}} key={'pos' + i + j}/>
    );
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