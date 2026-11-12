// Big, slow bruiser. Default miniboss. Drops hearts and coins more often.
class Ogre extends EnemyType {
    constructor() {
        //    id      name     hp  speed dmg xp
        super(T_OGRE, "Ogre", 14, 16, 2, 5,
            getImage("ogre"));
        this.healthDropChance = 6;
        this.coinDropChance = COIN_DROP_CHANCE_OGRE;
    }
}
