// Where a boss appears when it spawns.
enum BossSpawn {
    /** Random open spot 95-140px from the hero (just off screen). */
    NearHero,
    /** Center of the map (always open floor). */
    MapCenter,
    /** Open spot on the opposite side of the map from the hero. */
    FarFromHero,
    /** Exact tile: set spawnCol / spawnRow. Falls back to NearHero if it's a wall. */
    Tile
}

// Base for every boss. To make a new boss:
//   1. Create Bosses/MyBoss.ts: `class MyBoss extends Boss implements ICharacter`
//   2. In its constructor call super(...) then change any settings below.
//   3. Write attack() using the helpers (ringBurst, aimedFan, summon, shootAt).
//   4. Return it from a level's createBoss() (Levels/*.ts) and list the file in pxt.json.
abstract class Boss extends Character implements ICharacter {
    // ---------- settings (change these in your boss's constructor) ----------
    /** Floor this boss was spawned on - use it to scale difficulty. */
    readonly floor: number;
    /** Where it appears. */
    spawnPoint: BossSpawn = BossSpawn.NearHero;
    spawnCol = 0;
    spawnRow = 0;
    /** true = flies over walls; false = blocked by walls and walks around them. */
    flying = false;
    /** Damage dealt when the hero touches it. */
    contactDamage = 2;
    /** ms before its first attack after spawning. */
    firstAttackDelay = 1500;
    /** ms between attacks, normally and while raging. */
    attackCooldown = 2000;
    rageCooldown = 1300;
    /** Rages below this fraction of max hp (0.5 = half). */
    rageAt = 0.5;
    /** Number of big (value 10) gems dropped on death. */
    gemDrops = 4;
    /** Text shown in the banner when it appears. */
    spawnBanner: string;

    // ---------- runtime state ----------
    /** How many times attack() has run - use it to cycle patterns. */
    attackCount = 0;
    private attackTimer = 0;

    constructor(id: string, name: string, floor: number, maxHp: number, speed: number, img: Image) {
        super(id, name, maxHp, speed, CharacterKind.Normal, img, SpriteKind.Enemy);
        this.floor = floor;
        this.spawnBanner = "BOSS: " + name + "!";
        this.z = 4;
    }

    get isRaging(): boolean {
        return this.hp < this.maxHp * this.rageAt;
    }

    get isStunned(): boolean {
        return getDN(this, "stun") > gameTime;
    }

    /** Picks the spawn position from spawnPoint. Override for custom placement. */
    spawnPosition(): number[] {
        const center = [Math.floor(MAP_W / 2) * 16 + 8, Math.floor(MAP_H / 2) * 16 + 8];
        if (this.spawnPoint == BossSpawn.MapCenter) {
            const mc = Math.floor(MAP_W / 2);
            const mr = Math.floor(MAP_H / 2);
            for (let d = 0; d < 12; d++) {
                for (let dc = -d; dc <= d; dc++) {
                    for (let dr = -d; dr <= d; dr++) {
                        if (!isWall(mc + dc, mr + dr)) return [(mc + dc) * 16 + 8, (mr + dr) * 16 + 8];
                    }
                }
            }
            return center;
        }
        if (this.spawnPoint == BossSpawn.Tile && !isWall(this.spawnCol, this.spawnRow)) {
            return [this.spawnCol * 16 + 8, this.spawnRow * 16 + 8];
        }
        if (this.spawnPoint == BossSpawn.FarFromHero) {
            // mirror the hero's position across the map center, then nudge to open floor
            const c = MAP_W - 1 - Math.floor(hero.x / 16);
            const r = MAP_H - 1 - Math.floor(hero.y / 16);
            for (let d = 0; d < 6; d++) {
                for (let dc = -d; dc <= d; dc++) {
                    for (let dr = -d; dr <= d; dr++) {
                        if (!isWall(c + dc, r + dr)) return [(c + dc) * 16 + 8, (r + dr) * 16 + 8];
                    }
                }
            }
        }
        const pos = findSpawn();
        return pos.length > 0 ? pos : center;
    }

    /** Runs right after it is placed. Default: banner, sound, screen shake. */
    onSpawn(): void {
        this.setFlag(SpriteFlag.GhostThroughWalls, this.flying);
        this.attackTimer = this.firstAttackDelay;
        banner(this.spawnBanner, 2500);
        sfx(music.bigCrash);
        scene.cameraShake(4, 500);
    }

    /** Called 10x per second by the enemy AI loop. */
    think(dt: number): void {
        if (this.isStunned) {
            this.vx = 0;
            this.vy = 0;
            return;
        }
        this.move();
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) {
            this.attack(hero);
            this.attackCount++;
            this.attackTimer = this.isRaging ? this.rageCooldown : this.attackCooldown;
        }
    }

    /** Default movement: flyers go straight at the hero, walkers pathfind around walls. Override for other movement. */
    move(): void {
        if (this.flying) {
            const dx = hero.x - this.x;
            const dy = hero.y - this.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
            this.vx = dx / d * this.speed;
            this.vy = dy / d * this.speed;
        } else {
            walkTowardHero(this, this.speed);
            unstickWalker(this);
        }
    }

    // ---------- attack helpers ----------

    /** `count` shots in a full circle. `offset` rotates the ring (radians). */
    protected ringBurst(count: number, speed: number, offset = 0) {
        for (let i = 0; i < count; i++) enemyShoot(this, offset + i * 2 * Math.PI / count, speed);
    }

    /** `count` shots fanned toward the target, `gap` radians apart. */
    protected aimedFan(target: Sprite, count: number, gap: number, speed: number) {
        const a0 = Math.atan2(target.y - this.y, target.x - this.x);
        const half = (count - 1) / 2;
        for (let i = 0; i < count; i++) enemyShoot(this, a0 + (i - half) * gap, speed);
    }

    /** One shot straight at the target. */
    protected shootAt(target: Sprite, speed: number) {
        enemyShoot(this, Math.atan2(target.y - this.y, target.x - this.x), speed);
    }

    /** Spawns `count` regular enemies of `enemyType` (0 slime, 1 bat, 2 goblin, 3 ogre) nearby. */
    protected summon(enemyType: number, count: number, radius = 30) {
        for (let i = 0; i < count; i++) {
            const x = this.x + randint(-radius, radius);
            const y = this.y + randint(-radius, radius);
            if (!isWallAt(x, y)) spawnEnemyAt(enemyType, x, y);
        }
    }

    // ---------- required / overridable ---------

    attack(target: Sprite): void {
        throw "attack() not implemented in " + this.name;
    }

    /** Default: drops loot, opens the portal, clears the floor (see bossDefeated in main.ts). */
    onDeath(): void {
        bossDefeated(this);
        this.destroy();
    }
}

/** The horned demon look the original bosses share; pass two palette colors. */
function makeDemonImage(c1: number, c2: number): Image {
    const im = image.create(28, 28);
    im.drawLine(7, 9, 3, 1, 13);
    im.drawLine(8, 9, 4, 1, 13);
    im.drawLine(9, 9, 5, 2, 13);
    im.drawLine(20, 9, 24, 1, 13);
    im.drawLine(19, 9, 23, 1, 13);
    im.drawLine(18, 9, 22, 2, 13);
    im.fillCircle(14, 16, 11, 15);
    im.fillCircle(14, 16, 10, c1);
    im.fillCircle(14, 21, 5, c2);
    im.fillRect(8, 11, 4, 3, 5);
    im.fillRect(16, 11, 4, 3, 5);
    im.setPixel(10, 12, 15);
    im.setPixel(17, 12, 15);
    im.drawLine(7, 9, 12, 11, 15);
    im.drawLine(21, 9, 16, 11, 15);
    im.drawLine(10, 17, 18, 17, 15);
    im.setPixel(11, 18, 1);
    im.setPixel(17, 18, 1);
    return im;
}
