import { rotate } from './entity/utils';
import { getValidPoints, getDroppablePoints, isThreatened, getPointKing } from './entity/validator'


const InDebugMode = () => false;

export function getValidities(board, players, selection) {
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
                0,
                selection.dropPiece
            )
            : getValidPoints(
                board,
                players, 0,
                [ selection.x, selection.y ]))
            validities[x][y] = true;
    return validities;
}

export function canSelect(piece) {
    if (InDebugMode()) return true;
    return piece.facing === 0 && piece.id !== 'None' && piece.id !== 'dead';
}

export function canPromote(point, board, selection) {
    const piece = board[selection.x][selection.y];
    if (InDebugMode()) return true;
    if (piece.promoted) return false;
    if (['p', 's', 'r'].includes(piece.id)) {
        const [fromX] = rotate(point, [4, 4], -piece.facing);
        const [toX] = rotate([selection.x, selection.y], [4, 4], -piece.facing);
        return fromX < 3 || toX < 3;
    }
}

export function getCheckedPlayers() {
    const { history, currentMove, players } = null;
    const board = history[currentMove];
    const checkedPlayers = [];
    for (const player of players) {
        if (!player.checkmated && isThreatened(board, players, getPointKing(board, player.facing)))
            checkedPlayers.push(player);
    }
    return checkedPlayers;
}