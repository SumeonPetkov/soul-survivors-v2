class PirateCharacter extends HeroCharacter implements ICharacterWithAbility {
    private ball = makeBall(2, 15, 11);      // flintlock lead ball
    private cannonball = makeBall(4, 15, 12);

    constructor() {
        //    id        name      img        HP SPD
        super("pirate", "Pirate", "myImage", 11, 72,
            "Cannon Blast", 10000, "Cannon Blast: exploding ball");
        this.attackName = "Flintlock";
        this.attackCooldown = 500; // 2 shots per second, but each one hits hard
    }

    attack(target: Sprite): void {
        const a = this.aimAt(target);
        //                                         count spread jitter speed dmg life
        this.shootSpread(this.ball, a, 1, 0, 0.03, 200, 5, 900);
        // muzzle smoke
        fx(PUFF_IMG, this.x + Math.cos(a) * 8, this.y + Math.sin(a) * 8, 150);
    }

    useAbility(): void {
        // big slow cannonball aimed where you face; explodes on hit
        const a = this.faceRight ? 0 : Math.PI;
        //                                            speed dmg life pierce boom
        this.shoot(this.cannonball, a, 110, 12, 1500, 0, 1);
        scene.cameraShake(4, 250);
        banner("CANNON BLAST!", 800);
        sfx(music.bigCrash);
    }
}
