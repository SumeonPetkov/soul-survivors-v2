// The final floor (FINAL_FLOOR in Levels/LevelRoster.ts): one huge open arena,
// no walls or fog, and Bulut spawns in the middle shortly after you arrive.
class ArenaLevel extends Level {
    constructor(floor: number) {
        super("Arena", floor);
        // ---- world: a big wall-free oval
        this.widthRange = [48, 52];
        this.heightRange = [44, 48];
        this.shapes = [MapShape.Oval];
        this.shapeWeights = [1];
        this.layouts = [LevelLayout.Open];
        this.layoutWeights = [1];
        this.edgeRoughness = [0, 0];
        this.boulders = [0, 0];
        this.ruins = [0, 0];
        this.wallLines = [0, 0];
        this.clearings = [0, 0];
        this.symmetryChance = 0;
        this.clearRoomsToLeave = false;
        this.fogOfWar = false;
        this.minOpenFloor = 0;
        // look: dark stone floor, gold walls
        this.floorColor = 15;
        this.floorLineColor = 12;
        this.wallTopColor = 5;
        this.wallLineColor = 4;
        this.wallFaceColor = 14;
        // ---- enemies: none spawn on their own - Bulut summons them (Bosses/Bulut.ts)
        this.randomSpawns = false;
        this.swarmEvery = 0;
        this.miniBossAt = [];
        // ---- boss
        this.bossSpawnTime = 4000;
    }

    createBoss(): Boss {
        return new Bulut(this.floor);
    }
}
