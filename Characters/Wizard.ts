class WizardCharacter extends HeroCharacter implements ICharacterWithAbility {
    private bolt = makeBall(2, 10, 3);

    constructor() {
        //    id        name      img       HP SPD
        super("wizard", "Wizard", "knight", 9, 66,
            "Frost Nova", 9000, "Frost Nova: AoE freeze");
        this.attackName = "Magic Staff";
        this.attackCooldown = 450;
        const im = this.image.clone();
        im.replace(11, 10);
        im.replace(8, 3);
        im.replace(9, 5);
        im.replace(1, 13);
        this.setHeroImage(im);
    }

    attack(target: Sprite): void {
        // homing bolts                              count spread jitter speed dmg life  pierce boom home
        this.shootSpread(this.bolt, this.aimAt(target), 1, 0, 0.1, 110, 3, 1600, 0, 0, 1);
    }

    useAbility(): void {
        fx(NOVA_IMG, this.x, this.y, 220);
        scene.cameraShake(3, 200);
        sfx(music.zapped);
        for (const s of sprites.allOfKind(SpriteKind.EnemyShot)) {
            if (Math.abs(s.x - this.x) < 52 && Math.abs(s.y - this.y) < 52) s.destroy();
        }
        for (const e of sprites.allOfKind(SpriteKind.Enemy)) {
            const ex = e.x - this.x;
            const ey = e.y - this.y;
            if (ex * ex + ey * ey < 52 * 52) {
                setDN(e, "stun", gameTime + 1800);
                e.vx = 0;
                e.vy = 0;
                hurtEnemy(e, (8 + player.level) * player.dmgMult);
            }
        }
    }
}
