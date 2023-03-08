import { useSanitizer } from "./use-sanitizer.js";

describe("useSanitizer", () => {
    const { sanitize } = useSanitizer();

    it("should not change valid string", () => {
        expect(sanitize("hello")).toEqual("hello");
    });

    it("should escape unsafe characters", () => {
        expect(sanitize("<script>")).toEqual("&lt;script&gt;");
    });
});
