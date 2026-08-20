// The height model behind the windowed timeline: estimate, measure, cache,
// correct. Offsets are prefix sums over a mix of measured and estimated heights,
// rebuilt from the earliest row that changed, which is what turns a scroll offset
// back into a row index without touching the DOM.
//
// Hand-rolled because a chat row's height depends on how its text wraps, which a
// generic virtualizer expects to know up front.

// A negative height means "not measured yet". 0 is reachable -- a conditionally
// collapsed row measures 0px -- and has to stay measured, or it would be
// re-measured on every pass forever.
const UNMEASURED = -1;

export class RowHeights {
    #estimate;
    #count;
    #heights;
    #offsets;

    // The oldest loaded row. The model covers [#first, #count); older rows
    // contribute no height because they are not in the timeline yet.
    #first;

    // Earliest row whose offset needs recomputing: changing row i only moves the
    // rows after it. #count + 1 means everything is up to date.
    #dirtyFrom;

    constructor(count, first, estimate) {
        this.#estimate = estimate;
        this.#count = count;
        this.#first = first;
        this.#heights = new Float64Array(count).fill(UNMEASURED);
        this.#offsets = new Float64Array(count + 1);
        this.#dirtyFrom = first;
    }

    get count() {
        return this.#count;
    }

    get first() {
        return this.#first;
    }

    // Load older history. Measured heights stay valid because a row keeps its
    // index: the offsets all shift by the height of the rows that were added,
    // which is what lets the scroll position be corrected exactly.
    extendTo(first) {
        if (first >= this.#first)
            return;
        this.#first = first;
        this.#dirtyFrom = first;
    }

    // A room only ever grows at the end, when the local user sends, so every
    // measured height and every offset up to the old end survives.
    grow(count) {
        if (count <= this.#count)
            return;

        const heights = new Float64Array(count);
        heights.set(this.#heights);
        heights.fill(UNMEASURED, this.#count);
        const offsets = new Float64Array(count + 1);
        offsets.set(this.#offsets);

        this.#dirtyFrom = Math.min(this.#dirtyFrom, this.#count);
        this.#heights = heights;
        this.#offsets = offsets;
        this.#count = count;
    }

    heightAt(index) {
        const height = this.#heights[index];
        return height === UNMEASURED ? this.#estimate : height;
    }

    // Returns whether the cached height moved, so a caller that read offsets
    // before the pass knows they are now stale.
    measure(index, height) {
        if (this.#heights[index] === height)
            return false;
        this.#heights[index] = height;
        if (index < this.#dirtyFrom)
            this.#dirtyFrom = index;
        return true;
    }

    offsetAt(index) {
        this.#recomputeOffsets();
        return this.#offsets[index];
    }

    get totalHeight() {
        this.#recomputeOffsets();
        return this.#offsets[this.#count];
    }

    // The row containing a content offset, clamped at both ends.
    indexAt(offset) {
        this.#recomputeOffsets();
        const offsets = this.#offsets;
        let low = this.#first;
        let high = this.#count - 1;
        while (low < high) {
            const middle = (low + high + 1) >> 1;
            if (offsets[middle] <= offset)
                low = middle;
            else
                high = middle - 1;
        }
        return Math.max(this.#first, low);
    }

    #recomputeOffsets() {
        if (this.#dirtyFrom > this.#count)
            return;
        const offsets = this.#offsets;
        // Offsets run from the oldest loaded row, which is the origin the
        // scroller's own coordinates line up with.
        offsets[this.#first] = 0;
        for (let i = this.#dirtyFrom; i < this.#count; i++)
            offsets[i + 1] = offsets[i] + this.heightAt(i);
        this.#dirtyFrom = this.#count + 1;
    }
}
