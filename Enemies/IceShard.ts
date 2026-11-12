// Glacier: fast and fragile; spawned by ice golems.
class IceShard extends EnemyType {
    constructor() {
        //    id           name          hp  speed dmg xp
        super(T_ICE_SHARD, "Ice Shard", 2, 44, 1, 1,
            img`
            . . . f f . . .
            . . f 9 9 f . .
            . f 9 1 1 9 f .
            f 9 1 9 9 1 9 f
            f 9 9 9 9 9 9 f
            . f 9 9 9 9 f .
            . . f 9 9 f . .
            . . . f f . . .
            `);
    }
}
