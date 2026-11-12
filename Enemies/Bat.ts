// Fast, fragile, flies over walls.
class Bat extends EnemyType {
    constructor() {
        //    id     name    hp  speed dmg xp
        super(T_BAT, "Bat", 2, 46, 1, 1,
            getImage("bat"));
        this.flying = true;
    }
}
