// Fails if the code asks for an image name that doesn't exist in images.g.jres.
// (MakeCode compiles fine with a wrong name; the game only crashes with
// "Unknown image ID: ..." when that line runs.)
//
// Checks every .ts file listed in pxt.json for:
//   getImage("name")                        - assets.ts
//   super("id", "Name", "imageName", ...)   - heroes (Characters/*.ts pass the sprite name)
//
// Run locally: node .github/scripts/check-images.js
const fs = require("fs");

const pxt = JSON.parse(fs.readFileSync("pxt.json", "utf8"));
const jres = JSON.parse(fs.readFileSync("images.g.jres", "utf8"));

// getImage() tries the exact name, then the lowercase name (see assets.ts)
const names = new Set();
for (const [key, v] of Object.entries(jres)) {
    if (key === "*") continue;
    if (v.displayName) names.add(v.displayName);
}
const exists = (n) => names.has(n) || names.has(n.toLowerCase());

const patterns = [
    /getImage\(\s*"([^"]+)"\s*\)/g,
    // hero constructors: super("ninja", "Ninja", "myImage6", ...)
    /super\(\s*"[^"]*"\s*,\s*"[^"]*"\s*,\s*"([^"]+)"/g,
];

const problems = [];
let checked = 0;
for (const file of pxt.files.filter((f) => f.endsWith(".ts"))) {
    const src = fs.readFileSync(file, "utf8");
    const lines = src.split("\n");
    for (const re of patterns) {
        for (const m of src.matchAll(re)) {
            // heroes only: other classes' third super() argument isn't an image name
            if (re !== patterns[0] && !/extends\s+HeroCharacter/.test(src)) continue;
            checked++;
            if (!exists(m[1])) {
                const line = src.slice(0, m.index).split("\n").length;
                problems.push(`${file}:${line}: unknown image "${m[1]}"  (${lines[line - 1].trim()})`);
            }
        }
    }
}

console.log(`Checked ${checked} image references against ${names.size} images in images.g.jres.`);
if (problems.length) {
    for (const p of problems) console.log(`::error::${p}`);
    console.log("\nImages that exist: " + [...names].sort().join(", "));
    console.log("If an image was renamed in the web editor, use the new name in the code (or rename it back).");
    process.exit(1);
}
console.log("All image names exist.");
