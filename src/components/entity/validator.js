import { rotate, inRange, applyOnLine, includePoint, sumOfPoints } from './utils';


function isOnBoard(x, y) {
    return inRange(x, 0, 8) && inRange(y, 0, 8);
}

function getReachablePoints(board, point) {
    const [x, y] = point;
    const piece = board[x][y];
    const MOVEMENTS = {
        '-1': [],
        'None': [],
        'p': [[-1, 0]],
        's': [ [-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 1] ],
        'g': [ [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0] ],
        'r': [],
        'k': [ [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1] ],
        'R': [ [-1, -1], [-1, 1], [1, -1], [1, 1] ]
        // 'n':[[-2,-1],[-2,1]],
        // 'l':[[-1,0]],
        // 'b':[[-1,-1],[-1,1],[1,-1],[1,1]],
        // 'B':[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
    };
    const reachablePoints = [];
    const addReachablePoint = (x, y) => {
        if (board[x][y].facing !== piece.facing) reachablePoints.push([x, y]);
    };
    const piece_id = !piece.promoted ? piece.id : piece.id === 'r' ? 'R' : 'g';
    for (const [moveX, moveY] of MOVEMENTS[piece_id]) {
        const [newX, newY] = rotate(
            [x + moveX, y + moveY],
            [x, y],
            piece.facing
        );
        if (isOnBoard(newX, newY)) addReachablePoint(newX, newY);
    }

    if (piece.id === 'r') {
        for (let n = 0; n < 4; ++n) {
            applyOnLine([x, y], rotate([0, -1], [0, 0], n), (x, y) => {
                if (board[x][y].id !== 'None') {
                    addReachablePoint(x, y);
                    return true;
                }
                addReachablePoint(x, y);
            });
        }
    }

    return reachablePoints;
}

function isThreatening(players, pieceThreatening, pieceThreatened) {
    return ![pieceThreatened.facing, -1].includes(pieceThreatening.facing) && !players[pieceThreatening.facing].checkmated
}

function isThreatened(board, players, point) {
    const [x, y] = point;
    const piece = board[x][y];
    for (const [dx, dy] of [ [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1] ])
        if (
        isOnBoard(x + dx, y + dy) &&
        isThreatening(players, board[x+dx][y+dy], piece) &&
        includePoint(getReachablePoints(board, [x + dx, y + dy]), [x, y])
        )
            return true;

    let result = false;
    for (let n = 0; n < 4; ++n) {
        applyOnLine([x, y], rotate([0, -1], [0, 0], n), (x, y) => {
            const threateningPiece = board[x][y];
            result |=
                isThreatening(players, threateningPiece, piece) &&
                threateningPiece.id === 'r';
            if (threateningPiece.id !== 'None') return true;
        });
    }

    return result;
}

function getPointKing(board, facing) {
    let pointKing = [];
    for (const [x, row] of board.entries())
        for (const [y, piece] of row.entries())
            if (piece.id === 'k' && piece.facing === facing)
                pointKing = [x, y];
    return pointKing;
}

function isCheckmated(board, players, facing) {
    for (const [x, row] of board.entries())
        for (const [y, piece] of row.entries())
            if (
            piece.facing === facing &&
            getValidPoints(board, players, facing, [x, y]).length > 0
            )
                return false;
    return true;
}

function getValidPoints(board, players, facing, point) {
    const [x, y] = point;
    const piece = board[x][y];
    let [kingX, kingY] = getPointKing(board, facing);
    const reachablePoints = getReachablePoints(board, [x, y]);
    const validPoints = reachablePoints.filter(([toX, toY]) => {
        if (board[toX][toY].id === 'k' || board[toX][toY].id === 'dead') return false;
        const newBoard = board.map((row) => row.slice());
        if (piece.id === 'k') {
            kingX = toX;
            kingY = toY;
        }
        newBoard[x][y] = {id: 'None', facing: -1, promoted: false};
        newBoard[toX][toY] = piece;
        return !isThreatened(newBoard, players, [kingX, kingY]);
    });
    return validPoints;
}

function getColumnsWithPawn(board, facing) {
    const columnsWithPawn = [];
    for (let y = 0; y < 9; ++y)
        applyOnLine(
            rotate([-1, y], [4, 4], facing),
            rotate([1, 0], [0, 0], facing),
            (x, y) => {
                const piece = board[x][y];
                if (piece.id === 'p' && !piece.promoted && piece.facing === facing) {
                    columnsWithPawn.push(facing % 2 ? x : y);
                    return true;
                }
            }
        );
    return columnsWithPawn;
}

function isDropPawnMate(board, players, facing, point) {
    const [x, y] = sumOfPoints(point, rotate([-1, 0], [0, 0], facing));
    if (!isOnBoard(x, y)) return false;
    const piece = board[x][y];
    if (piece.id === 'k' && piece.facing !== facing) {
        const [x, y] = point;
        const newBoard = board.map((row) => row.slice());
        newBoard[x][y] = {id: 'p', facing: facing, promoted: false};
        if (isCheckmated(newBoard, players, piece.facing)) return true;
    }
    return false;
}

function getDroppablePoints(board, players, facing, dropPiece) {
    let droppablePoints = [];
    const pointKing = getPointKing(board, facing);
    for (const [x, row] of board.entries())
        for (const [y, piece] of row.entries())
            if (piece.id === 'None') {
                const newBoard = board.map((row) => row.slice());
                newBoard[x][y] = dropPiece;
                if (!isThreatened(newBoard, players, pointKing))
                    droppablePoints.push([x, y]);
            }

    if (dropPiece.id === 'p') {
        const columnsWithPawn = getColumnsWithPawn(board, facing);
        droppablePoints = droppablePoints.filter((point) => {
            const [rx, ry] = rotate(point, [4, 4], -facing);
            return (
                rx > 0 &&
                !columnsWithPawn.includes(ry) &&
                !isDropPawnMate(board, players, facing, point)
            );
        });
    }

    return droppablePoints;
}

export { getValidPoints, getDroppablePoints, isCheckmated, getPointKing, isThreatened }