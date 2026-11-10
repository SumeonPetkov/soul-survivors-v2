class ForestLevel extends Level {
    constructor(floor: number) {
        super("Forest", floor);
        // ---- world generation: rolled fresh every time the floor starts ----
        this.widthRange = [34, 40];
        this.heightRange = [34, 40];
        this.shapes = [MapShape.Blob, MapShape.Oval, MapShape.Rectangle];
        this.shapeWeights = [5, 3, 2];
        this.edgeRoughness = [10, 25];
        this.pillarSpacing = [3, 4];
        this.pillarChance = [40, 65];
        this.blockCount = [10, 14];
        this.boulders = [2, 6];
        this.wallLines = [0, 1];
        this.clearings = [0, 2];
        this.decorChance = [14, 22];
        // look
        this.floorColor = 7;
        this.floorLineColor = 6;
        this.wallTopColor = 6;
        this.wallLineColor = 7;
        this.wallFaceColor = 14;
        // ---- enemies:       slime bat goblin ogre
        this.enemyWeights =  [32,   38, 20,    10];
        this.enemyUnlockAt = [0,    0,  0,     10000];
        // ---- boss
        this.bossSpawnTime = 12000;
    }

    createBoss(): Boss {
        return new ForestFiend(this.floor);
    }
}
