import expect from "expect.js";
import sinon from "sinon";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ROOT_DIR = path.resolve(__dirname, "../");

export function sh(command, options = {}) {
    return execSync(command, {
        cwd: ROOT_DIR,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"],
        ...options,
    });
}

globalThis.expect = expect;
globalThis.sinon = sinon;
globalThis.sh = sh;
globalThis.ROOT_DIR = ROOT_DIR;

export const mochaHooks = {
    afterEach() {
        sinon.restore();
    },
};
