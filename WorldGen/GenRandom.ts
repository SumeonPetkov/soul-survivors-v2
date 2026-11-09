// Seeded random numbers for world generation (xorshift32).
// The same seed always generates the same map - set a level's `seed` to reproduce one.
class GenRandom {
    readonly seed: number;
    private s: number;

    constructor(seed: number) {
        this.seed = seed;
        this.s = (seed | 0) == 0 ? 1 : (seed | 0);
    }

    /** 0 <= n < 1 */
    next(): number {
        let x = this.s;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.s = x;
        return (x >>> 0) / 4294967296;
    }

    /** Whole number from lo to hi (inclusive). */
    int(lo: number, hi: number): number {
        return lo + Math.floor(this.next() * (hi - lo + 1));
    }

    /** true `percent`% of the time. */
    chance(percent: number): boolean {
        return this.next() * 100 < percent;
    }

    /** Index picked with probability proportional to its weight (-1 if all are 0). */
    weighted(weights: number[]): number {
        let total = 0;
        for (const w of weights) total += Math.max(0, w);
        if (total <= 0) return -1;
        let roll = this.next() * total;
        for (let i = 0; i < weights.length; i++) {
            roll -= Math.max(0, weights[i]);
            if (roll < 0) return i;
        }
        return weights.length - 1;
    }
}
