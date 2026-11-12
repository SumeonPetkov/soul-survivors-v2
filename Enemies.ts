// ---------------- ENEMIES ----------------
// Every enemy type: stats, sprite and special behaviour, all indexed by type number.
// To add an enemy:
//   1. Add a T_ constant and one entry to EVERY array below (same position).
//   2. Give it a weight in each level's enemyWeights / enemyUnlockAt (Levels/*.ts).
//   3. Special behaviour: on-death effects go in the E_SPLIT / E_DEATH_SHOTS / E_REVIVES
//      arrays; movement and attacks (charging, shooting) are in the enemy AI in main.ts.

const T_TURTLE = 0      // slow and tanky
const T_BAT = 1
const T_GOBLIN = 2      // pistol shooter, backs away when close
const T_OGRE = 3
const T_SKELETON = 4    // Dungeon: gets back up once after being killed
const T_SLIME_KING = 5  // Dungeon: splits into 3 small slimes
const T_WOLF = 6        // Forest: charges at the hero
const T_SPORE_POD = 7   // Forest: bursts into spores when killed
const T_ICE_GOLEM = 8   // Glacier: shatters into 2 ice shards
const T_ICE_SHARD = 9   // Glacier: only spawned by golems
const T_FIRE_IMP = 10   // Volcano: flying shooter, 3-shot spread
const T_MAGMA_SLIME = 11 // Volcano: bursts into fire shots when killed
const T_SLIME = 12      // small slime, only spawned by the Slime King

//                turtle bat gob ogre skel king wolf spore golem shard imp magma slime
const E_HP =     [8,     2,  6,  14,  5,   16,  6,   6,    20,   2,    4,  6,    2]
const E_SPD =    [16,    46, 20, 16,  24,  14,  30,  10,   12,   44,   30, 22,   32]
const E_DMG =    [1,     1,  1,  2,   1,   2,   1,   1,    2,    1,    1,  1,    1]
const E_XP =     [2,     1,  2,  5,   1,   5,   3,   2,    5,    1,    3,  2,    1]
// flyers pass over walls; everything else is blocked by them and pathfinds around
const E_FLY =    [false, true, false, false, false, false, false, false, false, false, true, false, false]

// ---- on death ----
// split: spawn E_SPLIT_COUNT enemies of type E_SPLIT_INTO (-1 = none)
const E_SPLIT_INTO =  [-1, -1, -1, -1, -1, T_SLIME, -1, -1, T_ICE_SHARD, -1, -1, -1, -1]
const E_SPLIT_COUNT = [0,  0,  0,  0,  0,  3,       0,  0,  2,           0,  0,  0,  0]
// burst into this many enemy shots in a ring
const E_DEATH_SHOTS = [0,  0,  0,  0,  0,  0,       0,  6,  0,           0,  0,  4,  0]
// comes back once (half HP, stunned for a moment)
const E_REVIVES =     [false, false, false, false, true, false, false, false, false, false, false, false, false]

const ENEMY_SPRITES: { [name: string]: Image } = {
    skeleton: img`
    . . . f f f f f f . . .
    . . f 1 1 1 1 1 1 f . .
    . f 1 f f 1 1 f f 1 f .
    . f 1 f 2 1 1 2 f 1 f .
    . . f 1 1 1 1 1 1 f . .
    . . f 1 f 1 1 f 1 f . .
    . . . f f f f f f . . .
    . . f 1 f 1 1 f 1 f . .
    . f 1 f 1 f f 1 f 1 f .
    . . f 1 f 1 1 f 1 f . .
    . . . f 1 f f 1 f . . .
    . . . f f . . f f . . .
`,
    slimeKing: img`
    . . . 5 . . 5 . . 5 . . 5 . . .
    . . . 5 5 5 5 5 5 5 5 5 5 . . .
    . . . 5 4 5 5 4 4 5 5 4 5 . . .
    . . . . f f f f f f f f . . . .
    . . f f 7 7 7 7 7 7 7 7 f f . .
    . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
    f 7 7 1 1 7 7 7 7 7 7 1 1 7 7 f
    f 7 7 1 f 7 7 7 7 7 7 f 1 7 7 f
    f 7 7 7 7 7 7 7 7 7 7 7 7 7 7 f
    f 7 7 7 7 7 7 7 7 7 7 7 7 7 7 f
    f 6 7 7 7 7 f f f f 7 7 7 7 6 f
    f 6 6 7 7 7 7 7 7 7 7 7 7 6 6 f
    . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
    . . f f f f f f f f f f f f . .
`,
    wolf: img`
    . f . . . . . . . . f .
    . f b f . . . . f b f .
    . f b b f f f f b b f .
    . f b b b b b b b b f .
    f b 1 f b b b b f 1 b f
    f b b b b b b b b b b f
    . f b b 1 f f 1 b b f .
    . . f b 1 1 1 1 b f . .
    . . f b b 2 2 b b f . .
    . f b b b b b b b b f .
    f b f b f b b f b f b f
    f f . f f . . f f . f f
`,
    sporePod: img`
    . . . f f f f f f . . .
    . f f 2 2 2 2 2 2 f f .
    f 2 2 1 2 2 2 2 1 2 2 f
    f 2 1 1 2 2 2 2 1 1 2 f
    f 2 2 2 2 1 1 2 2 2 2 f
    . f f f f f f f f f f .
    . . . f d d d d f . . .
    . . f d f d d f d f . .
    . . f d d d d d d f . .
    . . f d d d d d d f . .
    . . f d d d d d d f . .
    . . . f f f f f f . . .
`,
    iceGolem: img`
    . . . f f f f f f f f . . .
    . . f 9 9 9 9 9 9 9 9 f . .
    . f 9 1 9 9 9 9 9 9 1 9 f .
    . f 9 f f 9 9 9 9 f f 9 f .
    . f 9 9 9 9 9 9 9 9 9 9 f .
    f f f 9 9 9 9 9 9 9 9 f f f
    f 9 9 f 9 9 1 1 9 9 f 9 9 f
    f 9 1 f 9 9 9 9 9 9 f 1 9 f
    f 9 9 f 9 9 9 9 9 9 f 9 9 f
    . f f f 9 9 9 9 9 9 f f f .
    . . f 9 9 f f f f 9 9 f . .
    . . f 9 9 f . . f 9 9 f . .
    . f 9 9 9 f . . f 9 9 9 f .
    . f f f f f . . f f f f f .
`,
    iceShard: img`
    . . . f f . . .
    . . f 9 9 f . .
    . f 9 1 1 9 f .
    f 9 1 9 9 1 9 f
    f 9 9 9 9 9 9 f
    . f 9 9 9 9 f .
    . . f 9 9 f . .
    . . . f f . . .
`,
    fireImp: img`
    . . . f . . . . f . . .
    . . f 2 f . . f 2 f . .
    f . f 2 2 2 2 2 2 f . f
    2 f 2 5 f 2 2 f 5 2 f 2
    2 2 f 2 2 2 2 2 2 f 2 2
    . 2 f 4 2 2 2 2 4 f 2 .
    . . f 2 4 4 4 4 2 f . .
    . . . f 2 2 2 2 f . . .
    . . . f 2 f f 2 f . . .
    . . . . f . . f . . . .
`,
    magmaSlime: img`
    . . . . f f f f . . . .
    . . f f 2 4 4 2 f f . .
    . f 2 4 4 5 5 4 4 2 f .
    f 2 4 f 4 4 4 4 f 4 2 f
    f 2 4 f 4 5 5 4 f 4 2 f
    f 2 4 4 4 4 4 4 4 4 2 f
    f 2 2 4 5 4 4 5 4 2 2 f
    f e 2 2 4 4 4 4 2 2 e f
    . f e e 2 2 2 2 e e f .
    . . f f f f f f f f . .
`,
}

const E_IMG: Image[] = [
    // editor sprites have empty borders; trimming them keeps hitboxes tight
    trimImage(getImage("turtle")), getImage("bat"), trimImage(getImage("goblin")), getImage("ogre"),
    ENEMY_SPRITES["skeleton"], ENEMY_SPRITES["slimeKing"], ENEMY_SPRITES["wolf"], ENEMY_SPRITES["sporePod"],
    ENEMY_SPRITES["iceGolem"], ENEMY_SPRITES["iceShard"], ENEMY_SPRITES["fireImp"], ENEMY_SPRITES["magmaSlime"],
    trimImage(getImage("slime")),
]

/** Shooting enemies keep their distance and fire at the hero. */
function isShooterType(t: number): boolean {
    return t == T_GOBLIN || t == T_FIRE_IMP
}

/** Runs when enemy e of type t dies (not when the boss clears the room). */
function enemyDeathEffects(e: Sprite, t: number) {
    // gets back up once
    if (E_REVIVES[t] && getDN(e, "revived") == 0) {
        const r = spawnEnemyAt(t, e.x, e.y, true)
        if (r) {
            setDN(r, "revived", 1)
            setDN(r, "hp", Math.ceil(getDN(r, "hp") / 2))
            setDN(r, "stun", gameTime + 1500)
        }
    }
    // splits into smaller enemies
    const child = E_SPLIT_INTO[t]
    for (let i = 0; child >= 0 && i < E_SPLIT_COUNT[t]; i++) {
        let x = e.x + randint(-7, 7)
        let y = e.y + randint(-7, 7)
        if (isWallAt(x, y)) { x = e.x; y = e.y }
        const c = spawnEnemyAt(child, x, y, true)
        if (c) setDN(c, "stun", gameTime + 300) // a moment before they move
    }
    // bursts into shots
    const n = E_DEATH_SHOTS[t]
    const a0 = Math.random() * Math.PI
    for (let i = 0; i < n; i++) enemyShoot(e, a0 + i * 2 * Math.PI / n, 60)
}
