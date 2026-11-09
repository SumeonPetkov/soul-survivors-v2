// Contracts that concrete character classes must fulfil.
// MakeCode can't compile `abstract` methods, so add `implements ICharacter...`
// to every concrete class to get a compile error when a method is missing.

interface ICharacter {
    /** Called whenever the character attacks `target` (heroes: auto-fire, off cooldown). */
    attack(target: Sprite): void;
    /** Called once when hp reaches 0. */
    onDeath(): void;
}

interface ICharacterWithAbility extends ICharacter {
    /** Called when the player presses A and the ability is off cooldown. */
    useAbility(): void;
}
