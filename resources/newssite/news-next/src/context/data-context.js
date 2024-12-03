import { createContext, useContext } from "react";
import { dataSource } from "../data";

import { v4 as uuidv4 } from "uuid";

const RTL_LOCALES = ["ar", "he", "fa", "ps", "ur"];
const DEFAULT_LANG = "en";
const DEFAULT_DIR = "ltr";

const DataContext = createContext(null);

export const DataContextProvider = ({ children }) => {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get("lang")?.toLowerCase();
    const lang = langFromUrl && langFromUrl in dataSource ? langFromUrl : DEFAULT_LANG;
    const dir = lang && RTL_LOCALES.includes(lang) ? "rtl" : DEFAULT_DIR;

    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);

    const { content } = dataSource[lang];

    const selected = Object.create(null);
    Object.keys(content).forEach((key) => {
        const { sections } = content[key];
        const selectedSections = [];

        for (let i = 0; i < sections.length; i++) {
            const selectedSection = { ...sections[i] };
            selectedSections.push(selectedSection);

            const { articles } = selectedSections[i];
            for (let j = 0; j < articles.length; j++) {
                articles[j].id = uuidv4();
                const { content } = articles[j];
                if (Array.isArray(content)) {
                    for (let k = 0; k < content.length; k++)
                        content[k].id = uuidv4();
                }

            }
        }

        selected[key] = {
            ...content[key],
            sections: selectedSections,
        };
    });

    const value = {
        lang,
        dir,
        ...dataSource[lang],
        content: selected,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
    const dataContext = useContext(DataContext);

    if (!dataContext)
        throw new Error("A DataProvider must be rendered before using useDataContext");

    return dataContext;
};
