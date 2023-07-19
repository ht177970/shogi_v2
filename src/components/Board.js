import { useGameStore } from "../stores/store";
import Square from "./Square"

function Board({currentBoard, onPlay}){
  const { selection } = useGameStore();

  function handleClick(pos){
    /*if(currentBoard[pos.x][pos.y].id === 'None'){
    return;
    }*/
    /*if(selected){
      if(selected.x !== pos.x || selected.y !== pos.y){
        Move(selected, pos);
      }
    setSelected(null);
    }
    else{
    setSelected(pos);
    }*/
    onPlay(pos);
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