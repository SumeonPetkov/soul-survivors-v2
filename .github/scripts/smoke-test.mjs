// Opens the built game in headless Chrome, plays a few seconds and fails on a crash -
// the same thing as opening the page and watching the F12 console.
//
// Expects the page served at http://localhost:8000/ (index.html + assets/js/binary.js).
// Run locally: npx playwright install chromium; python -m http.server 8000; node .github/scripts/smoke-test.mjs
import { chromium } from "playwright";

const URL = process.env.SMOKE_URL || "http://localhost:8000/index.html";
const PLAY_SECONDS = Number(process.env.SMOKE_SECONDS || 25);

// console text that means the game itself broke
const FATAL = /Simulator crashed|unhandled exception|Unknown image ID|Unknown tile ID|Program panic/i;

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage();

// page.on("console") also receives messages from the simulator iframe
page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") console.log(`[console.error] ${text}`);
    if (FATAL.test(text)) errors.push(text);
});
page.on("pageerror", (err) => {
    console.log(`[pageerror] ${err.message}`);
    if (FATAL.test(err.message)) errors.push(err.message);
});

console.log(`Opening ${URL}`);
await page.goto(URL);

// the simulator iframe draws the game on a canvas once it's running
const sim = page.frameLocator("#simframe");
await sim.locator("canvas").first().waitFor({ state: "visible", timeout: 90_000 });
console.log("Simulator is running.");
await page.waitForTimeout(3000);

// give the game keyboard focus, then play: A (space) gets through the menus,
// arrows walk around, and A keeps picking level-up rewards
await page.locator("#simframe").click();
const keys = ["Space", "ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
const end = Date.now() + PLAY_SECONDS * 1000;
for (let i = 0; Date.now() < end && errors.length === 0; i++) {
    const k = keys[i % keys.length];
    await page.keyboard.down(k);
    await page.waitForTimeout(k === "Space" ? 120 : 900);
    await page.keyboard.up(k);
}
await page.waitForTimeout(1000);
// what the game looked like at the end (uploaded as an artifact by the workflow)
await page.screenshot({ path: "smoke-test.png" });
await browser.close();

if (errors.length) {
    for (const e of errors) console.log(`::error::Game crashed: ${e}`);
    process.exit(1);
}
console.log(`No crash after ${PLAY_SECONDS}s of play.`);
