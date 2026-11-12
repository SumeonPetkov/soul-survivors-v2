// Volcano: bursts into fire shots when killed.
class MagmaSlime extends EnemyType {
    constructor() {
        //    id             name            hp  speed dmg xp
        super(T_MAGMA_SLIME, "Magma Slime", 6, 22, 1, 2,
            img`
            . . . . f f f f . . . .
            . . f f 2 4 4 2 f f . .
            . f 2 4 4 5 5 4 4 2 f .
            f 2 4 f 4 4 4 4 f 4 2 f
            f 2 4 f 4 5 5 4 f 4 2 f
            f 2 4 4 4 4 4 4 4 4 2 f
            f 2 2 4 5 4 4 5 4 2 2 f
            f e 2 2 4 4 4 4 2 2 e f
            . f e e 2 2 2 2 e e f .
            . . f f f f f f f f . .
            `);
        this.deathShots = 4;
    }
}
