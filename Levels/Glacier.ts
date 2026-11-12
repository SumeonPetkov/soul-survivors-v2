class GlacierLevel extends Level {
    constructor(floor: number) {
        super("Glacier", floor);
        // ---- world generation: rolled fresh every time the floor starts ----
        this.widthRange = [34, 40];
        this.heightRange = [34, 40];
        this.shapes = [MapShape.Oval, MapShape.Blob, MapShape.Rectangle];
        this.shapeWeights = [4, 4, 2];
        this.edgeRoughness = [5, 20];
        this.caveDensity = [38, 45];
        this.boulders = [1, 5];
        this.ruins = [0, 0];
        this.wallLines = [0, 0];
        this.clearings = [1, 3];
        this.safeRadius = 5;
        this.decorChance = [4, 8];
        // look
        this.floorColor = 9;
        this.floorLineColor = 1;
        this.wallTopColor = 1;
        this.wallLineColor = 9;
        this.wallFaceColor = 8;
        // ---- enemies: addEnemy(type, weight = how common, unlockAt = ms into the floor)
        this.addEnemy(T_TURTLE, 22);
        this.addEnemy(T_BAT, 25);
        this.addEnemy(T_GOBLIN, 15);
        this.addEnemy(T_OGRE, 8);
        this.addEnemy(T_ICE_GOLEM, 14, 10000);
        this.addEnemy(T_ICE_SHARD, 6);
        // ---- boss
        this.bossSpawnTime = 12000;
    }

    createBoss(): Boss {
        return new FrostDemon(this.floor);
    }
}
