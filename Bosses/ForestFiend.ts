// Boss of the Forest level (Levels/Forest.ts).
class ForestFiend extends Boss implements ICharacter {
    constructor(floor: number) {
        //    id              name            floor  hp                                      speed
        super("forest_fiend", "Forest Fiend", floor, Math.floor(160 * (1 + 0.7 * (floor - 1))), 20 + floor * 2,
            makeDemonImage(7, 6));
        this.spawnPoint = BossSpawn.NearHero;
        this.contactDamage = 2;
        this.attackCooldown = 2000;
        this.rageCooldown = 1300;
    }

    attack(target: Sprite): void {
        const speedUp = this.isRaging ? 15 : 0;
        if (this.attackCount % 3 == 2) {
            this.aimedFan(target, 5, 0.22, 80 + speedUp);
        } else {
            this.ringBurst(10 + this.floor * 2, 55 + speedUp, this.attackCount * 0.3);
        }
        if (this.attackCount % 4 == 3) this.summon(this.isRaging ? 1 : 0, 3);
    }
}
