// Every item a chest can contain. Add new items here.
const ITEM_POOL: (() => Item)[] = [
    () => new IronHeart(),
    () => new BerserkerMask(),
    () => new Hourglass(),
    () => new WingedBoots(),
    () => new VampireFang(),
    () => new ThornShield(),
    () => new LuckyCoin(),
    () => new SplitCrystal(),
    () => new BombRing(),
    () => new RegenCharm(),
    () => new StarTracer(),
];

/** Number of choices a chest offers. */
const CHEST_CHOICES = 3;

/**
 * Up to `count` different items for a chest. Items you carry come back as the carried
 * instance (picking it upgrades it); items at max level are never offered.
 */
function rollChestItems(carried: Item[], count: number): Item[] {
    const options: Item[] = [];
    for (const make of ITEM_POOL) {
        let it = make();
        for (const c of carried) if (c.id == it.id) it = c;
        if (it.level < it.maxLevel) options.push(it);
    }
    const out: Item[] = [];
    while (out.length < count && options.length > 0) {
        const k = randint(0, options.length - 1);
        out.push(options[k]);
        options.removeAt(k);
    }
    return out;
}
