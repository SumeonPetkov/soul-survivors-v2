// Floating damage numbers: white for normal hits, red with a "!" for crits.
// Shown from hurtEnemy in main.ts. Turn them off with SHOW_DAMAGE_TEXT.

const SHOW_DAMAGE_TEXT = true
/** Most numbers on screen at once; extra hits are skipped so heavy fights stay fast. */
const MAX_DAMAGE_TEXTS = 24

namespace SpriteKind {
    export const DmgText = SpriteKind.create()
}

function showDamageText(x: number, y: number, dmg: number, crit: boolean) {
    if (!SHOW_DAMAGE_TEXT || dmg <= 0) return
    if (sprites.allOfKind(SpriteKind.DmgText).length >= MAX_DAMAGE_TEXTS) return
    const s = "" + Math.max(1, Math.round(dmg)) + (crit ? "!" : "")
    const font = image.font5
    // 1px black outline around the digits so they read on any floor color
    const im = image.create(s.length * font.charWidth + 2, font.charHeight + 2)
    for (let ox = 0; ox <= 2; ox++)
        for (let oy = 0; oy <= 2; oy++)
            if (ox != 1 || oy != 1) im.print(s, ox, oy, 15, font)
    im.print(s, 1, 1, crit ? 2 : 1, font)

    const t = sprites.create(im, SpriteKind.DmgText)
    t.setFlag(SpriteFlag.Ghost, true)
    t.setPosition(x + randint(-4, 4), y)
    t.z = 20
    // pops up, slows down and fades out
    t.vx = randint(-8, 8)
    t.vy = crit ? -45 : -35
    t.ay = 70
    t.lifespan = crit ? 750 : 550
}
