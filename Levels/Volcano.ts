class VolcanoLevel extends Level {
    constructor(floor: number) {
        super("Volcano", floor);
        this.song = SONG_VOLCANO; // "Magma Forge" (Music.ts)
        // ---- world generation: rolled fresh every time the floor starts ----
        this.widthRange = [32, 38];
        this.heightRange = [32, 38];
        this.shapes = [MapShape.Diamond, MapShape.Rectangle, MapShape.Cross, MapShape.Blob];
        this.shapeWeights = [3, 3, 2, 2];
        this.edgeRoughness = [0, 15];
        this.roomSize = [6, 9];
        this.blockCount = [14, 20];
        this.caveDensity = [38, 43];
        this.ruins = [0, 2];
        this.boulders = [0, 3];
        this.symmetryChance = 35;
        // look
        this.floorColor = 14;
        this.floorLineColor = 15;
        this.wallTopColor = 4;
        this.wallLineColor = 15;
        this.wallFaceColor = 2;
        // ---- enemies:       slime bat gob ogre skel king wolf spore golem shard imp magma
        this.enemyWeights =  [18,   25, 15, 12,  0,   0,   0,   0,    0,    0,    15, 15];
        this.enemyUnlockAt = [0,    0,  0,  0,    0, 0, 0, 0, 0, 0, 0, 0];
        // ---- boss
        this.bossSpawnTime = 12000;
    }

    createBoss(): Boss {
        return new MagmaDemon(this.floor);
    }
}
