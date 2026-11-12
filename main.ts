// =====================================================
//  SOUL SURVIVORS  -  Soul Knight x Vampire Survivors
//  MakeCode Arcade (JavaScript)
//  Arrows: move  |  Auto-aim & auto-fire
//  A: hero ability | each hero has its own attack
//  Survive each floor, kill the boss, enter the portal.
// =====================================================

namespace SpriteKind {
    export const Gem = SpriteKind.create()
    export const EnemyShot = SpriteKind.create()
    export const Orbit = SpriteKind.create()
    export const Pickup = SpriteKind.create()
    export const Portal = SpriteKind.create()
    export const Fx = SpriteKind.create()
    export const Attach = SpriteKind.create()
    export const Barrier = SpriteKind.create()
    export const Chest = SpriteKind.create()
}

// ---------------- CONFIG ----------------
// map size in tiles - set by the current level when it builds (see BaseClasses/Level.ts)
let MAP_W = 34
let MAP_H = 34
const MAX_ENEMIES = 45
const MAX_GEMS = 120
// actual screen size (set in config.ts) - use these instead of hardcoding 160 / 120
const SW = scene.screenWidth()
const SH = scene.screenHeight()
const MAX_SHOTS = 70

// ---------------- HEROES ----------------
// Heroes are classes in Characters/. Add new ones to the roster in startHeroSelect().

// ---------------- UPGRADES ----------------
// Level-up buffs are classes in Buffs/Buffs.ts (offered from BUFF_POOL in Buffs/BuffRoster.ts).

// ---------------- LEVELS ----------------
// Levels live in Levels/ (order in Levels/LevelRoster.ts); each picks its own boss from Bosses/.

// ---------------- ENEMIES ----------------
// Enemy types, stats, sprites and death effects live in Enemies.ts.

// ---------------- ART ----------------
const GEM_G = img`
..7..
.717.
77777
.777.
..7..
`
const HEART = img`
.22.22.
2212222
2222222
.22222.
..222..
...2...
`

const GEM_B = GEM_G.clone()
GEM_B.replace(7, 9)
const GEM_R = GEM_G.clone()
GEM_R.replace(7, 2)

function makeBall(r: number, outer: number, inner: number): Image {
    const s = r * 2 + 1
    const im = image.create(s, s)
    im.fillCircle(r, r, r, outer)
    if (r >= 2) im.fillCircle(r, r, r - 1, inner)
    else im.setPixel(r, r, inner)
    return im
}
function makeRing(r: number, c: number, c2: number): Image {
    const im = image.create(r * 2 + 1, r * 2 + 1)
    im.drawCircle(r, r, r, c)
    im.drawCircle(r, r, r - 1, c2)
    return im
}
function makeBlade(): Image {
    const im = image.create(9, 9)
    im.drawLine(1, 1, 7, 7, 9)
    im.drawLine(1, 7, 7, 1, 9)
    im.drawLine(0, 4, 8, 4, 1)
    im.drawLine(4, 0, 4, 8, 1)
    im.fillRect(3, 3, 3, 3, 11)
    return im
}
function makeBolt(): Image {
    const im = image.create(9, 56)
    let x = 4
    for (let y = 0; y < 56; y += 7) {
        const nx = randint(1, 7)
        im.drawLine(x, y, nx, y + 7, 5)
        im.drawLine(x + 1, y, nx + 1, y + 7, 1)
        x = nx
    }
    return im
}
function makeExplosion(r: number): Image {
    const im = image.create(r * 2 + 1, r * 2 + 1)
    im.fillCircle(r, r, r, 2)
    im.fillCircle(r, r, r - 4, 4)
    im.fillCircle(r, r, r - 9, 5)
    return im
}
/** Red/orange spark burst for enemy deaths (the white PUFF_IMG means "something spawns here"). */
function makeDeathBurst(): Image {
    const im = image.create(11, 11)
    // 8 sparks pointing outward
    im.drawLine(5, 0, 5, 2, 2)
    im.drawLine(5, 8, 5, 10, 2)
    im.drawLine(0, 5, 2, 5, 2)
    im.drawLine(8, 5, 10, 5, 2)
    im.setPixel(1, 1, 4)
    im.setPixel(9, 1, 4)
    im.setPixel(1, 9, 4)
    im.setPixel(9, 9, 4)
    im.setPixel(2, 2, 4)
    im.setPixel(8, 2, 4)
    im.setPixel(2, 8, 4)
    im.setPixel(8, 8, 4)
    im.fillCircle(5, 5, 1, 4)
    return im
}
function makePortal(a: number, b: number): Image {
    const im = image.create(20, 20)
    im.fillCircle(10, 10, 9, 15)
    im.fillCircle(10, 10, 8, a)
    im.fillCircle(10, 10, 6, b)
    im.fillCircle(10, 10, 4, a)
    im.fillCircle(10, 10, 2, 1)
    return im
}

const SHOT_IMG = makeBall(2, 2, 3)
const PUFF_IMG = makeBall(2, 1, 13)
const DEATH_IMG = makeDeathBurst()
const BLADE_IMG = makeBlade()
const BOLT_IMG = makeBolt()
const EXPLO_IMG = makeExplosion(18)
const NOVA_IMG = makeRing(52, 9, 1)
const PORTAL_A = makePortal(10, 9)
const PORTAL_B = makePortal(9, 10)

// ---------------- STATE ----------------
let started = false
let hero: HeroCharacter = null
let player: Player = null
let boss: Boss = null
let currentLevel: Level = null
let portal: Sprite = null
let orbits: Sprite[] = []
let floorNum = 1
let floorTime = 0
let gameTime = 0
let lastTick = 0
let bossSpawned = false
let bossAlive = false
let kills = 0
let fireTimer = 0
let invulnUntil = 0
let spawnTimer = 0
let swarmTimer = 0
let aimAngle = 0
let menuOpen = false
let wantNextFloor = false
let wantGameOver = false
let bannerText = ""
let bannerUntil = 0
let magnetAll = false
let walls: boolean[] = []

// ---------------- SPRITE DATA ----------------
function setDN(s: Sprite, k: string, v: number) {
    s.data[k] = v
}
function getDN(s: Sprite, k: string): number {
    const v = s.data[k]
    if (v === undefined || v === null) return 0
    return v
}
function setDB(s: Sprite, k: string, v: boolean) {
    s.data[k] = v
}
function getDB(s: Sprite, k: string): boolean {
    return s.data[k] === true
}

// ---------------- HELPERS ----------------
function sfx(m: music.Melody) {
    music.play(music.melodyPlayable(m), music.PlaybackMode.InBackground)
}
function banner(text: string, ms: number) {
    bannerText = text
    bannerUntil = gameTime + ms
}
function printC(t: Image, text: string, y: number, col: number, f: image.Font) {
    t.print(text, Math.floor((SW - text.length * f.charWidth) / 2), y, col, f)
}
function fmtTime(ms: number): string {
    const s = Math.max(0, Math.ceil(ms / 1000))
    const m = Math.floor(s / 60)
    const ss = s % 60
    return m + ":" + (ss < 10 ? "0" : "") + ss
}
function fx(im: Image, x: number, y: number, life: number) {
    const s = sprites.create(im, SpriteKind.Fx)
    s.setFlag(SpriteFlag.Ghost, true)
    s.setPosition(x, y)
    s.lifespan = life
    s.z = 5
}
function isWall(c: number, r: number): boolean {
    if (c < 0 || r < 0 || c >= MAP_W || r >= MAP_H) return true
    return walls[r * MAP_W + c]
}
function isWallAt(x: number, y: number): boolean {
    return isWall(Math.floor(x / 16), Math.floor(y / 16))
}

function clearLevel() {
    const kinds = [SpriteKind.Enemy, SpriteKind.EnemyShot, SpriteKind.Projectile, SpriteKind.Gem, SpriteKind.Pickup, SpriteKind.Portal, SpriteKind.Fx, SpriteKind.Chest]
    for (const k of kinds) sprites.destroyAllSpritesOfKind(k)
    portal = null
    boss = null
}

function setupFloor() {
    clearLevel()
    currentLevel = levelForFloor(floorNum)
    currentLevel.build() // rolls a brand-new map from the level's generation settings
    resetFlowField()
    resetFog(currentLevel.fogOfWar, currentLevel.fogRadius) // before buildMinimap
    resetRoomClear()
    miniBossIdx = 0
    buildMinimap()
    hero.setPosition(currentLevel.startCol * 16 + 8, currentLevel.startRow * 16 + 8)
    floorTime = 0
    spawnTimer = currentLevel.firstSpawnDelay
    swarmTimer = 0
    bossSpawned = false
    bossAlive = false
    magnetAll = false
    banner(floorNum >= FINAL_FLOOR ? "FINAL FLOOR: " + currentLevel.name : "FLOOR " + floorNum + "/" + FINAL_FLOOR + ": " + currentLevel.name, 2500)
    currentLevel.onStart()
}

// ---------------- ENEMIES ----------------
function findSpawn(): number[] {
    // inside a locked room everything spawns in that room
    if (roomLocked()) return roomSpawnPoint()
    for (let tries = 0; tries < 20; tries++) {
        const a = Math.random() * Math.PI * 2
        const d = randint(Math.floor(SW * 0.6), Math.floor(SW * 0.875))
        const x = hero.x + Math.cos(a) * d
        const y = hero.y + Math.sin(a) * d
        const c = Math.floor(x / 16)
        const r = Math.floor(y / 16)
        if (!isWall(c, r)) return [c * 16 + 8, r * 16 + 8]
    }
    return []
}

function initEnemy(e: Sprite, t: number, hpv: number, spd: number) {
    setDN(e, "type", t)
    setDN(e, "hp", hpv)
    setDN(e, "maxhp", hpv)
    setDN(e, "spd", spd)
    setDN(e, "cd", randint(800, 2500))
    setDN(e, "stun", 0)
    setDN(e, "orb", -9999)
    setDB(e, "dead", false)
}

function spawnEnemyAt(t: number, x: number, y: number, force = false): Sprite {
    if (!force && sprites.allOfKind(SpriteKind.Enemy).length >= MAX_ENEMIES) return null
    const e = sprites.create(E_IMG[t], SpriteKind.Enemy)
    e.setPosition(x, y)
    if (E_FLY[t]) e.setFlag(SpriteFlag.GhostThroughWalls, true)
    const scale = 1 + 0.45 * (floorNum - 1) + floorTime / 60000 * 0.6
    initEnemy(e, t, Math.ceil(E_HP[t] * scale), E_SPD[t] + floorNum * 2 + randint(-3, 3))
    return e
}

// ---------------- MINIBOSSES + CHESTS ----------------
let miniBossIdx = 0 // next entry of currentLevel.miniBossAt (timed levels)

/** A big, tough version of a normal enemy (see the level's miniBoss* settings). Drops a chest. */
function spawnMiniBoss(x: number, y: number): Sprite {
    const lv = currentLevel
    const e = spawnEnemyAt(lv.miniBossEnemy, x, y, true)
    setDN(e, "hp", getDN(e, "hp") * lv.miniBossHpMult)
    setDN(e, "maxhp", getDN(e, "hp"))
    setDN(e, "elite", 1)
    e.scale = lv.miniBossScale
    fx(PUFF_IMG, x, y, 300)
    banner("MINIBOSS!", 1500)
    sfx(music.thump)
    return e
}

let _chestImg: Image = null
function chestImage(): Image {
    if (_chestImg) return _chestImg
    const im = image.create(16, 13)
    im.fillRect(1, 4, 14, 9, 14)   // body
    im.fillRect(0, 1, 16, 5, 4)    // lid
    im.drawRect(0, 1, 16, 12, 15)
    im.drawLine(0, 5, 15, 5, 15)
    im.fillRect(6, 4, 4, 4, 5)     // lock
    im.setPixel(7, 6, 15)
    im.setPixel(8, 6, 15)
    _chestImg = im
    return im
}

function dropChest(x: number, y: number) {
    if (isWallAt(x, y)) {
        x = Math.floor(hero.x / 16) * 16 + 8
        y = Math.floor(hero.y / 16) * 16 + 8
    }
    const c = sprites.create(chestImage(), SpriteKind.Chest)
    c.setPosition(x, y)
    c.z = 2
    setDN(c, "armed", 1)
    fx(PUFF_IMG, x, y, 250)
    sfx(music.magicWand)
}

function isCarried(it: Item): boolean {
    return player.items.indexOf(it) >= 0
}

/** A chest offers CHEST_CHOICES items: new ones start at Lv1, ones you carry level up. */
function openChest(c: Sprite) {
    // the choices are rolled once per chest, so stepping off and on doesn't re-roll them
    let choices: Item[] = c.data["items"]
    if (!choices) {
        choices = rollChestItems(player.items, CHEST_CHOICES)
        c.data["items"] = choices
    }
    const open: Item[] = []
    for (const it of choices) if (it.level < it.maxLevel) open.push(it)
    if (open.length == 0) {
        // every item is maxed
        hero.heal(hero.maxHp)
        banner("FULL HEAL!", 1500)
        c.destroy()
        return
    }
    const full = player.items.length >= player.maxItemSlots 
    const names: string[] = []
    const descs: string[] = []
    const icons: Image[] = []
    for (const it of open) {
        const have = isCarried(it)
        const next = have ? it.level + 1 : 1
        let label = it.name + " Lv" + next
        if (!have) label += full ? "  (swap)" : "  NEW"
        if (next == it.maxLevel) label += " MAX"
        names.push(label)
        descs.push(it.describe(next))
        icons.push(it.icon)
    }
    names.push("Leave it")
    descs.push("Close the chest")
    icons.push(null)
    setDN(c, "armed", 0) // don't reopen until the hero steps off
    const footer = full ? "Items full: a NEW item replaces one" : "UP/DOWN choose  A select"
    openMenu("TREASURE CHEST", names, descs, footer, function (i: number) {
        if (i >= open.length) return
        const it = open[i]
        if (isCarried(it)) {
            player.upgradeItem(it)
            banner(it.name.toUpperCase() + " LV" + it.level, 1500)
            sfx(music.powerUp)
            c.destroy()
        } else if (!full) {
            player.equipItem(it)
            banner("GOT " + it.name.toUpperCase(), 1500)
            sfx(music.powerUp)
            c.destroy()
        } else {
            chooseSwap(c, it)
        }
    }, icons)
}

/** Items full: pick which carried item the new one replaces. */
function chooseSwap(c: Sprite, it: Item) {
    // only droppable items are offered; slot[k] = index in player.items of menu row k
    const slot: number[] = []
    const names: string[] = []
    const descs: string[] = []
    const icons: Image[] = []
    for (let k = 0; k < player.items.length; k++) {
        const old = player.items[k]
        if (old.undroppable) continue
        slot.push(k)
        names.push("Drop " + old.name + " Lv" + old.level)
        descs.push("(" + old.describe(old.level) + ")")
        icons.push(old.icon)
    }
    if (slot.length == 0) {
        banner("YOUR ITEMS CAN'T BE DROPPED", 1500)
        return
    }
    names.push("Cancel")
    descs.push("Keep your items")
    icons.push(null)
    openMenu("TAKE " + it.name.toUpperCase() + "?", names, descs, it.name + ": " + it.describe(1), function (i: number) {
        if (i >= slot.length) return
        const old = player.items[slot[i]]
        player.replaceItem(slot[i], it)
        banner("SWAPPED " + old.name.toUpperCase(), 1500)
        sfx(music.powerUp)
        if (c) c.destroy() // null when called from the dev menu
    }, icons)
}

// spawns one enemy just off screen, type picked from the level's enemyWeights
function spawnEnemy() {
    const pos = findSpawn()
    if (pos.length == 0) return
    spawnEnemyAt(currentLevel.pickEnemy(floorTime), pos[0], pos[1])
}

function spawnRing() {
    const n = currentLevel.swarmSize
    for (let i = 0; i < n; i++) {
        const a = i * 2 * Math.PI / n
        const x = hero.x + Math.cos(a) * SW * 0.66
        const y = hero.y + Math.sin(a) * SH * 0.66
        if (!isWallAt(x, y)) spawnEnemyAt(currentLevel.swarmEnemy, x, y)
    }
}

function spawnBoss() {
    bossSpawned = true
    bossAlive = true
    boss = currentLevel.createBoss()
    const pos = boss.spawnPosition()
    boss.setPosition(pos[0], pos[1])
    boss.onSpawn()
}

function enemyShoot(src: Sprite, a: number, spd: number) {
    if (sprites.allOfKind(SpriteKind.EnemyShot).length >= MAX_SHOTS) return
    const s = sprites.create(SHOT_IMG, SpriteKind.EnemyShot)
    s.setPosition(src.x, src.y)
    s.setVelocity(Math.cos(a) * spd, Math.sin(a) * spd)
    s.setFlag(SpriteFlag.DestroyOnWall, true)
    s.setFlag(SpriteFlag.AutoDestroy, true)
    s.lifespan = 4000
}

// ---------------- TARGETING ----------------
// When true, projectiles created by the hero fly over walls (set while firing at a flyer behind a wall).
let shotsIgnoreWalls = false

function isFlyer(e: Sprite): boolean {
    if (boss && e == boss) return boss.flying
    return E_FLY[getDN(e, "type")]
}

/** true if no wall tile lies on the straight line between the two points. */
function lineOfSight(x0: number, y0: number, x1: number, y1: number): boolean {
    const dx = x1 - x0
    const dy = y1 - y0
    const steps = Math.ceil(Math.sqrt(dx * dx + dy * dy) / 6)
    for (let i = 1; i < steps; i++) {
        if (isWallAt(x0 + dx * i / steps, y0 + dy * i / steps)) return false
    }
    return true
}

/**
 * Nearest enemy within range that can be shot from (x, y): ground enemies need a clear
 * line of sight; flyers can be targeted through walls when flyersThroughWalls is true.
 */
function findTarget(x: number, y: number, range: number, flyersThroughWalls: boolean): Sprite {
    const list: Sprite[] = []
    const dist: number[] = []
    const r2 = range * range
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        const dx = e.x - x
        const dy = e.y - y
        const d = dx * dx + dy * dy
        if (d >= r2) continue
        // insert sorted by distance so the line-of-sight check runs nearest-first
        let k = dist.length
        while (k > 0 && dist[k - 1] > d) k--
        list.insertAt(k, e)
        dist.insertAt(k, d)
    }
    for (const e of list) {
        if (flyersThroughWalls && isFlyer(e)) return e
        if (lineOfSight(x, y, e.x, e.y)) return e
    }
    return null
}

function hurtEnemy(e: Sprite, dmg: number) {
    if (Math.percentChance(player.critChance)) dmg *= player.critMult
    if (player) for (const it of player.perks()) dmg = it.modifyDamageDealt(e, dmg)
    if (boss && e == boss) {
        boss.hp -= dmg // Boss.onDeath() runs at 0 hp
        return
    }
    if (getDB(e, "dead")) return
    const hpv = getDN(e, "hp") - dmg
    setDN(e, "hp", hpv)
    if (hpv <= 0) killEnemy(e)
}

/** effects = false skips death effects (splitting, reviving, shot bursts), e.g. on boss defeat. */
function killEnemy(e: Sprite, effects = true) {
    if (getDB(e, "dead")) return
    setDB(e, "dead", true)
    const t = getDN(e, "type")
    kills++
    dropGem(e.x, e.y, E_XP[t])
    if (getDN(e, "elite") > 0) dropChest(e.x, e.y)
    if (player) for (const it of player.perks()) it.onKill(e.x, e.y)
    if (Math.percentChance(t == T_OGRE ? 6 : 1.5)) dropPickup(2, e.x - 3, e.y + 2)
    fx(DEATH_IMG, e.x, e.y, 150)
    if (effects) enemyDeathEffects(e, t) // see Enemies.ts
    e.destroy()
}

function bossDefeated(b: Boss) {
    bossAlive = false
    boss = null
    kills++
    sprites.destroyAllSpritesOfKind(SpriteKind.EnemyShot)
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        if (e != b) killEnemy(e, false) // no splitting/reviving once the boss is dead
    }
    // final floor: beating the boss wins the game (no portal, no chest)
    if (floorNum >= FINAL_FLOOR) {
        fx(EXPLO_IMG, b.x, b.y, 400)
        scene.cameraShake(6, 900)
        doVictory(b.name)
        return
    }
    for (let i = 0; i < b.gemDrops; i++) dropGem(b.x + randint(-12, 12), b.y + randint(-12, 12), 10)
    dropPickup(2, b.x + 10, b.y)
    // chest a little toward the hero, so it isn't on top of the portal
    const cdx = hero.x - b.x
    const cdy = hero.y - b.y
    const cd = Math.sqrt(cdx * cdx + cdy * cdy) + 0.01
    dropChest(b.x + cdx / cd * 28, b.y + cdy / cd * 28)
    // the boss can die wedged against (or inside) a wall: snap the portal to the
    // nearest floor tile the hero can actually walk to
    const pp = nearestReachableSpot(b.x, b.y)
    portal = sprites.create(PORTAL_A, SpriteKind.Portal)
    portal.setPosition(pp[0], pp[1])
    portal.z = 1
    setDN(portal, "ready", gameTime + 2500)
    magnetAll = true
    fx(EXPLO_IMG, b.x, b.y, 300)
    scene.cameraShake(5, 600)
    banner("BOSS DEFEATED!", 2500)
    sfx(music.powerUp)
}

function explode(x: number, y: number, dmg: number) {
    fx(EXPLO_IMG, x, y, 160)
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        const dx = e.x - x
        const dy = e.y - y
        if (dx * dx + dy * dy < 24 * 24) hurtEnemy(e, dmg)
    }
}

// ---------------- DROPS ----------------
function dropGem(x: number, y: number, val: number) {
    const gems = sprites.allOfKind(SpriteKind.Gem)
    if (gems.length >= MAX_GEMS) {
        const g0 = gems[randint(0, gems.length - 1)]
        setDN(g0, "val", getDN(g0, "val") + val)
        return
    }
    const g = sprites.create(val >= 10 ? GEM_R : (val >= 3 ? GEM_B : GEM_G), SpriteKind.Gem)
    g.setPosition(x, y)
    g.setFlag(SpriteFlag.GhostThroughWalls, true)
    g.z = 1
    setDN(g, "val", val)
    setDN(g, "pull", 0)
}

function dropPickup(kind: number, x: number, y: number) {
    const s = sprites.create(HEART, SpriteKind.Pickup)
    s.setPosition(x, y)
    s.setFlag(SpriteFlag.GhostThroughWalls, true)
    s.z = 1
    setDN(s, "kind", kind)
    setDN(s, "pull", 0)
    s.lifespan = 15000
}

function pullToPlayer(g: Sprite, r2: number) {
    const dx = hero.x - g.x
    const dy = hero.y - g.y
    const d2 = dx * dx + dy * dy
    if (magnetAll || d2 < r2 || getDN(g, "pull") == 1) {
        setDN(g, "pull", 1)
        const d = Math.sqrt(d2) + 0.01
        g.vx = dx / d * 150
        g.vy = dy / d * 150
    }
}

// ---------------- PLAYER ----------------
function hurtPlayer(d: number) {
    if (gameTime < invulnUntil || wantGameOver || !started) return
    invulnUntil = gameTime + 800
    for (const it of player.perks()) d = it.modifyDamageTaken(d)
    if (d <= 0) {
        sfx(music.zapped) // blocked
        return
    }
    hero.hp -= d // calls hero.onDeath() at 0 hp
    scene.cameraShake(3, 150)
    sfx(music.smallCrash)
}

function addOrbit() {
    const o = sprites.create(BLADE_IMG, SpriteKind.Orbit)
    o.setFlag(SpriteFlag.GhostThroughWalls, true)
    o.z = 9
    orbits.push(o)
}


// ---------------- MENUS ----------------
// Menus must not push their scene in the middle of a frame. The engine updates sprites
// (lifespan, AutoDestroy) at frame priority 55, AFTER game.onUpdate (20) and overlaps (15),
// and it removes a dying sprite from game.currentScene() - so if a menu was pushed earlier
// in that frame, sprites expiring that frame (explosions, lightning...) are removed from the
// menu scene instead and stay stuck in the game scene forever. So openMenu only queues the
// menu, and it is shown from a frame handler that runs right after the sprite update.
let _pendingMenu: () => void = null
game.eventContext().registerFrameHandler(56, function () {
    if (!_pendingMenu) return
    const show = _pendingMenu
    _pendingMenu = null
    show()
})

function openMenu(title: string, names: string[], descs: string[], footer: string, onPick: (i: number) => void, icons: Image[] = null) {
    menuOpen = true
    _pendingMenu = function () {
        _showMenu(title, names, descs, footer, onPick, icons)
    }
}

function _showMenu(title: string, names: string[], descs: string[], footer: string, onPick: (i: number) => void, icons: Image[]) {
    game.pushScene()
    let sel = 0
    scene.setBackgroundColor(15)
    // shrink rows so any number of options fits between the title and footer
    const rowH = Math.min(30, Math.floor((SH - 28) / names.length))
    const pad = rowH >= 26 ? 4 : 2
    scene.createRenderable(50, (t, c) => {
        printC(t, title, 4, 5, image.font8)
        for (let i = 0; i < names.length; i++) {
            const y = 17 + i * rowH
            const on = i == sel
            t.fillRect(6, y, SW - 12, rowH - 2, on ? 8 : 12)
            t.drawRect(6, y, SW - 12, rowH - 2, on ? 5 : 11)
            let tx = 10
            if (icons && icons[i]) {
                t.drawTransparentImage(icons[i], 10, y + pad)
                tx = 24
            }
            t.print(names[i], tx, y + pad, on ? 5 : 1, image.font8)
            // a description can have several lines separated by "\n"
            if (descs[i]) {
                const lines = descs[i].split("\n")
                for (let j = 0; j < lines.length; j++) {
                    t.print(lines[j], tx, y + pad + 10 + j * 7, on ? 1 : 11, image.font5)
                }
            }
        }
        printC(t, footer, SH - 9, 11, image.font5)
    })
    controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
        sel = (sel + names.length - 1) % names.length
    })
    controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
        sel = (sel + 1) % names.length
    })
    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        game.popScene()
        menuOpen = false
        onPick(sel)
    })
}

function showLevelUp() {
    // picks come from BUFF_POOL (Buffs/BuffRoster.ts); max BUFF_SLOTS different buffs
    const full = player.buffs.length >= BUFF_SLOTS
    const picks = rollLevelUpBuffs(player.buffs, LEVEL_UP_CHOICES)
    const names: string[] = []
    const descs: string[] = []
    const icons: Image[] = []
    for (const b of picks) {
        const next = b.level + 1
        let label = b.name
        if (!b.instant) {
            label += " Lv" + next
            if (b.level == 0) label += "  NEW"
            if (next == b.maxLevel) label += " MAX"
        }
        names.push(label)
        descs.push(b.describe(next))
        icons.push(b.icon)
    }
    sfx(music.baDing)
    const footer = full ? "Buffs full (" + BUFF_SLOTS + "/" + BUFF_SLOTS + ") - A select" : "UP/DOWN choose  A select"
    openMenu("LEVEL UP!  LV " + player.level, names, descs, footer, function (i: number) {
        player.takeBuff(picks[i])
    }, icons)
}

function startGame(chosen: HeroCharacter) {
    hero = chosen
    player = new Player(hero)
    hero.enableMovement()
    scene.cameraFollowSprite(hero)
    floorNum = DEV_MODE ? DEV_START_FLOOR : 1 // see config.ts
    setupFloor()
    lastTick = game.runtime()
    started = true
}

/** The run is won: freeze the game, celebrate, then show the win screen. */
function doVictory(bossName: string) {
    started = false
    controller.moveSprite(hero, 0, 0)
    hero.vx = 0
    hero.vy = 0
    sprites.destroyAllSpritesOfKind(SpriteKind.EnemyShot)
    banner(bossName.toUpperCase() + " IS DEFEATED!", 3000)
    sfx(music.powerUp)
    hero.startEffect(effects.confetti, 2500)
    control.runInParallel(function () {
        pause(2500)
        game.splash("VICTORY! All " + FINAL_FLOOR + " floors cleared", "Lv " + player.level + "  Kills " + kills)
        game.over(true)
    })
}

function doGameOver() {
    started = false
    wantGameOver = false
    controller.moveSprite(hero, 0, 0)
    hero.vx = 0
    hero.vy = 0
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        e.vx = 0
        e.vy = 0
    }
    sfx(music.wawawawaa)
    hero.startEffect(effects.fire, 800)
    control.runInParallel(function () {
        pause(1200)
        game.splash("YOU DIED - Floor " + floorNum, "Lv " + player.level + "  Kills " + kills)
        game.over(false)
    })
}

// ---------------- INPUT ----------------
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!started) return
    hero.tryUseAbility(gameTime)
})

// ---------------- OVERLAPS ----------------
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (p, e) {
    if (getDN(p, "last") == e.id) return
    setDN(p, "last", e.id)
    const dmg = getDN(p, "dmg")
    if (getDN(p, "boom") > 0) {
        explode(p.x, p.y, dmg)
        p.destroy()
        return
    }
    hurtEnemy(e, dmg)
    for (const it of player.perks()) it.onProjectileHit(p, e)
    const pierce = getDN(p, "pierce")
    if (pierce <= 0) p.destroy()
    else setDN(p, "pierce", pierce - 1)
})

sprites.onOverlap(SpriteKind.Orbit, SpriteKind.Enemy, function (o, e) {
    if (gameTime - getDN(e, "orb") < 450) return
    setDN(e, "orb", gameTime)
    // blade damage grows with the Orbit Blades buff (Buffs/Buffs.ts)
    hurtEnemy(e, (2 + player.buffLevel("orbit")) * player.dmgMult)
})

sprites.onOverlap(SpriteKind.Orbit, SpriteKind.EnemyShot, function (o, s) {
    s.destroy()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (p, e) {
    hurtPlayer(boss && e == boss ? boss.contactDamage : E_DMG[getDN(e, "type")])
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.EnemyShot, function (p, s) {
    s.destroy()
    hurtPlayer(1)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Gem, function (p, g) {
    player.gainXp(getDN(g, "val"))
    g.destroy()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Pickup, function (p, k) {
    const kind = getDN(k, "kind")
    if (kind == 2) {
        hero.heal(2)
        sfx(music.baDing)
        k.destroy()
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Chest, function (p, c) {
    if (menuOpen || getDN(c, "armed") == 0) return
    openChest(c)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Portal, function (p, o) {
    if (gameTime < getDN(o, "ready")) return
    wantNextFloor = true
})

// ---------------- ENEMY AI (10x per second) ----------------
game.onUpdateInterval(100, function () {
    if (!started) return
    updateFlowField()
    if (boss) boss.think(100)
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        if (e == boss) continue
        const t = getDN(e, "type")
        const dx = hero.x - e.x
        const dy = hero.y - e.y
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01
        if (d > SW * 1.31) {
            const pos = findSpawn()
            if (pos.length > 0) e.setPosition(pos[0], pos[1])
            continue
        }
        let spd = getDN(e, "spd")
        const stunned = getDN(e, "stun") > gameTime
        if (stunned) spd = 0

        // wolves: every few seconds, charge straight at the hero
        if (t == T_WOLF && !stunned) {
            if (getDN(e, "dash") > gameTime) continue // mid-charge: keep the charge velocity
            let cd = getDN(e, "cd") - 100
            if (cd <= 0 && d < 110) {
                e.vx = dx / d * spd * 4
                e.vy = dy / d * spd * 4
                setDN(e, "dash", gameTime + 400)
                setDN(e, "cd", 2200)
                continue
            }
            setDN(e, "cd", cd)
        }

        // shooters back away when the hero gets close
        const keepAway = isShooterType(t) && d < (t == T_FIRE_IMP ? 70 : 55)
        if (E_FLY[t] || keepAway) {
            // flyers go straight
            if (keepAway) spd = -spd * 0.7
            e.vx = dx / d * spd
            e.vy = dy / d * spd
        } else {
            walkTowardHero(e, spd)
            if (!stunned && unstickWalker(e)) continue
        }

        // shooters: goblins fire one shot, fire imps a 3-shot spread
        if (isShooterType(t) && !stunned) {
            let cd = getDN(e, "cd") - 100
            if (cd <= 0) {
                if (d < 120) {
                    const a = Math.atan2(dy, dx)
                    if (t == T_FIRE_IMP) {
                        for (let k = -1; k <= 1; k++) enemyShoot(e, a + k * 0.3, 65)
                    } else {
                        enemyShoot(e, a, 70)
                    }
                }
                cd = Math.max(1400, 2600 - floorNum * 100)
            }
            setDN(e, "cd", cd)
        }
    }
    // homing staff bolts
    for (const p of sprites.allOfKind(SpriteKind.Projectile)) {
        if (getDN(p, "home") > 0) {
            const tg = findTarget(p.x, p.y, 70, getDN(p, "ghost") > 0)
            if (tg) {
                const s = getDN(p, "spd")
                const a = Math.atan2(tg.y - p.y, tg.x - p.x)
                let vx = p.vx * 0.5 + Math.cos(a) * s * 0.5
                let vy = p.vy * 0.5 + Math.sin(a) * s * 0.5
                const m = Math.sqrt(vx * vx + vy * vy) + 0.01
                p.vx = vx / m * s
                p.vy = vy / m * s
            }
        }
    }
})

// ---------------- MAIN LOOP ----------------
game.onUpdate(function () {
    if (!started) return
    const now = game.runtime()
    let dt = now - lastTick
    lastTick = now
    if (dt > 100) dt = 100
    if (dt < 0) dt = 0
    gameTime += dt

    if (wantGameOver) {
        doGameOver()
        return
    }
    if (wantNextFloor) {
        wantNextFloor = false
        floorNum++
        hero.heal(2)
        setupFloor()
        for (const it of player.perks()) it.onEachFloor(floorNum)
        sfx(music.powerUp)
        return
    }
    if (player.pendingLevels > 0 && !menuOpen) {
        player.pendingLevels--
        showLevelUp()
        return
    }
    floorTime += dt

    // regen

    // hero-specific per-frame logic (e.g. rogue roll)
    hero.update(dt)
    for (const it of player.perks()) it.update(dt)
    updateFog()

    // aim + face
    const tgt = hero.currentTarget()
    if (tgt) aimAngle = Math.atan2(tgt.y - hero.y, tgt.x - hero.x)
    else if (hero.vx != 0 || hero.vy != 0) aimAngle = Math.atan2(hero.vy, hero.vx)
    const right = Math.cos(aimAngle) >= 0
    hero.face(right)

    // auto attack: each hero shoots its own way (see Characters/*.ts)
    fireTimer -= dt
    if (fireTimer <= 0) {
        if (!tgt) {
            fireTimer = 60
        } else {
            // a flyer behind a wall can only be hit by shots that go over walls
            shotsIgnoreWalls = isFlyer(tgt) && !lineOfSight(hero.x, hero.y, tgt.x, tgt.y)
            hero.attack(tgt)
            for (const it of player.perks()) it.onAttack(tgt)
            shotsIgnoreWalls = false
            fireTimer = hero.attackCooldown / (player.rateMult * hero.fireRateMult())
        }
    }

    // invulnerability blink
    hero.setFlag(SpriteFlag.Invisible, gameTime < invulnUntil && Math.floor(gameTime / 70) % 2 == 0)

    // (Holy Aura and Lightning now run in their own update() - see Buffs/Buffs.ts)

    // magnet
    const r2 = player.pickupRange * player.pickupRange
    const gems = sprites.allOfKind(SpriteKind.Gem)
    if (gems.length == 0) magnetAll = false
    for (const g of gems) pullToPlayer(g, r2)
    for (const k of sprites.allOfKind(SpriteKind.Pickup)) pullToPlayer(k, r2)

    // room clearing: lock rooms on entry, spawn their enemies, unlock when cleared
    updateRoomClear(dt)

    // spawning (timed waves; room-clearing levels spawn per room instead,
    // and levels with randomSpawns = false only get what the boss summons)
    if (!roomMode && currentLevel.randomSpawns && (!bossSpawned || bossAlive)) {
        spawnTimer -= dt
        if (spawnTimer <= 0) {
            let interval = currentLevel.nextSpawnInterval(floorTime)
            if (bossAlive) interval *= 2.2
            spawnTimer = interval
            const cnt = currentLevel.waveSize(floorTime)
            for (let i = 0; i < cnt; i++) spawnEnemy()
        }
        if (!bossAlive && currentLevel.swarmEvery > 0) {
            swarmTimer += dt
            if (swarmTimer >= currentLevel.swarmEvery) {
                swarmTimer = 0
                spawnRing()
                banner("A SWARM APPROACHES!", 1500)
            }
        }
    }
    if (!roomMode && !bossSpawned && floorTime >= currentLevel.bossSpawnTime) spawnBoss()
    // timed minibosses (room-clearing levels put them in rooms instead)
    if (!roomMode && miniBossIdx < currentLevel.miniBossAt.length && floorTime >= currentLevel.miniBossAt[miniBossIdx]) {
        miniBossIdx++
        const mp = findSpawn()
        if (mp.length > 0) spawnMiniBoss(mp[0], mp[1])
    }
    // chests re-arm once the hero steps off them
    for (const ch of sprites.allOfKind(SpriteKind.Chest)) {
        if (getDN(ch, "armed") == 0 && !hero.overlapsWith(ch)) setDN(ch, "armed", 1)
    }

    // level-specific events
    currentLevel.update(dt)

    // portal animation
    if (portal) portal.setImage(Math.floor(gameTime / 200) % 2 == 0 ? PORTAL_A : PORTAL_B)
})

// ---------------- HUD ----------------
function drawBar(t: Image, x: number, y: number, w: number, frac: number, col: number, label: string) {
    t.fillRect(x, y, w, 7, 12)
    const fw = Math.floor(w * Math.max(0, Math.min(1, frac)))
    if (fw > 0) t.fillRect(x, y, fw, 7, col)
    t.print(label, x + 2, y + 1, 1, image.font5)
}

// item bar: ITEM_SLOTS chest items (yellow frames), then BUFF_SLOTS buffs (blue frames) with their level
const SLOT_SIZE = 12
function drawItemBar(t: Image, x0: number, y0: number) {
    for (let i = 0; i < player.maxItemSlots ; i++) {
        const x = x0 + i * (SLOT_SIZE + 1)
        t.fillRect(x, y0, SLOT_SIZE, SLOT_SIZE, 15)
        t.drawRect(x, y0, SLOT_SIZE, SLOT_SIZE, i < player.items.length ? 5 : 12)
        if (i < player.items.length) {
            const it = player.items[i]
            t.drawTransparentImage(it.icon, x + 1, y0 + 1)
            t.fillRect(x + SLOT_SIZE - 5, y0 + SLOT_SIZE - 6, 5, 6, 15)
            t.print("" + it.level, x + SLOT_SIZE - 5, y0 + SLOT_SIZE - 6, it.level >= it.maxLevel ? 5 : 1, image.font5)
        }
    }
    const bx = x0 + player.maxItemSlots * (SLOT_SIZE + 1) + 3
    const buffs = player.buffs
    for (let i = 0; i < BUFF_SLOTS; i++) {
        const x = bx + i * (SLOT_SIZE + 1)
        t.fillRect(x, y0, SLOT_SIZE, SLOT_SIZE, 15)
        t.drawRect(x, y0, SLOT_SIZE, SLOT_SIZE, i < buffs.length ? 9 : 12)
        if (i < buffs.length) {
            const b = buffs[i]
            if (b.icon) t.drawTransparentImage(b.icon, x + 1, y0 + 1)
            t.fillRect(x + SLOT_SIZE - 5, y0 + SLOT_SIZE - 6, 5, 6, 15)
            t.print("" + b.level, x + SLOT_SIZE - 5, y0 + SLOT_SIZE - 6, b.level >= b.maxLevel ? 5 : 1, image.font5)
        }
    }
}

// fog of war: above all sprites (hero z=10), below the HUD
scene.createRenderable(20, (t, c) => drawFog(t, c))

scene.createRenderable(100, (t, c) => {
    if (!hero) return
    // Soul Knight style status panel
    t.fillRect(1, 1, 56, 10, 15)
    drawBar(t, 3, 3, 52, hero.hp / hero.maxHp, 2, "HP " + hero.hp + "/" + hero.maxHp)
    drawItemBar(t, 1, 12)
    // floor + timer
    let ts = fmtTime(currentLevel.bossSpawnTime - floorTime)
    if (roomMode) ts = roomLocked() ? "CLEAR THE ROOM" : "ROOMS " + roomsCleared() + "/" + roomsTotal()
    if (bossSpawned) ts = bossAlive ? "BOSS" : "PORTAL!"
    const top = "F" + floorNum + " " + ts
    t.fillRect(Math.floor((SW - top.length * 6) / 2) - 2, 1, top.length * 6 + 3, 8, 15)
    printC(t, top, 2, bossSpawned ? 2 : 1, image.font5)
    // boss bar
    if (bossAlive && boss) {
        const frac = boss.hp / boss.maxHp
        const bx = Math.floor((SW - 102) / 2)
        printC(t, boss.name, SH - 35, 2, image.font5)
        t.fillRect(bx, SH - 28, 102, 6, 15)
        t.fillRect(bx + 1, SH - 27, Math.max(0, Math.floor(100 * frac)), 4, 2)
    }
    // skill
    const cdLeft = hero.abilityReadyAt - gameTime
    const sk = cdLeft <= 0 ? "A:" + hero.abilityName : "A:" + Math.ceil(cdLeft / 1000) + "s"
    t.print(sk, 2, SH - 19, cdLeft <= 0 ? 5 : 11, image.font5)
    // level + xp bar
    t.print("LV" + player.level, 2, SH - 11, 7, image.font5)
    t.fillRect(0, SH - 4, SW, 4, 15)
    t.fillRect(0, SH - 3, Math.floor(SW * player.xp / player.xpNeed), 2, 7)
    // minimap (top-right)
    drawMinimap(t, SW - MINIMAP_SIZE - 2, 2)
    // banner
    if (gameTime < bannerUntil) {
        const bw = bannerText.length * 6 + 8
        t.fillRect(Math.floor((SW - bw) / 2), 32, bw, 12, 15)
        printC(t, bannerText, 34, 5, image.font8)
    }
})

// ---------------- START ----------------
// The hero roster. To add a custom hero: create Characters/MyHero.ts with
// `class MyHero extends HeroCharacter implements ICharacterWithAbility`,
// list it in pxt.json, and add `new MyHero()` here.
function createHeroRoster(): HeroCharacter[] {
    return [
        new NinjaCharacter(),
        new PirateCharacter(),
        new NapoleonCharacter(),
    ]
}

function startHeroSelect() {
    // Heroes are created up front so the menu can show their real stats;
    // the ones not picked are destroyed.
    const roster = createHeroRoster()
    const names: string[] = []
    const descs: string[] = []
    for (const h of roster) {
        h.setFlag(SpriteFlag.Invisible, true)
        names.push(h.menuTitle)
        descs.push(h.description)
    }
    openMenu("CHOOSE YOUR HERO", names, descs, "A: use ability", function (i: number) {
        for (let k = 0; k < roster.length; k++) {
            if (k != i) roster[k].destroy()
        }
        roster[i].setFlag(SpriteFlag.Invisible, false)
        startGame(roster[i])
    })
}

scene.setBackgroundColor(15)
game.splash("SOUL SURVIVORS", "Soul Knight x Survivors")
startHeroSelect()
