import "@testing-library/jest-dom/extend-expect";

import crypto from "crypto";

Object.defineProperty(globalThis, "crypto", {
    value: {
        randomUUID: () => crypto.randomUUID(),
    },
});
