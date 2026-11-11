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

class CursedIdol extends Item {
    slots = 0;    // what this idol has currently added
    penalty = 0;
    constructor() {
        super("idol", "Cursed Idol", 3, img`
            . . . . . . . . . .
            . . . f f f f . . .
            . . f a a a a f . .
            . . f 2 a a 2 f . .
            . . f a a a a f . .
            . . . f a a f . . .
            . . f a a a a f . .
            . . f a f f a f . .
            . f f f f f f f f .
            . . . . . . . . . .
        `);
        this.undroppable = true;
    }
    describe(level: number) { return "+1 Item Slot\n-" + (25 - 5 * level) + " Damage; Cannot be dropped"; }
    // apply(1) on pickup and on each level up, apply(-level) on removal.
    // Undo what was applied last, then apply the amounts for the current level.
    apply(n: number) {
        player.maxItemSlots -= this.slots;
        player.dmgMult += this.penalty;
        this.slots = 0;
        this.penalty = 0;
        if (n < 0) return; // removed
        this.slots = 1;
        this.penalty = 0.25 - 0.05 * this.level;
        player.maxItemSlots += this.slots;
        player.dmgMult -= this.penalty;
    }
}

class GamblersDie extends Item {
    oldMult = 0;
    constructor() {
        super("die", "Gambler's Die", 3, img`
            . . . . . . . . . .
            . f f f f f f f f .
            . f 1 1 1 1 1 1 f .
            . f 1 2 1 1 2 1 f .
            . f 1 1 1 1 1 1 f .
            . f 1 1 1 1 1 1 f .
            . f 1 2 1 1 2 1 f .
            . f 1 1 1 1 1 1 f .
            . f f f f f f f f .
            . . . . . . . . . .
        `);
    }
    rollMult(level: number) { 
        const roll = Math.randomRange(1, 7);
        if (roll <= 2 + 1 * level) {
            player.dmgMult += 0.3;
            this.oldMult = 0.3;
            banner("DAMAGE +30%", 2000);
        } else {
            player.dmgMult -= 0.3;
            this.oldMult = -0.3;
            banner("DAMAGE -30%", 2000);
        }
    }
    // win chance = (2 + level) out of 7: 43% / 57% / 71%
    describe(level: number) { return "Each floor: " + Math.round((2 + level) / 7 * 100) + "% chance of +30% dmg\nelse -30% dmg"; }
    onEachFloor(currentFloor: number) {
        player.dmgMult -= this.oldMult;
        this.oldMult = 0;
        this.rollMult(this.level);
    }
    apply(n: number) {
        if (n < 0) {
            player.dmgMult -= this.oldMult;
            this.oldMult = 0;
            return;
        }
        if (this.level == 1) this.rollMult(this.level);
    }
}

class BloodPact extends Item {
    // what this pact has currently added (undo-then-apply, like the Cursed Idol)
    bonus = 0;
    hpCost = 0;
    describe(level: number) { return "+" + (15 + 15 * level) + "% damage\n-2 max HP"; }
    apply(n: number) {
        player.dmgMult -= this.bonus;
        hero.maxHp += this.hpCost;
        this.bonus = 0;
        this.hpCost = 0;
        if (n < 0) return; // removed
        this.bonus = 0.15 + 0.15 * this.level;
        this.hpCost = 2;
        player.dmgMult += this.bonus;
        hero.maxHp -= this.hpCost; // maxHp never goes below 1
    }
    constructor() {
        super("pact", "Blood Pact", 3, img`
            . . . . . . . . . .
            . . . . 2 2 . . . .
            . . . 2 2 2 2 . . .
            . . 2 2 2 2 2 2 . .
            . . 2 1 2 2 2 2 . .
            . 2 2 1 2 2 2 2 2 .
            . 2 2 2 2 2 2 2 2 .
            . . 2 2 2 2 2 2 . .
            . . . 2 2 2 2 . . .
            . . . . . . . . . .
        `);
    }
}

class ShadowStep extends Item {
    static readonly BURST_SPEED = 40;
    burstUntil = 0;
    bursting = false;
    describe(level: number) { return "After a hit: +" + (0.3 * level) + "s invulnerable\nand a speed burst"; }
    modifyDamageTaken(damage: number) {
        if (damage <= 0) return damage;
        invulnUntil = Math.max(invulnUntil, gameTime + 800 + 300 * this.level);
        if (!this.bursting) {
            this.bursting = true;
            hero.speed += ShadowStep.BURST_SPEED;
            hero.enableMovement();
        }
        this.burstUntil = gameTime + 1500;
        return damage;
    }
    update(dt: number) {
        if (this.bursting && gameTime >= this.burstUntil) this.endBurst();
    }
    apply(n: number) {
        if (n < 0 && this.bursting) this.endBurst(); // dropped mid-burst
    }
    endBurst() {
        this.bursting = false;
        hero.speed -= ShadowStep.BURST_SPEED;
        hero.enableMovement();
    }
    constructor() {
        super("shadow", "Shadow Step", 3, img`
            . . . . . . . . . .
            . . . . . a . a . .
            . . . . . a a a . .
            . . . . . a a a . .
            . a . a . a a a . .
            . a a a . . a . . .
            . a a a . . . . . .
            . a a a . . . . . .
            . . a . . . . . . .
            . . . . . . . . . .
        `);
    }
}

class SecondWind extends Item {
    used = false;
    healNext = 0;
    describe(level: number) { return "Once per floor: survive a lethal hit\nthen heal " + level + " HP"; }
    modifyDamageTaken(damage: number) {
        if (this.used || damage < hero.hp) return damage;
        this.used = true;
        this.healNext = this.level; // healed next frame, after the hit lands
        banner("SECOND WIND!", 1500);
        return hero.hp - 1; // leaves the hero at 1 HP
    }
    update(dt: number) {
        if (this.healNext > 0 && !hero.isDead) {
            hero.heal(this.healNext);
            this.healNext = 0;
        }
    }
    onEachFloor(currentFloor: number) { this.used = false; }
    constructor() {
        super("wind", "Second Wind", 3, img`
            . . . . . . . . . .
            . . . 9 9 9 . . . .
            . . 9 . . . 9 . . .
            . . . . . . 9 . . .
            . 9 9 9 9 9 . . . .
            . . . . . . . . . .
            . 1 1 1 1 1 1 1 . .
            . . . . . . . . 1 .
            . . . . . 1 1 1 . .
            . . . . . . . . . .
        `);
    }
}

class RicochetCharm extends Item {
    chance(level: number) { return 20 + 15 * level; }
    describe(level: number) { return this.chance(level) + "% chance shots bounce to\nanother enemy (60% dmg)"; }
    onProjectileHit(p: Sprite, e: Sprite) {
        if (!Math.percentChance(this.chance(this.level))) return;
        const dmg = getDN(p, "dmg") * 0.6;
        if (dmg < 0.3) return; // chain has faded out
        // nearest other enemy within 90px with a clear line from the one that was hit
        let next: Sprite = null;
        let best = 90 * 90;
        for (const o of sprites.allOfKind(SpriteKind.Enemy)) {
            if (o == e || getDB(o, "dead")) continue;
            const dx = o.x - e.x;
            const dy = o.y - e.y;
            const d = dx * dx + dy * dy;
            if (d < best && lineOfSight(e.x, e.y, o.x, o.y)) {
                best = d;
                next = o;
            }
        }
        if (!next) return;
        const spd = getDN(p, "spd") > 0 ? getDN(p, "spd") : 150;
        const b = hero.shoot(p.image, Math.atan2(next.y - e.y, next.x - e.x), spd, 1, 500);
        b.setPosition(e.x, e.y);
        setDN(b, "dmg", dmg);     // exact damage, not re-scaled by Power
        setDN(b, "last", e.id);   // don't instantly hit the same enemy again
    }
    constructor() {
        super("ricochet", "Ricochet Charm", 3, img`
            . . . . . . . . b b
            . . 5 . . . . . b b
            . . . 5 . . . . b b
            . . . . 5 5 . . b b
            . . . . . . 5 5 b b
            . . . . 5 5 . . b b
            . . . 5 . . . . b b
            . 4 4 . . . . . b b
            . 4 4 . . . . . b b
            . . . . . . . . b b
        `);
    }
}

class ExecutionersAxe extends Item {
    threshold(level: number) { return 10 + 5 * level; } // % of max HP
    describe(level: number) { return "Enemies under " + this.threshold(level) + "% HP die in one hit\nBosses: +50% dmg"; }
    modifyDamageDealt(e: Sprite, damage: number) {
        const th = this.threshold(this.level) / 100;
        if (boss && e == boss) {
            return boss.hp < boss.maxHp * th ? damage * 1.5 : damage;
        }
        const hp = getDN(e, "hp");
        const mx = getDN(e, "maxhp");
        if (mx > 0 && hp <= mx * th) return Math.max(damage, hp); // execute
        return damage;
    }
    constructor() {
        super("axe", "Executioner's Axe", 3, img`
            . . . . . . . . . .
            . . . b b b e . . .
            . . 1 b b b e . . .
            . 1 b b b b e . . .
            . 1 b b b b e . . .
            . . 1 b b b e . . .
            . 2 . . . . e . . .
            . . . . . . e . . .
            . . . . . . e . . .
            . . . . . . . . . .
        `);
    }
}

class TwinFang extends Item {
    chance(level: number) { return 15 + 15 * level; }
    describe(level: number) { return this.chance(level) + "% chance to attack twice"; }
    onAttack(target: Sprite) {
        if (Math.percentChance(this.chance(this.level))) hero.attack(target);
    }
    constructor() {
        super("twinfang", "Twin Fang", 3, img`
            . . . . . . . . . .
            . 1 1 1 . . . . . .
            . 1 1 1 . . . . . .
            . 1 1 1 . . . 2 . .
            . 1 1 1 . . . 1 . .
            . . 1 . . . 1 1 1 .
            . . 2 . . . 1 1 1 .
            . . . . . . 1 1 1 .
            . . . . . . 1 1 1 .
            . . . . . . . . . .
        `);
    }
}

class EmberCore extends Item {
    timer = 0;
    ticking = false; // burn damage must not re-ignite (would burn forever)
    flame: Image = null;
    describe(level: number) { return "Hits burn enemies for 3s\n" + level + " damage per second"; }
    modifyDamageDealt(e: Sprite, damage: number) {
        if (!this.ticking) setDN(e, "burn", gameTime + 3000);
        return damage;
    }
    update(dt: number) {
        this.timer += dt;
        if (this.timer < 500) return;
        this.timer = 0;
        if (!this.flame) this.flame = makeBall(1, 2, 4);
        this.ticking = true;
        for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
            if (getDN(e, "burn") > gameTime) {
                hurtEnemy(e, 0.5 * this.level * player.dmgMult);
                fx(this.flame, e.x + randint(-4, 4), e.y - 4, 150);
            }
        }
        this.ticking = false;
    }
    constructor() {
        super("ember", "Ember Core", 3, img`
            . . . . . . . . 4 .
            . . . 2 2 2 2 . . .
            . . 2 4 4 4 4 2 . .
            . 2 4 5 5 4 4 4 2 .
            . 2 4 5 1 5 4 4 2 .
            . 2 4 4 5 5 4 4 2 .
            . 2 4 4 4 4 4 4 2 .
            . . 2 4 4 4 4 2 . .
            . . . 2 2 2 2 . . .
            . . . . . . . . . .
        `);
    }
}

class OrbitBlade extends Item {
    added = 0; // blades this item has added to the shared `orbits` list
    describe(level: number) { return "+" + level + " orbiting blade" + (level > 1 ? "s" : ""); }
    apply(n: number) {
        if (n > 0) {
            for (let i = 0; i < n; i++) addOrbit();
            this.added += n;
        } else {
            for (let i = 0; i < this.added; i++) {
                const o = orbits.pop();
                if (o) o.destroy();
            }
            this.added = 0;
        }
    }
    constructor() {
        super("orbit", "Orbit Blade", 3, img`
            . . . . . . . . . .
            . . . . 1 1 . . . .
            . . . . b b . . . .
            . . a . . . . a . .
            . 1 b . 9 9 . b 1 .
            . 1 b . 9 9 . b 1 .
            . . a . . . . a . .
            . . . . b b . . . .
            . . . . 1 1 . . . .
            . . . . . . . . . .
        `);
    }
}

