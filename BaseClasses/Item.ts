// An item found in a chest (dropped by bosses and minibosses).
// A chest offers 3 items: a new one is equipped at level 1, one you already carry goes up
// a level. Items at maxLevel no longer show up in chests. The hero carries at most
// ITEM_SLOTS items; taking a new one when full means swapping one out (it's lost).
//
// To make a new item:
//   1. Add a class to Items/Items.ts: `class MyItem extends Item`
//   2. In its constructor call super(id, name, maxLevel, icon) - icon is a 10x10 image.
//   3. Stat bonuses: override apply(n) to add n levels' worth (n is negative when removed).
//      Behaviour: override update / onKill / modifyDamageTaken and use this.level.
//   4. Override describe(level) to say what that level does.
//   5. Add it to ITEM_POOL in Items/ItemRoster.ts.

/** Max items carried at once. */
const ITEM_SLOTS = 3;
/** Max different level-up buffs at once. */
const BUFF_SLOTS = 3;

abstract class Item {
    readonly id: string;
    readonly name: string;
    readonly maxLevel: number;
    readonly icon: Image;
    /** Current level (1 = just picked up). */
    level: number;

    constructor(id: string, name: string, maxLevel: number, icon: Image) {
        this.id = id;
        this.name = name;
        this.maxLevel = maxLevel;
        this.icon = icon;
        this.level = 0;
    }

    /** What the item does at `level` (shown in chests). */
    describe(level: number): string { return ""; }

    /** Adds n levels of stat bonuses (n < 0 removes them, e.g. when swapped out). */
    apply(n: number): void { }
    /** Runs every frame while carried. */
    update(dt: number): void { }
    /** Runs when the hero kills an enemy at (x, y). */
    onKill(x: number, y: number): void { }
    /** Change damage the hero is about to take; return 0 to block it. */
    modifyDamageTaken(damage: number): number { return damage; }
}
