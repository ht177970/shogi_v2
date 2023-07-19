const size = {
  'p': 0.8,
  's': 0.9,
  'g': 0.9,
  'k': 1,
  'r': 1
}

const imagePath = [
"pieceForward.png",
"pieceRight.png",
"pieceBackward.png",
"pieceLeft.png"
]

const getAssetURL = (path) => {
  //return new URL(`../../assets/appearance/piece/${path}`, import.meta.url).href
  return new URL(`http://localhost:8080/assets/appearance/piece/${path}`, import.meta.url).href
}

const getMask = (piece) => {
  const name = piece.id + (piece.promoted ? '1' : '0');
  const url = getAssetURL(`text/hai-yan/${name}.svg`)
  return `url(${url}) no-repeat center / contain`
}

function Piece({selected, piece}){
  return(
    <div className='w-full h-full z-10' style={{transform: 'rotate(' + 90 * piece.facing + 'deg)'}}>
      <div className={'transition-all h-full' + (selected ? ' selected' : '')}>
        <div className='aspect-square z-10 relative w-full h-full flex select-none' style={{transform: 'scale(' + size[piece.id] + ')'}}>
          <div className='max-w-[50%] h-[70%] z-10 m-auto aspect-[3/4]'
          style={{
            height: size[piece.id] * 70 + "%",
            backgroundColor: piece.promoted ? '#ff0000' : '#000000',
            mask: getMask(piece), WebkitMask: getMask(piece)
          }}/>
          <img alt='' draggable={false} className='absolute w-full h-full' src={getAssetURL('body/' + imagePath[piece.facing])}/>
        </div>
      </div>
    </div>
  )
}

export default Piece