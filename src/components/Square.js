import Piece from "./Piece";

function Square({selected, piece, onSquareClick}){
  let text = ''
  if(piece.id !== 'None'){
    text = <Piece selected={selected} piece={piece} onClick={() => {}}/>
  }
  return(
    <div className='relative select-none w-full h-full' onClick={onSquareClick}>
      <div className='absolute w-full h-full border-[0.1vmin] bg-opacity-[0.1]' style={{borderColor:'#000000', backgroundColor: (selected ? '#ffffff4D' : '')}}>
      </div>
      <div className='absolute w-full h-full z-10' style={{transform: 'rotate(' + 90 * piece.facing + 'deg)'}}>
        {text}
      </div>
    </div>
  )
}

export default Square;