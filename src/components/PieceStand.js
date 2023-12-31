import { useGameStore } from "./stores/store";
import Piece from "./Piece";

function PieceStand({player}){

  const { selection, isPlayer, isSelected, select, deselect } = useGameStore();

  function handleClick(id, number){
    if(!isPlayer){
      return;
    }
    if(isSelected()){
      deselect();
    }
    if(number > 0 && player.turn){
      select(-1, -1, {id: id, facing: player.facing});
    }
  }

  let content = []
  for(const key in player.piecesInHand){
    const number = player.piecesInHand[key];
    content.push(
      <div key={key} className={`relative w-full h-full ${number === 0 ? 'opacity-60' : ''}`} onClick={() => {handleClick(key, number);}}>
        <div className='absolute text-[3vmin] shadow-white top-0 right-[10%] z-20'
        style={{textShadow:'-1px -1px 0 #ffffff, 1px -1px 0 #ffffff, -1px 1px 0 #ffffff, 1px 1px 0 #ffffff'}}>
          { number }
        </div>
        <Piece selected={selection.dropPiece && selection.dropPiece.id === key && selection.dropPiece.facing === player.facing }
        piece={{id: key, facing: player.facing, promoted: false}}
        onClick={() => {}}></Piece>
      </div>
    )
  }

  return(
    <div className="bg-red-400 flex flex-row h-full">
      {content}
    </div>
  )
}

export default PieceStand;