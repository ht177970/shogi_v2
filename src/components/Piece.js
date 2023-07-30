import { useConfigStore } from "./stores/store"

const size = {
  'p': 0.8,
  's': 0.9,
  'g': 0.9,
  'k': 1,
  'r': 1,
  'dead': 1
}

const imagePath = [
"pieceForward.png",
"pieceRight.png",
"pieceBackward.png",
"pieceLeft.png"
]

const getAssetURL = (path) => {
  return new URL(`https://ht177970.github.io/shogi_v2/assets/appearance/piece/${path}`, import.meta.url).href
}

const GetMask = (piece) => {
  const { font } = useConfigStore();
  const name = piece.id + (piece.promoted ? '1' : '0');
  const url = getAssetURL(`text/${font}/${name}.svg`)
  return `url(${url}) no-repeat center / contain`
}

function Piece({selected, piece, onClick}){
  let mask =
    <div className='max-w-[50%] h-[70%] z-10 m-auto aspect-[3/4]'
    style={{
      height: size[piece.id] * 70 + "%",
      backgroundColor: piece.promoted ? '#ff0000' : '#000000',
      mask: GetMask(piece), WebkitMask: GetMask(piece)
    }}/>
  if(piece.id === 'dead'){
    mask = '';
  }
  return(
    <div className={'transition-all h-full' + (selected ? ' selected' : '')} onClick={() => {onClick();}}>
      <div className='aspect-square relative w-full h-full flex select-none' style={{transform: 'scale(' + size[piece.id] + ')'}}>
        {mask}
        <img alt='' draggable={false} className='absolute w-full h-full' src={getAssetURL('body/' + imagePath[piece.facing])}/>
      </div>
    </div>
  )
}

export default Piece