import { createContext, useContext } from "react";
import { content as contentEn } from "@/data/en/content";
import { settings as settingsEn } from "@/data/en/dialog";
import { footer as footerEn } from "@/data/en/footer";
import * as buttonsEn from "@/data/en/buttons";
import * as linksEn from "@/data/en/links";

const strings = {
    en: {
        content: contentEn,
        settings: settingsEn,
        footer: footerEn,
        buttons: buttonsEn,
        links: linksEn,
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
