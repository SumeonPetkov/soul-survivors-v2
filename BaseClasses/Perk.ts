// Shared base for everything that levels up and hooks into the game:
// chest items (BaseClasses/Item.ts) and level-up buffs (BaseClasses/Buff.ts).
// Every hook below runs for both - main.ts calls them on player.perks().
//
// Buffs AND nerfs: apply(n) can change stats in either direction, e.g. +damage but -max HP.
// Describe both in describe(level), one per line: "+40% damage\n-1 max HP".

abstract class Perk {
    readonly id: string;
    readonly name: string;
    readonly maxLevel: number;
    readonly icon: Image;
    /** Current level (1 = just picked up, 0 = not owned). */
    level: number;

    constructor(id: string, name: string, maxLevel: number, icon: Image) {
        this.id = id;
        this.name = name;
        this.maxLevel = maxLevel;
        this.icon = icon;
        this.level = 0;
    }

    /**
     * What the perk does at `level` (shown in menus).
     * Several effects? Separate lines with "\n", e.g. "+1 Item Slot\n-20 Damage".
     */
    describe(level: number): string { return ""; }

    /**
     * Adds n levels of stat changes. Called with 1 when picked and on each level up
     * (this.level is already updated), and with -level when removed (items only).
     */
    apply(n: number): void { }
    /** Runs every frame while owned. */
    update(dt: number): void { }
    /** Runs when the hero kills an enemy at (x, y). */
    onKill(x: number, y: number): void { }
    /** Change damage the hero is about to take; return 0 to block it. */
    modifyDamageTaken(damage: number): number { return damage; }
    /** Change damage the hero deals to enemy `e` (every source: shots, aura, orbits...). */
    modifyDamageDealt(e: Sprite, damage: number): number { return damage; }
    /** A hero projectile `p` just hit enemy `e` (non-exploding shots only). */
    onProjectileHit(p: Sprite, e: Sprite): void { }
    /** The hero's auto-attack just fired at `target`. */
    onAttack(target: Sprite): void { }
    /** Called once upon entering a new floor. */
    onEachFloor(currentFloor: number): void { }
}
