// Forest: every few seconds, charges straight at the hero.
class Wolf extends EnemyType {
    constructor() {
        //    id      name     hp  speed dmg xp
        super(T_WOLF, "Wolf", 6, 30, 1, 3,
            img`
            . f . . . . . . . . f .
            . f b f . . . . f b f .
            . f b b f f f f b b f .
            . f b b b b b b b b f .
            f b 1 f b b b b f 1 b f
            f b b b b b b b b b b f
            . f b b 1 f f 1 b b f .
            . . f b 1 1 1 1 b f . .
            . . f b b 2 2 b b f . .
            . f b b b b b b b b f .
            f b f b f b b f b f b f
            f f . f f . . f f . f f
            `);
    }

    think(e: Sprite, dx: number, dy: number, d: number, spd: number, stunned: boolean): void {
        if (!stunned) {
            if (getDN(e, "dash") > gameTime) return; // mid-charge: keep the charge velocity
            const cd = getDN(e, "cd") - 100;
            if (cd <= 0 && d < 110) {
                this.moveStraight(e, dx, dy, d, spd * 4);
                setDN(e, "dash", gameTime + 400);
                setDN(e, "cd", 2200);
                return;
            }
            setDN(e, "cd", cd);
        }
        this.chase(e, dx, dy, d, spd, stunned);
    }
}
