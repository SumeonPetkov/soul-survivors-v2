// All chest items. Icons are 10x10 (. = transparent, 1-f = palette colors).
// Stat items add their bonus once per level in apply(n); behaviour items read this.level.

class IronHeart extends Item {
    constructor() {
        super("ironheart", "Iron Heart", 3, img`
            . . . . . . . . . .
            . c c . . . c c . .
            c d d c . c d d c .
            c d d d c d d d c .
            c d d d d d d d c .
            . c d d d d d c . .
            . . c d d d c . . .
            . . . c d c . . . .
            . . . . c . . . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+" + (3 * level) + " max HP"; }
    apply(n: number) {
        hero.maxHp += 3 * n;
        if (n > 0) hero.heal(3 * n);
        else hero.hp = Math.min(hero.hp, hero.maxHp);
    }
}

class BerserkerMask extends Item {
    constructor() {
        super("berserker", "Berserker Mask", 4, img`
            . . 2 2 2 2 2 2 . .
            . 2 2 2 2 2 2 2 2 .
            . 2 f f 2 2 f f 2 .
            . 2 f f 2 2 f f 2 .
            . 2 2 2 2 2 2 2 2 .
            . . 2 2 2 2 2 2 . .
            . . 2 1 2 2 1 2 . .
            . . 2 2 2 2 2 2 . .
            . . . 2 . . 2 . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+" + (25 * level) + "% damage"; }
    apply(n: number) { player.dmgMult += 0.25 * n; }
}

class Hourglass extends Item {
    constructor() {
        super("hourglass", "Hourglass", 4, img`
            . d d d d d d d d .
            . . 9 . . . . 9 . .
            . . . 9 5 5 9 . . .
            . . . . 9 9 . . . .
            . . . . 9 9 . . . .
            . . . 9 . . 9 . . .
            . . 9 . 5 5 . 9 . .
            . . 9 5 5 5 5 9 . .
            . d d d d d d d d .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+" + (20 * level) + "% fire rate"; }
    apply(n: number) { player.rateMult += 0.2 * n; }
}

class WingedBoots extends Item {
    constructor() {
        super("wingboots", "Winged Boots", 3, img`
            . . 9 9 9 9 . . . .
            . . 9 9 9 9 . . . .
            1 . 9 9 9 9 . . . .
            1 1 9 9 9 9 . . . .
            1 1 1 9 9 9 . . . .
            . 1 1 9 9 9 9 . . .
            . . 9 9 9 9 9 9 9 .
            . . 9 9 9 9 9 9 9 .
            . . 8 8 8 8 8 8 8 .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+" + (12 * level) + " move speed"; }
    apply(n: number) {
        hero.speed += 12 * n;
        hero.enableMovement();
    }
}

class StarTracer extends Item {
    timer = 0;
    star = getImage("myImage11");
    constructor() {
        super("tracer", "Star Tracer", 3, img`
            . . . . . . . . . .
            . 9 9 9 9 9 9 9 9 .
            . 9 9 9 9 9 9 9 9 .
            . 9 9 1 1 1 1 9 9 .
            . 9 1 f f f f 1 9 .
            . 9 f f f f f f 9 .
            . . f f f f f f . .
            . . . f f f f . . .
            . . . . f f . . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+" + (0.25 * level) + " damage a star"; }
    // fires `level` homing stars per second in random directions
    update(dt: number) {
        if (!hero.canAttack()) return; // no enemy to shoot: hold the stars
        this.timer += dt;
        if (this.timer < 1000 / this.level) return;
        this.timer = 0;
        //                                                     speed dmg life pierce boom home
        hero.shoot(this.star, Math.random() * 2 * Math.PI, 100, 1.5 + 0.25 * this.level, 500 + this.level * 100, 1, 0, 1);
    }
}

class VampireFang extends Item {
    kills = 0;
    constructor() {
        super("fang", "Vampire Fang", 3, img`
            . . . . . . . . . .
            . 1 1 1 1 1 1 1 1 .
            . 1 1 1 1 1 1 1 1 .
            . 1 1 1 1 1 1 1 1 .
            . . 1 1 . . 1 1 . .
            . . 1 1 . . 1 1 . .
            . . 1 2 . . 1 2 . .
            . . . 2 . . . 2 . .
            . . . 2 . . . . . .
            . . . . . . . . . .
        `);
    }
    killsNeeded(level: number) { return 12 - 3 * (level - 1); }
    describe(level: number) { return "Heal 1 HP every " + this.killsNeeded(level) + " kills"; }
    onKill(x: number, y: number) {
        this.kills++;
        if (this.kills >= this.killsNeeded(this.level)) {
            this.kills = 0;
            hero.heal(1);
        }
    }
}

class ThornShield extends Item {
    readyAt = 0;
    constructor() {
        super("shield", "Guardian Shield", 3, img`
            . 8 8 8 8 8 8 8 . .
            . 8 9 9 9 9 9 8 . .
            . 8 9 9 1 9 9 8 . .
            . 8 9 1 1 1 9 8 . .
            . 8 9 9 1 9 9 8 . .
            . . 8 9 9 9 8 . . .
            . . 8 9 9 9 8 . . .
            . . . 8 9 8 . . . .
            . . . . 8 . . . . .
            . . . . . . . . . .
        `);
    }
    cooldown(level: number) { return 10 - 2 * (level - 1); }
    describe(level: number) { return "Blocks a hit every " + this.cooldown(level) + "s"; }
    modifyDamageTaken(damage: number): number {
        if (gameTime < this.readyAt) return damage;
        this.readyAt = gameTime + this.cooldown(this.level) * 1000;
        fx(PUFF_IMG, hero.x, hero.y, 200);
        return 0;
    }
}

class LuckyCoin extends Item {
    constructor() {
        super("coin", "Lucky Coin", 4, img`
            . . . 5 5 5 5 . . .
            . . 5 5 5 5 5 5 . .
            . 5 5 5 4 4 5 5 5 .
            . 5 5 4 5 5 5 5 5 .
            . 5 5 5 4 4 5 5 5 .
            . 5 5 5 5 5 4 5 5 .
            . 5 5 5 4 4 5 5 5 .
            . . 5 5 5 5 5 5 . .
            . . . 5 5 5 5 . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+" + (10 * level) + "% crit chance"; }
    apply(n: number) { player.critChance += 10 * n; }
}

class SplitCrystal extends Item {
    constructor() {
        super("crystal", "Split Crystal", 2, img`
            . . . . a . . . . .
            . . . a a a . . . .
            . . a a b a a . . .
            . a a b b b a a . .
            . . a a b a a . . .
            . . . a a a . . . .
            . . . . a . . . . .
            . . a . . . a . . .
            . a a a . a a a . .
            . . a . . . a . . .
        `);
    }
    describe(level: number) { return "+" + level + " bullet" + (level > 1 ? "s" : "") + " per shot"; }
    apply(n: number) { player.multishot += n; }
}

class BombRing extends Item {
    constructor() {
        super("bombring", "Bomb Ring", 3, img`
            . . . . . . 4 . . .
            . . . . . 4 . 5 . .
            . . . . f . . . . .
            . . f f f f . . . .
            . f f f f f f . . .
            . f f 1 f f f . . .
            . f f f f f f f . .
            . f f f f f f . . .
            . . f f f f . . . .
            . . . . . . . . . .
        `);
    }
    chance(level: number) { return 15 + 10 * level; }
    describe(level: number) { return this.chance(level) + "% of kills explode"; }
    onKill(x: number, y: number) {
        if (Math.percentChance(this.chance(this.level))) explode(x, y, (2 + this.level) * player.dmgMult);
    }
}

class RegenCharm extends Item {
    timer = 0;
    constructor() {
        super("regen", "Regen Charm", 3, img`
            . . . . . . . . . .
            . . . 7 7 7 7 . . .
            . . . 7 7 7 7 . . .
            . 7 7 7 7 7 7 7 7 .
            . 7 7 7 1 1 7 7 7 .
            . 7 7 7 1 1 7 7 7 .
            . 7 7 7 7 7 7 7 7 .
            . . . 7 7 7 7 . . .
            . . . 7 7 7 7 . . .
            . . . . . . . . . .
        `);
    }
    interval(level: number) { return 12 - 3 * (level - 1); }
    describe(level: number) { return "Heal 1 HP every " + this.interval(level) + "s"; }
    update(dt: number) {
        this.timer += dt;
        if (this.timer >= this.interval(this.level) * 1000) {
            this.timer = 0;
            hero.heal(1);
        }
    }
}
