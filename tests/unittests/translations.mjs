import expect from "expect.js";
import { todos, defaultTodoText, defaultLanguage, getTodoText } from "../../resources/shared/translations.mjs";

describe("Translations & Localization (`resources/shared/translations.mjs`)", () => {
    const supportedLanguages = ["en", "zh-cn", "ja", "es", "de", "ru", "emoji"];

    describe("todos dictionary integrity", () => {
        it("should contain all supported language keys", () => {
            expect(typeof todos).to.be("object");
            expect(todos).not.to.be(null);
            for (const lang of supportedLanguages) {
                expect(todos).to.have.property(lang);
                expect(Array.isArray(todos[lang])).to.be(true, `Expected array for language ${lang}`);
            }
        });

        it("should have identical dictionary lengths across all supported languages (1-to-1 symmetry)", () => {
            const baseLength = todos.en.length;
            expect(baseLength).to.be.greaterThan(0);

            for (const lang of supportedLanguages)
                expect(todos[lang].length).to.be(baseLength, `Expected language '${lang}' to have exactly ${baseLength} translations, found ${todos[lang].length}`);
        });

        it("should contain only valid non-empty strings in all dictionaries", () => {
            for (const lang of supportedLanguages) {
                for (let i = 0; i < todos[lang].length; i++) {
                    const text = todos[lang][i];
                    expect(text).to.be.a("string", `Expected string at index ${i} for language '${lang}'`);
                    expect(text.trim().length).to.be.greaterThan(0, `Found empty string at index ${i} for language '${lang}'`);
                }
            }
        });
    });

    describe("defaultTodoText dictionary", () => {
        it("should provide default text strings for all supported languages", () => {
            expect(typeof defaultTodoText).to.be("object");
            for (const lang of supportedLanguages) {
                expect(defaultTodoText).to.have.property(lang);
                expect(defaultTodoText[lang]).to.be.a("string");
                expect(defaultTodoText[lang].trim().length).to.be.greaterThan(0);
            }
        });
    });

    describe("defaultLanguage", () => {
        it("should export 'en' as defaultLanguage", () => {
            expect(defaultLanguage).to.be("en");
        });
    });

    describe("getTodoText() helper", () => {
        it("should return exact todo item when index is within bounds", () => {
            expect(getTodoText("en", 0)).to.be(todos.en[0]);
            expect(getTodoText("ja", 5)).to.be(todos.ja[5]);
            expect(getTodoText("de", 10)).to.be(todos.de[10]);
        });

        it("should wrap index modulo dictionary length when index exceeds length", () => {
            const len = todos.en.length;
            expect(getTodoText("en", len)).to.be(todos.en[0]);
            expect(getTodoText("en", len + 3)).to.be(todos.en[3]);
            expect(getTodoText("es", len * 2 + 7)).to.be(todos.es[7]);
        });

        it("should fall back to 'en' when lang parameter is not passed or undefined", () => {
            expect(getTodoText(undefined, 2)).to.be(todos.en[2]);
        });
    });
});
