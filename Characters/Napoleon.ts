class NapoleonCharacter extends HeroCharacter implements ICharacterWithAbility {
    // lead musket ball: dark outline, grey body, white shine
    private musketBall = img`
        . f f f .
        f b 1 b f
        f b b c f
        f c c c f
        . f f f .
    `;
    // starburst shown at the barrel when the volley fires
    private muzzleFlash = img`
        . . . 5 . . .
        . 5 . 4 . 5 .
        . . 4 5 4 . .
        5 4 5 1 5 4 5
        . . 4 5 4 . .
        . 5 . 4 . 5 .
        . . . 5 . . .
    `;
    // iron cannon shell with a lit fuse, drawn just before each explosion
    private shell = img`
        . . . . . . . 5 .
        . . . . . . 4 . 5
        . . . f f f e . .
        . . f b 1 c c f .
        . f b 1 c c c c f
        . f c c c c c c f
        . f c c c c c c f
        . . f c c c c f .
        . . . f f f f . .
    `;
    // cannonade: shells still to land, and when the next one lands
    private shellsLeft = 0;
    private nextShellAt = 0;

    constructor() {
        //    id          name        img         HP SPD
        super("napoleon", "Napoleon", "myImage5", 10, 64,
            "Cannonade", 11000, "Cannonade: artillery barrage");
        this.attackName = "Musket Volley";
        this.attackCooldown = 600;
    }

    attack(target: Sprite): void {
        const a = this.aimAt(target);
        // a line of muskets firing together count spread jitter speed dmg life
        this.shootSpread(this.musketBall, a, 3, 0.3, 0.04, 160, 2, 800);
        // flash at the barrel, then a puff of powder smoke
        fx(this.muzzleFlash, this.x + Math.cos(a) * 9, this.y + Math.sin(a) * 9, 80);
        fx(PUFF_IMG, this.x + Math.cos(a) * 13, this.y + Math.sin(a) * 13, 160);
    }

    useAbility(): void {
        this.shellsLeft = 6;
        this.nextShellAt = gameTime;
        banner("CANNONADE!", 900);
        sfx(music.bigCrash);
    }

    update(dt: number): void {
        if (this.shellsLeft <= 0 || gameTime < this.nextShellAt) return;
        this.shellsLeft--;
        this.nextShellAt = gameTime + 200;
        // land on the nearest enemy still standing, or a random spot near you if none
        const e = findTarget(this.x, this.y, SW * 0.6, true);
        const x = e ? e.x : this.x + randint(-60, 60);
        const y = e ? e.y : this.y + randint(-50, 50);
        fx(this.shell, x, y - 12, 120);
        explode(x, y, 6 * player.dmgMult);
        scene.cameraShake(2, 120);
    }
}
