// Coins and vending machines.
//
// Coins come from:
//   - the map: a few are scattered on random floor tiles when the floor starts
//   - enemies: a small chance on every kill (ogres and minibosses drop more)
//   - chests: miniboss and boss chests hold coins, paid out when first opened
// They're pulled in by the magnet like gems and kept for the whole run (player.coins).
//
// Vending machines: each floor has a currentLevel.vendingChance % chance of ONE machine
// on a random floor tile (never the start or boss room). Walk into it to shop.
// Prices go up with the floor number; each machine has limited stock.

namespace SpriteKind {
    export const Coin = SpriteKind.create()
    export const Vending = SpriteKind.create()
}

// ---------------- TUNING ----------------
/** Coins scattered on the map at floor start: [min, max], plus COINS_MAP_PER_FLOOR per floor. */
const COINS_MAP = [4, 7]
const COINS_MAP_PER_FLOOR = 1
/** % chance that a map coin is a gold pile worth COIN_PILE_VALUE instead of 1. */
const COIN_PILE_CHANCE = 20
const COIN_PILE_VALUE = 3
/** % chance a normal enemy drops a coin, and the bigger chance for ogres. */
const COIN_DROP_CHANCE = 10
const COIN_DROP_CHANCE_OGRE = 35
/** Coins inside chests: [min, max]. */
const COINS_MINIBOSS_CHEST = [6, 10]
const COINS_BOSS_CHEST = [15, 25]
/** Coin sprites on the map at once; extra coins are added onto an existing one. */
const MAX_COINS = 60

// ---------------- ART ----------------
const COIN_IMG = img`
    . 5 5 5 .
    5 5 4 5 5
    5 4 5 5 5
    5 5 4 5 5
    . 5 5 5 .
`
const COIN_PILE_IMG = img`
    . . 5 5 5 . .
    . 5 5 4 5 5 .
    . 5 4 5 5 5 .
    5 5 5 5 5 5 5
    5 4 5 5 4 5 5
    . 5 5 5 5 5 .
`
/** 10x10 icon for the HUD and shop menu. */
const COIN_ICON = img`
    . . . 5 5 5 5 . . .
    . . 5 5 5 5 5 5 . .
    . 5 5 4 4 4 4 5 5 .
    5 5 4 5 5 5 5 4 5 5
    5 5 4 5 5 5 5 5 5 5
    5 5 4 5 5 5 5 5 5 5
    5 5 4 5 5 5 5 4 5 5
    . 5 5 4 4 4 4 5 5 .
    . . 5 5 5 5 5 5 . .
    . . . 5 5 5 5 . . .
`

let _vendingImg: Image = null
function vendingImage(): Image {
    if (_vendingImg) return _vendingImg
    const im = image.create(16, 22)
    im.fillRect(0, 0, 16, 22, 15)      // outline
    im.fillRect(1, 1, 14, 20, 8)       // body
    im.fillRect(1, 1, 14, 3, 2)        // red top sign
    im.fillRect(3, 2, 10, 1, 1)
    im.fillRect(2, 5, 9, 11, 9)        // glass
    for (let r = 0; r < 3; r++) {      // products on shelves
        const y = 6 + r * 3
        im.fillRect(3, y, 2, 2, [2, 5, 7][r])
        im.fillRect(6, y, 2, 2, [7, 2, 4][r])
        im.fillRect(9, y + 2, 1, 1, 6) // shelf edge
        im.fillRect(3, y + 2, 7, 1, 6)
    }
    im.fillRect(12, 6, 2, 6, 13)       // keypad
    im.setPixel(12, 7, 15)
    im.setPixel(13, 9, 15)
    im.fillRect(12, 13, 2, 2, 5)       // coin slot
    im.fillRect(3, 17, 10, 3, 15)      // pickup tray
    im.fillRect(4, 18, 8, 1, 12)
    _vendingImg = im
    return im
}

// ---------------- COINS ----------------
function dropCoin(x: number, y: number, val: number) {
    const coins = sprites.allOfKind(SpriteKind.Coin)
    if (coins.length >= MAX_COINS) {
        const c0 = coins[randint(0, coins.length - 1)]
        setDN(c0, "val", getDN(c0, "val") + val)
        return
    }
    const c = sprites.create(val >= COIN_PILE_VALUE ? COIN_PILE_IMG : COIN_IMG, SpriteKind.Coin)
    c.setPosition(x, y)
    c.setFlag(SpriteFlag.GhostThroughWalls, true)
    c.z = 1
    setDN(c, "val", val)
    setDN(c, "pull", 0)
}

/** A shower of coins around (x, y), e.g. from a chest. */
function burstCoins(x: number, y: number, total: number) {
    while (total > 0) {
        const v = total >= COIN_PILE_VALUE ? COIN_PILE_VALUE : 1
        total -= v
        dropCoin(x + randint(-10, 10), y + randint(-10, 10), v)
    }
}

/** Called from killEnemy: maybe drop a coin. */
function maybeDropEnemyCoin(e: Sprite, def: EnemyType) {
    const elite = getDN(e, "elite") > 0
    if (elite) return // minibosses pay out through their chest
    if (Math.percentChance(def.coinDropChance)) dropCoin(e.x + 3, e.y - 2, 1)
}

function gainCoins(n: number) {
    player.coins += n
}

/** Random walkable tile centers (pixels) away from the hero's start, outside the boss room. */
function _shopFloorSpots(minDistTiles: number): number[] {
    const out: number[] = []
    const sc = currentLevel.startCol
    const sr = currentLevel.startRow
    const lv = currentLevel
    const bossRoom = lv.bossRoom >= 0 ? lv.rooms[lv.bossRoom] : null
    const startRoom = lv.startRoom >= 0 ? lv.rooms[lv.startRoom] : null
    for (let r = 1; r < MAP_H - 1; r++) {
        for (let c = 1; c < MAP_W - 1; c++) {
            if (isWall(c, r)) continue
            if (Math.abs(c - sc) + Math.abs(r - sr) < minDistTiles) continue
            if (bossRoom && _shopInRoom(bossRoom, c, r)) continue
            if (startRoom && _shopInRoom(startRoom, c, r)) continue
            out.push(r * MAP_W + c)
        }
    }
    return out
}

function _shopInRoom(room: PlacedRoom, c: number, r: number): boolean {
    return c >= room.x && c < room.x + room.w && r >= room.y && r < room.y + room.h
}

/** Takes a random tile out of spots and returns it (-1 if empty). */
function _shopTakeSpot(spots: number[]): number {
    if (spots.length == 0) return -1
    const k = randint(0, spots.length - 1)
    const t = spots[k]
    spots.removeAt(k)
    return t
}

// ---------------- VENDING MACHINE ----------------
// Products: names, what they do and prices are all here.
const V_NAME = ["Health Soda", "XP Candy", "Energy Drink", "Iron Snack", "Mystery Box"]
const V_DESC = ["Heal 4 HP", "Instantly gain a level", "Ability ready right now", "+1 max HP", "Drops a treasure chest"]
/** Price on floor 1, and how much it goes up per floor after that. */
const V_PRICE = [5, 12, 4, 15, 22]
const V_PRICE_PER_FLOOR = [1, 3, 1, 3, 5]
/** Stock per machine. */
const V_STOCK = [3, 2, 2, 1, 1]
/** true = buying it closes the shop (a level-up menu or a chest comes next). */
const V_CLOSES = [false, true, false, false, true]
/** 16x16 product pictures, same order as V_NAME (drawn at 2x in the shop). */
const V_IMG: Image[] = [
    img`
        .....bbbbbb.....
        ....bddddddb....
        ...2222222222...
        ...2222222222...
        ...2111111112...
        ...2122122112...
        ...2122222112...
        ...2112221112...
        ...2111211112...
        ...2111111112...
        ...2222222222...
        ...2222222222...
        ...2222222222...
        ...2222222222...
        ....bddddddb....
        ................
    `, img`
        ................
        ................
        ................
        ................
        55...777777...55
        555.77777777.555
        5555771177775555
        5555777777775555
        5555777777775555
        5555777777665555
        555.77777766.555
        55...777777...55
        ................
        ................
        ................
        ................
    `, img`
        .....dddddd.....
        ....88888888....
        ....88888888....
        ....88888558....
        ....88885588....
        ....88855888....
        ....88555558....
        ....88885588....
        ....88855888....
        ....88588888....
        ....88888888....
        ....88888888....
        ....89999998....
        ....88888888....
        .....dddddd.....
        ................
    `, img`
        ................
        ................
        ................
        ................
        ..bbbbbbbbbbbb..
        .bddddddddddddb.
        .bd22d22ddddddb.
        .bd22222ddbbbdb.
        .bdd222dddddddb.
        .bddd2dddbbbddb.
        .bddddddddddddb.
        ..bbbbbbbbbbbb..
        ................
        ................
        ................
        ................
    `, img`
        ................
        ................
        ..444444444444..
        ..444444444444..
        ..eeeeeeeeeeee..
        ..eeeee55eeeee..
        ..eeee5ee5eeee..
        ..eeeeeee5eeee..
        ..eeeeee5eeeee..
        ..eeeee5eeeeee..
        ..eeeeeeeeeeee..
        ..eeeee5eeeeee..
        ..eeeeeeeeeeee..
        ..eeeeeeeeeeee..
        ................
        ................
    `,
]
const V_IMG_BIG: Image[] = V_IMG.map(im => im.doubled())

/** The machine on this floor (null = none this floor). */
let vendingMachine: Sprite = null

function vendPrice(i: number): number {
    return V_PRICE[i] + (floorNum - 1) * V_PRICE_PER_FLOOR[i]
}

/** Called from setupFloor, after the map is built: scatter coins, maybe place a machine. */
function setupShop() {
    vendingMachine = null
    const spots = _shopFloorSpots(4)
    // coins on the map
    let n = randint(COINS_MAP[0], COINS_MAP[1]) + (floorNum - 1) * COINS_MAP_PER_FLOOR
    while (n > 0) {
        const t = _shopTakeSpot(spots)
        if (t < 0) break
        const v = Math.percentChance(COIN_PILE_CHANCE) ? COIN_PILE_VALUE : 1
        dropCoin((t % MAP_W) * 16 + 8 + randint(-4, 4), Math.idiv(t, MAP_W) * 16 + 8 + randint(-4, 4), v)
        n--
    }
    // a vending machine - not every floor has one
    if (!Math.percentChance(currentLevel.vendingChance)) return
    // prefer tiles with floor all around, so the machine isn't half inside a wall
    const roomy: number[] = []
    for (const t of _shopFloorSpots(8)) {
        const c = t % MAP_W
        const r = Math.idiv(t, MAP_W)
        if (!isWall(c - 1, r) && !isWall(c + 1, r) && !isWall(c, r - 1) && !isWall(c, r + 1)) roomy.push(t)
    }
    const t = _shopTakeSpot(roomy.length > 0 ? roomy : spots)
    if (t < 0) return
    const m = sprites.create(vendingImage(), SpriteKind.Vending)
    m.setPosition((t % MAP_W) * 16 + 8, Math.idiv(t, MAP_W) * 16 + 5)
    m.z = 2
    setDN(m, "armed", 1)
    m.data["stock"] = V_STOCK.slice(0)
    vendingMachine = m
}

// The shop screen: one square box per product (picture + price strip at the bottom),
// LEFT/RIGHT to choose, A to buy, B to leave. Like openMenu, it's only queued here and
// shown from the frame handler in main.ts (see the MENUS comment there).
function openVending(m: Sprite) {
    setDN(m, "armed", 0) // don't reopen until the hero steps off
    menuOpen = true
    _pendingMenu = function () {
        _showVending(m)
    }
}

function _showVending(m: Sprite) {
    game.pushScene()
    scene.setBackgroundColor(15)
    const stock: number[] = m.data["stock"]
    const n = V_NAME.length
    let sel = 0
    while (sel < n - 1 && stock[sel] <= 0) sel++
    // a message shown under the boxes for a moment (gameTime is paused in here)
    let msg = ""
    let msgCol = 1
    let msgUntil = 0

    // layout: one row of square boxes, centered
    const gap = 6
    const box = Math.min(56, Math.idiv(SW - 16 - (n - 1) * gap, n))
    const big = box >= 44 // 2x pictures when the boxes are big enough
    const x0 = Math.idiv(SW - (n * box + (n - 1) * gap), 2)
    const y0 = 36
    const stripH = 11

    scene.createRenderable(50, (t, c) => {
        printC(t, "VENDING MACHINE", 6, 5, image.font8)
        // coins you have
        const cs = "" + player.coins
        const cw = 12 + cs.length * 6
        const cx = Math.idiv(SW - cw, 2)
        t.drawTransparentImage(COIN_ICON, cx, 19)
        t.print(cs, cx + 12, 21, 5, image.font5)

        for (let i = 0; i < n; i++) {
            const x = x0 + i * (box + gap)
            const on = i == sel
            const out = stock[i] <= 0
            const price = vendPrice(i)
            // the box
            t.fillRect(x, y0, box, box, on ? 8 : 12)
            t.drawRect(x, y0, box, box, on ? 5 : 11)
            if (on) t.drawRect(x - 1, y0 - 1, box + 2, box + 2, 5)
            // the picture, centered in the space above the price strip
            const pic = big ? V_IMG_BIG[i] : V_IMG[i]
            const px = x + Math.idiv(box - pic.width, 2)
            const py = y0 + Math.idiv(box - stripH - pic.height, 2)
            t.drawTransparentImage(pic, px, py)
            if (out) {
                // sold out: cross the picture
                t.drawLine(x + 4, y0 + 4, x + box - 5, y0 + box - stripH - 3, 2)
                t.drawLine(x + box - 5, y0 + 4, x + 4, y0 + box - stripH - 3, 2)
            }
            // price strip along the bottom
            const sy = y0 + box - stripH - 1
            t.fillRect(x + 1, sy, box - 2, stripH, 15)
            t.drawLine(x + 1, sy, x + box - 2, sy, on ? 5 : 11)
            if (out) {
                const s = "SOLD"
                t.print(s, x + Math.idiv(box - s.length * 6, 2), sy + 3, 11, image.font5)
            } else {
                const s = "" + price
                const w = 7 + s.length * 6
                const tx = x + Math.idiv(box - w, 2)
                t.drawTransparentImage(COIN_IMG, tx, sy + 3)
                t.print(s, tx + 7, sy + 3, player.coins >= price ? 5 : 2, image.font5)
            }
            // stock count in the top-right corner
            if (!out) t.print("x" + stock[i], x + box - 13, y0 + 3, on ? 1 : 11, image.font5)
        }

        // details of the selected product
        const dy = y0 + box + 10
        printC(t, V_NAME[sel], dy, 1, image.font8)
        printC(t, V_DESC[sel], dy + 13, 11, image.font5)
        if (game.runtime() < msgUntil) {
            printC(t, msg, dy + 26, msgCol, image.font8)
        } else if (stock[sel] <= 0) {
            printC(t, "SOLD OUT", dy + 26, 2, image.font8)
        } else if (player.coins < vendPrice(sel)) {
            printC(t, "Not enough coins", dy + 26, 2, image.font5)
        }
        printC(t, "LEFT/RIGHT choose   A buy   B leave", SH - 9, 11, image.font5)
    })

    const close = function () {
        game.popScene()
        menuOpen = false
    }
    controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
        sel = (sel + n - 1) % n
    })
    controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
        sel = (sel + 1) % n
    })
    controller.B.onEvent(ControllerButtonEvent.Pressed, close)
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        const i = sel
        const price = vendPrice(i)
        if (stock[i] <= 0 || player.coins < price) {
            msg = stock[i] <= 0 ? "SOLD OUT" : "NOT ENOUGH COINS"
            msgCol = 2
            msgUntil = game.runtime() + 1000
            sfx(music.thump)
            return
        }
        player.coins -= price
        stock[i]--
        sfx(music.baDing)
        if (V_CLOSES[i]) {
            close()
            banner(_vendApply(i, m), 1200)
        } else {
            msg = _vendApply(i, m)
            msgCol = 7
            msgUntil = game.runtime() + 1000
        }
    })
}

/** Gives product i and returns the message to show. */
function _vendApply(i: number, m: Sprite): string {
    if (i == 0) {
        hero.heal(4)
        return "+4 HP"
    } else if (i == 1) {
        player.xp = player.xpNeed
        player.gainXp(0) // levels up; the level-up menu shows after the shop closes
        return "LEVEL UP!"
    } else if (i == 2) {
        hero.abilityReadyAt = gameTime
        return "ABILITY READY!"
    } else if (i == 3) {
        hero.maxHp += 1
        hero.heal(1)
        return "+1 MAX HP"
    }
    // Mystery Box: the chest pops out just below the machine
    dropChest(m.x, m.y + 18)
    return "A CHEST POPS OUT!"
}

/** Called every frame from the main loop. */
function updateShop() {
    const m = vendingMachine
    if (m && getDN(m, "armed") == 0 && !hero.overlapsWith(m)) setDN(m, "armed", 1)
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.Coin, function (p, c) {
    gainCoins(getDN(c, "val"))
    sfx(music.knock)
    c.destroy()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Vending, function (p, m) {
    if (menuOpen || getDN(m, "armed") == 0) return
    openVending(m)
})

// ---------------- HUD ----------------
function drawCoinCounter(t: Image, x: number, y: number) {
    const s = "" + player.coins
    t.fillRect(x, y, 14 + s.length * 6, 12, 15)
    t.drawTransparentImage(COIN_ICON, x + 1, y + 1)
    t.print(s, x + 13, y + 3, 5, image.font5)
}
