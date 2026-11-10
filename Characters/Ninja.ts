class NinjaCharacter extends HeroCharacter implements ICharacterWithAbility {
    private shuriken = scaleImage(getImage("myImage7"), 0.7);

    constructor() {
        //    id       name     img         HP SPD
        super("ninja", "Ninja", "myImage6", 8, 90,
            "Shuriken Storm", 8000, "Shuriken Storm: blade ring");
        this.attackName = "Shuriken";
        this.attackCooldown = 260;
    }

    attack(target: Sprite): void {
        // one piercing star (+ Multishot upgrade)          count spread jitter speed dmg life pierce
        this.shootSpread(this.shuriken, this.aimAt(target), 1, 0, 0.05, 170, 1, 600, 1);
    }

    useAbility(): void {
        // ring of 12 piercing shurikens in every direction
        const n = 12;
        for (let i = 0; i < n; i++) {
            this.shoot(this.shuriken, i * 2 * Math.PI / n, 150, 2, 700, 2);
        }
        invulnUntil = Math.max(invulnUntil, gameTime + 300);
        banner("SHURIKEN STORM!", 800);
        sfx(music.pewPew);
    }
}
