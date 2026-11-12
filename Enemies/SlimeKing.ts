// Dungeon: splits into 3 small slimes.
class SlimeKing extends EnemyType {
    constructor() {
        //    id            name           hp  speed dmg xp
        super(T_SLIME_KING, "Slime King", 16, 14, 2, 5,
            img`
            . . . 5 . . 5 . . 5 . . 5 . . .
            . . . 5 5 5 5 5 5 5 5 5 5 . . .
            . . . 5 4 5 5 4 4 5 5 4 5 . . .
            . . . . f f f f f f f f . . . .
            . . f f 7 7 7 7 7 7 7 7 f f . .
            . f 7 7 7 7 7 7 7 7 7 7 7 7 f .
            f 7 7 1 1 7 7 7 7 7 7 1 1 7 7 f
            f 7 7 1 f 7 7 7 7 7 7 f 1 7 7 f
            f 7 7 7 7 7 7 7 7 7 7 7 7 7 7 f
            f 7 7 7 7 7 7 7 7 7 7 7 7 7 7 f
            f 6 7 7 7 7 f f f f 7 7 7 7 6 f
            f 6 6 7 7 7 7 7 7 7 7 7 7 6 6 f
            . f 6 6 6 6 6 6 6 6 6 6 6 6 f .
            . . f f f f f f f f f f f f . .
            `);
        this.splitInto = T_SLIME;
        this.splitCount = 3;
    }
}
