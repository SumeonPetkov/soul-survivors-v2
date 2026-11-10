// Procedural rooms for LevelLayout.RoomDungeon: every room is built from scratch
// (random size, outline and interior), so no two dungeons look the same.
// The result uses the same grid format as hand-drawn rooms (ROOM_WALL / ROOM_FLOOR)
// with a solid wall border; doors are punched later by the corridor code.
//
// Outlines:  0 rectangle, 1 oval, 2 cross, 3 notched corners, 4 octagon
// Interiors: 0 empty, 1 pillar grid, 2 central block (ring), 3 scattered rocks,
//            4 divider wall with gaps, 5 corner columns

/** Builds a random room no bigger than maxSize x maxSize. The start room is kept simple and open. */
function generateRandomRoom(maxSize: number, isStart: boolean, rng: GenRandom): number[][] {
    const lo = Math.min(maxSize, 10);
    let g: number[][] = null;
    for (let attempt = 0; attempt < 8; attempt++) {
        const w = rng.int(lo, maxSize);
        const h = rng.int(lo, maxSize);
        g = [];
        for (let r = 0; r < h; r++) {
            const line: number[] = [];
            for (let c = 0; c < w; c++) line.push(ROOM_WALL);
            g.push(line);
        }
        _rsOutline(g, w, h, isStart ? rng.int(0, 1) : rng.int(0, 4), rng);
        if (!isStart) _rsInterior(g, w, h, rng.int(0, 5), rng);
        const open = _rsKeepConnected(g, w, h);
        if (open * 100 >= (w - 2) * (h - 2) * 45) return g;
    }
    // fallback: plain open rectangle
    for (let r = 1; r < g.length - 1; r++) for (let c = 1; c < g[0].length - 1; c++) g[r][c] = ROOM_FLOOR;
    return g;
}

/** Carves the room's floor outline inside its 1-tile wall border. */
function _rsOutline(g: number[][], w: number, h: number, shape: number, rng: GenRandom) {
    const iw = w - 2;
    const ih = h - 2;
    // cross: arm thickness
    const armW = rng.int(3, Math.max(3, iw - 2));
    const armH = rng.int(3, Math.max(3, ih - 2));
    // notched: size of each corner cut (0 = not cut)
    const cut: number[] = [];
    for (let k = 0; k < 4; k++) cut.push(rng.chance(60) ? rng.int(2, Math.max(2, Math.idiv(Math.min(iw, ih), 2) - 1)) : 0);
    // octagon: corner bevel
    const bevel = rng.int(2, Math.max(2, Math.idiv(Math.min(iw, ih), 3)));

    for (let r = 1; r <= ih; r++) {
        for (let c = 1; c <= iw; c++) {
            const x = c - 1; // 0..iw-1
            const y = r - 1; // 0..ih-1
            let floor = true;
            if (shape == 1) {
                const dx = (x + 0.5 - iw / 2) / (iw / 2);
                const dy = (y + 0.5 - ih / 2) / (ih / 2);
                floor = dx * dx + dy * dy <= 1.1;
            } else if (shape == 2) {
                const inCol = Math.abs(x + 0.5 - iw / 2) * 2 <= armW;
                const inRow = Math.abs(y + 0.5 - ih / 2) * 2 <= armH;
                floor = inCol || inRow;
            } else if (shape == 3) {
                if (x < cut[0] && y < cut[0]) floor = false;
                if (x >= iw - cut[1] && y < cut[1]) floor = false;
                if (x >= iw - cut[2] && y >= ih - cut[2]) floor = false;
                if (x < cut[3] && y >= ih - cut[3]) floor = false;
            } else if (shape == 4) {
                const ex = Math.min(x, iw - 1 - x);
                const ey = Math.min(y, ih - 1 - y);
                floor = ex + ey >= bevel;
            }
            if (floor) g[r][c] = ROOM_FLOOR;
        }
    }
}

/** Adds walls inside the room. Features stay 2 tiles from the border so the walk-around edge stays open. */
function _rsInterior(g: number[][], w: number, h: number, kind: number, rng: GenRandom) {
    if (kind == 1) {
        // pillar grid
        const s = rng.int(2, 3);
        const off = rng.int(0, s - 1);
        const big = rng.chance(35) && s == 3;
        for (let r = 3; r < h - 3; r++) {
            for (let c = 3; c < w - 3; c++) {
                if ((r - 3 - off) % s != 0 || (c - 3 - off) % s != 0) continue;
                _rsWall(g, c, r, w, h);
                if (big) {
                    _rsWall(g, c + 1, r, w, h);
                    _rsWall(g, c, r + 1, w, h);
                    _rsWall(g, c + 1, r + 1, w, h);
                }
            }
        }
    } else if (kind == 2) {
        // central block -> ring room
        const bw = Math.max(1, w - 4 - 2 * rng.int(1, 2));
        const bh = Math.max(1, h - 4 - 2 * rng.int(1, 2));
        const c0 = Math.idiv(w - bw, 2);
        const r0 = Math.idiv(h - bh, 2);
        for (let r = r0; r < r0 + bh; r++) for (let c = c0; c < c0 + bw; c++) _rsWall(g, c, r, w, h);
    } else if (kind == 3) {
        // scattered rocks (1x1 or 2x2)
        for (let n = rng.int(2, 2 + Math.idiv(w * h, 30)); n > 0; n--) {
            const c = rng.int(3, Math.max(3, w - 5));
            const r = rng.int(3, Math.max(3, h - 5));
            const sz = rng.chance(40) ? 2 : 1;
            for (let dr = 0; dr < sz; dr++) for (let dc = 0; dc < sz; dc++) _rsWall(g, c + dc, r + dr, w, h);
        }
    } else if (kind == 4) {
        // divider wall across the middle with 1-2 gaps of 2 tiles
        const vertical = rng.chance(50);
        const len = vertical ? h : w;
        const at = vertical ? Math.idiv(w, 2) : Math.idiv(h, 2);
        const gapA = rng.int(2, Math.max(2, len - 4));
        const gapB = rng.chance(50) ? rng.int(2, Math.max(2, len - 4)) : -10;
        for (let p = 2; p < len - 2; p++) {
            if ((p >= gapA && p < gapA + 2) || (p >= gapB && p < gapB + 2)) continue;
            if (vertical) _rsWall(g, at, p, w, h);
            else _rsWall(g, p, at, w, h);
        }
    } else if (kind == 5) {
        // a column near each corner
        const inset = rng.int(2, 3);
        const corners = [[inset, inset], [w - 1 - inset, inset], [inset, h - 1 - inset], [w - 1 - inset, h - 1 - inset]];
        for (const p of corners) _rsWall(g, p[0], p[1], w, h);
    }
}

function _rsWall(g: number[][], c: number, r: number, w: number, h: number) {
    if (c >= 2 && r >= 2 && c < w - 2 && r < h - 2) g[r][c] = ROOM_WALL;
}

/** Keeps only the floor reachable from the tile nearest the middle; returns how many floor tiles remain. */
function _rsKeepConnected(g: number[][], w: number, h: number): number {
    let start = -1;
    let best = 99999;
    for (let r = 1; r < h - 1; r++) {
        for (let c = 1; c < w - 1; c++) {
            if (g[r][c] != ROOM_FLOOR) continue;
            const d = Math.abs(2 * c - w) + Math.abs(2 * r - h);
            if (d < best) {
                best = d;
                start = r * w + c;
            }
        }
    }
    if (start < 0) return 0;
    const seen: boolean[] = [];
    for (let i = 0; i < w * h; i++) seen.push(false);
    seen[start] = true;
    const queue = [start];
    let count = 0;
    while (queue.length > 0) {
        const i = queue.pop();
        count++;
        const c = i % w;
        const r = Math.idiv(i, w);
        const nb = [i - 1, i + 1, i - w, i + w];
        for (let k = 0; k < 4; k++) {
            const j = nb[k];
            const jc = k < 2 ? c + (k == 0 ? -1 : 1) : c;
            const jr = k >= 2 ? r + (k == 2 ? -1 : 1) : r;
            if (jc < 0 || jr < 0 || jc >= w || jr >= h || seen[j]) continue;
            if (g[jr][jc] != ROOM_FLOOR) continue;
            seen[j] = true;
            queue.push(j);
        }
    }
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) if (g[r][c] == ROOM_FLOOR && !seen[r * w + c]) g[r][c] = ROOM_WALL;
    return count;
}
