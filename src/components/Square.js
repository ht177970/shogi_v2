import Piece from "./Piece";

function Square({selected, piece, onSquareClick}){
  return(
    <div className='relative select-none w-full h-full' onClick={onSquareClick}>
      <div className='absolute w-full h-full border-[0.1vmin] bg-opacity-[0.1]' style={{borderColor:'#000000', backgroundColor: (selected ? '#ffffff4D' : '')}}>
      </div>
      <div className='absolute w-full h-full z-10' style={{transform: `rotate(${piece.facing * 90}deg)`}}>
        {piece.id !== 'None' && <Piece selected={selected} piece={piece} onClick={() => {}}/>}
      </div>
    </div>
  )
}

export default Square;