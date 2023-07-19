import Piece from "./Piece";

function Square({selected, piece, onSquareClick}){
  let text = ''
  if(piece.id !== 'None'){
    text = <Piece selected={selected} piece={piece}/>
  }
  return(
    <div className='square' onClick={onSquareClick}>
      <div className='absolute w-full h-full bg-opacity-[0.1]' style={{backgroundColor: (selected ? '#ffffff4D' : '')}}>
      </div>
      {text}
    </div>
  )
}

export default Square;