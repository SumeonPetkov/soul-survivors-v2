// Big Wall: a ring of bricks appears around the hero for a few seconds.
// Bricks block enemy shots, and push back + damage enemies that walk into them
// (see the SpriteKind.Barrier overlaps in main.ts).
const WALL_BRICKS = 14;
const WALL_RADIUS = 32;
const WALL_LIFE = 4000;

let _trumpBrick: Image = null;
function trumpBrickImage(): Image {
    if (!_trumpBrick) {
        const im = image.create(8, 8);
        im.fill(2);
        im.drawRect(0, 0, 8, 8, 14);
        im.drawLine(0, 3, 7, 3, 14);
        im.drawLine(3, 0, 3, 3, 14);
        im.drawLine(5, 4, 5, 7, 14);
        im.setPixel(1, 1, 3);
        im.setPixel(6, 5, 3);
        _trumpBrick = im;
    }
    return _trumpBrick;
}

class TrumpCharacter extends HeroCharacter implements ICharacterWithAbility {
    private pellet = makeBall(1, 4, 5);

    constructor() {
        //    id       name     img      HP  SPD
        super("trump", "Trump", "trump", 10, 68,
            "Big Wall", 12000, "Big Wall: block & shove foes");
        this.attackName = "Shotgun";
        this.attackCooldown = 700;
    }

    attack(target: Sprite): void {
        // 5-pellet blast                                count spread jitter speed dmg life
        this.shootSpread(this.pellet, this.aimAt(target), 5, 0.75, 0.08, 150, 2, 450);
    }

    useAbility(): void {
        const brick = trumpBrickImage();
        for (let i = 0; i < WALL_BRICKS; i++) {
            const a = i * 2 * Math.PI / WALL_BRICKS;
            const b = sprites.create(brick, SpriteKind.Barrier);
            b.setFlag(SpriteFlag.GhostThroughWalls, true);
            b.setPosition(this.x + Math.cos(a) * WALL_RADIUS, this.y + Math.sin(a) * WALL_RADIUS);
            b.lifespan = WALL_LIFE;
            b.z = 8;
            setDN(b, "cx", this.x);
            setDN(b, "cy", this.y);
            setDN(b, "dmg", (2 + Math.floor(player.level / 2)) * player.dmgMult);
        }
        banner("BIG BEAUTIFUL WALL!", 1200);
        scene.cameraShake(2, 200);
        sfx(music.knock);
    }
}
