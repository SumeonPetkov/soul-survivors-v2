// Everything about the current run that isn't the hero sprite itself:
// XP/level, level-up buffs and chest items.
class Player {
    hero: HeroCharacter;

    xp: number;
    level: number;
    xpNeed: number;
    pendingLevels: number;

    /** upgrades[id] = how many times upgrade `id` (see U_NAME) was picked. */
    upgrades: number[];
    /** Chest items carried (max ITEM_SLOTS). */
    items: Item[];
    dmgMult: number;
    rateMult: number;
    multishot: number;
    critChance: number;
    pickupRange: number;

    constructor(hero: HeroCharacter) {
        this.hero = hero;
        this.xp = 0;
        this.level = 1;
        this.xpNeed = 5;
        this.pendingLevels = 0;
        this.upgrades = [];
        for (let i = 0; i < U_NAME.length; i++) this.upgrades.push(0);
        this.items = [];
        this.dmgMult = 1;
        this.rateMult = 1;
        this.multishot = 0;
        this.critChance = 5;
        this.pickupRange = 50;
    }

    /** Level-up buffs owned (upgrade ids with at least one level). Feast doesn't count. */
    buffIds(): number[] {
        const out: number[] = [];
        for (let i = 0; i < U_NAME.length - 1; i++) if (this.upgrades[i] > 0) out.push(i);
        return out;
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
        this.xp += v;
        while (this.xp >= this.xpNeed) {
            this.xp -= this.xpNeed;
            this.level++;
            this.xpNeed = Math.floor(5 + this.level * 3.5 + this.level * this.level * 0.15);
            this.pendingLevels++;
        }
    }
}
