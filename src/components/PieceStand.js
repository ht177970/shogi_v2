import { useGameStore } from "./stores/store";
import Piece from "./Piece";

function PieceStand({facing}){

  const { players, selection, isSelected, select, deselect } = useGameStore();

  function handleClick(id, number){
    if(isSelected()){
      deselect();
    }
    if(number > 0){
      select(-1, -1, {id: id, facing: facing});
    }
  }

  let content = []
  for(const key in players[facing].pieceInHand){
    const number = players[facing].pieceInHand[key];
    content.push(
      <div key={key} className={'relative w-full h-full' + (number === 0 ? ' opacity-60' : '')} onClick={() => {handleClick(key, number)}}>
        <div className='absolute text-[3vmin] shadow-white top-0 right-[10%] z-20'
        style={{textShadow:'-1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff'}}>
          { number }
        </div>
        <Piece selected={selection.dropPiece && selection.dropPiece.id === key && selection.dropPiece.facing === facing }
        piece={{id: key, facing: facing, promoted: false}}></Piece>
      </div>
    )
  }
  return(
    <div className="w-fit bg-red-400 flex flex-row">
      {content}
    </div>
  )
}

export default PieceStand;