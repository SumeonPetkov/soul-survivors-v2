// A playable hero: a Character with health, its own attack and an A-button ability.
// Concrete heroes: `class X extends HeroCharacter implements ICharacterWithAbility`.
/** Hero body size in px, used for walls and getting hit. Kept well under a 16px tile so 1-tile tunnels are easy. */
const HERO_BODY = 10;

abstract class HeroCharacter extends Character implements ICharacterWithAbility {
    /** Auto-attack settings. Set these in the hero's constructor. */
    attackName: string;
    attackCooldown: number;

    readonly description: string;
    readonly abilityName: string;
    readonly abilityCooldown: number;
    abilityReadyAt: number;

    imgR: Image;
    imgL: Image;
    faceRight: boolean;

    constructor(characterId: string, name: string, img: string,
        maxHp: number, speed: number,
        abilityName: string, abilityCooldown: number, description: string) {
        super(characterId, name, maxHp, speed, CharacterKind.Normal, getImage(img), SpriteKind.Player);
        this.attackName = name;
        this.attackCooldown = 500;
        this.abilityName = abilityName;
        this.abilityCooldown = abilityCooldown;
        this.description = description;
        this.abilityReadyAt = 0;
        this.faceRight = true;
        this.z = 10;
        this.setHeroImage(this.image);
    }

    /** Text shown on the hero select menu. */
    get menuTitle(): string {
        let t = this.name.toUpperCase();
        while (t.length < 8) t += " ";
        return t + "HP" + this.maxHp;
    }

    /** Use for palette swaps etc. Keeps the left/right facing images in sync. */
    protected setHeroImage(img: Image) {
        this.imgR = img;
        this.imgL = img.clone();
        this.imgL.flipX();
        this.setImage(this.faceRight ? this.imgR : this.imgL);
    }

    /**
     * Replaces MakeCode's default hitbox (the box around every visible pixel) with a
     * fixed HERO_BODY box at the hero's feet, centred so it doesn't move when the hero
     * turns. Works for any sprite size, e.g. the 32x32 pirate.
     */
    setHitbox() {
        if (this._hitbox && this._hitbox.isValid()) return;
        const img = this.image;
        const full = game.calculateHitBox(this); // box around the visible pixels
        const fullTop = Fx.toInt(full.oy);
        const fullH = Fx.toInt(full.height);
        const w = Math.min(HERO_BODY, img.width);
        const h = Math.min(HERO_BODY, fullH);
        const ox = Math.floor((img.width - w) / 2);
        const oy = fullTop + fullH - h;
        this._hitbox = new game.Hitbox(this, Fx8(w), Fx8(h), Fx8(ox), Fx8(oy));
    }

    face(right: boolean) {
        if (right == this.faceRight) return;
        this.faceRight = right;
        this.setImage(right ? this.imgR : this.imgL);
    }

    // ---- targeting ----

    /** How far the auto-attack reaches, in px. Override in a hero for a shorter/longer range. */
    get attackRange(): number {
        return SW * 0.72;
    }

    /**
     * The enemy the auto-attack would shoot right now (nearest in range with a clear shot;
     * flyers count even behind walls), or null if there is none.
     */
    currentTarget(): Sprite {
        return findTarget(this.x, this.y, this.attackRange, true);
    }

    /** true when there is an enemy in range the hero can shoot. */
    canAttack(): boolean {
        return this.currentTarget() != null;
    }

    /** Gives the arrow keys control of the hero at its current speed. */
    enableMovement() {
        controller.moveSprite(this, this.speed, this.speed);
    }

    /** Called by the A button. Handles the cooldown, then runs the hero's ability. */
    tryUseAbility(now: number): boolean {
        if (now < this.abilityReadyAt) return false;
        this.abilityReadyAt = now + this.abilityCooldown;
        this.useAbility();
        return true;
    }

    // ---- attack helpers for use inside attack() ----

    /** Angle in radians from the hero to `target`. */
    protected aimAt(target: Sprite): number {
        return Math.atan2(target.y - this.y, target.x - this.x);
    }

    /**
     * Fires one projectile. Damage is scaled by the Power upgrade.
     * pierce: enemies it passes through, boom: 1 = explodes on hit, home: 1 = seeks enemies.
     */
    shoot(img: Image, angle: number, speed: number, damage: number, life: number,
        pierce = 0, boom = 0, home = 0): Sprite {
        const p = sprites.createProjectileFromSprite(img, this, Math.cos(angle) * speed, Math.sin(angle) * speed);
        if (shotsIgnoreWalls) {
            // firing at a flyer behind a wall: this volley flies over walls
            p.setFlag(SpriteFlag.GhostThroughWalls, true);
            setDN(p, "ghost", 1);
        } else {
            p.setFlag(SpriteFlag.DestroyOnWall, true);
        }
        p.lifespan = life;
        setDN(p, "dmg", damage * player.dmgMult);
        setDN(p, "pierce", pierce);
        setDN(p, "boom", boom);
        setDN(p, "home", home);
        setDN(p, "last", -1);
        setDN(p, "spd", speed);
        return p;
    }

    /**
     * Fires `count` projectiles fanned over `spread` radians, plus the Multishot
     * upgrade and extraBullets(). `jitter` adds random inaccuracy per shot.
     */
    protected shootSpread(img: Image, angle: number, count: number, spread: number, jitter: number,
        speed: number, damage: number, life: number, pierce = 0, boom = 0, home = 0) {
        const n = count + player.multishot + this.extraBullets();
        const sp = spread + 0.14 * (n - count);
        for (let i = 0; i < n; i++) {
            let a = angle;
            if (n > 1) a += -sp / 2 + sp * i / (n - 1);
            a += (Math.random() - 0.5) * jitter * 2;
            this.shoot(img, a, speed, damage, life, pierce, boom, home);
        }
    }

    // ---- hooks heroes can override (optional) ----

    /** Runs every frame while the game is playing. */
    update(dt: number): void { }
    /** Extra bullets added to every volley. */
    extraBullets(): number { return 0; }
    /** Multiplies fire rate (2 = twice as fast). */
    fireRateMult(): number { return 1; }

    // ---- required (enforced by ICharacterWithAbility on the concrete class) ----

    attack(target: Sprite): void {
        throw "attack() not implemented in " + this.name;
    }

    useAbility(): void {
        throw "useAbility() not implemented in " + this.name;
    }

    onDeath(): void {
        wantGameOver = true;
    }
}
