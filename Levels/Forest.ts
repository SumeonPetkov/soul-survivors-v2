class ForestLevel extends Level {
    constructor(floor: number) {
        super("Forest", floor);
        this.song = SONG_FOREST; // "Overgrown Halls" (Music.ts)
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
        // ---- enemies:       turtle bat gob ogre skel king wolf spore golem shard imp magma slime
        this.enemyWeights =  [25,   25, 15, 8,   0,   0,   18,  9,    0,    0,    0,  0, 0];
        this.enemyUnlockAt = [0,    0,  0,  10000, 0, 0, 0, 15000, 0, 0, 0, 0, 0];
        // ---- boss
        this.bossSpawnTime = 12000;
    }

    createBoss(): Boss {
        return new ForestFiend(this.floor);
    }
}
