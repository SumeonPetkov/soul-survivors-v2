// Dev-only helpers. Turned on by DEV_MODE in config.ts.
//
// B during a run: opens a menu listing every item in ITEM_POOL. Picking one follows the
// chest rules: a new item is equipped at Lv1 (or swapped in when slots are full), an item
// you carry goes up one level. Press B again to give more.

/** Returns the carried instance of the pool item with this id, or a fresh one. */
function devFindItem(make: () => Item): Item {
    const fresh = make()
    for (const c of player.items) if (c.id == fresh.id) return c
    return fresh
}

function openDevItemMenu() {
    const items: Item[] = []
    const names: string[] = []
    const descs: string[] = []
    const icons: Image[] = []
    for (const make of ITEM_POOL) {
        const it = devFindItem(make)
        const have = isCarried(it)
        let label = it.name
        if (!have) label += "  NEW"
        else if (it.level >= it.maxLevel) label += "  MAXED"
        else label += "  Lv" + it.level + " > " + (it.level + 1)
        items.push(it)
        names.push(label)
        descs.push(it.describe(have ? Math.min(it.level + 1, it.maxLevel) : 1))
        icons.push(it.icon)
    }
    names.push("Close")
    descs.push("")
    icons.push(null)
    openMenu("DEV: GIVE ITEM", names, descs, "Items " + player.items.length + "/" + ITEM_SLOTS + "  A give", function (i: number) {
        if (i >= items.length) return
        const it = items[i]
        if (isCarried(it)) {
            if (it.level >= it.maxLevel) {
                banner(it.name.toUpperCase() + " IS MAXED", 1000)
                return
            }
            player.upgradeItem(it)
            banner(it.name.toUpperCase() + " LV" + it.level, 1000)
        } else if (player.items.length < ITEM_SLOTS) {
            player.equipItem(it)
            banner("GOT " + it.name.toUpperCase(), 1000)
        } else {
            chooseSwap(null, it) // slots full: pick which item to drop
        }
    }, icons)
}

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!DEV_MODE || !started || menuOpen) return
    openDevItemMenu()
})
