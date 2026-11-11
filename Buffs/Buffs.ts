// Every level-up buff. Each class holds its icon, text and effect.
// To add one: write a class here, then list it in BUFF_POOL (Buffs/BuffRoster.ts).
// Hooks you can override are listed in BaseClasses/Perk.ts.

class OrbitBlades extends Buff {
    constructor() {
        super("orbit", "Orbit Blades", 5, img`
            . . . . 1 1 . . . .
            . . . 1 d d 1 . . .
            . . 1 d . . d 1 . .
            . 1 d . . . . d 1 .
            1 d . . 5 5 . . d 1
            1 d . . 5 5 . . d 1
            . 1 d . . . . d 1 .
            . . 1 d . . d 1 . .
            . . . 1 d d 1 . . .
            . . . . 1 1 . . . .
        `);
    }
    describe(level: number) { return "Blades spin around you\n" + level + " blade" + (level > 1 ? "s" : "") + ", " + (2 + level) + " dmg"; }
    // one more blade per level; their damage (2 + level) is read in the Orbit overlap in main.ts
    apply(n: number) { for (let i = 0; i < n; i++) addOrbit(); }
}

class HolyAura extends Buff {
    ring: Sprite = null;
    timer = 0;
    constructor() {
        super("aura", "Holy Aura", 5, img`
            . . . . 4 . . . . .
            . . . 4 4 . . . . .
            . . . 4 5 4 . . . .
            . . 4 5 5 4 . 4 . .
            . . 4 5 5 5 4 . . .
            . 4 4 5 5 5 4 4 . .
            . 4 5 5 5 5 5 4 . .
            . 4 5 5 1 5 5 4 . .
            . . 4 5 5 5 4 . . .
            . . . 4 4 4 . . . .
        `);
    }
    radius(level: number) { return 20 + level * 5; }
    damage(level: number) { return 0.5 + 0.5 * level; }
    describe(level: number) { return "Burn nearby enemies\n" + this.damage(level) + " dmg every 0.5s"; }
    apply(n: number) {
        if (!this.ring) {
            this.ring = sprites.create(image.create(2, 2), SpriteKind.Attach);
            this.ring.setFlag(SpriteFlag.Ghost, true);
            this.ring.z = 1;
        }
        this.ring.setImage(makeRing(this.radius(this.level), 5, 4));
    }
    update(dt: number) {
        this.ring.setPosition(hero.x, hero.y);
        this.timer += dt;
        if (this.timer < 500) return;
        this.timer = 0;
        const r = this.radius(this.level);
        const dmg = this.damage(this.level) * player.dmgMult;
        for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
            const ex = e.x - hero.x;
            const ey = e.y - hero.y;
            if (ex * ex + ey * ey < r * r) hurtEnemy(e, dmg);
        }
    }
}

class Lightning extends Buff {
    timer = 0;
    constructor() {
        super("lightning", "Lightning", 5, img`
            . . . . . 5 5 5 . .
            . . . . 5 5 5 . . .
            . . . 5 5 5 . . . .
            . . 5 5 5 . . . . .
            . 5 5 5 5 5 5 5 . .
            . . . . . 5 5 5 . .
            . . . . 5 5 5 . . .
            . . . 5 5 5 . . . .
            . . 5 5 . . . . . .
            . 5 . . . . . . . .
        `);
    }
    interval(level: number) { return 2600 - level * 300; }
    describe(level: number) { return "Smite " + level + " random foe" + (level > 1 ? "s" : "") + "\nevery " + (this.interval(level) / 1000) + "s"; }
    update(dt: number) {
        this.timer += dt;
        if (this.timer < this.interval(this.level)) return;
        this.timer = 0;
        const list = sprites.allOfKind(SpriteKind.Enemy).filter(e => Math.abs(e.x - hero.x) < SW * 0.53 && Math.abs(e.y - hero.y) < SH * 0.54);
        for (let i = 0; i < this.level && list.length > 0; i++) {
            const k = randint(0, list.length - 1);
            const e = list[k];
            list.removeAt(k);
            fx(BOLT_IMG, e.x, e.y - 26, 150);
            hurtEnemy(e, (5 + this.level * 3) * player.dmgMult);
        }
    }
}

class Power extends Buff {
    constructor() {
        super("power", "Power", 8, img`
            . . . . . . . . 1 1
            . . . . . . . 1 d 1
            . . . . . . 1 d 1 .
            . . . . . 1 d 1 . .
            . . . . 1 d 1 . . .
            . e . 1 d 1 . . . .
            . . e 1 1 . . . . .
            . . e e . . . . . .
            . e . . e . . . . .
            e . . . . . . . . .
        `);
    }
    describe(level: number) { return "+20% damage"; }
    apply(n: number) { player.dmgMult += 0.2 * n; }
}

class Haste extends Buff {
    constructor() {
        super("haste", "Haste", 8, img`
            . . . . . . . . . .
            . 9 . . . . 9 . . .
            . 9 9 . . . 9 9 . .
            . 9 9 9 . . 9 9 9 .
            . 9 9 9 9 . 9 9 9 9
            . 9 9 9 9 . 9 9 9 9
            . 9 9 9 . . 9 9 9 .
            . 9 9 . . . 9 9 . .
            . 9 . . . . 9 . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+15% fire rate"; }
    apply(n: number) { player.rateMult += 0.15 * n; }
}

class Multishot extends Buff {
    constructor() {
        super("multishot", "Multishot", 3, img`
            . . . . . . . . . 5
            . . . . . . . 5 5 .
            . . . . . 5 5 . . .
            . . . 5 5 . . . . .
            . 5 5 5 5 5 5 5 5 5
            . . . 5 5 . . . . .
            . . . . . 5 5 . . .
            . . . . . . . 5 5 .
            . . . . . . . . . 5
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+1 bullet per shot"; }
    apply(n: number) { player.multishot += n; }
}

class Vitality extends Buff {
    constructor() {
        super("vitality", "Vitality", 5, img`
            . . . . . . . . . .
            . 2 2 . . . 2 2 . .
            2 2 2 2 . 2 2 2 2 .
            2 2 1 2 2 2 2 2 2 .
            2 2 2 2 2 2 2 2 2 .
            . 2 2 2 2 2 2 2 . .
            . . 2 2 2 2 2 . . .
            . . . 2 2 2 . . . .
            . . . . 2 . . . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+2 max HP, heal 2"; }
    apply(n: number) {
        hero.maxHp += 2 * n;
        hero.heal(2 * n);
    }
}

class SwiftBoots extends Buff {
    constructor() {
        super("boots", "Swift Boots", 5, img`
            . . e e e e . . . .
            . . e e e e . . . .
            . . e e e e . . . .
            . . e e e e . . . .
            . . e e e e . . . .
            . . e e e e e . . .
            . . e e e e e e e .
            . . e e e e e e e .
            . . d d d d d d d .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+10% move speed"; }
    apply(n: number) {
        for (let i = 0; i < n; i++) hero.speed = Math.floor(hero.speed * 1.1);
        hero.enableMovement();
    }
}

class Magnet extends Buff {
    constructor() {
        super("magnet", "Magnet", 4, img`
            . . . . . . . . . .
            . 1 1 . . . . 1 1 .
            . 2 2 . . . . 2 2 .
            . 2 2 . . . . 2 2 .
            . 2 2 . . . . 2 2 .
            . 2 2 . . . . 2 2 .
            . 2 2 2 . . 2 2 2 .
            . . 2 2 2 2 2 2 . .
            . . . 2 2 2 2 . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+50% pickup range"; }
    apply(n: number) { for (let i = 0; i < n; i++) player.pickupRange *= 1.5; }
}

class Critical extends Buff {
    constructor() {
        super("crit", "Critical", 5, img`
            . . . . 2 . . . . .
            . . 2 2 2 2 2 . . .
            . 2 . . 2 . . 2 . .
            . 2 . . 2 . . 2 . .
            2 2 2 2 . 2 2 2 2 .
            . 2 . . 2 . . 2 . .
            . 2 . . 2 . . 2 . .
            . . 2 2 2 2 2 . . .
            . . . . 2 . . . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+8% crit chance"; }
    apply(n: number) { player.critChance += 8 * n; }
}

// Example of a buff with a nerf: stronger shots, but you get more fragile.
class GlassCannon extends Buff {
    constructor() {
        super("glass", "Glass Cannon", 3, img`
            . . . . 9 9 . . . .
            . . . 9 1 1 9 . . .
            . . 9 1 9 9 1 9 . .
            . . 9 9 9 9 9 9 . .
            . . 9 9 2 2 9 9 . .
            . . 9 9 2 2 9 9 . .
            . . 9 9 9 9 9 9 . .
            . . 9 1 9 9 1 9 . .
            . . . 9 9 9 9 . . .
            . . . . . . . . . .
        `);
    }
    describe(level: number) { return "+40% damage\n-1 max HP"; }
    apply(n: number) {
        player.dmgMult += 0.4 * n;
        hero.maxHp -= n; // never below 1
    }
}

// Offered when nothing else can be picked. Instant: heals and is gone, takes no slot.
class Feast extends Buff {
    constructor() {
        super("feast", "Feast", 1, null);
        this.instant = true;
    }
    describe(level: number) { return "Heal 50% HP"; }
    apply(n: number) { hero.heal(Math.ceil(hero.maxHp / 2)); }
}
