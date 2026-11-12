// Dev-only helpers. Turned on by DEV_MODE in config.ts (DEV_START_FLOOR is there too).
//
// B during a run opens the dev menu:
//   Give item      - every item in ITEM_POOL; follows the chest rules (new = Lv1,
//                    carried = +1 level, swap when slots are full)
//   Next floor     - leave this floor now
//   Final floor    - jump straight to the boss arena (FINAL_FLOOR)
//   Spawn boss now - skip the boss timer on timed floors
//   Full heal

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
    openMenu("DEV: GIVE ITEM", names, descs, "Items " + player.items.length + "/" + player.maxItemSlots  + "  A give", function (i: number) {
        if (i >= items.length) return
        const it = items[i]
        if (isCarried(it)) {
            if (it.level >= it.maxLevel) {
                banner(it.name.toUpperCase() + " IS MAXED", 1000)
                return
            }
            player.upgradeItem(it)
            banner(it.name.toUpperCase() + " LV" + it.level, 1000)
        } else if (player.items.length < player.maxItemSlots ) {
            player.equipItem(it)
            banner("GOT " + it.name.toUpperCase(), 1000)
        } else {
            chooseSwap(null, it) // slots full: pick which item to drop
        }
    }, icons)
}

function openDevMenu() {
    const names = ["Give item", "Next floor", "Final floor", "Spawn boss now", "Full heal", "Close"]
    const descs = [
        "Any item, chest rules apply",
        "Floor " + floorNum + " -> " + (floorNum + 1),
        "Jump to floor " + FINAL_FLOOR + " (boss arena)",
        bossSpawned ? "Boss already spawned" : "Skip the boss timer",
        "HP " + hero.hp + " -> " + hero.maxHp,
        "",
    ]
    openMenu("DEV MENU  (floor " + floorNum + ")", names, descs, "UP/DOWN choose  A select", function (i: number) {
        if (i == 0) openDevItemMenu()
        else if (i == 1) wantNextFloor = true
        else if (i == 2) {
            floorNum = FINAL_FLOOR - 1 // the floor change adds 1
            wantNextFloor = true
        } else if (i == 3) {
            if (!bossSpawned) spawnBoss()
        } else if (i == 4) hero.heal(hero.maxHp)
    })
}

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (!DEV_MODE || !started || menuOpen) return
    openDevMenu()
})
