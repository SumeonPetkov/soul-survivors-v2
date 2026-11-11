// Ground pathfinding: a "flow field" of steps-to-the-hero for every floor tile,
// rebuilt whenever the hero moves to a new tile. Walking enemies (and non-flying
// bosses) follow it around walls instead of pushing straight into them.

let _flow: number[] = [];
let _flowFrom = -1;

/**
 * The floor tile the hero is standing on, as [c, r]. The hero's hitbox is smaller than
 * its image, so against a wall its center (hero.x/y) can be over the wall tile; then
 * this returns the open neighbouring tile closest to the center instead.
 */
function heroTile(): number[] {
    const c = Math.floor(hero.x / 16);
    const r = Math.floor(hero.y / 16);
    if (!isWall(c, r)) return [c, r];
    let best = [c, r];
    let bestD = 1e9;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (isWall(c + dc, r + dr)) continue;
            // distance from the hero's center to that tile's rectangle
            const tx = (c + dc) * 16;
            const ty = (r + dr) * 16;
            const ex = Math.max(Math.max(tx - hero.x, 0), hero.x - (tx + 16));
            const ey = Math.max(Math.max(ty - hero.y, 0), hero.y - (ty + 16));
            const d = ex * ex + ey * ey;
            if (d < bestD) {
                bestD = d;
                best = [c + dc, r + dr];
            }
        }
    }
    return best;
}

/** Rebuilds the flow field if the hero changed tile (cheap: one flood fill). */
function updateFlowField() {
    const n = MAP_W * MAP_H;
    const ht = heroTile();
    const hc = ht[0];
    const hr = ht[1];
    const start = hr * MAP_W + hc;
    if (start == _flowFrom && _flow.length == n) return;
    _flowFrom = start;
    _flow = [];
    for (let i = 0; i < n; i++) _flow.push(-1);
    if (isWall(hc, hr)) return;
    const queue = [start];
    _flow[start] = 0;
    let head = 0;
    while (head < queue.length) {
        const i = queue[head++];
        const c = i % MAP_W;
        const r = Math.idiv(i, MAP_W);
        const d = _flow[i] + 1;
        if (c > 0 && _flow[i - 1] < 0 && !walls[i - 1]) { _flow[i - 1] = d; queue.push(i - 1); }
        if (c < MAP_W - 1 && _flow[i + 1] < 0 && !walls[i + 1]) { _flow[i + 1] = d; queue.push(i + 1); }
        if (r > 0 && _flow[i - MAP_W] < 0 && !walls[i - MAP_W]) { _flow[i - MAP_W] = d; queue.push(i - MAP_W); }
        if (r < MAP_H - 1 && _flow[i + MAP_W] < 0 && !walls[i + MAP_W]) { _flow[i + MAP_W] = d; queue.push(i + MAP_W); }
    }
}

/** Forces a rebuild (call after the map changes, e.g. a new floor). */
function resetFlowField() {
    _flowFrom = -1;
    _flow = [];
}

function _flowAt(c: number, r: number): number {
    if (c < 0 || r < 0 || c >= MAP_W || r >= MAP_H) return -1;
    return _flow[r * MAP_W + c];
}

/**
 * Center [x, y] of the floor tile nearest (x, y) that the hero can walk to.
 * Used to place things (the portal) that must be reachable even if whatever
 * dropped them was wedged in a wall or sealed behind something.
 */
function nearestReachableSpot(x: number, y: number): number[] {
    updateFlowField();
    const c0 = Math.floor(x / 16);
    const r0 = Math.floor(y / 16);
    const ht = heroTile();
    const heroOnFloor = _flowAt(ht[0], ht[1]) >= 0;
    for (let d = 0; d < Math.max(MAP_W, MAP_H); d++) {
        let best: number[] = [];
        let bestD = 1e9;
        // check the ring at Chebyshev distance d, keep the closest tile in it
        for (let dr = -d; dr <= d; dr++) {
            for (let dc = -d; dc <= d; dc++) {
                if (Math.max(Math.abs(dc), Math.abs(dr)) != d) continue;
                const c = c0 + dc;
                const r = r0 + dr;
                const ok = heroOnFloor ? _flowAt(c, r) >= 0 : !isWall(c, r);
                if (!ok) continue;
                const dd = dc * dc + dr * dr;
                if (dd < bestD) {
                    bestD = dd;
                    best = [c * 16 + 8, r * 16 + 8];
                }
            }
        }
        if (best.length > 0) return best;
    }
    return [Math.floor(hero.x / 16) * 16 + 8, Math.floor(hero.y / 16) * 16 + 8];
}

/** Sets `s`'s velocity to walk toward the hero at `speed`, going around walls. */
function walkTowardHero(s: Sprite, speed: number) {
    const c = Math.floor(s.x / 16);
    const r = Math.floor(s.y / 16);
    const here = _flowAt(c, r);
    let tx = hero.x;
    let ty = hero.y;
    if (here > 1) {
        // step to the neighbouring tile that is closest to the hero
        // (diagonals only when both side tiles are open, so we don't clip corners)
        let best = here;
        let bc = c;
        let br = r;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dc == 0 && dr == 0) continue;
                if (dc != 0 && dr != 0 && (isWall(c + dc, r) || isWall(c, r + dr))) continue;
                const v = _flowAt(c + dc, r + dr);
                if (v >= 0 && v < best) {
                    best = v;
                    bc = c + dc;
                    br = r + dr;
                }
            }
        }
        tx = bc * 16 + 8;
        ty = br * 16 + 8;
    }
    const dx = tx - s.x;
    const dy = ty - s.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
    s.vx = dx / d * speed;
    s.vy = dy / d * speed;
}

/**
 * Call every AI tick for walkers. If the sprite has barely moved for ~3 seconds
 * while trying to walk (wedged on a corner / gap too small for it), it puffs and
 * reappears somewhere open near the hero. Returns true if it was moved.
 */
function unstickWalker(s: Sprite): boolean {
    const lx = getDN(s, "lx");
    const ly = getDN(s, "ly");
    const moved = Math.abs(s.x - lx) + Math.abs(s.y - ly);
    setDN(s, "lx", s.x);
    setDN(s, "ly", s.y);
    if (moved > 1.5 || (s.vx == 0 && s.vy == 0)) {
        setDN(s, "stuck", 0);
        return false;
    }
    const stuck = getDN(s, "stuck") + 1;
    setDN(s, "stuck", stuck);
    if (stuck < 30) return false;
    setDN(s, "stuck", 0);
    const pos = findSpawn();
    if (pos.length == 0) return false;
    fx(PUFF_IMG, s.x, s.y, 150);
    s.setPosition(pos[0], pos[1]);
    fx(PUFF_IMG, s.x, s.y, 150);
    return true;
}
