// Every buff a level up can offer. Add new buffs here.
const BUFF_POOL: (() => Buff)[] = [
    () => new OrbitBlades(),
    () => new HolyAura(),
    () => new Lightning(),
    () => new Power(),
    () => new Haste(),
    () => new Multishot(),
    () => new Vitality(),
    () => new SwiftBoots(),
    () => new Magnet(),
    () => new Critical(),
    () => new GlassCannon(),
];

/** Filler offered when fewer than LEVEL_UP_CHOICES buffs can be picked. */
function makeFillerBuff(): Buff { return new Feast(); }

/** Number of choices a level up offers. */
const LEVEL_UP_CHOICES = 3;

/**
 * Up to `count` different buffs for a level up, padded with the filler buff.
 * Buffs you own come back as the owned instance (picking it levels it up); maxed ones
 * are skipped, and once BUFF_SLOTS are used only owned buffs are offered.
 */
function rollLevelUpBuffs(owned: Buff[], count: number): Buff[] {
    const full = owned.length >= BUFF_SLOTS;
    const options: Buff[] = [];
    for (const make of BUFF_POOL) {
        let b = make();
        let have = false;
        for (const o of owned) if (o.id == b.id) { b = o; have = true; }
        if (full && !have) continue;
        if (b.level < b.maxLevel) options.push(b);
    }
    const out: Buff[] = [];
    while (out.length < count && options.length > 0) {
        const k = randint(0, options.length - 1);
        out.push(options[k]);
        options.removeAt(k);
    }
    while (out.length < count) out.push(makeFillerBuff());
    return out;
}
