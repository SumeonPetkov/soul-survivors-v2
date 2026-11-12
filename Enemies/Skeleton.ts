// Dungeon: gets back up once after being killed.
class Skeleton extends EnemyType {
    constructor() {
        //    id          name         hp  speed dmg xp
        super(T_SKELETON, "Skeleton", 5, 24, 1, 1,
            img`
            . . . f f f f f f . . .
            . . f 1 1 1 1 1 1 f . .
            . f 1 f f 1 1 f f 1 f .
            . f 1 f 2 1 1 2 f 1 f .
            . . f 1 1 1 1 1 1 f . .
            . . f 1 f 1 1 f 1 f . .
            . . . f f f f f f . . .
            . . f 1 f 1 1 f 1 f . .
            . f 1 f 1 f f 1 f 1 f .
            . . f 1 f 1 1 f 1 f . .
            . . . f 1 f f 1 f . . .
            . . . f f . . f f . . .
            `);
        this.revives = true;
    }
}
