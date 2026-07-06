import m from "mithril";

let currentLanguage = "DE";

const translations = {
    DE: {
        "title": "Geschichte des Computers",
        "filter": "Filter:",
        "year": "Jahr",
        "transistors": "Transistoren:",
        "clockSpeed": "Taktfrequenz:",
        "memory": "Speicher:",
        "wikipedia": "Wikipedia ↗"
    },
    FR: {
        "title": "Histoire de l'informatique",
        "filter": "Filtrer :",
        "year": "Année",
        "transistors": "Transistors :",
        "clockSpeed": "Fréquence d'horloge :",
        "memory": "Mémoire :",
        "wikipedia": "Wikipédia ↗"
    },
    IT: {
        "title": "Storia del computer",
        "filter": "Filtra:",
        "year": "Anno",
        "transistors": "Transistor:",
        "clockSpeed": "Frequenza di clock:",
        "memory": "Memoria:",
        "wikipedia": "Wikipedia ↗"
    }
};

export function getLanguage() {
    return currentLanguage;
}

export function setLanguage(lang) {
    if (currentLanguage !== lang) {
        currentLanguage = lang;
        m.redraw();
    }
}

export function t(key) {
    return translations[currentLanguage][key] || translations["DE"][key] || key;
}

export function translateContent(field) {
    if (!field) return "";
    if (typeof field === "object") {
        return field[currentLanguage] || field.DE || Object.values(field)[0] || "";
    }
    return field;
}
