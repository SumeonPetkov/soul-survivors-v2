class NapoleonCharacter extends HeroCharacter implements ICharacterWithAbility {
    private musketBall = makeBall(1, 15, 11);
    private shell = makeBall(3, 15, 2);
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
        // a line of muskets firing together          count spread jitter speed dmg life
        this.shootSpread(this.musketBall, this.aimAt(target), 3, 0.3, 0.04, 160, 2, 800);
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
