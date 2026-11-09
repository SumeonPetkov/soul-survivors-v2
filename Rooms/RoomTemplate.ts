// Hand-drawn rooms for LevelLayout.RoomDungeon.
//
// A room is drawn as rows of text, all rows the same length:
//   #  wall
//   .  floor
//   D  door - put these on the room's outer edge where corridors may connect
//   (anything else counts as wall)
//
// The generator rotates and flips rooms randomly, so one drawing gives up to 8 variants.
// A side with no D still gets a door if a corridor needs one (punched where floor is behind it).
// Rooms must fit inside a grid cell: at most (roomCellSize - 4) tiles on each side (12 by default).
//
// To add rooms, call defineRoom(...) in any file listed in pxt.json after this one
// (see Rooms/DungeonRooms.ts). A level picks rooms by set name (Level.roomSet).

enum RoomRole {
    /** Can appear anywhere. */
    Normal,
    /** Only used for the room the hero starts in (if the set has none, a Normal room is used). */
    Start
}

const ROOM_WALL = 1;
const ROOM_FLOOR = 0;
const ROOM_DOOR = 2;

class RoomTemplate {
    readonly set: string;
    readonly name: string;
    readonly weight: number;
    readonly role: RoomRole;
    /** grid[row][col] = ROOM_WALL / ROOM_FLOOR / ROOM_DOOR */
    readonly grid: number[][];

    constructor(set: string, name: string, rows: string[], weight: number, role: RoomRole) {
        this.set = set;
        this.name = name;
        this.weight = weight;
        this.role = role;
        this.grid = [];
        if (rows.length == 0) throw "room " + name + " is empty";
        const w = rows[0].length;
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (row.length != w) throw "room " + name + ": row " + r + " is " + row.length + " wide, expected " + w;
            const line: number[] = [];
            for (let c = 0; c < w; c++) {
                const ch = row.charAt(c);
                line.push(ch == "." ? ROOM_FLOOR : (ch == "D" ? ROOM_DOOR : ROOM_WALL));
            }
            this.grid.push(line);
        }
    }

    get width(): number { return this.grid[0].length; }
    get height(): number { return this.grid.length; }
}

const ROOM_TEMPLATES: RoomTemplate[] = [];

/** Adds a hand-drawn room to a room set. */
function defineRoom(set: string, name: string, rows: string[], weight = 1, role = RoomRole.Normal): RoomTemplate {
    const t = new RoomTemplate(set, name, rows, weight, role);
    ROOM_TEMPLATES.push(t);
    return t;
}

function roomsInSet(set: string): RoomTemplate[] {
    const out: RoomTemplate[] = [];
    for (const t of ROOM_TEMPLATES) if (t.set == set) out.push(t);
    return out;
}

/** Rotates a grid 90 degrees clockwise `turns` times, then mirrors it left-right if `flip`. */
function transformRoomGrid(src: number[][], turns: number, flip: boolean): number[][] {
    let g = src;
    for (let t = 0; t < turns; t++) {
        const h = g.length;
        const w = g[0].length;
        const out: number[][] = [];
        for (let r = 0; r < w; r++) {
            const line: number[] = [];
            for (let c = 0; c < h; c++) line.push(g[h - 1 - c][r]);
            out.push(line);
        }
        g = out;
    }
    if (flip) {
        const out: number[][] = [];
        for (const row of g) {
            const line: number[] = [];
            for (let c = row.length - 1; c >= 0; c--) line.push(row[c]);
            out.push(line);
        }
        g = out;
    }
    return g;
}
