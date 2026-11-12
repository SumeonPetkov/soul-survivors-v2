// An item found in a chest (dropped by bosses and minibosses).
// A chest offers 3 items: a new one is equipped at level 1, one you already carry goes up
// a level. Items at maxLevel no longer show up in chests. The hero carries at most
// ITEM_SLOTS items; taking a new one when full means swapping one out (it's lost).
//
// To make a new item:
//   1. Add a class to Items/Items.ts: `class MyItem extends Item`
//   2. In its constructor call super(id, name, maxLevel, icon) - icon is a 10x10 image.
//   3. Stat bonuses: override apply(n) to add n levels' worth (n is negative when removed).
//      Behaviour: override any hook from BaseClasses/Perk.ts and use this.level.
//   4. Override describe(level) to say what that level does.
//   5. Add it to ITEM_POOL in Items/ItemRoster.ts.

/** Max items carried at once. */
const ITEM_SLOTS = 3;

abstract class Item extends Perk {
    /**
     * true = once picked up it can never be swapped out (e.g. cursed items).
     * Set it in the subclass constructor, after super(): `this.undroppable = true;`
     * (MakeCode doesn't allow redeclaring the field in the subclass.)
     */
    undroppable = false;

    constructor(id: string, name: string, maxLevel: number, icon: Image) {
        super(id, name, maxLevel, icon);
    }
}
