// Slow and tanky. Common everywhere.
class Turtle extends EnemyType {
    constructor() {
        //    id        name       hp  speed dmg xp
        super(T_TURTLE, "Turtle", 8, 16, 1, 2,
            trimImage(getImage("turtle")));
    }
}
