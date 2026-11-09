// LevelLayout.RoomDungeon: the map is split into a grid of cells, each cell gets a
// hand-drawn room (Rooms/*.ts) and neighbouring rooms are joined by corridors.
// A random spanning tree guarantees every room is reachable; extra links add loops.

/** A room stamped onto the map. x/y = top-left tile. */
class PlacedRoom {
    x: number;
    y: number;
    grid: number[][];
    /** true for an empty cell (a small open junction): every edge tile is floor. */
    open: boolean;
    /** Map tile indexes (r * width + c) of this room's doorways - closed while the room is locked. */
    doors: number[];
    /** Corridor steps from the start room (filled after the corridors are made). */
    depth: number;

    constructor(x: number, y: number, grid: number[][], open: boolean) {
        this.x = x;
        this.y = y;
        this.grid = grid;
        this.open = open;
        this.doors = [];
        this.depth = 0;
    }

    /** true if tile (c, r) is well inside the room (2+ tiles from its outer edge). */
    containsDeep(c: number, r: number): boolean {
        return c >= this.x + 2 && c <= this.x + this.w - 3 && r >= this.y + 2 && r <= this.y + this.h - 3;
    }

    get w(): number { return this.grid[0].length; }
    get h(): number { return this.grid.length; }
}

// sides: 0 north, 1 east, 2 south, 3 west
const _RD_DC = [0, 1, 0, -1];
const _RD_DR = [-1, 0, 1, 0];

function generateRoomDungeon(level: Level, rng: GenRandom): GenContext {
    const cols = Math.max(1, rng.int(level.roomGridCols[0], level.roomGridCols[level.roomGridCols.length - 1]));
    const rows = Math.max(1, rng.int(level.roomGridRows[0], level.roomGridRows[level.roomGridRows.length - 1]));
    const cell = level.roomCellSize;
    const cw = Math.max(1, rng.int(level.corridorWidth[0], level.corridorWidth[level.corridorWidth.length - 1]));
    const ctx = new GenContext(cols * cell + 2, rows * cell + 2, rng);
    ctx.fillRect(1, 1, ctx.width - 2, ctx.height - 2, true);

    const pool = roomsInSet(level.roomSet);
    if (pool.length == 0) throw "no rooms defined for room set '" + level.roomSet + "'";
    const maxSize = cell - 4; // 2 tiles of padding on each side keeps room for corridors
    const startCell = Math.idiv(rows, 2) * cols + Math.idiv(cols, 2);
    const emptyPct = rng.int(level.emptyCellChance[0], level.emptyCellChance[level.emptyCellChance.length - 1]);

    // ---- place one room per cell ----
    const rooms: PlacedRoom[] = [];
    for (let gr = 0; gr < rows; gr++) {
        for (let gc = 0; gc < cols; gc++) {
            const i = gr * cols + gc;
            let grid: number[][] = null;
            let open = false;
            if (i != startCell && rng.chance(emptyPct)) grid = null;
            else grid = _rdPickRoom(pool, i == startCell, maxSize, rng);
            if (!grid) {
                open = true;
                grid = [];
                for (let r = 0; r <= cw; r++) {
                    const line: number[] = [];
                    for (let c = 0; c <= cw; c++) line.push(ROOM_FLOOR);
                    grid.push(line);
                }
            }
            const h = grid.length;
            const w = grid[0].length;
            const x = 1 + gc * cell + 2 + rng.int(0, Math.max(0, cell - 4 - w));
            const y = 1 + gr * cell + 2 + rng.int(0, Math.max(0, cell - 4 - h));
            for (let r = 0; r < h; r++) {
                for (let c = 0; c < w; c++) ctx.setWall(x + c, y + r, grid[r][c] != ROOM_FLOOR);
            }
            rooms.push(new PlacedRoom(x, y, grid, open));
        }
    }

    // ---- spanning tree (random depth-first walk over the grid) ----
    const linkE: boolean[] = []; // link between cell i and its east neighbour
    const linkS: boolean[] = []; // link between cell i and its south neighbour
    const seen: boolean[] = [];
    for (let i = 0; i < rows * cols; i++) {
        linkE.push(false);
        linkS.push(false);
        seen.push(false);
    }
    const stack = [startCell];
    seen[startCell] = true;
    while (stack.length > 0) {
        const i = stack[stack.length - 1];
        const gc = i % cols;
        const gr = Math.idiv(i, cols);
        const options: number[] = [];
        for (let s = 0; s < 4; s++) {
            const nc = gc + _RD_DC[s];
            const nr = gr + _RD_DR[s];
            if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
            if (!seen[nr * cols + nc]) options.push(s);
        }
        if (options.length == 0) {
            stack.pop();
            continue;
        }
        const s = options[rng.int(0, options.length - 1)];
        const j = (gr + _RD_DR[s]) * cols + gc + _RD_DC[s];
        if (s == 1) linkE[i] = true;
        else if (s == 3) linkE[j] = true;
        else if (s == 2) linkS[i] = true;
        else linkS[j] = true;
        seen[j] = true;
        stack.push(j);
    }

    // ---- extra links make loops ----
    const extraPct = rng.int(level.extraConnections[0], level.extraConnections[level.extraConnections.length - 1]);
    for (let i = 0; i < rows * cols; i++) {
        if (i % cols < cols - 1 && !linkE[i] && rng.chance(extraPct)) linkE[i] = true;
        if (Math.idiv(i, cols) < rows - 1 && !linkS[i] && rng.chance(extraPct)) linkS[i] = true;
    }

    // ---- corridors ----
    for (let i = 0; i < rows * cols; i++) {
        if (linkE[i]) _rdConnect(ctx, rooms[i], rooms[i + 1], true, cw, rng);
        if (linkS[i]) _rdConnect(ctx, rooms[i], rooms[i + cols], false, cw, rng);
    }

    // ---- depth of every room (corridor steps from the start) -> the boss room is the deepest ----
    for (const rm of rooms) rm.depth = -1;
    rooms[startCell].depth = 0;
    const queue = [startCell];
    let deepest = startCell;
    while (queue.length > 0) {
        const i = queue.shift();
        const gc = i % cols;
        const gr = Math.idiv(i, cols);
        const nb: number[] = [];
        if (gc < cols - 1 && linkE[i]) nb.push(i + 1);
        if (gc > 0 && linkE[i - 1]) nb.push(i - 1);
        if (gr < rows - 1 && linkS[i]) nb.push(i + cols);
        if (gr > 0 && linkS[i - cols]) nb.push(i - cols);
        for (const j of nb) {
            if (rooms[j].depth >= 0) continue;
            rooms[j].depth = rooms[i].depth + 1;
            queue.push(j);
            if (!rooms[j].open && (rooms[deepest].open || rooms[j].depth > rooms[deepest].depth)) deepest = j;
        }
    }
    level.rooms = rooms;
    level.startRoom = startCell;
    level.bossRoom = deepest == startCell ? -1 : deepest;

    // ---- hero starts on the floor tile closest to the start room's middle ----
    const sr = rooms[startCell];
    const mc = sr.x + Math.idiv(sr.w, 2);
    const mr = sr.y + Math.idiv(sr.h, 2);
    let best = -1;
    for (let r = sr.y; r < sr.y + sr.h; r++) {
        for (let c = sr.x; c < sr.x + sr.w; c++) {
            if (ctx.isWall(c, r)) continue;
            const d = (c - mc) * (c - mc) + (r - mr) * (r - mr);
            if (best < 0 || d < best) {
                best = d;
                level.startC = c;
                level.startR = r;
            }
        }
    }
    return ctx;
}

/** Picks a room (weighted) and a rotation/flip that fits in maxSize. null if nothing fits. */
function _rdPickRoom(pool: RoomTemplate[], isStart: boolean, maxSize: number, rng: GenRandom): number[][] {
    let list: RoomTemplate[] = [];
    if (isStart) for (const t of pool) if (t.role == RoomRole.Start) list.push(t);
    if (list.length == 0) for (const t of pool) if (t.role == RoomRole.Normal) list.push(t);
    if (list.length == 0) list = pool;
    for (let attempt = 0; attempt < 10; attempt++) {
        const weights: number[] = [];
        for (const t of list) weights.push(t.weight);
        const t = list[Math.max(0, rng.weighted(weights))];
        const turn0 = rng.int(0, 3);
        const flip = rng.chance(50);
        for (let k = 0; k < 4; k++) {
            const turns = (turn0 + k) % 4;
            // only the size matters for fitting: odd turns swap width/height
            const w = turns % 2 == 0 ? t.width : t.height;
            const h = turns % 2 == 0 ? t.height : t.width;
            if (w <= maxSize && h <= maxSize) return transformRoomGrid(t.grid, turns, flip);
        }
    }
    return null;
}

/**
 * Opens a door on one side of a room and returns where the corridor starts:
 * [c, r] of the first tile just outside the room, lanes run along +c (N/S sides) or +r (E/W sides).
 */
function _rdOpenDoor(ctx: GenContext, room: PlacedRoom, side: number, cw: number, rng: GenRandom): number[] {
    const len = side % 2 == 0 ? room.w : room.h;
    const edgeAt = (p: number): number[] => {
        if (side == 0) return [p, 0];
        if (side == 1) return [room.w - 1, p];
        if (side == 2) return [p, room.h - 1];
        return [0, p];
    };
    const inC = -_RD_DC[side];
    const inR = -_RD_DR[side];
    const cellAt = (c: number, r: number): number => {
        if (c < 0 || r < 0 || c >= room.w || r >= room.h) return ROOM_WALL;
        return room.grid[r][c];
    };

    // candidates: doors drawn on that side, otherwise any edge tile with floor behind it
    let cand: number[] = [];
    for (let p = 0; p < len; p++) {
        const e = edgeAt(p);
        if (cellAt(e[0], e[1]) == ROOM_DOOR) cand.push(p);
    }
    if (cand.length == 0) {
        for (let p = 1; p < len - 1; p++) {
            const e = edgeAt(p);
            if (cellAt(e[0], e[1]) == ROOM_FLOOR || cellAt(e[0] + inC, e[1] + inR) == ROOM_FLOOR) cand.push(p);
        }
    }
    let p = cand.length > 0 ? cand[rng.int(0, cand.length - 1)] : Math.idiv(len, 2);
    // keep the whole door (cw lanes) off the corners
    const lo = room.open ? 0 : 1;
    const hi = Math.max(lo, len - cw - (room.open ? 0 : 1));
    p = Math.max(lo, Math.min(hi, p));

    // carve each lane from the edge inward until it reaches the room's floor
    for (let k = 0; k < cw; k++) {
        const e = edgeAt(p + k);
        let c = room.x + e[0];
        let r = room.y + e[1];
        const di = r * ctx.width + c;
        if (room.doors.indexOf(di) < 0) room.doors.push(di);
        for (let d = 0; d < Math.max(room.w, room.h); d++) {
            const lc = c - room.x;
            const lr = r - room.y;
            if (lc < 0 || lr < 0 || lc >= room.w || lr >= room.h) break;
            if (d > 0 && !ctx.isWall(c, r)) break;
            ctx.setWall(c, r, false);
            c += inC;
            r += inR;
        }
    }
    const e0 = edgeAt(p);
    return [room.x + e0[0] + _RD_DC[side], room.y + e0[1] + _RD_DR[side]];
}

/** Joins room a to room b (b is east of a when horizontal, else south of a). */
function _rdConnect(ctx: GenContext, a: PlacedRoom, b: PlacedRoom, horizontal: boolean, cw: number, rng: GenRandom) {
    const s = _rdOpenDoor(ctx, a, horizontal ? 1 : 2, cw, rng);
    const e = _rdOpenDoor(ctx, b, horizontal ? 3 : 0, cw, rng);
    if (horizontal) {
        // s = first tile east of a, e = first tile west of b; lanes go down (+r)
        const mx = Math.max(s[0], Math.idiv(s[0] + e[0] - (cw - 1), 2));
        _rdCarve(ctx, s[0], s[1], mx + cw - 1, s[1] + cw - 1);
        _rdCarve(ctx, mx, Math.min(s[1], e[1]), mx + cw - 1, Math.max(s[1], e[1]) + cw - 1);
        _rdCarve(ctx, mx, e[1], e[0], e[1] + cw - 1);
    } else {
        // s = first tile south of a, e = first tile north of b; lanes go right (+c)
        const my = Math.max(s[1], Math.idiv(s[1] + e[1] - (cw - 1), 2));
        _rdCarve(ctx, s[0], s[1], s[0] + cw - 1, my + cw - 1);
        _rdCarve(ctx, Math.min(s[0], e[0]), my, Math.max(s[0], e[0]) + cw - 1, my + cw - 1);
        _rdCarve(ctx, e[0], my, e[0] + cw - 1, e[1]);
    }
}

function _rdCarve(ctx: GenContext, c0: number, r0: number, c1: number, r1: number) {
    const ca = Math.min(c0, c1);
    const cb = Math.max(c0, c1);
    const ra = Math.min(r0, r1);
    const rb = Math.max(r0, r1);
    for (let r = ra; r <= rb; r++) {
        for (let c = ca; c <= cb; c++) ctx.setWall(c, r, false);
    }
}
