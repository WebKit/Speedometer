import { useValidators } from "./use-validators.js";

describe("useValidators", function () {
    const { hasValidName, hasValidEmail, hasValidMin, hasValidMax, hasValidRange, hasValidRequired } = useValidators();

    describe("hasValidName", function () {
        it("should pass with valid input", function () {
            expect(hasValidName("test")).toBeTruthy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidName("*$(")).toBeFalsy();
        });
    });

    describe("hasValidEmail", function () {
        it("should pass with valid input", function () {
            expect(hasValidEmail("test@test.com")).toBeTruthy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidEmail("@test.com")).toBeFalsy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidEmail("test.com")).toBeFalsy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidEmail("test@")).toBeFalsy();
        });
    });

    describe("hasValidMin", function () {
        it("should pass with valid input", function () {
            expect(hasValidMin("hello", 2)).toBeTruthy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidMin("hi", 4)).toBeFalsy();
        });
    });

    describe("hasValidMax", function () {
        it("should pass with valid input", function () {
            expect(hasValidMax("hello", 10)).toBeTruthy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidMax("hello", 4)).toBeFalsy();
        });
    });

    describe("hasValidRange", function () {
        it("should pass with valid input", function () {
            expect(hasValidRange("hello", 2, 10)).toBeTruthy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidRange("hi", 4, 10)).toBeFalsy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidRange("hello", 2, 4)).toBeFalsy();
        });
    });

    describe("hasValidRequired", function () {
        it("should pass with valid input", function () {
            expect(hasValidRequired(true)).toBeTruthy();
        });

        it("should pass with valid input", function () {
            expect(hasValidRequired("test")).toBeTruthy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidRequired(false)).toBeFalsy();
        });

        it("should fail with invalid input", function () {
            expect(hasValidRequired("")).toBeFalsy();
        });
    });
});
