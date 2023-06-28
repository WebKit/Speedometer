import { createContext, useContext } from "react";
import { content as contentEn } from "@/data/en/content";
import { settings as settingsEn } from "@/data/en/dialog";
import { footer as footerEn } from "@/data/en/footer";
import * as buttonsEn from "@/data/en/buttons";
import * as linksEn from "@/data/en/links";

const contentImport = { en: contentEn };
const settingsImport = { en: settingsEn };
const footerImport = { en: footerEn };
const buttonsImport = { en: buttonsEn };
const linksImport = { en: linksEn };

const DataContext = createContext(null);

export const DataContextProvider = ({ children }) => {
    const defaultLanguage = "en";
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get("lang") ?? "en";
    const dir = urlParams.get("dir") ?? "ltr";

    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", defaultLanguage);

    const value = {
        lang,
        dir,
        content: contentImport[lang] ?? contentImport[defaultLanguage],
        settings: settingsImport[lang] ?? settingsImport[defaultLanguage],
        buttons: buttonsImport[lang] ?? buttonsImport[defaultLanguage],
        links: linksImport[lang] ?? linksImport[defaultLanguage],
        footer: footerImport[lang] ?? footerImport[defaultLanguage],
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
    const dataContext = useContext(DataContext);

    if (!dataContext)
        throw new Error("A DataProvider must be rendered before using useDataContext");

    return dataContext;
};
