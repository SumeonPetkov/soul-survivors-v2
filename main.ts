// =====================================================
//  SOUL SURVIVORS  -  Soul Knight x Vampire Survivors
//  MakeCode Arcade (JavaScript)
//  Arrows: move  |  Auto-aim & auto-fire
//  A: hero skill |  B: swap weapon
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
}

// ---------------- CONFIG ----------------
const MAP_W = 34
const MAP_H = 34
const FLOOR_TIME = 12000
const MAX_ENEMIES = 45
const MAX_GEMS = 120
const MAX_SHOTS = 70

// ---------------- WEAPONS ----------------
const W_NAME = ["Pistol", "Shotgun", "SMG", "Laser Rifle", "Bazooka", "Magic Staff"]
const W_DMG = [2, 2, 1, 5, 7, 3]
const W_CD = [320, 700, 110, 480, 950, 450]
const W_SPD = [160, 150, 185, 240, 115, 110]
const W_COST = [0, 1, 0.3, 1.5, 3, 1]
const W_COUNT = [1, 5, 1, 1, 1, 1]
const W_SPREAD = [0, 0.75, 0, 0, 0, 0]
const W_JIT = [0.04, 0.08, 0.18, 0, 0.02, 0.1]
const W_PIERCE = [0, 0, 0, 4, 0, 0]
const W_BOOM = [0, 0, 0, 0, 1, 0]
const W_HOME = [0, 0, 0, 0, 0, 1]
const W_LIFE = [900, 450, 700, 900, 1400, 1600]
const W_COLOR = [5, 4, 13, 9, 7, 10]

// ---------------- HEROES ----------------
const H_NAME = ["KNIGHT  HP7 AR5", "ROGUE   HP6 AR3", "WIZARD  HP4 AR5"]
const H_DESC = ["Dual Wield: rapid fire", "Dodge Roll: quick dash", "Frost Nova: AoE freeze"]
const H_SKILL = ["Dual Wield", "Dodge Roll", "Frost Nova"]
const H_HP = [7, 6, 4]
const H_ARM = [5, 3, 5]
const H_EN = [180, 150, 260]
const H_SPD = [70, 84, 66]
const H_WPN = [0, 2, 5]
const H_CD = [14000, 2200, 9000]

// ---------------- UPGRADES ----------------
const U_NAME = ["Orbit Blades", "Holy Aura", "Lightning", "Power", "Haste", "Multishot", "Vitality", "Plating", "Swift Boots", "Magnet", "Battery", "Critical", "Feast"]
const U_DESC = ["Blades spin around you", "Burn nearby enemies", "Smite random foes", "+20% damage", "+15% fire rate", "+1 bullet per shot", "+2 max HP, heal 2", "+1 armor shield", "+10% move speed", "+50% pickup range", "+60 energy, +regen", "+8% crit chance", "Heal 50% HP"]
const U_MAX = [5, 5, 5, 8, 8, 3, 5, 5, 5, 4, 4, 5, 99]

// ---------------- THEMES ----------------
const T_NAME = ["Dungeon", "Forest", "Glacier", "Volcano"]
const T_FA = [12, 7, 9, 14]
const T_FL = [15, 6, 1, 15]
const T_WT = [11, 6, 1, 4]
const T_WL = [12, 7, 9, 15]
const T_WF = [14, 14, 8, 2]
const BOSS_NAME = ["Crypt Demon", "Forest Fiend", "Frost Demon", "Magma Demon"]
const B_C1 = [10, 7, 9, 2]
const B_C2 = [11, 6, 1, 4]

// ---------------- ENEMIES ----------------
// 0 slime, 1 bat, 2 goblin shooter, 3 ogre, 4 boss
const E_HP = [3, 2, 4, 14, 0]
const E_SPD = [26, 46, 20, 16, 22]
const E_DMG = [1, 1, 1, 2, 2]
const E_XP = [1, 1, 2, 5, 40]

// ---------------- ART ----------------
const KNIGHT = img`
................
.....ffffff.....
....fbbbbbbf....
...fbb1111bbf...
...fb1ffffff1f..
...fbf999999f...
...fbbffffffbf..
....fbbbbbbbf...
...ff88bbbb88f..
..f8888bbbb888f.
..f8dd8bbbb8dd8f
..ff888bbbb888f.
...f88bbbbbb88f.
...fbbbffffbbbf.
...fcccf..fcccf.
...fffff..fffff.
`
const SLIME = img`
............
............
....ffff....
..ff7777ff..
.f77777777f.
f7711777117f
f771f7771f7f
f7777777777f
f7766666677f
.f66666666f.
..ffffffff..
............
`
const BAT = img`
............
f..........f
ff........ff
fcf.ffff.fcf
fccfaaaafccf
fcccaaaacccf
.fca2aa2acf.
..fcaaaacf..
...f1aa1f...
....ffff....
............
............
`
const GOBLIN = img`
............
..f......f..
.f7f.ff.f7f.
.f77f77f77f.
..f777777f..
..f727727f..
..f777777f..
...feeeef...
..feeeeeef..
..f7eeee7f..
...fe..ef...
...ff..ff...
`
const OGRE = img`
................
.....ffffff.....
....fccccccf....
...fcc2cc2ccf...
...fccccccccf...
...fcf1ff1fcf...
..ffccffffccff..
.fccccccccccccf.
fcccfccccccfcccf
fccffeeeeeeffccf
.ff.feeeeeef.ff.
....feeeeeef....
....fccffccf....
....fccffccf....
...fffff.fffff..
................
`
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
const E_IMG: Image[] = [SLIME, BAT, GOBLIN, OGRE]

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
function makeGun(w: number): Image {
    const im = image.create(12, 8)
    const c = W_COLOR[w]
    if (w == 5) {
        im.drawLine(1, 7, 8, 2, 14)
        im.drawLine(2, 7, 9, 2, 14)
        im.fillCircle(9, 2, 2, c)
        im.setPixel(9, 2, 1)
        return im
    }
    if (w == 4) {
        im.fillRect(0, 1, 12, 5, 15)
        im.fillRect(1, 2, 10, 3, c)
        im.fillRect(3, 6, 2, 2, 14)
        return im
    }
    let len = 9
    if (w == 1 || w == 3) len = 11
    if (w == 2) len = 8
    im.fillRect(1, 1, len, 4, 15)
    im.fillRect(2, 2, len - 2, 2, c)
    im.fillRect(2, 5, 3, 3, 14)
    if (w == 2) im.fillRect(5, 5, 2, 3, 15)
    if (w == 3) im.drawLine(3, 2, len - 1, 2, 1)
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
function makePortal(a: number, b: number): Image {
    const im = image.create(20, 20)
    im.fillCircle(10, 10, 9, 15)
    im.fillCircle(10, 10, 8, a)
    im.fillCircle(10, 10, 6, b)
    im.fillCircle(10, 10, 4, a)
    im.fillCircle(10, 10, 2, 1)
    return im
}
function makeBoss(c1: number, c2: number): Image {
    const im = image.create(28, 28)
    im.drawLine(7, 9, 3, 1, 13)
    im.drawLine(8, 9, 4, 1, 13)
    im.drawLine(9, 9, 5, 2, 13)
    im.drawLine(20, 9, 24, 1, 13)
    im.drawLine(19, 9, 23, 1, 13)
    im.drawLine(18, 9, 22, 2, 13)
    im.fillCircle(14, 16, 11, 15)
    im.fillCircle(14, 16, 10, c1)
    im.fillCircle(14, 21, 5, c2)
    im.fillRect(8, 11, 4, 3, 5)
    im.fillRect(16, 11, 4, 3, 5)
    im.setPixel(10, 12, 15)
    im.setPixel(17, 12, 15)
    im.drawLine(7, 9, 12, 11, 15)
    im.drawLine(21, 9, 16, 11, 15)
    im.drawLine(10, 17, 18, 17, 15)
    im.setPixel(11, 18, 1)
    im.setPixel(17, 18, 1)
    return im
}
function makeTiles(th: number): Image[] {
    const fa = T_FA[th]
    const fl = T_FL[th]
    const wt = T_WT[th]
    const wl = T_WL[th]
    const wf = T_WF[th]
    const t0 = image.create(16, 16)
    const t1 = image.create(16, 16)
    t1.fill(fa)
    t1.drawLine(0, 0, 15, 0, fl)
    t1.drawLine(0, 0, 0, 15, fl)
    const t2 = t1.clone()
    t2.drawLine(4, 9, 7, 9, fl)
    t2.drawLine(7, 9, 9, 7, fl)
    t2.setPixel(11, 4, fl)
    t2.setPixel(12, 12, fl)
    const t3 = image.create(16, 16)
    t3.fill(wt)
    t3.drawRect(0, 0, 16, 16, wl)
    t3.setPixel(5, 5, wl)
    t3.setPixel(10, 10, wl)
    const t4 = image.create(16, 16)
    t4.fill(wf)
    t4.fillRect(0, 0, 16, 4, wt)
    t4.drawLine(0, 4, 15, 4, 15)
    t4.drawLine(0, 10, 15, 10, 15)
    t4.drawLine(7, 4, 7, 10, 15)
    t4.drawLine(3, 10, 3, 15, 15)
    t4.drawLine(11, 10, 11, 15, 15)
    t4.drawLine(0, 15, 15, 15, 15)
    return [t0, t1, t2, t3, t4]
}

const W_BULLET: Image[] = [makeBall(2, 4, 5), makeBall(1, 4, 5), makeBall(1, 5, 1), makeBall(2, 9, 1), makeBall(3, 2, 4), makeBall(2, 10, 3)]
const SHOT_IMG = makeBall(2, 2, 3)
const ENERGY_IMG = makeBall(2, 8, 9)
const PUFF_IMG = makeBall(2, 1, 13)
const BLADE_IMG = makeBlade()
const BOLT_IMG = makeBolt()
const EXPLO_IMG = makeExplosion(18)
const NOVA_IMG = makeRing(52, 9, 1)
const PORTAL_A = makePortal(10, 9)
const PORTAL_B = makePortal(9, 10)
const BOSS_IMG: Image[] = []
for (let i = 0; i < 4; i++) BOSS_IMG.push(makeBoss(B_C1[i], B_C2[i]))
const gunR: Image[] = []
const gunL: Image[] = []
const W_PICK: Image[] = []
for (let i = 0; i < W_NAME.length; i++) {
    const g = makeGun(i)
    gunR.push(g)
    const gl = g.clone()
    gl.flipX()
    gunL.push(gl)
    const pk = image.create(16, 12)
    pk.fillRect(0, 0, 16, 12, 15)
    pk.drawRect(0, 0, 16, 12, 5)
    pk.drawTransparentImage(g, 2, 2)
    W_PICK.push(pk)
}

// ---------------- STATE ----------------
let started = false
let hero = 0
let player: Sprite = null
let gun: Sprite = null
let aura: Sprite = null
let boss: Sprite = null
let portal: Sprite = null
let orbits: Sprite[] = []
let weapons: number[] = [0, -1]
let slot = 0
let hp = 6
let maxHp = 6
let armor = 4
let maxArmor = 4
let energy = 180
let maxEnergy = 180
let energyRegen = 4
let xp = 0
let level = 1
let xpNeed = 5
let pendingLevels = 0
let floorNum = 1
let floorTime = 0
let gameTime = 0
let lastTick = 0
let bossSpawned = false
let bossAlive = false
let kills = 0
let fireTimer = 0
let invulnUntil = 0
let lastHurt = -9999
let armorTimer = 0
let skillReadyAt = 0
let skillUntil = 0
let rollUntil = 0
let rollVx = 0
let rollVy = 0
let dmgMult = 1
let rateMult = 1
let multishot = 0
let critChance = 5
let moveSpeed = 70
let pickupRange = 300
let spawnTimer = 0
let swarmTimer = 0
let auraTimer = 0
let boltTimer = 0
let aimAngle = 0
let faceRight = true
let gunKey = -1
let menuOpen = false
let wantNextFloor = false
let wantGameOver = false
let bannerText = ""
let bannerUntil = 0
let magnetAll = false
let noEnergyUntil = 0
let heroImgR: Image = null
let heroImgL: Image = null
let walls: boolean[] = []
let upLv: number[] = []
for (let i = 0; i < U_NAME.length; i++) upLv.push(0)

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
    t.print(text, Math.floor((160 - text.length * f.charWidth) / 2), y, col, f)
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

// ---------------- MAP ----------------
function buildFloor() {
    walls = []
    for (let r = 0; r < MAP_H; r++) {
        for (let c = 0; c < MAP_W; c++) {
            walls.push(c == 0 || r == 0 || c == MAP_W - 1 || r == MAP_H - 1)
        }
    }
    const blocks = Math.min(28, 14 + floorNum * 2)
    for (let i = 0; i < blocks; i++) {
        const bc = randint(3, MAP_W - 6)
        const br = randint(3, MAP_H - 6)
        if (Math.abs(bc - MAP_W / 2) < 5 && Math.abs(br - MAP_H / 2) < 5) continue
        const bw = randint(1, 3)
        const bh = randint(1, 3)
        for (let dy = 0; dy < bh; dy++) {
            for (let dx = 0; dx < bw; dx++) {
                walls[(br + dy) * MAP_W + bc + dx] = true
            }
        }
    }
    const buf = control.createBuffer(4 + MAP_W * MAP_H)
    buf.setNumber(NumberFormat.UInt16LE, 0, MAP_W)
    buf.setNumber(NumberFormat.UInt16LE, 2, MAP_H)
    const layer = image.create(MAP_W, MAP_H)
    for (let r = 0; r < MAP_H; r++) {
        for (let c = 0; c < MAP_W; c++) {
            let tile = 1
            if (isWall(c, r)) {
                tile = isWall(c, r + 1) ? 3 : 4
                layer.setPixel(c, r, 1)
            } else if (randint(0, 9) == 0) {
                tile = 2
            }
            buf.setNumber(NumberFormat.UInt8LE, 4 + r * MAP_W + c, tile)
        }
    }
    const th = (floorNum - 1) % 4
    tiles.setCurrentTilemap(tiles.createTilemap(buf, layer, makeTiles(th), TileScale.Sixteen))
}

function clearLevel() {
    const kinds = [SpriteKind.Enemy, SpriteKind.EnemyShot, SpriteKind.Projectile, SpriteKind.Gem, SpriteKind.Pickup, SpriteKind.Portal, SpriteKind.Fx]
    for (const k of kinds) sprites.destroyAllSpritesOfKind(k)
    portal = null
    boss = null
}

function setupFloor() {
    clearLevel()
    buildFloor()
    player.setPosition(Math.floor(MAP_W / 2) * 16 + 8, Math.floor(MAP_H / 2) * 16 + 8)
    floorTime = 0
    spawnTimer = 1500
    swarmTimer = 0
    bossSpawned = false
    bossAlive = false
    magnetAll = false
    armor = maxArmor
    banner("FLOOR " + floorNum + ": " + T_NAME[(floorNum - 1) % 4], 2500)
}

// ---------------- ENEMIES ----------------
function findSpawn(): number[] {
    for (let tries = 0; tries < 20; tries++) {
        const a = Math.random() * Math.PI * 2
        const d = randint(95, 140)
        const x = player.x + Math.cos(a) * d
        const y = player.y + Math.sin(a) * d
        const c = Math.floor(x / 16)
        const r = Math.floor(y / 16)
        if (!isWall(c, r)) return [c * 16 + 8, r * 16 + 8]
    }
    return []
}

function pickType(): number {
    const t = floorTime / 1000 + (floorNum - 1) * 35
    const r = randint(0, 99)
    if (t > 45 && r < 10) return 3
    if (t > 20 && r < 30) return 2
    if (r < 62) return 0
    return 1
}

function initEnemy(e: Sprite, t: number, hpv: number, spd: number) {
    setDN(e, "type", t)
    setDN(e, "hp", hpv)
    setDN(e, "spd", spd)
    setDN(e, "cd", randint(800, 2500))
    setDN(e, "stun", 0)
    setDN(e, "orb", -9999)
    setDB(e, "dead", false)
}

function spawnEnemyAt(t: number, x: number, y: number) {
    if (sprites.allOfKind(SpriteKind.Enemy).length >= MAX_ENEMIES) return
    const e = sprites.create(E_IMG[t], SpriteKind.Enemy)
    e.setPosition(x, y)
    const scale = 1 + 0.45 * (floorNum - 1) + floorTime / 60000 * 0.6
    initEnemy(e, t, Math.ceil(E_HP[t] * scale), E_SPD[t] + floorNum * 2 + randint(-3, 3))
}

function spawnEnemy(t: number) {
    const pos = findSpawn()
    if (pos.length == 0) return
    spawnEnemyAt(t, pos[0], pos[1])
}

function spawnRing() {
    for (let i = 0; i < 14; i++) {
        const a = i * 2 * Math.PI / 14
        const x = player.x + Math.cos(a) * 105
        const y = player.y + Math.sin(a) * 80
        if (!isWallAt(x, y)) spawnEnemyAt(1, x, y)
    }
}

function spawnBoss() {
    const pos = findSpawn()
    if (pos.length == 0) return
    bossSpawned = true
    bossAlive = true
    const th = (floorNum - 1) % 4
    boss = sprites.create(BOSS_IMG[th], SpriteKind.Enemy)
    boss.setPosition(pos[0], pos[1])
    boss.setFlag(SpriteFlag.GhostThroughWalls, true)
    const mhp = Math.floor(160 * (1 + 0.7 * (floorNum - 1)))
    initEnemy(boss, 4, mhp, 20 + floorNum * 2)
    setDN(boss, "max", mhp)
    setDN(boss, "cd", 1500)
    setDN(boss, "pat", 0)
    banner("BOSS: " + BOSS_NAME[th] + "!", 2500)
    sfx(music.bigCrash)
    scene.cameraShake(4, 500)
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

function bossAttack(b: Sprite) {
    const frac = getDN(b, "hp") / getDN(b, "max")
    const rage = frac < 0.5
    const pat = getDN(b, "pat")
    if (pat % 3 == 2) {
        const a0 = Math.atan2(player.y - b.y, player.x - b.x)
        for (let i = -2; i <= 2; i++) enemyShoot(b, a0 + i * 0.22, rage ? 95 : 80)
    } else {
        const n = 10 + floorNum * 2
        const off = pat * 0.3
        for (let i = 0; i < n; i++) enemyShoot(b, off + i * 2 * Math.PI / n, rage ? 70 : 55)
    }
    if (pat % 4 == 3) {
        for (let i = 0; i < 3; i++) {
            const x = b.x + randint(-30, 30)
            const y = b.y + randint(-30, 30)
            if (!isWallAt(x, y)) spawnEnemyAt(rage ? 1 : 0, x, y)
        }
    }
    setDN(b, "pat", pat + 1)
}

function nearestEnemyTo(x: number, y: number, range: number): Sprite {
    let best: Sprite = null
    let bd = range * range
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        const dx = e.x - x
        const dy = e.y - y
        const d = dx * dx + dy * dy
        if (d < bd) {
            bd = d
            best = e
        }
    }
    return best
}

function hurtEnemy(e: Sprite, dmg: number) {
    if (getDB(e, "dead")) return
    if (Math.percentChance(critChance)) dmg *= 2
    const hpv = getDN(e, "hp") - dmg
    setDN(e, "hp", hpv)
    if (hpv <= 0) killEnemy(e)
}

function killEnemy(e: Sprite) {
    if (getDB(e, "dead")) return
    setDB(e, "dead", true)
    const t = getDN(e, "type")
    kills++
    info.changeScoreBy(E_XP[t])
    if (t == 4) {
        bossDefeated(e)
    } else {
        dropGem(e.x, e.y, E_XP[t])
        if (Math.percentChance(10)) dropPickup(1, e.x + 3, e.y + 2)
        if (Math.percentChance(t == 3 ? 6 : 1.5)) dropPickup(2, e.x - 3, e.y + 2)
        if (t == 3 && Math.percentChance(4)) dropWeapon(randint(1, W_NAME.length - 1), e.x, e.y, false)
        fx(PUFF_IMG, e.x, e.y, 120)
    }
    e.destroy()
}

function bossDefeated(b: Sprite) {
    bossAlive = false
    boss = null
    info.changeScoreBy(100 * floorNum)
    sprites.destroyAllSpritesOfKind(SpriteKind.EnemyShot)
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        if (e != b) killEnemy(e)
    }
    for (let i = 0; i < 4; i++) dropGem(b.x + randint(-12, 12), b.y + randint(-12, 12), 10)
    let w = randint(1, W_NAME.length - 1)
    for (let k = 0; k < 10 && weapons.indexOf(w) >= 0; k++) w = randint(1, W_NAME.length - 1)
    const wx = isWallAt(b.x + 22, b.y) ? b.x - 22 : b.x + 22
    dropWeapon(w, isWallAt(wx, b.y) ? b.x : wx, b.y, false)
    portal = sprites.create(PORTAL_A, SpriteKind.Portal)
    portal.setPosition(b.x, b.y)
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
    const s = sprites.create(kind == 1 ? ENERGY_IMG : HEART, SpriteKind.Pickup)
    s.setPosition(x, y)
    s.setFlag(SpriteFlag.GhostThroughWalls, true)
    s.z = 1
    setDN(s, "kind", kind)
    setDN(s, "pull", 0)
    s.lifespan = 15000
}

function dropWeapon(w: number, x: number, y: number, locked: boolean) {
    const s = sprites.create(W_PICK[w], SpriteKind.Pickup)
    s.setPosition(x, y)
    s.z = 2
    setDN(s, "kind", 3)
    setDN(s, "w", w)
    setDN(s, "lock", locked ? 1 : 0)
}

function pullToPlayer(g: Sprite, r2: number) {
    const dx = player.x - g.x
    const dy = player.y - g.y
    const d2 = dx * dx + dy * dy
    if (magnetAll || d2 < r2 || getDN(g, "pull") == 1) {
        setDN(g, "pull", 1)
        const d = Math.sqrt(d2) + 0.01
        g.vx = dx / d * 150
        g.vy = dy / d * 150
    }
}

// ---------------- PLAYER ----------------
function gainXp(v: number) {
    xp += v
    while (xp >= xpNeed) {
        xp -= xpNeed
        level++
        xpNeed = Math.floor(5 + level * 3.5 + level * level * 0.15)
        pendingLevels++
    }
}

function hurtPlayer(d: number) {
    if (gameTime < invulnUntil || wantGameOver || !started) return
    invulnUntil = gameTime + 800
    lastHurt = gameTime
    if (armor > 0) {
        const a = Math.min(armor, d)
        armor -= a
        d -= a
    }
    hp -= d
    scene.cameraShake(3, 150)
    sfx(d > 0 ? music.smallCrash : music.zapped)
    if (hp <= 0) {
        hp = 0
        wantGameOver = true
    }
}

function fireWeapon(target: Sprite): boolean {
    if (!target) return false
    const w = weapons[slot]
    if (energy < W_COST[w]) {
        noEnergyUntil = gameTime + 600
        return false
    }
    energy -= W_COST[w]
    let count = W_COUNT[w] + multishot
    if (hero == 0 && gameTime < skillUntil) count += 1
    const spread = W_SPREAD[w] + 0.14 * (count - W_COUNT[w])
    for (let i = 0; i < count; i++) {
        let a = aimAngle
        if (count > 1) a += -spread / 2 + spread * i / (count - 1)
        a += (Math.random() - 0.5) * W_JIT[w] * 2
        const p = sprites.createProjectileFromSprite(W_BULLET[w], gun, Math.cos(a) * W_SPD[w], Math.sin(a) * W_SPD[w])
        p.setFlag(SpriteFlag.DestroyOnWall, true)
        p.lifespan = W_LIFE[w]
        setDN(p, "dmg", W_DMG[w] * dmgMult)
        setDN(p, "pierce", W_PIERCE[w])
        setDN(p, "boom", W_BOOM[w])
        setDN(p, "home", W_HOME[w])
        setDN(p, "last", -1)
        setDN(p, "spd", W_SPD[w])
    }
    return true
}

function addOrbit() {
    const o = sprites.create(BLADE_IMG, SpriteKind.Orbit)
    o.setFlag(SpriteFlag.GhostThroughWalls, true)
    o.z = 9
    orbits.push(o)
}

function auraRadius(): number {
    return 20 + upLv[1] * 5
}

function refreshAura() {
    if (!aura) {
        aura = sprites.create(image.create(2, 2), SpriteKind.Attach)
        aura.setFlag(SpriteFlag.Ghost, true)
        aura.z = 1
    }
    aura.setImage(makeRing(auraRadius(), 5, 4))
}

function applyUpgrade(id: number) {
    upLv[id]++
    if (id == 0) addOrbit()
    else if (id == 1) refreshAura()
    else if (id == 3) dmgMult += 0.2
    else if (id == 4) rateMult += 0.15
    else if (id == 5) multishot++
    else if (id == 6) {
        maxHp += 2
        hp = Math.min(maxHp, hp + 2)
    } else if (id == 7) {
        maxArmor++
        armor++
    } else if (id == 8) {
        moveSpeed = Math.floor(moveSpeed * 1.1)
        controller.moveSprite(player, moveSpeed, moveSpeed)
    } else if (id == 9) pickupRange *= 1.5
    else if (id == 10) {
        maxEnergy += 60
        energy += 60
        energyRegen += 2
    } else if (id == 11) critChance += 8
    else if (id == 12) hp = Math.min(maxHp, hp + Math.ceil(maxHp / 2))
}

// ---------------- MENUS ----------------
function openMenu(title: string, names: string[], descs: string[], footer: string, onPick: (i: number) => void) {
    menuOpen = true
    game.pushScene()
    let sel = 0
    scene.setBackgroundColor(15)
    scene.createRenderable(50, (t, c) => {
        printC(t, title, 4, 5, image.font8)
        for (let i = 0; i < names.length; i++) {
            const y = 18 + i * 30
            const on = i == sel
            t.fillRect(6, y, 148, 27, on ? 8 : 12)
            t.drawRect(6, y, 148, 27, on ? 5 : 11)
            t.print(names[i], 10, y + 4, on ? 5 : 1, image.font8)
            t.print(descs[i], 10, y + 16, on ? 1 : 11, image.font5)
        }
        printC(t, footer, 111, 11, image.font5)
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
    const pool: number[] = []
    for (let i = 0; i < 12; i++) {
        if (upLv[i] < U_MAX[i]) pool.push(i)
    }
    const picks: number[] = []
    while (picks.length < 3 && pool.length > 0) {
        const k = randint(0, pool.length - 1)
        picks.push(pool[k])
        pool.removeAt(k)
    }
    while (picks.length < 3) picks.push(12)
    const names: string[] = []
    const descs: string[] = []
    for (const id of picks) {
        names.push(U_NAME[id] + (U_MAX[id] < 99 ? " Lv" + (upLv[id] + 1) : ""))
        descs.push(U_DESC[id])
    }
    sfx(music.baDing)
    openMenu("LEVEL UP!  LV " + level, names, descs, "UP/DOWN choose  A select", function (i: number) {
        applyUpgrade(picks[i])
    })
}

function startGame(h: number) {
    hero = h
    maxHp = H_HP[h]
    hp = maxHp
    maxArmor = H_ARM[h]
    armor = maxArmor
    maxEnergy = H_EN[h]
    energy = maxEnergy
    moveSpeed = H_SPD[h]
    weapons = [H_WPN[h], -1]
    slot = 0
    heroImgR = KNIGHT.clone()
    if (h == 1) {
        heroImgR.replace(8, 2)
        heroImgR.replace(11, 12)
        heroImgR.replace(9, 5)
        heroImgR.replace(1, 11)
    } else if (h == 2) {
        heroImgR.replace(11, 10)
        heroImgR.replace(8, 3)
        heroImgR.replace(9, 5)
        heroImgR.replace(1, 13)
    }
    heroImgL = heroImgR.clone()
    heroImgL.flipX()
    player = sprites.create(heroImgR, SpriteKind.Player)
    player.z = 10
    controller.moveSprite(player, moveSpeed, moveSpeed)
    scene.cameraFollowSprite(player)
    gun = sprites.create(gunR[weapons[0]], SpriteKind.Attach)
    gun.setFlag(SpriteFlag.Ghost, true)
    gun.z = 11
    floorNum = 1
    info.setScore(0)
    setupFloor()
    lastTick = game.runtime()
    started = true
}

function doGameOver() {
    started = false
    wantGameOver = false
    controller.moveSprite(player, 0, 0)
    player.vx = 0
    player.vy = 0
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        e.vx = 0
        e.vy = 0
    }
    sfx(music.wawawawaa)
    player.startEffect(effects.fire, 800)
    control.runInParallel(function () {
        pause(1200)
        game.splash("YOU DIED - Floor " + floorNum, "Lv " + level + "  Kills " + kills)
        game.over(false)
    })
}

// ---------------- INPUT ----------------
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!started || gameTime < skillReadyAt) return
    skillReadyAt = gameTime + H_CD[hero]
    if (hero == 0) {
        skillUntil = gameTime + 5000
        banner("DUAL WIELD!", 1000)
        sfx(music.magicWand)
    } else if (hero == 1) {
        let dx = 0
        let dy = 0
        if (controller.left.isPressed()) dx -= 1
        if (controller.right.isPressed()) dx += 1
        if (controller.up.isPressed()) dy -= 1
        if (controller.down.isPressed()) dy += 1
        if (dx == 0 && dy == 0) dx = faceRight ? 1 : -1
        const d = Math.sqrt(dx * dx + dy * dy)
        rollVx = dx / d * 230
        rollVy = dy / d * 230
        rollUntil = gameTime + 220
        invulnUntil = Math.max(invulnUntil, gameTime + 450)
        controller.moveSprite(player, 0, 0)
    } else {
        fx(NOVA_IMG, player.x, player.y, 220)
        scene.cameraShake(3, 200)
        sfx(music.zapped)
        for (const s of sprites.allOfKind(SpriteKind.EnemyShot)) {
            if (Math.abs(s.x - player.x) < 52 && Math.abs(s.y - player.y) < 52) s.destroy()
        }
        for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
            const ex = e.x - player.x
            const ey = e.y - player.y
            if (ex * ex + ey * ey < 52 * 52) {
                setDN(e, "stun", gameTime + 1800)
                e.vx = 0
                e.vy = 0
                hurtEnemy(e, (8 + level) * dmgMult)
            }
        }
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!started) return
    if (weapons[1 - slot] >= 0) {
        slot = 1 - slot
        fireTimer = 150
        banner(W_NAME[weapons[slot]], 700)
    }
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
    const pierce = getDN(p, "pierce")
    if (pierce <= 0) p.destroy()
    else setDN(p, "pierce", pierce - 1)
})

sprites.onOverlap(SpriteKind.Orbit, SpriteKind.Enemy, function (o, e) {
    if (gameTime - getDN(e, "orb") < 450) return
    setDN(e, "orb", gameTime)
    hurtEnemy(e, (2 + upLv[0]) * dmgMult)
})

sprites.onOverlap(SpriteKind.Orbit, SpriteKind.EnemyShot, function (o, s) {
    s.destroy()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (p, e) {
    hurtPlayer(E_DMG[getDN(e, "type")])
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.EnemyShot, function (p, s) {
    s.destroy()
    hurtPlayer(1)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Gem, function (p, g) {
    gainXp(getDN(g, "val"))
    g.destroy()
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Pickup, function (p, k) {
    const kind = getDN(k, "kind")
    if (kind == 1) {
        energy = Math.min(maxEnergy, energy + 20)
        k.destroy()
    } else if (kind == 2) {
        hp = Math.min(maxHp, hp + 2)
        sfx(music.baDing)
        k.destroy()
    } else if (kind == 3) {
        if (getDN(k, "lock") == 1) return
        const w = getDN(k, "w")
        if (weapons[1 - slot] < 0) {
            weapons[1 - slot] = w
            slot = 1 - slot
        } else {
            const old = weapons[slot]
            weapons[slot] = w
            dropWeapon(old, k.x, k.y, true)
        }
        k.destroy()
        banner("GOT " + W_NAME[w] + "!", 1200)
        sfx(music.jumpUp)
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Portal, function (p, o) {
    if (gameTime < getDN(o, "ready")) return
    wantNextFloor = true
})

// ---------------- ENEMY AI (10x per second) ----------------
game.onUpdateInterval(100, function () {
    if (!started) return
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        const t = getDN(e, "type")
        const dx = player.x - e.x
        const dy = player.y - e.y
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01
        if (t != 4 && d > 210) {
            const pos = findSpawn()
            if (pos.length > 0) e.setPosition(pos[0], pos[1])
            continue
        }
        let spd = getDN(e, "spd")
        const stunned = getDN(e, "stun") > gameTime
        if (stunned) spd = 0
        if (t == 2 && d < 55) spd = -spd * 0.7
        e.vx = dx / d * spd
        e.vy = dy / d * spd
        if ((t == 2 || t == 4) && !stunned) {
            let cd = getDN(e, "cd") - 100
            if (cd <= 0) {
                if (t == 2) {
                    if (d < 120) enemyShoot(e, Math.atan2(dy, dx), 70)
                    cd = Math.max(1400, 2600 - floorNum * 100)
                } else {
                    bossAttack(e)
                    cd = getDN(e, "hp") < getDN(e, "max") / 2 ? 1300 : 2000
                }
            }
            setDN(e, "cd", cd)
        }
    }
    // homing staff bolts
    for (const p of sprites.allOfKind(SpriteKind.Projectile)) {
        if (getDN(p, "home") > 0) {
            const tg = nearestEnemyTo(p.x, p.y, 70)
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
        hp = Math.min(maxHp, hp + 2)
        setupFloor()
        sfx(music.powerUp)
        return
    }
    if (pendingLevels > 0 && !menuOpen) {
        pendingLevels--
        showLevelUp()
        return
    }
    floorTime += dt

    // regen
    energy = Math.min(maxEnergy, energy + energyRegen * dt / 1000)
    if (armor < maxArmor && gameTime - lastHurt > 3000) {
        armorTimer += dt
        if (armorTimer >= 700) {
            armorTimer = 0
            armor++
        }
    } else {
        armorTimer = 0
    }

    // rogue roll
    if (rollUntil > 0) {
        if (gameTime < rollUntil) {
            player.vx = rollVx
            player.vy = rollVy
            fx(PUFF_IMG, player.x, player.y + 5, 100)
        } else {
            rollUntil = 0
            player.vx = 0
            player.vy = 0
            controller.moveSprite(player, moveSpeed, moveSpeed)
        }
    }

    // aim, face, gun
    const tgt = nearestEnemyTo(player.x, player.y, 115)
    if (tgt) aimAngle = Math.atan2(tgt.y - player.y, tgt.x - player.x)
    else if (player.vx != 0 || player.vy != 0) aimAngle = Math.atan2(player.vy, player.vx)
    const right = Math.cos(aimAngle) >= 0
    if (right != faceRight) {
        faceRight = right
        player.setImage(right ? heroImgR : heroImgL)
    }
    const w = weapons[slot]
    const key = w * 2 + (faceRight ? 1 : 0)
    if (key != gunKey) {
        gunKey = key
        gun.setImage(faceRight ? gunR[w] : gunL[w])
    }
    gun.setPosition(player.x + Math.cos(aimAngle) * 6, player.y + 3 + Math.sin(aimAngle) * 3)

    // auto fire
    fireTimer -= dt
    if (fireTimer <= 0) {
        if (fireWeapon(tgt)) {
            let cd = W_CD[w] / rateMult
            if (hero == 0 && gameTime < skillUntil) cd = cd / 2
            fireTimer = cd
        } else {
            fireTimer = 60
        }
    }

    // invulnerability blink
    player.setFlag(SpriteFlag.Invisible, gameTime < invulnUntil && Math.floor(gameTime / 70) % 2 == 0)

    // orbit blades
    const n = orbits.length
    for (let i = 0; i < n; i++) {
        const a = gameTime / 260 + i * 2 * Math.PI / n
        orbits[i].setPosition(player.x + Math.cos(a) * 28, player.y + Math.sin(a) * 28)
    }

    // holy aura
    if (aura) {
        aura.setPosition(player.x, player.y)
        auraTimer += dt
        if (auraTimer >= 500) {
            auraTimer = 0
            const r = auraRadius()
            const dmg = (0.5 + 0.5 * upLv[1]) * dmgMult
            for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
                const ex = e.x - player.x
                const ey = e.y - player.y
                if (ex * ex + ey * ey < r * r) hurtEnemy(e, dmg)
            }
        }
    }

    // lightning
    if (upLv[2] > 0) {
        boltTimer += dt
        if (boltTimer >= 2600 - upLv[2] * 300) {
            boltTimer = 0
            const list = sprites.allOfKind(SpriteKind.Enemy).filter(e => Math.abs(e.x - player.x) < 85 && Math.abs(e.y - player.y) < 65)
            for (let i = 0; i < upLv[2] && list.length > 0; i++) {
                const k = randint(0, list.length - 1)
                const e = list[k]
                list.removeAt(k)
                fx(BOLT_IMG, e.x, e.y - 26, 150)
                hurtEnemy(e, (5 + upLv[2] * 3) * dmgMult)
            }
        }
    }

    // magnet
    const r2 = pickupRange * pickupRange
    const gems = sprites.allOfKind(SpriteKind.Gem)
    if (gems.length == 0) magnetAll = false
    for (const g of gems) pullToPlayer(g, r2)
    for (const k of sprites.allOfKind(SpriteKind.Pickup)) {
        if (getDN(k, "kind") == 3) {
            if (getDN(k, "lock") == 1) {
                if (Math.abs(k.x - player.x) > 18 || Math.abs(k.y - player.y) > 18) setDN(k, "lock", 0)
            }
        } else {
            pullToPlayer(k, r2)
        }
    }

    // spawning
    if (!bossSpawned || bossAlive) {
        spawnTimer -= dt
        if (spawnTimer <= 0) {
            let interval = Math.max(220, 1000 - floorTime / 100 - floorNum * 70)
            if (bossAlive) interval *= 2.2
            spawnTimer = interval
            const cnt = 1 + Math.floor(floorTime / 30000) + (floorNum > 2 ? 1 : 0)
            for (let i = 0; i < cnt; i++) spawnEnemy(pickType())
        }
        if (!bossAlive) {
            swarmTimer += dt
            if (swarmTimer >= 25000) {
                swarmTimer = 0
                spawnRing()
                banner("A SWARM APPROACHES!", 1500)
            }
        }
    }
    if (!bossSpawned && floorTime >= FLOOR_TIME) spawnBoss()

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

scene.createRenderable(100, (t, c) => {
    if (!player) return
    // Soul Knight style status panel
    t.fillRect(1, 1, 56, 26, 15)
    drawBar(t, 3, 3, 52, hp / maxHp, 2, "HP " + hp + "/" + maxHp)
    drawBar(t, 3, 11, 52, maxArmor > 0 ? armor / maxArmor : 0, 11, "AR " + armor + "/" + maxArmor)
    drawBar(t, 3, 19, 52, energy / maxEnergy, 8, "EN " + Math.floor(energy))
    // floor + timer
    let ts = fmtTime(FLOOR_TIME - floorTime)
    if (bossSpawned) ts = bossAlive ? "BOSS" : "PORTAL!"
    const top = "F" + floorNum + " " + ts
    t.fillRect(Math.floor((160 - top.length * 6) / 2) - 2, 1, top.length * 6 + 3, 8, 15)
    printC(t, top, 2, bossSpawned ? 2 : 1, image.font5)
    // boss bar
    if (bossAlive && boss) {
        const frac = getDN(boss, "hp") / getDN(boss, "max")
        printC(t, BOSS_NAME[(floorNum - 1) % 4], 85, 2, image.font5)
        t.fillRect(29, 92, 102, 6, 15)
        t.fillRect(30, 93, Math.max(0, Math.floor(100 * frac)), 4, 2)
    }
    // skill
    const cdLeft = skillReadyAt - gameTime
    const sk = cdLeft <= 0 ? "A:" + H_SKILL[hero] : "A:" + Math.ceil(cdLeft / 1000) + "s"
    t.print(sk, 2, 101, cdLeft <= 0 ? 5 : 11, image.font5)
    // weapons
    const wn = W_NAME[weapons[slot]]
    t.print(wn, 158 - wn.length * 6, 109, gameTime < noEnergyUntil ? 2 : 5, image.font5)
    if (weapons[1 - slot] >= 0) {
        const wn2 = "B:" + W_NAME[weapons[1 - slot]]
        t.print(wn2, 158 - wn2.length * 6, 101, 11, image.font5)
    }
    // level + xp bar
    t.print("LV" + level, 2, 109, 7, image.font5)
    t.fillRect(0, 116, 160, 4, 15)
    t.fillRect(0, 117, Math.floor(160 * xp / xpNeed), 2, 7)
    // banner
    if (gameTime < bannerUntil) {
        const bw = bannerText.length * 6 + 8
        t.fillRect(Math.floor((160 - bw) / 2), 32, bw, 12, 15)
        printC(t, bannerText, 34, 5, image.font8)
    }
})

// ---------------- START ----------------
scene.setBackgroundColor(15)
game.splash("SOUL SURVIVORS", "Soul Knight x Survivors")
openMenu("CHOOSE YOUR HERO", H_NAME, H_DESC, "A: skill   B: swap gun", function (i: number) {
    startGame(i)
})
