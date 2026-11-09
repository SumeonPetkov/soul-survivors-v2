class RogueCharacter extends HeroCharacter implements ICharacterWithAbility {
    private rollUntil = 0;
    private rollVx = 0;
    private rollVy = 0;
    private bullet = makeBall(1, 5, 1);

    constructor() {
        //    id       name     img       HP SPD
        super("rogue", "Rogue", "knight", 9, 84,
            "Dodge Roll", 2200, "Dodge Roll: quick dash");
        this.attackName = "SMG";
        this.attackCooldown = 110;
        const im = this.image.clone();
        im.replace(8, 2);
        im.replace(11, 12);
        im.replace(9, 5);
        im.replace(1, 11);
        this.setHeroImage(im);
    }

    attack(target: Sprite): void {
        //                                                 count spread jitter speed dmg life
        this.shootSpread(this.bullet, this.aimAt(target), 1, 0, 0.18, 185, 1, 700);
    }

    useAbility(): void {
        let dx = 0;
        let dy = 0;
        if (controller.left.isPressed()) dx -= 1;
        if (controller.right.isPressed()) dx += 1;
        if (controller.up.isPressed()) dy -= 1;
        if (controller.down.isPressed()) dy += 1;
        if (dx == 0 && dy == 0) dx = this.faceRight ? 1 : -1;
        const d = Math.sqrt(dx * dx + dy * dy);
        this.rollVx = dx / d * 230;
        this.rollVy = dy / d * 230;
        this.rollUntil = gameTime + 220;
        invulnUntil = Math.max(invulnUntil, gameTime + 450);
        controller.moveSprite(this, 0, 0);
    }

    update(dt: number): void {
        if (this.rollUntil <= 0) return;
        if (gameTime < this.rollUntil) {
            this.vx = this.rollVx;
            this.vy = this.rollVy;
            fx(PUFF_IMG, this.x, this.y + 5, 100);
        } else {
            this.rollUntil = 0;
            this.vx = 0;
            this.vy = 0;
            this.enableMovement();
        }
    }
}
