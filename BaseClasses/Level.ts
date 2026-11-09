// The outline of the playable area.
enum MapShape {
    Rectangle,
    Oval,
    Diamond,
    /** A plus sign with random arm widths. */
    Cross,
    /** Irregular island made of overlapping circles. */
    Blob
}

// How walls are laid out inside the shape.
enum LevelLayout {
    /** No walls - only the extras (boulders, ruins...). */
    Open,
    /** Random rectangular blocks. */
    Blocks,
    /** A loose grid of pillars. */
    Pillars,
    /** Rooms split by walls with doorways. */
    Rooms,
    /** Organic cave walls. */
    Caves,
    /**
     * Hand-drawn rooms (Rooms/*.ts) placed on a grid and joined by corridors.
     * Ignores shape, the other layout settings and extras - see the "room dungeon" settings.
     */
    RoomDungeon
}

// Base for every level. Nothing about the map is fixed: every time the floor starts,
// build() rolls a new map from the settings below. Settings written as [min, max]
// are rolled each time; shapes/layouts are picked using their weights.
//
// To make a new level:
//   1. Create Levels/MyLevel.ts: `class MyLevel extends Level`
//   2. In its constructor call super(name, floor) and change any settings below.
//   3. Implement createBoss(), add it to LEVEL_ORDER in Levels/LevelRoster.ts, list the file in pxt.json.
// For full control override generateWalls(), or decorate() to add to the generated map.
abstract class Level {
    readonly name: string;
    /** Which floor number this level is being played as (1, 2, ...). Use it to scale difficulty. */
    readonly floor: number;

    // ================= WORLD GENERATION SETTINGS =================

    /** 0 = different map every time; any other number = always the same map (for testing). */
    seed = 0;

    // ---------- size (tiles, 16px each) ----------
    widthRange = [32, 38];
    heightRange = [32, 38];

    // ---------- shape ----------
    shapes: MapShape[] = [MapShape.Rectangle];
    shapeWeights = [1];
    /** % chance per edge tile to crumble inward (2 passes) - makes outlines ragged. */
    edgeRoughness = [0, 10];

    // ---------- layout ----------
    layouts: LevelLayout[] = [LevelLayout.Blocks];
    layoutWeights = [1];
    /** Blocks: how many, plus blocksPerFloor for each floor number; size of each side. */
    blockCount = [12, 18];
    blocksPerFloor = 2;
    blockSize = [1, 3];
    /** Pillars: tiles between pillars and % of grid spots that get one. */
    pillarSpacing = [3, 5];
    pillarChance = [45, 70];
    /** Caves: % of tiles that start as wall before smoothing (40-48 works well). */
    caveDensity = [40, 46];
    /** Rooms: room size in tiles. */
    roomSize = [7, 10];

    // ---------- room dungeon (LevelLayout.RoomDungeon) ----------
    /** Which hand-drawn rooms to use (the set name given to defineRoom). */
    roomSet = "dungeon";
    /** Grid of rooms: how many across and down. Not scaled by screen size. */
    roomGridCols = [3, 4];
    roomGridRows = [3, 4];
    /** Tiles per grid cell. Rooms can be up to (roomCellSize - 4) on each side. */
    roomCellSize = 16;
    /** Corridor width in tiles. */
    corridorWidth = [2, 2];
    /** % chance for each pair of neighbouring rooms not already joined to get an extra corridor (loops). */
    extraConnections = [15, 30];
    /** % chance a cell has no room, only a corridor junction. */
    emptyCellChance = [0, 10];

    // ---------- room clearing (RoomDungeon only) ----------
    /** true = entering a room locks its doors until every enemy inside is dead; the boss waits in the deepest room. */
    clearRoomsToLeave = false;
    /** Enemies per wave in a room, plus roomEnemiesPerFloor for each floor after the first. */
    roomEnemies = [3, 6];
    roomEnemiesPerFloor = 1;
    /** Waves per room (the next wave comes when the previous one is dead). */
    roomWaves = [1, 1];

    // ---------- fog of war ----------
    /** true = you only see what's in line of sight; unexplored areas are black. */
    fogOfWar = false;
    /** How far the hero can see, in tiles. */
    fogRadius = 11;

    // ---------- extras (added on top of any layout) ----------
    boulders = [0, 3];
    ruins = [0, 1];
    wallLines = [0, 2];
    /** Round open areas carved out of whatever is there. */
    clearings = [0, 0];

    // ---------- symmetry ----------
    /** % chance the map is mirrored (left/right, top/bottom, or both). */
    symmetryChance = 0;

    // ---------- start area / look ----------
    /** Tiles around the start that are always kept clear. */
    safeRadius = 4;
    /** If less than this % of the map ends up walkable, the map is re-rolled (up to 6 tries). */
    minOpenFloor = 35;
    /**
     * Sizes and counts above are tuned for the default 160x120 screen. When true, map size
     * is multiplied by (screen width / 160) and obstacle/extra counts by that squared,
     * so a bigger screen gets a proportionally bigger map with the same wall density.
     */
    scaleWithScreen = true;
    /** % of floor tiles with the cracked decoration. */
    decorChance = [8, 12];
    floorColor = 12;
    floorLineColor = 15;
    wallTopColor = 11;
    wallLineColor = 12;
    wallFaceColor = 14;

    // ================= ENEMIES (0 slime, 1 bat, 2 goblin shooter, 3 ogre) =================
    enemyWeights = [32, 38, 20, 10];
    /** ms into the floor before each type starts appearing. */
    enemyUnlockAt = [0, 0, 20000, 45000];
    firstSpawnDelay = 1500;
    /** ms between spawn waves at the start; it shrinks over time and per floor. */
    spawnInterval = 1000;
    minSpawnInterval = 220;
    extraPerWave = 0;
    /** Swarm: a ring of enemies around the hero every swarmEvery ms (0 = off). */
    swarmEvery = 25000;
    swarmEnemy = 1;
    swarmSize = 14;

    // ================= MINIBOSSES (drop a chest with an item) =================
    /** Enemy type used for minibosses (0 slime, 1 bat, 2 goblin, 3 ogre). */
    miniBossEnemy = 3;
    miniBossHpMult = 8;
    /** Size multiplier of the sprite. */
    miniBossScale = 1.5;
    /** Timed levels: ms into the floor when each miniboss appears (keep these before bossSpawnTime). */
    miniBossAt = [6000];
    /** Room-clearing levels: how many rooms hold a miniboss. */
    miniBossRooms = [1, 2];

    // ================= BOSS =================
    /** ms into the floor before the boss appears. */
    bossSpawnTime = 12000;

    // ================= results of the last build (read-only) =================
    width = 34;
    height = 34;
    chosenShape = MapShape.Rectangle;
    chosenLayout = LevelLayout.Blocks;
    usedSeed = 0;

    constructor(name: string, floor: number) {
        this.name = name;
        this.floor = floor;
    }

    /** The boss for this level. Required - override in every level. */
    createBoss(): Boss {
        throw "createBoss() not implemented in " + this.name;
    }

    /** Runs once after the map is built and the hero is placed. */
    onStart(): void { }

    /** Runs every frame while the floor is being played. */
    update(dt: number): void { }

    /** Optional: add to the map after it's generated, before cleanup. */
    decorate(ctx: GenContext): void { }

    /** RoomDungeon results: the placed rooms, the start room and boss room (indexes into rooms, -1 = none). */
    rooms: PlacedRoom[] = [];
    startRoom = -1;
    bossRoom = -1;
    /** The tile images of the loaded map (see makeTileImages). */
    tileImages: Image[] = [];

    /** Start tile chosen by the generator (-1 = map center). */
    startC = -1;
    startR = -1;
    get startCol(): number { return this.startC >= 0 ? this.startC : Math.floor(this.width / 2); }
    get startRow(): number { return this.startR >= 0 ? this.startR : Math.floor(this.height / 2); }

    // =====================================================================
    // Generation
    // =====================================================================

    /** Rolls and loads a brand-new map. Called every time the floor starts. */
    build() {
        this.usedSeed = this.seed != 0 ? this.seed : randint(1, 2147483646);
        const rng = new GenRandom(this.usedSeed);
        let ctx: GenContext = null;
        for (let attempt = 0; attempt < 6; attempt++) {
            ctx = this.generate(rng);
            if (this.openPercent(ctx) >= this.minOpenFloor) break;
        }

        MAP_W = ctx.width;
        MAP_H = ctx.height;
        walls = ctx.walls;
        this.loadTilemap(ctx);
    }

    /** One full generation pass with a fresh roll of every setting. */
    protected generate(rng: GenRandom): GenContext {
        this.startC = -1;
        this.startR = -1;
        this.rooms = [];
        this.startRoom = -1;
        this.bossRoom = -1;
        this.chosenLayout = this.layouts[Math.max(0, rng.weighted(this.layoutWeights))];
        if (this.chosenLayout == LevelLayout.RoomDungeon) {
            const rc = generateRoomDungeon(this, rng); // also sets startC/startR
            this.width = rc.width;
            this.height = rc.height;
            this.decorate(rc);
            this.fillUnreachable(rc);
            return rc;
        }

        const k = this.mapScale;
        this.width = Math.round(this.roll(rng, this.widthRange) * k);
        this.height = Math.round(this.roll(rng, this.heightRange) * k);
        const ctx = new GenContext(this.width, this.height, rng);
        this.chosenShape = this.shapes[Math.max(0, rng.weighted(this.shapeWeights))];

        this.cutShape(ctx);
        this.roughenEdges(ctx);
        this.generateWalls(ctx);
        this.addExtras(ctx);
        if (rng.chance(this.symmetryChance)) this.mirror(ctx, rng.int(0, 2));
        this.decorate(ctx);
        this.clearSafeZone(ctx);
        this.fillUnreachable(ctx);
        return ctx;
    }

    protected openPercent(ctx: GenContext): number {
        let open = 0;
        for (const w of ctx.walls) if (!w) open++;
        return open * 100 / ctx.walls.length;
    }

    /** Map size multiplier from the screen size (1 at 160x120, 2 at 320x240). */
    get mapScale(): number {
        return this.scaleWithScreen ? Math.max(1, scene.screenWidth() / 160) : 1;
    }

    /** Rolls a count and scales it by map area. */
    protected rollCount(rng: GenRandom, range: number[]): number {
        const k = this.mapScale;
        return Math.round(this.roll(rng, range) * k * k);
    }

    protected roll(rng: GenRandom, range: number[]): number {
        return rng.int(range[0], range[range.length - 1]);
    }

    /** A random tile inside the shape, as [c, r]. */
    protected randomTile(ctx: GenContext): number[] {
        for (let t = 0; t < 60; t++) {
            const c = ctx.rng.int(1, ctx.width - 2);
            const r = ctx.rng.int(1, ctx.height - 2);
            if (ctx.inShape(c, r)) return [c, r];
        }
        return [this.startCol, this.startRow];
    }

    // ---------- shape ----------

    protected cutShape(ctx: GenContext) {
        const w = ctx.width;
        const h = ctx.height;
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const rx = cx - 1;
        const ry = cy - 1;
        const s = this.chosenShape;
        if (s == MapShape.Rectangle) return;

        let armX = 0;
        let armY = 0;
        const bx: number[] = [];
        const by: number[] = [];
        const br: number[] = [];
        if (s == MapShape.Cross) {
            armX = rx * ctx.rng.int(35, 60) / 100;
            armY = ry * ctx.rng.int(35, 60) / 100;
        } else if (s == MapShape.Blob) {
            const m = Math.min(rx, ry);
            bx.push(cx);
            by.push(cy);
            br.push(m * 0.6);
            const n = ctx.rng.int(4, 7);
            for (let k = 0; k < n; k++) {
                const a = ctx.rng.next() * Math.PI * 2;
                const d = m * ctx.rng.int(30, 60) / 100;
                bx.push(cx + Math.cos(a) * d);
                by.push(cy + Math.sin(a) * d);
                br.push(m * ctx.rng.int(35, 55) / 100);
            }
        }

        for (let r = 1; r < h - 1; r++) {
            for (let c = 1; c < w - 1; c++) {
                const dx = c - cx;
                const dy = r - cy;
                let keep = true;
                if (s == MapShape.Oval) keep = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
                else if (s == MapShape.Diamond) keep = Math.abs(dx) / rx + Math.abs(dy) / ry <= 1.05;
                else if (s == MapShape.Cross) keep = Math.abs(dx) <= armX || Math.abs(dy) <= armY;
                else if (s == MapShape.Blob) {
                    keep = false;
                    for (let k = 0; k < bx.length; k++) {
                        const ex = c - bx[k];
                        const ey = r - by[k];
                        if (ex * ex + ey * ey <= br[k] * br[k]) {
                            keep = true;
                            break;
                        }
                    }
                }
                if (!keep) ctx.removeFromShape(c, r);
            }
        }
    }

    protected roughenEdges(ctx: GenContext) {
        const pct = this.roll(ctx.rng, this.edgeRoughness);
        if (pct <= 0) return;
        for (let pass = 0; pass < 2; pass++) {
            const crumble: number[] = [];
            for (let r = 1; r < ctx.height - 1; r++) {
                for (let c = 1; c < ctx.width - 1; c++) {
                    if (!ctx.inShape(c, r)) continue;
                    const onEdge = !ctx.inShape(c - 1, r) || !ctx.inShape(c + 1, r) || !ctx.inShape(c, r - 1) || !ctx.inShape(c, r + 1);
                    if (onEdge && ctx.rng.chance(pct)) crumble.push(r * ctx.width + c);
                }
            }
            for (const i of crumble) ctx.removeFromShape(i % ctx.width, Math.idiv(i, ctx.width));
        }
    }

    // ---------- layout ----------

    /** Fills the inside of the shape according to the chosen layout. Override for a custom generator. */
    protected generateWalls(ctx: GenContext) {
        const l = this.chosenLayout;
        if (l == LevelLayout.Blocks) this.genBlocks(ctx);
        else if (l == LevelLayout.Pillars) this.genPillars(ctx);
        else if (l == LevelLayout.Rooms) this.genRooms(ctx);
        else if (l == LevelLayout.Caves) this.genCaves(ctx);
    }

    protected genBlocks(ctx: GenContext) {
        const n = this.rollCount(ctx.rng, this.blockCount) + Math.round(this.floor * this.blocksPerFloor * this.mapScale * this.mapScale);
        for (let k = 0; k < n; k++) {
            const t = this.randomTile(ctx);
            ctx.fillRect(t[0], t[1], this.roll(ctx.rng, this.blockSize), this.roll(ctx.rng, this.blockSize), true);
        }
    }

    protected genPillars(ctx: GenContext) {
        const s = Math.max(2, this.roll(ctx.rng, this.pillarSpacing));
        const chance = this.roll(ctx.rng, this.pillarChance);
        const offC = ctx.rng.int(0, s - 1);
        const offR = ctx.rng.int(0, s - 1);
        for (let r = 2 + offR; r < ctx.height - 2; r += s) {
            for (let c = 2 + offC; c < ctx.width - 2; c += s) {
                if (!ctx.rng.chance(chance)) continue;
                const pc = c + ctx.rng.int(0, 1);
                const pr = r + ctx.rng.int(0, 1);
                if (ctx.rng.chance(30)) ctx.fillRect(pc, pr, 2, 2, true);
                else ctx.setWall(pc, pr, true);
            }
        }
    }

    protected genRooms(ctx: GenContext) {
        const s = Math.max(5, this.roll(ctx.rng, this.roomSize));
        const cols: number[] = [0];
        for (let c = s + ctx.rng.int(-2, 2); c < ctx.width - 4; c += s + ctx.rng.int(-1, 1)) cols.push(c);
        cols.push(ctx.width - 1);
        const rows: number[] = [0];
        for (let r = s + ctx.rng.int(-2, 2); r < ctx.height - 4; r += s + ctx.rng.int(-1, 1)) rows.push(r);
        rows.push(ctx.height - 1);
        for (let i = 1; i < cols.length - 1; i++) ctx.line(cols[i], 1, cols[i], ctx.height - 2, true);
        for (let j = 1; j < rows.length - 1; j++) ctx.line(1, rows[j], ctx.width - 2, rows[j], true);
        // a 2-tile doorway in every wall segment between two rooms
        for (let i = 1; i < cols.length - 1; i++) {
            for (let j = 0; j < rows.length - 1; j++) {
                const lo = rows[j] + 1;
                const hi = rows[j + 1] - 2;
                if (hi < lo) continue;
                const d = ctx.rng.int(lo, hi);
                ctx.setWall(cols[i], d, false);
                ctx.setWall(cols[i], d + 1, false);
            }
        }
        for (let j = 1; j < rows.length - 1; j++) {
            for (let i = 0; i < cols.length - 1; i++) {
                const lo = cols[i] + 1;
                const hi = cols[i + 1] - 2;
                if (hi < lo) continue;
                const d = ctx.rng.int(lo, hi);
                ctx.setWall(d, rows[j], false);
                ctx.setWall(d + 1, rows[j], false);
            }
        }
    }

    protected genCaves(ctx: GenContext) {
        const density = this.roll(ctx.rng, this.caveDensity);
        const w = ctx.width;
        const cells: number[] = [];
        for (let i = 0; i < ctx.mask.length; i++) if (ctx.mask[i]) cells.push(i);
        for (const i of cells) ctx.walls[i] = ctx.rng.chance(density);
        for (let step = 0; step < 4; step++) {
            const next: boolean[] = [];
            for (const i of cells) {
                const c = i % w;
                const r = Math.idiv(i, w);
                let n = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if ((dr != 0 || dc != 0) && ctx.isWall(c + dc, r + dr)) n++;
                    }
                }
                next.push(n >= 5 || (n >= 4 && ctx.walls[i]));
            }
            for (let k = 0; k < cells.length; k++) ctx.walls[cells[k]] = next[k];
        }
    }

    // ---------- extras ----------

    protected addExtras(ctx: GenContext) {
        const rng = ctx.rng;
        let n = this.rollCount(rng, this.boulders);
        for (let k = 0; k < n; k++) {
            const t = this.randomTile(ctx);
            ctx.fillCircle(t[0], t[1], rng.int(1, 2), true);
        }
        n = this.rollCount(rng, this.ruins);
        for (let k = 0; k < n; k++) {
            const t = this.randomTile(ctx);
            const w = rng.int(4, 7);
            const h = rng.int(4, 7);
            ctx.outlineRect(t[0], t[1], w, h, true);
            for (let g = rng.int(2, 4); g > 0; g--) {
                const side = rng.int(0, 3);
                const gc = side < 2 ? t[0] + rng.int(1, w - 2) : (side == 2 ? t[0] : t[0] + w - 1);
                const gr = side >= 2 ? t[1] + rng.int(1, h - 2) : (side == 0 ? t[1] : t[1] + h - 1);
                ctx.setWall(gc, gr, false);
                ctx.setWall(gc + (side < 2 ? 1 : 0), gr + (side >= 2 ? 1 : 0), false);
            }
        }
        n = this.rollCount(rng, this.wallLines);
        for (let k = 0; k < n; k++) {
            const t = this.randomTile(ctx);
            const len = rng.int(3, 7);
            if (rng.chance(50)) ctx.line(t[0], t[1], t[0] + len, t[1], true);
            else ctx.line(t[0], t[1], t[0], t[1] + len, true);
        }
        n = this.rollCount(rng, this.clearings);
        for (let k = 0; k < n; k++) {
            const t = this.randomTile(ctx);
            ctx.fillCircle(t[0], t[1], rng.int(2, 3), false);
        }
    }

    /** mode 0 = mirror left->right, 1 = top->bottom, 2 = both. */
    protected mirror(ctx: GenContext, mode: number) {
        const w = ctx.width;
        const h = ctx.height;
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                let sc = c;
                let sr = r;
                if ((mode == 0 || mode == 2) && c >= w / 2) sc = w - 1 - c;
                if ((mode == 1 || mode == 2) && r >= h / 2) sr = h - 1 - r;
                if (sc == c && sr == r) continue;
                ctx.walls[r * w + c] = ctx.walls[sr * w + sc];
                ctx.mask[r * w + c] = ctx.mask[sr * w + sc];
            }
        }
    }

    // ---------- cleanup + tilemap ----------

    private clearSafeZone(ctx: GenContext) {
        const sr = this.safeRadius;
        for (let dr = -sr; dr <= sr; dr++) {
            for (let dc = -sr; dc <= sr; dc++) {
                const c = this.startCol + dc;
                const r = this.startRow + dr;
                if (!ctx.inside(c, r) || ctx.isEdge(c, r)) continue;
                ctx.mask[r * ctx.width + c] = true; // the start is always part of the map
                ctx.walls[r * ctx.width + c] = false;
            }
        }
    }

    /** Turns any floor the hero can't walk to into wall, so nothing spawns in sealed pockets. */
    private fillUnreachable(ctx: GenContext) {
        const w = ctx.width;
        const seen: boolean[] = [];
        for (let i = 0; i < w * ctx.height; i++) seen.push(false);
        const stack = [this.startRow * w + this.startCol];
        seen[stack[0]] = true;
        while (stack.length > 0) {
            const i = stack.pop();
            const c = i % w;
            const r = Math.idiv(i, w);
            const nb = [i - 1, i + 1, i - w, i + w];
            const ok = [c > 0, c < w - 1, r > 0, r < ctx.height - 1];
            for (let k = 0; k < 4; k++) {
                if (ok[k] && !seen[nb[k]] && !ctx.walls[nb[k]]) {
                    seen[nb[k]] = true;
                    stack.push(nb[k]);
                }
            }
        }
        for (let i = 0; i < ctx.walls.length; i++) {
            if (!ctx.walls[i] && !seen[i]) ctx.walls[i] = true;
        }
    }

    private loadTilemap(ctx: GenContext) {
        const w = ctx.width;
        const h = ctx.height;
        const decor = this.roll(ctx.rng, this.decorChance);
        const buf = control.createBuffer(4 + w * h);
        buf.setNumber(NumberFormat.UInt16LE, 0, w);
        buf.setNumber(NumberFormat.UInt16LE, 2, h);
        const layer = image.create(w, h);
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                let tile = 1;
                if (ctx.isWall(c, r)) {
                    tile = ctx.isWall(c, r + 1) ? 3 : 4;
                    layer.setPixel(c, r, 2); // 2 = wall in Arcade's tilemap (TM_WALL); 1 does nothing
                } else if (ctx.rng.chance(decor)) {
                    tile = 2;
                }
                buf.setNumber(NumberFormat.UInt8LE, 4 + r * w + c, tile);
            }
        }
        this.tileImages = this.makeTileImages();
        tiles.setCurrentTilemap(tiles.createTilemap(buf, layer, this.tileImages, TileScale.Sixteen));
    }

    /** Tile art: [empty, floor, cracked floor, wall top, wall face]. Override for custom tiles. */
    protected makeTileImages(): Image[] {
        const fa = this.floorColor;
        const fl = this.floorLineColor;
        const wt = this.wallTopColor;
        const wl = this.wallLineColor;
        const wf = this.wallFaceColor;
        const t0 = image.create(16, 16);
        const t1 = image.create(16, 16);
        t1.fill(fa);
        t1.drawLine(0, 0, 15, 0, fl);
        t1.drawLine(0, 0, 0, 15, fl);
        const t2 = t1.clone();
        t2.drawLine(4, 9, 7, 9, fl);
        t2.drawLine(7, 9, 9, 7, fl);
        t2.setPixel(11, 4, fl);
        t2.setPixel(12, 12, fl);
        const t3 = image.create(16, 16);
        t3.fill(wt);
        t3.drawRect(0, 0, 16, 16, wl);
        t3.setPixel(5, 5, wl);
        t3.setPixel(10, 10, wl);
        const t4 = image.create(16, 16);
        t4.fill(wf);
        t4.fillRect(0, 0, 16, 4, wt);
        t4.drawLine(0, 4, 15, 4, 15);
        t4.drawLine(0, 10, 15, 10, 15);
        t4.drawLine(7, 4, 7, 10, 15);
        t4.drawLine(3, 10, 3, 15, 15);
        t4.drawLine(11, 10, 11, 15, 15);
        t4.drawLine(0, 15, 15, 15, 15);
        return [t0, t1, t2, t3, t4];
    }

    // =====================================================================
    // Enemy spawning (used by main.ts)
    // =====================================================================

    /** Picks an enemy type from enemyWeights, ignoring types not unlocked yet. */
    pickEnemy(floorTime: number): number {
        let total = 0;
        for (let i = 0; i < this.enemyWeights.length; i++) {
            if (floorTime >= this.enemyUnlockAt[i]) total += this.enemyWeights[i];
        }
        if (total <= 0) return 0;
        let roll = randint(0, total - 1);
        for (let i = 0; i < this.enemyWeights.length; i++) {
            if (floorTime < this.enemyUnlockAt[i]) continue;
            roll -= this.enemyWeights[i];
            if (roll < 0) return i;
        }
        return 0;
    }

    /** ms until the next spawn wave. */
    nextSpawnInterval(floorTime: number): number {
        return Math.max(this.minSpawnInterval, this.spawnInterval - floorTime / 100 - this.floor * 70);
    }

    /** Enemies in the next wave. */
    waveSize(floorTime: number): number {
        return 1 + Math.floor(floorTime / 30000) + (this.floor > 2 ? 1 : 0) + this.extraPerWave;
    }
}
