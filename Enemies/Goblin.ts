// Pistol shooter: keeps its distance and fires single shots.
class Goblin extends ShooterEnemy {
    constructor() {
        //    id        name       hp  speed dmg xp
        super(T_GOBLIN, "Goblin", 6, 20, 1, 2,
            trimImage(getImage("goblin")));
        this.keepAway = 55;
    }
}
