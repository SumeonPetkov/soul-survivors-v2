// Room clearing (levels with clearRoomsToLeave = true and the RoomDungeon layout).
// Walking into a room you haven't cleared shuts its doors; its enemies appear after a
// short warning. Kill everything (all waves) and the doors open again.
// The deepest room holds the boss; beating it opens the portal to the next floor.

let roomMode = false
/** index of the locked room in currentLevel.rooms, -1 = none */
let _rcActive = -1
let _rcCleared: boolean[] = []
let _rcWavesLeft = 0
/** waves this room started with (for the "WAVE 2/3" banner) */
let _rcWavesTotal = 0
/** gameTime when the pending wave appears (0 = no wave pending) */
let _rcWaveAt = 0
let _rcPending: number[] = [] // tile indexes where the pending wave appears
let _rcDoorImg: Image = null
let _rcMini: boolean[] = []    // rooms that hold a miniboss
let _rcMiniAt: number[] = []   // where the pending miniboss appears ([] = none)

/** Warning time before a wave appears, ms. */
const ROOM_WAVE_DELAY = 700

function resetRoomClear() {
    const lv = currentLevel
    roomMode = lv.clearRoomsToLeave && lv.chosenLayout == LevelLayout.RoomDungeon && lv.rooms.length > 0
    _rcActive = -1
    _rcWaveAt = 0
    _rcPending = []
    _rcCleared = []
    _rcMini = []
    _rcMiniAt = []
    const candidates: number[] = []
    for (let i = 0; i < lv.rooms.length; i++) {
        // junctions and the start room have nothing to fight
        _rcCleared.push(lv.rooms[i].open || i == lv.startRoom)
        _rcMini.push(false)
        if (!_rcCleared[i] && i != lv.bossRoom) candidates.push(i)
    }
    let minis = randint(lv.miniBossRooms[0], lv.miniBossRooms[lv.miniBossRooms.length - 1])
    while (minis > 0 && candidates.length > 0) {
        const k = randint(0, candidates.length - 1)
        _rcMini[candidates[k]] = true
        candidates.removeAt(k)
        minis--
    }
}

function roomLocked(): boolean {
    return roomMode && _rcActive >= 0
}

function roomsTotal(): number {
    let n = 0
    for (const r of currentLevel.rooms) if (!r.open) n++
    return n
}

function roomsCleared(): number {
    let n = 0
    for (let i = 0; i < _rcCleared.length; i++) if (_rcCleared[i] && !currentLevel.rooms[i].open) n++
    return n
}

/** Call every frame. */
function updateRoomClear(dt: number) {
    if (!roomMode || !hero) return
    const rooms = currentLevel.rooms
    if (_rcActive < 0) {
        const hc = Math.floor(hero.x / 16)
        const hr = Math.floor(hero.y / 16)
        for (let i = 0; i < rooms.length; i++) {
            if (!_rcCleared[i] && rooms[i].containsDeep(hc, hr)) {
                _rcEnter(i)
                break
            }
        }
        return
    }

    // a wave is about to appear
    if (_rcWaveAt > 0) {
        if (gameTime < _rcWaveAt) return
        _rcWaveAt = 0
        for (const i of _rcPending) {
            const x = (i % MAP_W) * 16 + 8
            const y = Math.idiv(i, MAP_W) * 16 + 8
            fx(PUFF_IMG, x, y, 200)
            spawnEnemyAt(currentLevel.pickEnemy(floorTime), x, y)
        }
        _rcPending = []
        if (_rcMiniAt.length > 0) {
            spawnMiniBoss(_rcMiniAt[0], _rcMiniAt[1])
            _rcMiniAt = []
        }
        return
    }

    if (sprites.allOfKind(SpriteKind.Enemy).length > 0) return
    if (_rcIsBossRoom() && bossAlive) return
    if (_rcWavesLeft > 0) {
        _rcQueueWave()
        return
    }
    _rcClear()
}

function _rcIsBossRoom(): boolean {
    return _rcActive >= 0 && _rcActive == currentLevel.bossRoom
}

function _rcEnter(i: number) {
    _rcActive = i
    _rcSetDoors(currentLevel.rooms[i], true)
    sfx(music.thump)
    scene.cameraShake(2, 200)
    if (i == currentLevel.bossRoom) {
        _rcWavesLeft = 0
        spawnBoss()
        // the boss appears in the room, as far from the hero as possible
        const p = _rcFarthestFloor(currentLevel.rooms[i])
        if (p.length > 0) boss.setPosition(p[0], p[1])
    } else if (_rcMini[i]) {
        // one wave: the miniboss plus a few minions
        _rcWavesLeft = 1
        _rcWavesTotal = 1
        _rcMiniAt = _rcFarthestFloor(currentLevel.rooms[i])
        _rcQueueWave()
    } else {
        const lv = currentLevel
        _rcWavesLeft = Math.max(1, randint(lv.roomWaves[0], lv.roomWaves[lv.roomWaves.length - 1]))
        _rcWavesTotal = _rcWavesLeft
        _rcQueueWave()
        banner(_rcWavesTotal > 1 ? "ROOM LOCKED! " + _rcWavesTotal + " WAVES" : "ROOM LOCKED!", 1200)
    }
}

function _rcQueueWave() {
    _rcWavesLeft--
    // later waves: say so, so the warning dots don't look like leftovers
    const waveNum = _rcWavesTotal - _rcWavesLeft
    if (waveNum >= 2 && _rcMiniAt.length == 0) {
        banner("WAVE " + waveNum + "/" + _rcWavesTotal, 1000)
        sfx(music.thump)
    }
    const lv = currentLevel
    const room = lv.rooms[_rcActive]
    let n = randint(lv.roomEnemies[0], lv.roomEnemies[lv.roomEnemies.length - 1]) + (floorNum - 1) * lv.roomEnemiesPerFloor
    const spots = _rcFloorTiles(room, 3)
    if (spots.length < 30) n = Math.ceil(n * 0.6) // small rooms get fewer enemies
    if (_rcMiniAt.length > 0) {
        n = Math.ceil(n / 2) // miniboss rooms: fewer minions
        fx(PUFF_IMG, _rcMiniAt[0], _rcMiniAt[1], ROOM_WAVE_DELAY)
    }
    n = Math.min(n, spots.length)
    _rcPending = []
    for (let k = 0; k < n; k++) {
        const j = randint(0, spots.length - 1)
        const t = spots[j]
        spots.removeAt(j)
        _rcPending.push(t)
        // warning puffs where enemies will appear
        fx(PUFF_IMG, (t % MAP_W) * 16 + 8, Math.idiv(t, MAP_W) * 16 + 8, ROOM_WAVE_DELAY)
    }
    _rcWaveAt = gameTime + ROOM_WAVE_DELAY
}

function _rcClear() {
    const room = currentLevel.rooms[_rcActive]
    const wasBoss = _rcIsBossRoom()
    _rcCleared[_rcActive] = true
    _rcActive = -1
    _rcSetDoors(room, false)
    if (!wasBoss) banner("ROOM CLEARED", 1200) // the boss has its own banner
    sfx(music.baDing)
}

/** Floor tiles inside the room at least minDist tiles from the hero (Chebyshev). */
function _rcFloorTiles(room: PlacedRoom, minDist: number): number[] {
    const hc = Math.floor(hero.x / 16)
    const hr = Math.floor(hero.y / 16)
    const out: number[] = []
    for (let r = room.y + 1; r < room.y + room.h - 1; r++) {
        for (let c = room.x + 1; c < room.x + room.w - 1; c++) {
            if (isWall(c, r)) continue
            if (Math.max(Math.abs(c - hc), Math.abs(r - hr)) < minDist) continue
            out.push(r * MAP_W + c)
        }
    }
    return out
}

function _rcFarthestFloor(room: PlacedRoom): number[] {
    const spots = _rcFloorTiles(room, 0)
    let best = -1
    let bestD = -1
    for (const t of spots) {
        const dx = (t % MAP_W) * 16 + 8 - hero.x
        const dy = Math.idiv(t, MAP_W) * 16 + 8 - hero.y
        const d = dx * dx + dy * dy
        if (d > bestD) {
            bestD = d
            best = t
        }
    }
    if (best < 0) return []
    return [(best % MAP_W) * 16 + 8, Math.idiv(best, MAP_W) * 16 + 8]
}

/** Spawn point while a room is locked (used by findSpawn: summons, unsticking...). */
function roomSpawnPoint(): number[] {
    if (_rcActive < 0) return []
    const spots = _rcFloorTiles(currentLevel.rooms[_rcActive], 3)
    if (spots.length == 0) return []
    const t = spots[randint(0, spots.length - 1)]
    return [(t % MAP_W) * 16 + 8, Math.idiv(t, MAP_W) * 16 + 8]
}

/** Closes (bars) or opens a room's doorways. */
function _rcSetDoors(room: PlacedRoom, closed: boolean) {
    const floorImg = currentLevel.tileImages[1]
    const door = _rcDoorImage()
    for (const i of room.doors) {
        const c = i % MAP_W
        const r = Math.idiv(i, MAP_W)
        const loc = tiles.getTileLocation(c, r)
        walls[i] = closed
        tiles.setTileAt(loc, closed ? door : floorImg)
        tiles.setWallAt(loc, closed)
        if (fogTileSeen(c, r)) minimapReveal(c, r)
    }
    resetFlowField()
    fogRefresh()
}

function _rcDoorImage(): Image {
    if (_rcDoorImg) return _rcDoorImg
    const im = image.create(16, 16)
    im.fill(15)
    for (let x = 1; x < 16; x += 4) im.fillRect(x, 0, 2, 16, 13)
    im.fillRect(0, 2, 16, 2, 14)
    im.fillRect(0, 12, 16, 2, 14)
    _rcDoorImg = im
    return im
}
