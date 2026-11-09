// The map while it's being generated. `mask` marks tiles inside the map's shape;
// tiles outside the shape (and the outer border) always stay wall and can't be changed.
class GenContext {
    readonly width: number;
    readonly height: number;
    readonly rng: GenRandom;
    /** walls[r * width + c] */
    walls: boolean[];
    /** mask[r * width + c] = true if the tile is inside the map shape */
    mask: boolean[];

    constructor(width: number, height: number, rng: GenRandom) {
        this.width = width;
        this.height = height;
        this.rng = rng;
        this.walls = [];
        this.mask = [];
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                const edge = this.isEdge(c, r);
                this.walls.push(edge);
                this.mask.push(!edge);
            }
        }
    }

    inside(c: number, r: number): boolean {
        return c >= 0 && r >= 0 && c < this.width && r < this.height;
    }

    isEdge(c: number, r: number): boolean {
        return c == 0 || r == 0 || c == this.width - 1 || r == this.height - 1;
    }

    /** true if (c, r) is part of the playable shape */
    inShape(c: number, r: number): boolean {
        return this.inside(c, r) && this.mask[r * this.width + c];
    }

    /** Cuts (c, r) out of the shape: it becomes permanent wall. */
    removeFromShape(c: number, r: number) {
        if (!this.inside(c, r)) return;
        this.mask[r * this.width + c] = false;
        this.walls[r * this.width + c] = true;
    }

    isWall(c: number, r: number): boolean {
        if (!this.inside(c, r)) return true;
        return this.walls[r * this.width + c];
    }

    /** Sets a wall inside the shape (does nothing outside it). */
    setWall(c: number, r: number, wall: boolean) {
        if (!this.inShape(c, r)) return;
        this.walls[r * this.width + c] = wall;
    }

    // ---------- drawing helpers ----------

    fillRect(c: number, r: number, w: number, h: number, wall: boolean) {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) this.setWall(c + dx, r + dy, wall);
        }
    }

    outlineRect(c: number, r: number, w: number, h: number, wall: boolean) {
        for (let dx = 0; dx < w; dx++) {
            this.setWall(c + dx, r, wall);
            this.setWall(c + dx, r + h - 1, wall);
        }
        for (let dy = 0; dy < h; dy++) {
            this.setWall(c, r + dy, wall);
            this.setWall(c + w - 1, r + dy, wall);
        }
    }

    fillCircle(cx: number, cy: number, radius: number, wall: boolean) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx * dx + dy * dy <= radius * radius + radius) this.setWall(cx + dx, cy + dy, wall);
            }
        }
    }

    line(c0: number, r0: number, c1: number, r1: number, wall: boolean) {
        const steps = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0));
        for (let i = 0; i <= steps; i++) {
            const t = steps == 0 ? 0 : i / steps;
            this.setWall(Math.round(c0 + (c1 - c0) * t), Math.round(r0 + (r1 - r0) * t), wall);
        }
    }
}
