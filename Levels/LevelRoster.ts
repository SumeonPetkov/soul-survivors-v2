// The order levels are played in. Entry 1 is floor 1, entry 2 is floor 2, ...
// Floors before FINAL_FLOOR loop through LEVEL_ORDER; each level (and its boss) gets the
// real floor number, so the second lap is harder. FINAL_FLOOR is always the arena with
// the final boss, and beating him wins the game.
// Every time a floor starts, a brand-new map is generated from the level's settings.

/** The last floor: the arena with Bulut. */
const FINAL_FLOOR = 10;

const LEVEL_ORDER: ((floor: number) => Level)[] = [
    (floor: number) => new DungeonLevel(floor),
    (floor: number) => new ForestLevel(floor),
    (floor: number) => new GlacierLevel(floor),
    (floor: number) => new VolcanoLevel(floor),
];

function levelForFloor(floor: number): Level {
    if (floor >= FINAL_FLOOR) return new ArenaLevel(floor);
    return LEVEL_ORDER[(floor - 1) % LEVEL_ORDER.length](floor);
}
