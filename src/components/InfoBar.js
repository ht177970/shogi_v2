import { useGameStore } from "./stores/store";
import PieceStand from "./PieceStand";

function InfoBar({facing}){
  const { currentPlayer, players } = useGameStore();

  function toTimeString(second){
    let ret = '';
    const m = ~~(second / 60);
    if(m < 10)
      ret += '0';
    ret += m + ':';
    const s = second % 60;
    if(s < 10)
      ret += '0';
    ret += s;
    return ret;
  }

  return(
    <div className="flex min-w-[30vmin] border-[0.3vmin] h-[10vmin]">
      <div className={`bg-gray-300 flex-grow mr-[2vmin] ${players[facing].inactive ? 'opacity-60' : ''}`}>
        {players[facing].nickname} {currentPlayer.facing === facing ? '<<' : ''}
      </div>
      <div className="bg-green-300 mr-[2vmin]">
        {toTimeString(players[facing].time)}
      </div>
      <PieceStand facing={facing}/>
    </div>
  )
}

export default InfoBar;