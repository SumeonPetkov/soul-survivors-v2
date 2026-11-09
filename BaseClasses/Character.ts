enum CharacterKind {
    Normal,
    Flying,
    Undead
}

// Base for anything that has health and lives in the world as a sprite.
// NOTE: don't name fields `_kind`, `_image` or `_data` - Sprite already uses them.
abstract class Character extends Sprite implements ICharacter {
    private _characterId: string;
    private _name: string;
    private _maxHp: number;
    private _hp: number;
    private _speed: number;
    private _charKind: CharacterKind;
    private _dead: boolean;

    constructor(characterId: string, name: string, maxHp: number, speed: number,
        kind: CharacterKind, img: Image, spriteKind: number) {
        super(img);
        // `new Sprite()` alone isn't simulated; do what sprites.create() does.
        this.setKind(spriteKind);
        game.currentScene().physicsEngine.addSprite(this);

        this._characterId = characterId;
        this._name = name;
        this._maxHp = maxHp;
        this._hp = maxHp;
        this._speed = speed;
        this._charKind = kind;
        this._dead = false;
    }

    get characterId(): string { return this._characterId; }
    get name(): string { return this._name; }
    get characterKind(): CharacterKind { return this._charKind; }
    get isDead(): boolean { return this._dead; }

    get speed(): number { return this._speed; }
    set speed(value: number) { this._speed = value; }

    get maxHp(): number { return this._maxHp; }
    set maxHp(value: number) {
        this._maxHp = Math.max(1, value);
        if (this._hp > this._maxHp) this._hp = this._maxHp;
    }

    get hp(): number { return this._hp; }
    set hp(value: number) {
        if (this._dead) return;
        this._hp = Math.max(0, Math.min(this._maxHp, value));
        if (this._hp <= 0) {
            this._dead = true;
            this.onDeath();
        }
    }

    heal(amount: number) {
        this.hp = this._hp + amount;
    }

    // Placeholders: MakeCode can't compile abstract methods. Subclasses override these.
    attack(target: Sprite): void {
        throw "attack() not implemented in " + this._name;
    }

    onDeath(): void {
        throw "onDeath() not implemented in " + this._name;
    }
}
