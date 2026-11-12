// Base for every regular enemy. One instance per enemy type lives in ENEMIES
// (Enemies/EnemyRoster.ts); the enemies in the game are plain sprites that store
// their type id, and the AI loop in main.ts calls that type's think() for them.
//
// To make a new enemy:
//   1. Add a T_ id at the end of the list in Enemies/EnemyRoster.ts.
//   2. Create Enemies/MyEnemy.ts: `class MyEnemy extends EnemyType`, call super(...) in
//      the constructor, then change any settings below.
//   3. Custom behaviour: override think() (movement/attacks) and/or onDeath().
//      For shooters, extend ShooterEnemy instead and override fire().
//   4. Add `new MyEnemy()` to ENEMIES in Enemies/EnemyRoster.ts (in id order) and
//      list the file in pxt.json before EnemyRoster.ts.
//   5. Add it to a level with this.addEnemy(T_MY_ENEMY, weight, unlockAt) (Levels/*.ts).
class EnemyType {
    // ---------- settings (change these in your enemy's constructor) ----------
    readonly id: number;
    readonly name: string;
    /** Base stats; hp and speed grow with the floor (see spawnEnemyAt in main.ts). */
    hp: number;
    speed: number;
    /** Damage dealt when it touches the hero. */
    damage: number;
    /** Value of the XP gem it drops. */
    xp: number;
    img: Image;
    /** true = flies over walls and moves straight at the hero; false = pathfinds around walls. */
    flying = false;
    /** % chance to drop a heart / a coin when killed. */
    healthDropChance = 1.5;
    coinDropChance = COIN_DROP_CHANCE;

    // ---------- on death (handled by the default onDeath) ----------
    /** Splits into splitCount enemies of type splitInto (-1 = none). */
    splitInto = -1;
    splitCount = 0;
    /** Bursts into this many enemy shots in a ring. */
    deathShots = 0;
    /** Gets back up once (half hp, stunned for a moment). */
    revives = false;

    constructor(id: number, name: string, hp: number, speed: number, damage: number, xp: number, img: Image) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.speed = speed;
        this.damage = damage;
        this.xp = xp;
        this.img = img;
    }

    // ---------- behaviour (override these) ----------

    /**
     * Called 10x per second for each enemy `e` of this type.
     * dx, dy: vector to the hero; d: distance; spd: its speed (0 while stunned).
     * Default: walk (or fly) toward the hero.
     */
    think(e: Sprite, dx: number, dy: number, d: number, spd: number, stunned: boolean): void {
        this.chase(e, dx, dy, d, spd, stunned);
    }

    /** Runs when `e` dies (not when the boss's death clears the room). */
    onDeath(e: Sprite): void {
        // gets back up once
        if (this.revives && getDN(e, "revived") == 0) {
            const r = spawnEnemyAt(this.id, e.x, e.y, true);
            if (r) {
                setDN(r, "revived", 1);
                setDN(r, "hp", Math.ceil(getDN(r, "hp") / 2));
                setDN(r, "stun", gameTime + 1500);
            }
        }
        // splits into smaller enemies
        for (let i = 0; this.splitInto >= 0 && i < this.splitCount; i++) {
            let x = e.x + randint(-7, 7);
            let y = e.y + randint(-7, 7);
            if (isWallAt(x, y)) { x = e.x; y = e.y; }
            const c = spawnEnemyAt(this.splitInto, x, y, true);
            if (c) setDN(c, "stun", gameTime + 300); // a moment before they move
        }
        // bursts into shots
        const a0 = Math.random() * Math.PI;
        for (let i = 0; i < this.deathShots; i++) enemyShoot(e, a0 + i * 2 * Math.PI / this.deathShots, 60);
    }

    // ---------- movement helpers ----------

    /**
     * Moves toward the hero: flyers straight, walkers along the pathfinding.
     * Returns false if a walker is busy getting unstuck from a wall this tick.
     */
    protected chase(e: Sprite, dx: number, dy: number, d: number, spd: number, stunned: boolean): boolean {
        if (this.flying) {
            this.moveStraight(e, dx, dy, d, spd);
            return true;
        }
        walkTowardHero(e, spd);
        return stunned || !unstickWalker(e);
    }

    /** Straight line at the hero; a negative spd moves away. */
    protected moveStraight(e: Sprite, dx: number, dy: number, d: number, spd: number) {
        e.vx = dx / d * spd;
        e.vy = dy / d * spd;
    }
}

/** Keeps its distance from the hero and shoots at it. Override fire() for other shot patterns. */
class ShooterEnemy extends EnemyType {
    /** Backs away when the hero is closer than this. */
    keepAway = 55;
    /** Only shoots when the hero is within this range. */
    shotRange = 120;

    constructor(id: number, name: string, hp: number, speed: number, damage: number, xp: number, img: Image) {
        super(id, name, hp, speed, damage, xp, img);
    }

    think(e: Sprite, dx: number, dy: number, d: number, spd: number, stunned: boolean): void {
        if (d < this.keepAway) {
            this.moveStraight(e, dx, dy, d, -spd * 0.7);
        } else if (!this.chase(e, dx, dy, d, spd, stunned)) {
            return;
        }
        if (stunned) return;
        let cd = getDN(e, "cd") - 100;
        if (cd <= 0) {
            if (d < this.shotRange) this.fire(e, Math.atan2(dy, dx));
            cd = Math.max(1400, 2600 - floorNum * 100); // shoots faster on later floors
        }
        setDN(e, "cd", cd);
    }

    /** Shoots toward angle `a` (radians). Default: one shot. */
    fire(e: Sprite, a: number): void {
        enemyShoot(e, a, 70);
    }
}
