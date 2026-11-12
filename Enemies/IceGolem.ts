// Glacier: shatters into 2 ice shards.
class IceGolem extends EnemyType {
    constructor() {
        //    id           name          hp  speed dmg xp
        super(T_ICE_GOLEM, "Ice Golem", 20, 12, 2, 5,
            img`
            . . . f f f f f f f f . . .
            . . f 9 9 9 9 9 9 9 9 f . .
            . f 9 1 9 9 9 9 9 9 1 9 f .
            . f 9 f f 9 9 9 9 f f 9 f .
            . f 9 9 9 9 9 9 9 9 9 9 f .
            f f f 9 9 9 9 9 9 9 9 f f f
            f 9 9 f 9 9 1 1 9 9 f 9 9 f
            f 9 1 f 9 9 9 9 9 9 f 1 9 f
            f 9 9 f 9 9 9 9 9 9 f 9 9 f
            . f f f 9 9 9 9 9 9 f f f .
            . . f 9 9 f f f f 9 9 f . .
            . . f 9 9 f . . f 9 9 f . .
            . f 9 9 9 f . . f 9 9 9 f .
            . f f f f f . . f f f f f .
            `);
        this.splitInto = T_ICE_SHARD;
        this.splitCount = 2;
    }
}
