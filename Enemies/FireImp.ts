// Volcano: flying shooter with a 3-shot spread.
class FireImp extends ShooterEnemy {
    constructor() {
        //    id          name         hp  speed dmg xp
        super(T_FIRE_IMP, "Fire Imp", 4, 30, 1, 3,
            img`
            . . . f . . . . f . . .
            . . f 2 f . . f 2 f . .
            f . f 2 2 2 2 2 2 f . f
            2 f 2 5 f 2 2 f 5 2 f 2
            2 2 f 2 2 2 2 2 2 f 2 2
            . 2 f 4 2 2 2 2 4 f 2 .
            . . f 2 4 4 4 4 2 f . .
            . . . f 2 2 2 2 f . . .
            . . . f 2 f f 2 f . . .
            . . . . f . . f . . . .
            `);
        this.flying = true;
        this.keepAway = 70;
    }

    fire(e: Sprite, a: number): void {
        for (let k = -1; k <= 1; k++) enemyShoot(e, a + k * 0.3, 65);
    }
}
