export function rotate(point, center, n) {
    let rotatedX = point[0] - center[0];
    let rotatedY = point[1] - center[1];

    for (let i = 0; i < (n + 4) % 4; i++) {
        const tempX = rotatedX;
        rotatedX = rotatedY;
        rotatedY = -tempX;
    }

    return [rotatedX + center[0], rotatedY + center[1]];
}


export function applyOnLine(origin, direction, fn) {
    let [x, y] = origin;
    let [dx, dy] = direction;
    x += dx;
    y += dy;
    while (inRange(x, 0, 8) && inRange(y, 0, 8)) {
        if (fn(x, y)) break;
        x += dx;
        y += dy;
    }
}

export function inRange(n, min, max) {
    return n >= min && n <= max;
}

export function includePoint(points, point) {
    return points.some(([x, y]) => x === point[0] && y === point[1]);
}

export function sumOfPoints(pointA, pointB) {
    return [pointA[0] + pointB[0], pointA[1] + pointB[1]];
}