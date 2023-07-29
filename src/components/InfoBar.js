import { useGameStore } from "./stores/store";
import PieceStand from "./PieceStand";

function InfoBar({facing}){
  const { currentPlayer, players } = useGameStore();
  return(
    <div className="flex min-w-[30vmin] border-[0.3vmin] h-[10vmin]">
      <div className={"bg-gray-300 flex-grow mr-[2vmin]" + (players[facing].inactive ? ' opacity-60' : '')}>{players[facing].nickname} {currentPlayer.facing === facing ?'<<':''}</div>
      <div className="bg-green-300 mr-[2vmin]">179:59</div>
      <PieceStand facing={facing}/>
    </div>
  )
}

export default InfoBar;