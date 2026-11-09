class KnightCharacter extends HeroCharacter implements ICharacterWithAbility {
    private dualUntil = 0;
    private bullet = makeBall(2, 4, 5);

    constructor() {
        //    id        name      img       HP  SPD
        super("knight", "Knight", "knight", 12, 70,
            "Dual Wield", 14000, "Dual Wield: rapid fire");
        this.attackName = "Pistol";
        this.attackCooldown = 320;
    }

    attack(target: Sprite): void {
        //                                                 count spread jitter speed dmg life
        this.shootSpread(this.bullet, this.aimAt(target), 1, 0, 0.04, 160, 2, 900);
    }

    useAbility(): void {
        this.dualUntil = gameTime + 5000;
        banner("DUAL WIELD!", 1000);
        sfx(music.magicWand);
    }

    extraBullets(): number {
        return gameTime < this.dualUntil ? 1 : 0;
    }

    fireRateMult(): number {
        return gameTime < this.dualUntil ? 2 : 1;
    }
}
