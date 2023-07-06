import { createContext, useContext } from "react";

import { content as contentEn } from "@/data/en/content";
import { content as contentJp } from "@/data/jp/content";
import { content as contentAr } from "@/data/ar/content";

import { settings as settingsEn } from "@/data/en/dialog";
import { settings as settingsJp } from "@/data/jp/dialog";
import { settings as settingsAr } from "@/data/ar/dialog";

import { footer as footerEn } from "@/data/en/footer";
import { footer as footerJp } from "@/data/jp/footer";
import { footer as footerAr } from "@/data/ar/footer";

import * as buttonsEn from "@/data/en/buttons";
import * as buttonsJp from "@/data/jp/buttons";
import * as buttonsAr from "@/data/ar/buttons";

import * as linksEn from "@/data/en/links";
import * as linksJp from "@/data/jp/links";
import * as linksAr from "@/data/ar/links";

const strings = {
    en: {
        content: contentEn,
        settings: settingsEn,
        footer: footerEn,
        buttons: buttonsEn,
        links: linksEn,
    },
    jp: {
        content: contentJp,
        settings: settingsJp,
        footer: footerJp,
        buttons: buttonsJp,
        links: linksJp,
    },
    ar: {
        content: contentAr,
        settings: settingsAr,
        footer: footerAr,
        buttons: buttonsAr,
        links: linksAr,
    },
};

const DataContext = createContext(null);

export const DataContextProvider = ({ children }) => {
    const defaultLanguage = "en";
    const urlParams = new URLSearchParams(window.location.search);
    const dir = urlParams.get("dir") ?? "ltr";
    const langFromUrl = urlParams.get("lang");
    const lang = langFromUrl && langFromUrl in strings ? langFromUrl : defaultLanguage;

    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);

    const value = {
        lang,
        dir,
        ...strings[lang],
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
    const dataContext = useContext(DataContext);

    if (!dataContext)
        throw new Error("A DataProvider must be rendered before using useDataContext");

    return dataContext;
};
