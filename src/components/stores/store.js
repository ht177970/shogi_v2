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

export function initPlayers(){
  return Array(4).fill().map((v, i) => {
    return {facing: i,
            piecesInHand: {'p': 0, 's': 0, 'g': 0, 'r': 0},
            checkmated: false,
            turn: false,
            first: true}
    });
}

function initSocketPlayers(){
  return Array(4).fill().map((v, i) => {
    return {facing: i,
            nickname: '',
            inactive: true,
            time: 120}
    });
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

function min(a, b){
  return a < b ? a : b;
}

export const useGameStore = () => {

  const gameStore = useContext(GameStoreContext);

  function reset() {
    gameStore.viewer.id = 0;
    gameStore.setCurrentMove(0)
    gameStore.setHistory([initBoard()])
    deselect();
  }

  function select(x, y, dropPiece = null) {
    gameStore.setSelection({x: x, y: y, dropPiece: dropPiece});
    gameStore.selected.current = true;
    gameStore.setHint(getValidities(
      gameStore.history[min(gameStore.currentMove, gameStore.history.length - 1)],
      gameStore.historyPlayers[min(gameStore.currentMove, gameStore.historyPlayers.length - 1)],
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
    history: gameStore.history,
    historyPlayers: gameStore.historyPlayers,
    currentMove: gameStore.currentMove,
    socketPlayers: gameStore.socketPlayers,
    selection: gameStore.selection,
    hint: gameStore.hint,
    isSelected: isSelected,
    select: select,
    deselect: deselect,
    setHistory: gameStore.setHistory,
    setHistoryPlayers: gameStore.setHistoryPlayers,
    setCurrentMove: gameStore.setCurrentMove,
    setSocketPlayers: gameStore.setSocketPlayers,
    setCurrentPlayer: gameStore.setCurrentPlayer,
    setSelection: gameStore.setSelection,
    setHint: gameStore.setHint,
    isPlayer: gameStore.isPlayer
  };
};

const StoreProvider = ({ children }) => {

  const viewer = useRef({ facing: 0 });
  const [history, setHistory] = useState([initBoard()]);
  const [historyPlayers, setHistoryPlayers] = useState([initPlayers()]);
  const [currentMove, setCurrentMove] = useState(0);
  const [socketPlayers, setSocketPlayers] = useState(initSocketPlayers());
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
        history,
        setHistory,
        historyPlayers,
        setHistoryPlayers,
        currentMove,
        setCurrentMove,
        socketPlayers,
        setSocketPlayers,
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