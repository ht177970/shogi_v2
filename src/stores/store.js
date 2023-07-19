import { rotate } from '../entity/utils';
import { createContext, useContext, useRef, useState } from 'react';

function initBoard(){
  const board = Array(9);
  for(let i = 0;i < 9;i++){
    board[i] = Array(9)
    for(let j = 0;j < 9;j++){
    board[i][j] = {id: 'None', facing: -1, promoted: false};
    }
  }
  //init board
  /*[
    [[6, 4], 'p'],
    [[7, 3], 'p'],
    [[7, 4], 'r'],
    [[7, 5], 'p'],
    [[8, 2], 's'],
    [[8, 3], 'g'],
    [[8, 4], 'k'],
    [[8, 5], 'g'],
    [[8, 6], 's']
  ].forEach((args) => {
    for (let n = 0; n < 4; ++n) {
      const [rotatedX, rotatedY] = rotate(args[0], [4, 4], n);
      board[rotatedX][rotatedY].id = args[1]
      board[rotatedX][rotatedY].facing = n
    }
  });*/

  return board
}

const GameStoreContext = createContext(null);


export const useGameStore = () => {

  const gameStore = useContext(GameStoreContext);

  function reset() {
    gameStore.viewer.id = 0;
    gameStore.currentPlayer.facing = 0;
    gameStore.setCurrentMove(0)
    gameStore.setHistory([initBoard()])
    deselect();
  }

  function select(x, y, dropPiece = null) {
    gameStore.setSelection({x: x, y: y, dropPiece: dropPiece});
    gameStore.selected.current = true;
    //Object.assign(hint, getValidities());
  }

  function deselect() {
    gameStore.setSelection({x: -1, y: -1, dropPiece: null});
    gameStore.selected.current = false;
    /*Object.assign(
      gameStore.hint,
      Array(9)
        .fill(0)
        .map((x) => Array(9).fill(false))
    );*/
  }

  function isSelected() {
    return gameStore.selected.current;
  }

  return {
    reset,
    viewer: gameStore.viewer,
    currentPlayer: gameStore.currentPlayer,
    history: gameStore.history,
    currentMove: gameStore.currentMove,
    players: gameStore.players,
    selection: gameStore.selection,
    hint: gameStore.hint,
    isSelected: isSelected,
    select: select,
    deselect: deselect,
    setHistory: gameStore.setHistory,
    setCurrentMove: gameStore.setCurrentMove,
    setPlayers: gameStore.setPlayers,
    setCurrentPlayer: gameStore.setCurrentPlayer,
    setSelection: gameStore.setSelection,
    setHint: gameStore.setHint
  };
};

const GameStoreProvider = ({ children }) => {

  const viewer = useRef({ facing: 0 });
  const [currentPlayer, setCurrentPlayer] = useState({ facing: 0 });
  const [history, setHistory] = useState([initBoard()]);
  const [currentMove, setCurrentMove] = useState(0);
  const [players, setPlayers] = useState(Array(4).fill().map((v, i) => { return {facing: i, pieceInHand: {'p': 0, 's': 0, 'g': 0, 'r': 0}, checkmated: false}}));
  const [selection, setSelection] = useState({ x: -1, y: -1, dropPiece: null });
  const [hint, setHint] = useState(
    Array(9)
      .fill(0)
      .map((x) => Array(9).fill(false))
  );
  const selected = useRef(false);

  return (
    <GameStoreContext.Provider
      value={{
        viewer,
        currentPlayer,
        setCurrentPlayer,
        history,
        setHistory,
        currentMove,
        setCurrentMove,
        players,
        setPlayers,
        selection,
        setSelection,
        hint,
        setHint,
        selected
      }}
    >
      {children}
    </GameStoreContext.Provider>
  );
};

export default GameStoreProvider;