import { useGameStore } from "./stores/store";
import PieceStand from "./PieceStand";

function InfoBar({facing}){
  const { currentMove, socketPlayers, historyPlayers } = useGameStore();
  const players = historyPlayers[currentMove >= historyPlayers.length ? historyPlayers.length - 1 : currentMove];

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
      <div className={`bg-gray-300 flex-grow mr-[2vmin] ${socketPlayers[facing].inactive ? 'opacity-60' : ''}`}>
        {socketPlayers[facing].nickname} {players[facing].turn ? '<<' : ''}
      </div>
      <div className="bg-green-300 mr-[2vmin]">
        {toTimeString(socketPlayers[facing].time)}
      </div>
      <PieceStand player={players[facing]}/>
    </div>
  )
}

export default InfoBar;