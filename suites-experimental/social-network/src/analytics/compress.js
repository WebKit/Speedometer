// Log batches are compressed on the client before upload, which keeps the beacon
// small on slow networks. LZW with growing code widths, packed into URL-safe base64.

const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

class BitWriter {
    constructor() {
        this.output = [];
        this.buffer = 0;
        this.bits = 0;
    }

    write(value, width) {
        for (let i = 0; i < width; i++) {
            this.buffer = (this.buffer << 1) | ((value >>> i) & 1);
            this.bits++;
            if (this.bits === 6) {
                this.output.push(BASE64[this.buffer]);
                this.buffer = 0;
                this.bits = 0;
            }
        }
    }

    finish() {
        if (this.bits)
            this.output.push(BASE64[this.buffer << (6 - this.bits)]);
        return this.output.join("");
    }
}

export function compressToString(input) {
    if (!input)
        return "";
    const dictionary = new Map();
    let nextCode = 65536 + 1;
    let width = 17;
    const writer = new BitWriter();
    let phrase = input[0];
    for (let i = 1; i < input.length; i++) {
        const char = input[i];
        const candidate = phrase + char;
        if (dictionary.has(candidate)) {
            phrase = candidate;
            continue;
        }
        writer.write(phrase.length === 1 ? phrase.charCodeAt(0) : dictionary.get(phrase), width);
        dictionary.set(candidate, nextCode++);
        if (nextCode >= 1 << width)
            width++;
        phrase = char;
    }
    writer.write(phrase.length === 1 ? phrase.charCodeAt(0) : dictionary.get(phrase), width);
    writer.write(65536, width);
    return writer.finish();
}

let crcTable = null;

export function crc32(text) {
    if (!crcTable) {
        crcTable = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++)
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            crcTable[n] = c >>> 0;
        }
    }
    let crc = 0xffffffff;
    for (let i = 0; i < text.length; i++)
        crc = crcTable[(crc ^ text.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}
