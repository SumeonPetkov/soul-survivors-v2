// Fog of war (when the current level has fogOfWar = true).
//   - tiles in the hero's line of sight (within fogRadius) are fully visible
//   - tiles seen before but not in sight right now are dimmed
//   - tiles never seen are black
// Enemies, shots and pickups outside the visible area are hidden.
// Visibility is recomputed only when the hero moves to another tile.

let fogOn = false
let fogRadius = 11
/** ever seen, per tile */
let _fogSeen: boolean[] = []
/** visible right now, per tile */
let _fogVis: boolean[] = []
let _fogVisList: number[] = []
let _fogHeroC = -999
let _fogHeroR = -999
let _fogDim: Image = null

/** Call after a new floor is generated (before buildMinimap). */
function resetFog(enabled: boolean, radius: number) {
    fogOn = enabled
    fogRadius = radius
    _fogSeen = []
    _fogVis = []
    _fogVisList = []
    for (let i = 0; i < MAP_W * MAP_H; i++) {
        _fogSeen.push(false)
        _fogVis.push(false)
    }
    _fogHeroC = -999
    _fogHeroR = -999
    if (!_fogDim) {
        // 50% checkerboard of black over the remembered area
        _fogDim = image.create(16, 16)
        for (let y = 0; y < 16; y++) {
            for (let x = (y % 2); x < 16; x += 2) _fogDim.setPixel(x, y, 15)
        }
    }
}

function fogTileVisible(c: number, r: number): boolean {
    if (!fogOn) return true
    if (c < 0 || r < 0 || c >= MAP_W || r >= MAP_H) return false
    return _fogVis[r * MAP_W + c]
}

function fogTileSeen(c: number, r: number): boolean {
    if (!fogOn) return true
    if (c < 0 || r < 0 || c >= MAP_W || r >= MAP_H) return false
    return _fogSeen[r * MAP_W + c]
}

/** true if world position (x, y) is in sight. */
function fogVisibleAt(x: number, y: number): boolean {
    return fogTileVisible(Math.floor(x / 16), Math.floor(y / 16))
}

/** Forces visibility to be recomputed next frame (call after walls change, e.g. doors closing). */
function fogRefresh() {
    _fogHeroC = -999
    _fogHeroR = -999
}

/** Call every frame. */
function updateFog() {
    if (!fogOn || !hero) return
    // not floor(hero.x / 16): against a wall the hero's center can be over the wall
    // tile, and every sight line from inside a wall is blocked -> everything fogged
    const ht = heroTile()
    const hc = ht[0]
    const hr = ht[1]
    if (hc != _fogHeroC || hr != _fogHeroR) {
        _fogHeroC = hc
        _fogHeroR = hr
        _fogRecompute(hc, hr)
    }
    _fogHideSprites()
}

function _fogRecompute(hc: number, hr: number) {
    for (const i of _fogVisList) _fogVis[i] = false
    _fogVisList = []
    const R = fogRadius
    const floors: number[] = []
    // floor tiles: visible if a line from the hero reaches them without crossing a wall
    for (let dr = -R; dr <= R; dr++) {
        const r = hr + dr
        if (r < 0 || r >= MAP_H) continue
        for (let dc = -R; dc <= R; dc++) {
            const c = hc + dc
            if (c < 0 || c >= MAP_W) continue
            if (dc * dc + dr * dr > R * R + R) continue
            if (isWall(c, r)) continue
            if (_fogCanSee(hc, hr, c, r)) floors.push(r * MAP_W + c)
        }
    }
    for (const i of floors) _fogMark(i)
    // walls: visible if they touch a visible floor tile (so you see the faces of the room you're in)
    for (const i of floors) {
        const c = i % MAP_W
        const r = Math.idiv(i, MAP_W)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nc = c + dc
                const nr = r + dr
                if (nc < 0 || nr < 0 || nc >= MAP_W || nr >= MAP_H) continue
                const j = nr * MAP_W + nc
                if (!_fogVis[j] && walls[j]) _fogMark(j)
            }
        }
    }
}

function _fogMark(i: number) {
    _fogVis[i] = true
    _fogVisList.push(i)
    if (!_fogSeen[i]) {
        _fogSeen[i] = true
        minimapReveal(i % MAP_W, Math.idiv(i, MAP_W))
    }
}

/** Line of sight between tile centers; also tries points near the target tile's corners so wall edges don't flicker. */
function _fogCanSee(c0: number, r0: number, c1: number, r1: number): boolean {
    if (_fogRay(c0 + 0.5, r0 + 0.5, c1 + 0.5, r1 + 0.5, c1, r1)) return true
    return _fogRay(c0 + 0.5, r0 + 0.5, c1 + 0.15, r1 + 0.15, c1, r1)
        || _fogRay(c0 + 0.5, r0 + 0.5, c1 + 0.85, r1 + 0.15, c1, r1)
        || _fogRay(c0 + 0.5, r0 + 0.5, c1 + 0.15, r1 + 0.85, c1, r1)
        || _fogRay(c0 + 0.5, r0 + 0.5, c1 + 0.85, r1 + 0.85, c1, r1)
}

/** Steps along the line (in tile units) and fails on the first wall tile that isn't the target. */
function _fogRay(x0: number, y0: number, x1: number, y1: number, tc: number, tr: number): boolean {
    const dx = x1 - x0
    const dy = y1 - y0
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 3)
    for (let i = 1; i < steps; i++) {
        const c = Math.floor(x0 + dx * i / steps)
        const r = Math.floor(y0 + dy * i / steps)
        if (c == tc && r == tr) return true
        if (isWall(c, r)) return false
    }
    return true
}

/** Hides enemies, shots, pickups etc. that are not in sight. */
function _fogHideSprites() {
    // (not Orbit: the hero's blades circle through walls and must always show)
    const kinds = [SpriteKind.Enemy, SpriteKind.EnemyShot, SpriteKind.Projectile, SpriteKind.Gem, SpriteKind.Pickup, SpriteKind.Fx, SpriteKind.Barrier]
    for (const k of kinds) {
        for (const s of sprites.allOfKind(k)) {
            s.setFlag(SpriteFlag.Invisible, !fogVisibleAt(s.x, s.y))
        }
    }
    // the portal and chests stay visible once their spot has been explored
    for (const ch of sprites.allOfKind(SpriteKind.Chest)) {
        ch.setFlag(SpriteFlag.Invisible, !fogTileSeen(Math.floor(ch.x / 16), Math.floor(ch.y / 16)))
    }
    if (portal) portal.setFlag(SpriteFlag.Invisible, !fogTileSeen(Math.floor(portal.x / 16), Math.floor(portal.y / 16)))
}

/** Draws the fog over the map (renderable between sprites and the HUD). */
function drawFog(target: Image, camera: scene.Camera) {
    if (!fogOn || !hero) return
    const ox = camera.drawOffsetX
    const oy = camera.drawOffsetY
    const c0 = Math.floor(ox / 16)
    const r0 = Math.floor(oy / 16)
    const c1 = Math.floor((ox + target.width - 1) / 16)
    const r1 = Math.floor((oy + target.height - 1) / 16)
    for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
            const x = c * 16 - ox
            const y = r * 16 - oy
            if (!fogTileSeen(c, r)) target.fillRect(x, y, 16, 16, 15)
            else if (!fogTileVisible(c, r)) target.drawTransparentImage(_fogDim, x, y)
        }
    }
}
