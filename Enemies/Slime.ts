// Small and quick. Only spawned when a Slime King splits.
class Slime extends EnemyType {
    constructor() {
        //    id       name      hp  speed dmg xp
        super(T_SLIME, "Slime", 2, 32, 1, 1,
            trimImage(getImage("slime")));
    }
}
