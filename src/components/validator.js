import { useGameStore, useConfigStore } from './stores/store';
import { rotate } from './entity/utils';
import { getValidPoints, getDroppablePoints, isThreatened, getPointKing } from './entity/validator'


const InDebugMode = () => false;

export function GetValidities() {
    const { board, players, currentPlayer, selection } = useGameStore();
    const validityDefault = InDebugMode();
    const validities = Array(9)
        .fill(0)
        .map((x) => Array(9).fill(validityDefault));
    if (InDebugMode()) validities[selection.x][selection.y] = false;
    else
        for (const [x, y] of selection.dropPiece
            ? getDroppablePoints(
                board,
                players,
                currentPlayer.facing,
                selection.dropPiece
            )
            : getValidPoints(
                board,
                players, currentPlayer.facing,
                [ selection.x, selection.y ]))
            validities[x][y] = true;
    return validities;
}

export function CanSelect(piece) {
    const { currentPlayer } = useGameStore();
    if (InDebugMode()) return true;
    return piece.facing === currentPlayer.facing && piece.id !== 'None';
}

export function canPromote(point, board, selection, currentPlayer) {
    const piece = board[selection.x][selection.y];
    if (InDebugMode()) return true;
    if (['p', 's', 'r'].includes(piece.id)) {
        const [fromX] = rotate(point, [4, 4], -currentPlayer.facing);
        const [toX] = rotate([selection.x, selection.y], [4, 4], -currentPlayer.facing);
        return fromX < 3 || toX < 3;
    }
}

export function GetCheckedPlayers() {
    const { history, currentMove, players } = useGameStore();
    const board = history[currentMove];
    const checkedPlayers = [];
    for (const player of players) {
        if (!player.checkmated && isThreatened(board, players, getPointKing(board, player.facing)))
            checkedPlayers.push(player);
    }
    return checkedPlayers;
}