// Seeded generators, so every iteration builds the same corpus without Math.random().

export function hashString(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}

export function createRandom(seed) {
    let state = seed >>> 0;
    const next = () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        next,
        int(min, max) {
            return min + Math.floor(next() * (max - min + 1));
        },
        pick(list) {
            return list[Math.floor(next() * list.length)];
        },
        chance(probability) {
            return next() < probability;
        },
        sample(list, count) {
            const copy = list.slice();
            const result = [];
            while (result.length < count && copy.length) {
                const index = Math.floor(next() * copy.length);
                result.push(copy[index]);
                copy.splice(index, 1);
            }
            return result;
        },
    };
}
