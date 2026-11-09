// Minimap in the top-right corner, always centered on the hero.
// The wall layout is drawn once per floor (buildMinimap); each frame only copies
// the visible window and draws dots for the hero, enemies, boss and portal.

/** Size of the minimap on screen, in pixels. */
const MINIMAP_SIZE = 64;
/** Pixels per map tile (2 = the minimap shows MINIMAP_SIZE / 2 tiles across). */
const MINIMAP_TILE = 2;
/** Colors (palette indexes). Walls use the current level's wall color. */
const MINIMAP_FLOOR = 15;
const MINIMAP_FRAME = 1;
const MINIMAP_HERO = 1;
const MINIMAP_ENEMY = 2;
const MINIMAP_BOSS = 10;
const MINIMAP_PORTAL = 5;
const MINIMAP_CHEST = 4;
/** With fog of war: unexplored areas and explored floor. */
const MINIMAP_UNKNOWN = 15;
const MINIMAP_FOG_FLOOR = 12;

let _minimapMap: Image = null;
let _minimapBox: Image = null;
let _minimapWall = 1;

/** Call after a new floor is generated. */
function buildMinimap() {
    const t = MINIMAP_TILE;
    _minimapWall = currentLevel.wallTopColor;
    _minimapMap = image.create(MAP_W * t, MAP_H * t);
    if (fogOn) {
        // fog: start blank, tiles are revealed as the hero sees them (minimapReveal)
        _minimapMap.fill(MINIMAP_UNKNOWN);
        if (!_minimapBox) _minimapBox = image.create(MINIMAP_SIZE, MINIMAP_SIZE);
        return;
    }
    _minimapMap.fill(MINIMAP_FLOOR);
    for (let r = 0; r < MAP_H; r++) {
        for (let c = 0; c < MAP_W; c++) {
            if (isWall(c, r)) _minimapMap.fillRect(c * t, r * t, t, t, _minimapWall);
        }
    }
    if (!_minimapBox) _minimapBox = image.create(MINIMAP_SIZE, MINIMAP_SIZE);
}

/** Fog: paints a newly seen tile onto the minimap. */
function minimapReveal(c: number, r: number) {
    if (!_minimapMap) return;
    const t = MINIMAP_TILE;
    _minimapMap.fillRect(c * t, r * t, t, t, isWall(c, r) ? _minimapWall : MINIMAP_FOG_FLOOR);
}

/** Draws the minimap onto the screen image `screen` with its top-left at (x0, y0). */
function drawMinimap(screen: Image, x0: number, y0: number) {
    if (!_minimapMap || !hero) return;
    const t = MINIMAP_TILE;
    const box = _minimapBox;
    const half = MINIMAP_SIZE / 2;
    // offset that puts the hero in the middle of the box
    const ox = Math.floor(half - hero.x / 16 * t);
    const oy = Math.floor(half - hero.y / 16 * t);

    box.fill(fogOn ? MINIMAP_UNKNOWN : _minimapWall); // anything outside the map reads as wall
    box.drawImage(_minimapMap, ox, oy);

    const blink = Math.floor(gameTime / 250) % 2 == 0;
    if (portal && blink && fogTileSeen(Math.floor(portal.x / 16), Math.floor(portal.y / 16))) _minimapDot(box, portal.x, portal.y, ox, oy, 4, MINIMAP_PORTAL);
    for (const ch of sprites.allOfKind(SpriteKind.Chest)) {
        if (fogTileSeen(Math.floor(ch.x / 16), Math.floor(ch.y / 16))) _minimapDot(box, ch.x, ch.y, ox, oy, 3, MINIMAP_CHEST);
    }
    for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
        if (boss && e == boss) continue;
        if (!fogVisibleAt(e.x, e.y)) continue;
        _minimapDot(box, e.x, e.y, ox, oy, 2, MINIMAP_ENEMY);
    }
    if (boss && fogVisibleAt(boss.x, boss.y)) _minimapDot(box, boss.x, boss.y, ox, oy, 4, blink ? MINIMAP_BOSS : MINIMAP_ENEMY);
    box.fillRect(half - 1, half - 1, 3, 3, MINIMAP_HERO);

    screen.drawRect(x0 - 1, y0 - 1, MINIMAP_SIZE + 2, MINIMAP_SIZE + 2, MINIMAP_FRAME);
    screen.drawImage(box, x0, y0);
}

function _minimapDot(box: Image, wx: number, wy: number, ox: number, oy: number, size: number, color: number) {
    const px = Math.floor(wx / 16 * MINIMAP_TILE) + ox - Math.idiv(size, 2);
    const py = Math.floor(wy / 16 * MINIMAP_TILE) + oy - Math.idiv(size, 2);
    if (px + size < 0 || py + size < 0 || px >= MINIMAP_SIZE || py >= MINIMAP_SIZE) return;
    box.fillRect(px, py, size, size, color);
}
