import { provide } from "vue";
import { useHead } from "#imports";
import { content as contentEn } from "~/data/en/content";
import { settings as settingsEn } from "~/data/en/dialog";
import { footer as footerEn } from "~/data/en/footer";
import * as buttonsEn from "~/data/en/buttons";
import * as linksEn from "~/data/en/links";

const strings = {
    en: {
        content: contentEn,
        settings: settingsEn,
        footer: footerEn,
        buttons: buttonsEn,
        links: linksEn,
    },
};

export function provideLocale() {
    const defaultLanguage = "en";
    const urlParams = new URLSearchParams(window.location.search);
    const dir = urlParams.get("dir") ?? "ltr";
    const langFromUrl = urlParams.get("lang");
    const lang = langFromUrl && langFromUrl in strings ? langFromUrl : defaultLanguage;

    useHead({
        htmlAttrs: { dir, lang },
    });

    const value = {
        lang,
        dir,
        ...strings[lang],
    };

    provide("data", value);
}
