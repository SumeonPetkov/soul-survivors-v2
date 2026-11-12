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
        // ---- enemies: addEnemy(type, weight = how common, unlockAt = ms into the floor)
        this.addEnemy(T_TURTLE, 18);
        this.addEnemy(T_BAT, 25);
        this.addEnemy(T_GOBLIN, 15);
        this.addEnemy(T_OGRE, 12);
        this.addEnemy(T_FIRE_IMP, 15);
        this.addEnemy(T_MAGMA_SLIME, 15);
        // ---- boss
        this.bossSpawnTime = 12000;
    }

    createBoss(): Boss {
        return new MagmaDemon(this.floor);
    }
}
