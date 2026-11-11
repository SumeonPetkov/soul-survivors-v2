// A level-up buff: on each level up the hero picks 1 of 3 offered buffs.
// A new buff starts at level 1, one you have goes up a level. The hero can hold at most
// BUFF_SLOTS different buffs; once full, only the ones you have are offered. Buffs are
// never removed, so apply(n) is only ever called with n = 1.
//
// To make a new buff:
//   1. Add a class to Buffs/Buffs.ts: `class MyBuff extends Buff`
//   2. In its constructor call super(id, name, maxLevel, icon) - icon is a 10x10 image.
//   3. Stat changes (buffs and nerfs): override apply(n), it runs on pick and each level up.
//      Behaviour: override any hook from BaseClasses/Perk.ts and use this.level.
//   4. Override describe(level) - one line per effect, e.g. "+40% damage\n-1 max HP".
//   5. Add it to BUFF_POOL in Buffs/BuffRoster.ts.
//
// Instant buffs (like Feast) take effect once and don't use a slot: set
// `this.instant = true;` in the constructor.

/** Max different level-up buffs at once. */
const BUFF_SLOTS = 3;

abstract class Buff extends Perk {
    /** true = one-shot effect (apply(1) then gone), never takes a slot or shows a level. */
    instant = false;

    constructor(id: string, name: string, maxLevel: number, icon: Image) {
        super(id, name, maxLevel, icon);
    }
}
