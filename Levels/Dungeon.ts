class DungeonLevel extends Level {
    constructor(floor: number) {
        super("Dungeon", floor);
        this.song = SONG_DUNGEON; // "Crypt Crawl" (Music.ts)
        // ---- world generation: rolled fresh every time the floor starts ----
        // randomly generated rooms (WorldGen/RoomShapes.ts), joined by corridors
        this.layouts = [LevelLayout.RoomDungeon];
        this.layoutWeights = [1];
        this.roomSet = "dungeon";
        this.roomGridCols = [3, 4];
        this.roomGridRows = [3, 4];
        this.roomCellSize = 20;
        this.corridorWidth = [2, 2];
        this.extraConnections = [15, 30];
        this.emptyCellChance = [0, 10];
        // like a roguelike dungeon crawler: rooms lock until everything inside is dead
        this.clearRoomsToLeave = true;
        this.roomEnemies = [3, 6];
        this.roomEnemiesPerFloor = 1;
        this.roomWaves = [1, 2];
        this.minOpenFloor = 0; // room maps are mostly solid rock - never re-roll
        // can't see past walls; unexplored areas are black
        this.fogOfWar = true;
        this.fogRadius = 11;
        // look
        this.floorColor = 12;
        this.floorLineColor = 15;
        this.wallTopColor = 11;
        this.wallLineColor = 12;
        this.wallFaceColor = 14;
        // ---- enemies:       turtle bat gob ogre skel king wolf spore golem shard imp magma slime
        this.enemyWeights =  [25,   25, 15, 8,   20,  7,   0,   0,    0,    0,    0,  0, 0];
        this.enemyUnlockAt = [0,    0,  20000, 45000, 0, 30000, 0, 0, 0, 0, 0, 0, 0];
        // ---- boss
        this.bossSpawnTime = 12000;
    }

    createBoss(): Boss {
        return new CryptDemon(this.floor);
    }
}
