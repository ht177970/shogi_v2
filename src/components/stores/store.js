import { createContext, useContext, useRef, useState } from 'react';
import { getValidities } from '../validator';

export function initBoard(){
  const board = Array(9);
  for(let i = 0;i < 9;i++){
    board[i] = Array(9)
    for(let j = 0;j < 9;j++){
    board[i][j] = {id: 'None', facing: -1, promoted: false};
    }
  }
  return board
}

const GameStoreContext = createContext(null);
const ConfigStoreContext = createContext(null);

export const useConfigStore = () => {
  const configStore = useContext(ConfigStoreContext);
  return {
    mode: configStore.mode,
    setMode: configStore.setMode,
    font: configStore.font,
    setFont: configStore.setFont,
    notation: configStore.notation,
    setNotation: configStore.setNotation
  }
}

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
    gameStore.setHint(getValidities(
      gameStore.history[gameStore.currentMove],
      gameStore.players,
      gameStore.currentPlayer,
      {x: x, y: y, dropPiece: dropPiece}));
  }

  function deselect() {
    gameStore.setSelection({x: -1, y: -1, dropPiece: null});
    gameStore.selected.current = false;
    gameStore.setHint(Array(9).fill(0).map((x) => Array(9).fill(false)));
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
    setHint: gameStore.setHint,
    isPlayer: gameStore.isPlayer
  };
};

const StoreProvider = ({ children }) => {

  const viewer = useRef({ facing: 0 });
  const [currentPlayer, setCurrentPlayer] = useState({ facing: 0 });
  const [history, setHistory] = useState([initBoard()]);
  const [currentMove, setCurrentMove] = useState(0);
  const [players, setPlayers] = useState(Array(4).fill().map((v, i) => { return {facing: i, piecesInHand: {'p': 0, 's': 0, 'g': 0, 'r': 0}, checkmated: false, inactive: true, time: 120}}));
  const [selection, setSelection] = useState({ x: -1, y: -1, dropPiece: null });
  const [hint, setHint] = useState(
    Array(9)
      .fill(0)
      .map((x) => Array(9).fill(false))
  );
  const isPlayer = useRef(false);
  const selected = useRef(false);

  const [mode, setMode] = useState('normal');
  const [font, setFont] = useState('hai-yan');
  const [notation, setNotation] = useState('japanese');

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
        selected,
        isPlayer
      }}
    >
      <ConfigStoreContext.Provider
        value={{
          mode,
          setMode,
          font,
          setFont,
          notation,
          setNotation
        }}
      >
        {children}
      </ConfigStoreContext.Provider>
    </GameStoreContext.Provider>
  );
};

export default StoreProvider;