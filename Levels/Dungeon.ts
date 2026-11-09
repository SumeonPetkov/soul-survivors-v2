class DungeonLevel extends Level {
    constructor(floor: number) {
        super("Dungeon", floor);
        // ---- world generation: rolled fresh every time the floor starts ----
        // hand-drawn rooms from Rooms/DungeonRooms.ts, joined by corridors
        this.layouts = [LevelLayout.RoomDungeon];
        this.layoutWeights = [1];
        this.roomSet = "dungeon";
        this.roomGridCols = [3, 4];
        this.roomGridRows = [3, 4];
        this.roomCellSize = 16;
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
        // ---- enemies:       slime bat goblin ogre
        this.enemyWeights =  [32,   38, 20,    10];
        this.enemyUnlockAt = [0,    0,  20000, 45000];
        // ---- boss
        this.bossSpawnTime = 12000;
    }

    createBoss(): Boss {
        return new CryptDemon(this.floor);
    }
}
