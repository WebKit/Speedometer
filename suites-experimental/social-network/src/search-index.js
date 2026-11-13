// The typeahead's local index: an inverted index over the words of every entry's name,
// with prefix lookup through a sorted term list and typo tolerance through a bounded
// Damerau-Levenshtein distance against terms sharing the first letter. Results are
// ranked by term rarity, match quality, entry type and the viewer's affinity.

const TYPE_BOOST = { user: 3, person: 1.5, group: 2, page: 2, keyword: 1, post: 0.5 };
const SPLIT = /[\s&\-·,.'#]+/;

export function normalizeText(text) {
    return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function tokenize(text) {
    const tokens = [];
    const normalized = normalizeText(text);
    let offset = 0;
    for (const part of normalized.split(SPLIT)) {
        const start = normalized.indexOf(part, offset);
        if (part)
            tokens.push({ term: part, start });
        offset = start + part.length;
    }
    return tokens;
}

export function buildSearchIndex(entries) {
    const postings = new Map();
    const docs = entries.map((entry, doc) => {
        const tokens = tokenize(entry.name);
        tokens.forEach((token, position) => {
            let list = postings.get(token.term);
            if (!list) {
                list = [];
                postings.set(token.term, list);
            }
            list.push({ doc, position, start: token.start });
        });
        return { entry, length: tokens.length };
    });
    const terms = Array.from(postings.keys()).sort();
    const byInitial = new Map();
    for (const term of terms) {
        let list = byInitial.get(term[0]);
        if (!list) {
            list = [];
            byInitial.set(term[0], list);
        }
        list.push(term);
    }
    return { docs, postings, terms, byInitial };
}

function lowerBound(terms, prefix) {
    let low = 0;
    let high = terms.length;
    while (low < high) {
        const mid = (low + high) >>> 1;
        if (terms[mid] < prefix)
            low = mid + 1;
        else
            high = mid;
    }
    return low;
}

// Optimal string alignment distance, giving up as soon as every cell exceeds `max`.
function boundedDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max)
        return max + 1;
    let previous2 = null;
    let previous = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++)
        previous[j] = j;
    for (let i = 1; i <= a.length; i++) {
        const current = new Array(b.length + 1);
        current[0] = i;
        let rowMin = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
            let value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
            if (previous2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
                value = Math.min(value, previous2[j - 2] + 1);
            current[j] = value;
            if (value < rowMin)
                rowMin = value;
        }
        if (rowMin > max)
            return max + 1;
        previous2 = previous;
        previous = current;
    }
    return previous[b.length];
}

function maxEdits(term) {
    if (term.length >= 7)
        return 2;
    return term.length >= 4 ? 1 : 0;
}

// Every indexed term the query term matches, with a quality from 0 to 1. The last query
// term is still being typed, so it also matches as a prefix.
function matchTerm(index, term, isPrefix) {
    const matches = new Map();
    const exact = index.postings.has(term);
    if (exact)
        matches.set(term, 1);
    if (isPrefix) {
        for (let i = lowerBound(index.terms, term); i < index.terms.length && index.terms[i].startsWith(term); i++) {
            if (!matches.has(index.terms[i]))
                matches.set(index.terms[i], 0.8 * (term.length / index.terms[i].length) + 0.1);
        }

    }
    const edits = maxEdits(term);
    if (edits) {
        for (const candidate of index.byInitial.get(term[0]) ?? []) {
            if (matches.has(candidate))
                continue;
            const target = isPrefix && candidate.length > term.length ? candidate.slice(0, term.length) : candidate;
            const distance = boundedDistance(term, target, edits);
            if (distance <= edits)
                matches.set(candidate, (0.5 - distance * 0.15) * (target.length / candidate.length));
        }
    }
    return matches;
}

/**
 * Returns up to `limit` results, each `{ entry, score, highlights }` where highlights are
 * `[start, end]` ranges of the name to emphasize.
 */
export function searchIndex(index, text, limit) {
    const queryTerms = tokenize(text).map((token) => token.term);
    if (!queryTerms.length)
        return [];
    const total = index.docs.length;
    let candidates = null;
    queryTerms.forEach((term, termIndex) => {
        const matches = matchTerm(index, term, termIndex === queryTerms.length - 1);
        const scores = new Map();
        for (const [matched, quality] of matches) {
            const list = index.postings.get(matched);
            const idf = Math.log(1 + total / list.length);
            for (const posting of list) {
                if (candidates && !candidates.has(posting.doc))
                    continue;
                const value = idf * quality * (posting.position === 0 ? 1.2 : 1);
                const best = scores.get(posting.doc);
                if (!best || best.value < value)
                    scores.set(posting.doc, { value, start: posting.start, length: Math.min(term.length, matched.length) });
            }
        }
        const next = new Map();
        for (const [doc, match] of scores) {
            const previous = candidates ? candidates.get(doc) : { score: 0, highlights: [] };
            next.set(doc, { score: previous.score + match.value, highlights: [...previous.highlights, [match.start, match.start + match.length]] });
        }
        candidates = next;
    });
    const results = [];
    for (const [doc, candidate] of candidates) {
        const { entry, length } = index.docs[doc];
        const score = candidate.score / Math.sqrt(length) + TYPE_BOOST[entry.type] + Math.log1p(entry.affinity ?? 0);
        results.push({ entry, score, highlights: candidate.highlights });
    }
    results.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name));
    return results.slice(0, limit);
}
