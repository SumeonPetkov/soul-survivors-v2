// The order levels are played in. Entry 1 is floor 1, entry 2 is floor 2, ...
// After the last entry it loops back to the start; each level (and its boss)
// gets the real floor number, so the second lap is harder.
// Every time a floor starts, a brand-new map is generated from the level's settings.

const LEVEL_ORDER: ((floor: number) => Level)[] = [
    (floor: number) => new DungeonLevel(floor),
    (floor: number) => new ForestLevel(floor),
    (floor: number) => new GlacierLevel(floor),
    (floor: number) => new VolcanoLevel(floor),
];

function levelForFloor(floor: number): Level {
    return LEVEL_ORDER[(floor - 1) % LEVEL_ORDER.length](floor);
}
