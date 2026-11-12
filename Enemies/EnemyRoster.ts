// Every regular enemy type. Enemy behaviour and stats live in Enemies/*.ts
// (see BaseClasses/EnemyType.ts for how to add one).
//
// Ids: one per enemy, in the same order as ENEMIES below. Add new ones at the end.
const T_TURTLE = 0
const T_BAT = 1
const T_GOBLIN = 2
const T_OGRE = 3
const T_SKELETON = 4
const T_SLIME_KING = 5
const T_WOLF = 6
const T_SPORE_POD = 7
const T_ICE_GOLEM = 8
const T_ICE_SHARD = 9
const T_FIRE_IMP = 10
const T_MAGMA_SLIME = 11
const T_SLIME = 12

const ENEMIES: EnemyType[] = [
    new Turtle(),
    new Bat(),
    new Goblin(),
    new Ogre(),
    new Skeleton(),
    new SlimeKing(),
    new Wolf(),
    new SporePod(),
    new IceGolem(),
    new IceShard(),
    new FireImp(),
    new MagmaSlime(),
    new Slime(),
]
for (let i = 0; i < ENEMIES.length; i++) {
    if (ENEMIES[i].id != i) throw "ENEMIES out of order at " + i + " (" + ENEMIES[i].name + ")";
}
