import expect from "expect.js";
import sinon from "sinon";

globalThis.expect = expect;
globalThis.sinon = sinon;

export const mochaHooks = {
    afterEach() {
        sinon.restore();
    },
};
