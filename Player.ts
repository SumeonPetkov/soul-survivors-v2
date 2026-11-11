// Everything about the current run that isn't the hero sprite itself:
// XP/level, level-up buffs and chest items.
class Player {
    hero: HeroCharacter;

    xp: number;
    level: number;
    xpNeed: number;
    pendingLevels: number;

    /** Level-up buffs owned (max BUFF_SLOTS). Instant buffs like Feast are never stored. */
    buffs: Buff[];
    /** Chest items carried (max ITEM_SLOTS). */
    items: Item[];
    dmgMult: number;
    rateMult: number;
    multishot: number;
    critChance: number;
    /** Damage multiplier on a crit (2 = double damage). */
    critMult: number;
    /** XP gain multiplier (1 = normal). */
    xpMult: number;
    pickupRange: number;
    maxItemSlots: number;

    constructor(hero: HeroCharacter) {
        this.hero = hero;
        this.xp = 0;
        this.level = 1;
        this.xpNeed = 5;
        this.maxItemSlots = ITEM_SLOTS;
        this.pendingLevels = 0;
        this.buffs = [];
        this.items = [];
        this.dmgMult = 1;
        this.rateMult = 1;
        this.multishot = 0;
        this.critChance = 5;
        this.critMult = 2;
        this.xpMult = 1;
        this.pickupRange = 50;
    }

    /** Everything whose hooks run: carried items, then owned buffs. */
    perks(): Perk[] {
        const out: Perk[] = [];
        for (const it of this.items) out.push(it);
        for (const b of this.buffs) out.push(b);
        return out;
    }

    /** Level of the owned buff with this id (0 if not owned). */
    buffLevel(id: string): number {
        for (const b of this.buffs) if (b.id == id) return b.level;
        return 0;
    }

    /** Takes a buff picked on level up: new ones start at Lv1, owned ones level up. */
    takeBuff(b: Buff) {
        if (b.instant) {
            b.level = 1;
            b.apply(1);
            return;
        }
        if (this.buffs.indexOf(b) < 0) {
            this.buffs.push(b);
            b.level = 1;
        } else {
            if (b.level >= b.maxLevel) return;
            b.level++;
        }
        b.apply(1);
    }

    /** Adds a new item at level 1 (caller checks there's a free slot). */
    equipItem(it: Item) {
        this.items.push(it);
        it.level = 1;
        it.apply(1);
    }

    /** Raises a carried item one level. */
    upgradeItem(it: Item) {
        if (it.level >= it.maxLevel) return;
        it.level++;
        it.apply(1);
    }

    /** Swaps out the item in slot i (it's lost, all its levels removed) for a new level 1 item. */
    replaceItem(i: number, it: Item) {
        const old = this.items[i];
        old.apply(-old.level);
        old.level = 0;
        this.items[i] = it;
        it.level = 1;
        it.apply(1);
    }

    gainXp(v: number) {
        this.xp += v * this.xpMult;
        while (this.xp >= this.xpNeed) {
            this.xp -= this.xpNeed;
            this.level++;
            this.xpNeed = Math.floor(5 + this.level * 3.5 + this.level * this.level * 0.15);
            this.pendingLevels++;
        }
    }
}
