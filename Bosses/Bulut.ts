// Final boss: waits in the arena on the last floor (Levels/Arena.ts).
// Beating him wins the game (see bossDefeated in main.ts).
//
// The arena has no random spawns: every enemy there comes from Bulut's summons.
// Three phases, by HP. Each phase change: banner, shockwave, cleared shots, reinforcements, 1s pause.
//   Phase 1 (100-66%): ring, aimed fan, summon, charge + slam
//   Phase 2 (66-33%, "Storm"): adds a 2-arm spiral and meteor rain; attacks faster
//   Phase 3 (<33%, "Enraged"): 4-arm spiral, big meteor rain + fan, 3 charges in a row,
//                              double rings; fastest attacks (rageAt = 0.33)
// Long attacks (spiral, charges) run over several AI ticks in move(); while one is
// running, attack() waits for it to finish.
class Bulut extends Boss implements ICharacter {
    private phase = 1;
    // charge + slam (chargesLeft > 0 chains extra charges after the slam)
    private chargeUntil = 0;
    private slamPending = false;
    private chargesLeft = 0;
    // spiral: shots fired every AI tick (100ms) while spiralLeft > 0
    private spiralLeft = 0;
    private spiralArms = 2;
    private spiralAngle = 0;
    // meteors waiting to land: position and landing time, same index in each list
    private meteorX: number[] = [];
    private meteorY: number[] = [];
    private meteorAt: number[] = [];

    private static readonly MARKER = img`
        2 2 . . . . . 2 2
        2 2 2 . . . 2 2 2
        . 2 2 2 . 2 2 2 .
        . . 2 2 2 2 2 . .
        . . . 2 4 2 . . .
        . . 2 2 2 2 2 . .
        . 2 2 2 . 2 2 2 .
        2 2 2 . . . 2 2 2
        2 2 . . . . . 2 2
    `;

    constructor(floor: number) {
        //    id       name     floor  hp                      speed
        super("bulut", "Bulut", floor, 6000, 22, getImage("myImage12"));
        this.spawnPoint = BossSpawn.MapCenter;
        this.contactDamage = 3;
        this.firstAttackDelay = 2000;
        this.attackCooldown = 1800;
        this.rageCooldown = 1000; // phase 3 attack speed
        this.rageAt = 0.33;       // "raging" = phase 3
        this.gemDrops = 10;
        this.spawnBanner = "FINAL BOSS: BULUT!";
    }

    private get busy(): boolean {
        return this.spiralLeft > 0 || this.slamPending || this.chargesLeft > 0;
    }

    attack(target: Sprite): void {
        if (this.busy) {
            this.attackCount--; // don't skip a step of the cycle while busy
            return;
        }
        if (this.phase == 1) this.phaseOneAttack(target);
        else if (this.phase == 2) this.phaseTwoAttack(target);
        else this.phaseThreeAttack(target);
    }

    private phaseOneAttack(target: Sprite) {
        const step = this.attackCount % 4;
        if (step == 0) this.ringBurst(16, 50, this.attackCount * 0.25);
        else if (step == 1) this.aimedFan(target, 7, 0.16, 85);
        else if (step == 2) {
            this.summon(T_WOLF, 4, 40);
            this.summon(T_FIRE_IMP, 3, 40);
        } else this.startCharge(target, 1);
    }

    private phaseTwoAttack(target: Sprite) {
        const step = this.attackCount % 5;
        if (step == 0) this.startSpiral(2, 25);
        else if (step == 1) this.meteorRain(5, 0);
        else if (step == 2) this.aimedFan(target, 9, 0.14, 90);
        else if (step == 3) {
            this.summon(T_WOLF, 6, 40);
            this.summon(T_ICE_GOLEM, 5, 40);
        } else this.startCharge(target, 1);
    }

    private phaseThreeAttack(target: Sprite) {
        const step = this.attackCount % 5;
        if (step == 0) this.startSpiral(4, 30);
        else if (step == 1) {
            this.meteorRain(8, 0);
            this.aimedFan(target, 5, 0.2, 95);
        } else if (step == 2) this.startCharge(target, 3);
        else if (step == 3) {
            this.summon(T_FIRE_IMP, 8, 40);
            this.summon(T_SKELETON, 8, 40);
        } else {
            const off = this.attackCount * 0.25;
            this.ringBurst(18, 55, off);
            this.ringBurst(18, 38, off + Math.PI / 18);
        }
    }

    // ---------- attack starters ----------

    /** Rush at the target for 0.6s, then slam. `count` > 1 chains more charges. */
    private startCharge(target: Sprite, count: number) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        this.vx = dx / d * this.speed * 5;
        this.vy = dy / d * this.speed * 5;
        this.chargeUntil = gameTime + 600;
        this.slamPending = true;
        this.chargesLeft = count - 1;
        banner(count > 1 ? "BULUT RAMPAGES!" : "BULUT CHARGES!", 700);
    }

    /** Stand still and spin `arms` streams of shots for `ticks` AI ticks (100ms each). */
    private startSpiral(arms: number, ticks: number) {
        this.spiralArms = arms;
        this.spiralLeft = ticks;
        this.vx = 0;
        this.vy = 0;
    }

    /** Red markers around the hero; each bursts into a ring of shots 0.9s later. */
    private meteorRain(count: number, delay: number) {
        for (let i = 0; i < count; i++) {
            // first one right on the hero, the rest scattered around
            const x = i == 0 ? hero.x : hero.x + randint(-70, 70);
            const y = i == 0 ? hero.y : hero.y + randint(-55, 55);
            if (isWallAt(x, y)) continue;
            this.meteorX.push(x);
            this.meteorY.push(y);
            this.meteorAt.push(gameTime + 900 + delay + i * 120);
            fx(Bulut.MARKER, x, y, 900 + delay + i * 120);
        }
    }

    // ---------- per-tick updates ----------

    move(): void {
        this.checkPhase();
        this.landMeteors();

        if (this.spiralLeft > 0) {
            this.spiralLeft--;
            for (let k = 0; k < this.spiralArms; k++) {
                enemyShoot(this, this.spiralAngle + k * 2 * Math.PI / this.spiralArms, 60);
            }
            this.spiralAngle += 0.32;
            this.vx = 0;
            this.vy = 0;
            return;
        }

        if (gameTime < this.chargeUntil) return; // keep the charge velocity
        if (this.slamPending) {
            this.slamPending = false;
            this.vx = 0;
            this.vy = 0;
            scene.cameraShake(5, 300);
            fx(NOVA_IMG, this.x, this.y, 200);
            this.ringBurst(this.phase == 3 ? 16 : 24, 45);
            if (this.chargesLeft > 0) this.startCharge(hero, this.chargesLeft);
            return;
        }
        super.move();
    }

    private landMeteors() {
        for (let i = this.meteorAt.length - 1; i >= 0; i--) {
            if (gameTime < this.meteorAt[i]) continue;
            const x = this.meteorX[i];
            const y = this.meteorY[i];
            fx(EXPLO_IMG, x, y, 200);
            const off = Math.random() * Math.PI;
            for (let k = 0; k < 8; k++) this.shotFrom(x, y, off + k * Math.PI / 4, 55);
            this.meteorX.removeAt(i);
            this.meteorY.removeAt(i);
            this.meteorAt.removeAt(i);
        }
    }

    private checkPhase() {
        const frac = this.hp / this.maxHp;
        const want = frac > 0.66 ? 1 : (frac > 0.33 ? 2 : 3);
        if (want <= this.phase) return;
        this.phase = want;
        // cancel whatever was running and make the change obvious
        this.spiralLeft = 0;
        this.chargesLeft = 0;
        this.slamPending = false;
        this.chargeUntil = 0;
        sprites.destroyAllSpritesOfKind(SpriteKind.EnemyShot);
        banner(want == 2 ? "BULUT: THE STORM BEGINS" : "BULUT IS ENRAGED!", 2000);
        sfx(music.bigCrash);
        scene.cameraShake(6, 600);
        fx(NOVA_IMG, this.x, this.y, 300);
        this.ringBurst(24, 40);
        // he's the only source of enemies in the arena: each new phase brings reinforcements
        if (want == 2) {
            this.attackCooldown = 1500;
            this.summon(T_WOLF, 3, 50);
            this.summon(T_ICE_GOLEM, 1, 50);
        } else {
            this.summon(T_SKELETON, 3, 50);
            this.summon(T_FIRE_IMP, 2, 50);
        }
        setDN(this, "stun", gameTime + 1000); // short pause before the new phase
    }

    /** Like enemyShoot, but from any point (used by meteors). */
    private shotFrom(x: number, y: number, a: number, spd: number) {
        if (sprites.allOfKind(SpriteKind.EnemyShot).length >= MAX_SHOTS) return;
        const s = sprites.create(SHOT_IMG, SpriteKind.EnemyShot);
        s.setPosition(x, y);
        s.setVelocity(Math.cos(a) * spd, Math.sin(a) * spd);
        s.setFlag(SpriteFlag.DestroyOnWall, true);
        s.setFlag(SpriteFlag.AutoDestroy, true);
        s.lifespan = 4000;
    }
}
