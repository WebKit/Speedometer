import m from "mithril";

export type Language = "DE" | "FR" | "IT";

let activeLanguage: Language = "DE";

export const getLanguage = (): Language => activeLanguage;

export const setLanguage = (lang: Language) => {
    activeLanguage = lang;
    m.redraw();
};

export const translations = {
    DE: {
        title: "Geschichte des Computers",
        subtitle: "1900 - 2026",
        filter: "Filter:",
        transistors: "Transistoren:",
        clockSpeed: "Taktfrequenz:",
        memory: "Speicher:",
        year: "Jahr",
        cpu: "CPU:",
        gpu: "GPU:",
        tpu: "TPU:",
        // Category tags
        cat_hardware: "Hardware",
        cat_software: "Software",
        cat_consumer: "Konsumenten",
        cat_networking: "Netzwerk",
        cat_web: "Web & Internet",
        cat_milestone: "Meilenstein",
        cat_gaming: "Spiele",
        cat_art: "Kunst",
        cat_military: "Militär",
        cat_politics: "Politik",
        cat_medicine: "Medizin",
        cat_science: "Wissenschaft",
        cat_default: "Allgemein",
    },
    FR: {
        title: "Histoire de l'informatique",
        subtitle: "1900 - 2026",
        filter: "Filtrer :",
        transistors: "Transistors :",
        clockSpeed: "Fréquence d'horloge :",
        memory: "Mémoire :",
        year: "Année",
        cpu: "Processeur :",
        gpu: "Processeur graphique :",
        tpu: "Processeur de tenseurs :",
        // Category tags
        cat_hardware: "Matériel",
        cat_software: "Logiciel",
        cat_consumer: "Grand public",
        cat_networking: "Réseau",
        cat_web: "Web & Internet",
        cat_milestone: "Jalon",
        cat_gaming: "Jeux",
        cat_art: "Art",
        cat_military: "Militaire",
        cat_politics: "Politique",
        cat_medicine: "Médecine",
        cat_science: "Science",
        cat_default: "Général",
    },
    IT: {
        title: "Storia del computer",
        subtitle: "1900 - 2026",
        filter: "Filtro:",
        transistors: "Transistori:",
        clockSpeed: "Frequenza di clock:",
        memory: "Memoria:",
        year: "Anno",
        cpu: "CPU:",
        gpu: "GPU:",
        tpu: "TPU:",
        // Category tags
        cat_hardware: "Hardware",
        cat_software: "Software",
        cat_consumer: "Consumatori",
        cat_networking: "Rete",
        cat_web: "Web & Internet",
        cat_milestone: "Pietra miliare",
        cat_gaming: "Giochi",
        cat_art: "Arte",
        cat_military: "Militare",
        cat_politics: "Politica",
        cat_medicine: "Medicina",
        cat_science: "Scienza",
        cat_default: "Generale",
    }
};

export type TranslationKey = keyof typeof translations["DE"];

export const t = (key: TranslationKey): string => {
    return translations[activeLanguage][key] || translations["DE"][key] || key;
};
