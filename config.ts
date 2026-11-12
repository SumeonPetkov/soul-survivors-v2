// Screen resolution in pixels (MakeCode Arcade default is 160 x 120).
// Bigger = more of the map visible at once; sprites stay the same pixel size.
// 320 x 240 is the usual maximum. Physical handheld devices may run slower above the default.
// Dev tools: B opens the dev menu (give items, skip floors, spawn the boss...).
// The deploy and PR workflows set this to false, so released builds never have it.
const DEV_MODE = true
// Floor a run starts on while DEV_MODE is on (released builds always start on floor 1).
// e.g. 10 = straight to the final arena to test the boss.
const DEV_START_FLOOR = 1

namespace userconfig {
    export const ARCADE_SCREEN_WIDTH = 320
    export const ARCADE_SCREEN_HEIGHT = 240
}
