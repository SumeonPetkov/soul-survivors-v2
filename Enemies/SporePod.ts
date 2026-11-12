// Forest: bursts into spores (a ring of shots) when killed.
class SporePod extends EnemyType {
    constructor() {
        //    id           name          hp  speed dmg xp
        super(T_SPORE_POD, "Spore Pod", 6, 10, 1, 2,
            img`
            . . . f f f f f f . . .
            . f f 2 2 2 2 2 2 f f .
            f 2 2 1 2 2 2 2 1 2 2 f
            f 2 1 1 2 2 2 2 1 1 2 f
            f 2 2 2 2 1 1 2 2 2 2 f
            . f f f f f f f f f f .
            . . . f d d d d f . . .
            . . f d f d d f d f . .
            . . f d d d d d d f . .
            . . f d d d d d d f . .
            . . f d d d d d d f . .
            . . . f f f f f f . . .
            `);
        this.deathShots = 6;
    }
}
