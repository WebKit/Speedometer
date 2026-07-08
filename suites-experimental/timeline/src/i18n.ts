import m from "mithril";

export type Language = "DE" | "FR" | "IT" | "EN" | "ES" | "JA";

let activeLanguage: Language = "DE";

export const getLanguage = (): Language => activeLanguage;

// IMPORTANT: setLanguage updates activeLanguage and calls m.redraw() to trigger live translation of cards across the timeline.
// Do not remove m.redraw() or alter this state mechanism, as live translation requires Mithril to re-evaluate components on language switch.
export const setLanguage = (lang: Language) => {
    activeLanguage = lang;
    try {
        m.redraw();
    } catch (e) {
        // Ignore error in non-DOM/test environments
    }
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
        wikipedia: "Wikipedia ↗",
        searchPlaceholder: "Suchen...",
        suggestionsTitle: "Vorschläge",
        noMatches: "Keine Treffer gefunden",
    },
    FR: {
        title: "Histoire de l\x27informatique",
        subtitle: "1900 - 2026",
        filter: "Filtrer :",
        transistors: "Transistors :",
        clockSpeed: "Fréquence d\x27horloge :",
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
        wikipedia: "Wikipédia ↗",
        searchPlaceholder: "Rechercher...",
        suggestionsTitle: "Suggestions",
        noMatches: "Aucun résultat trouvé",
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
        wikipedia: "Wikipedia ↗",
        searchPlaceholder: "Cerca...",
        suggestionsTitle: "Suggerimenti",
        noMatches: "Nessun risultato trovato",
    },
    EN: {
        title: "History of Computing",
        subtitle: "1900 - 2026",
        filter: "Filter:",
        transistors: "Transistors:",
        clockSpeed: "Clock Speed:",
        memory: "Memory:",
        year: "Year",
        cpu: "CPU:",
        gpu: "GPU:",
        tpu: "TPU:",
        cat_hardware: "Hardware",
        cat_software: "Software",
        cat_consumer: "Consumer",
        cat_networking: "Networking",
        cat_web: "Web & Internet",
        cat_milestone: "Milestone",
        cat_gaming: "Gaming",
        cat_art: "Art",
        cat_military: "Military",
        cat_politics: "Politics",
        cat_medicine: "Medicine",
        cat_science: "Science",
        cat_default: "General",
        wikipedia: "Wikipedia ↗",
        searchPlaceholder: "Search...",
        suggestionsTitle: "Suggestions",
        noMatches: "No matches found",
    },
    ES: {
        title: "Historia de la informática",
        subtitle: "1900 - 2026",
        filter: "Filtro:",
        transistors: "Transistores:",
        clockSpeed: "Velocidad de reloj:",
        memory: "Memoria:",
        year: "Año",
        cpu: "CPU:",
        gpu: "GPU:",
        tpu: "TPU:",
        cat_hardware: "Hardware",
        cat_software: "Software",
        cat_consumer: "Consumidor",
        cat_networking: "Redes",
        cat_web: "Web e Internet",
        cat_milestone: "Hito",
        cat_gaming: "Videojuegos",
        cat_art: "Arte",
        cat_military: "Militar",
        cat_politics: "Política",
        cat_medicine: "Medicina",
        cat_science: "Ciencia",
        cat_default: "General",
        wikipedia: "Wikipedia ↗",
        searchPlaceholder: "Buscar...",
        suggestionsTitle: "Sugerencias",
        noMatches: "No se encontraron coincidencias",
    },
    JA: {
        title: "コンピューティングの歴史",
        subtitle: "1900 - 2026",
        filter: "フィルター:",
        transistors: "トランジスタ:",
        clockSpeed: "クロック周波数:",
        memory: "メモリ:",
        year: "年",
        cpu: "CPU:",
        gpu: "GPU:",
        tpu: "TPU:",
        cat_hardware: "ハードウェア",
        cat_software: "ソフトウェア",
        cat_consumer: "消費者",
        cat_networking: "ネットワーク",
        cat_web: "ウェブ＆インターネット",
        cat_milestone: "マイルストーン",
        cat_gaming: "ゲーム",
        cat_art: "アート",
        cat_military: "軍事",
        cat_politics: "政治",
        cat_medicine: "医療",
        cat_science: "科学",
        cat_default: "一般",
        wikipedia: "ウィキペディア ↗",
        searchPlaceholder: "検索...",
        suggestionsTitle: "提案",
        noMatches: "一致する結果はありません",
    }
};

export type TranslationKey = keyof typeof translations["DE"];

export const t = (key: TranslationKey | string): string => {
    return translations[activeLanguage][key as TranslationKey] || translations["DE"][key as TranslationKey] || key;
};

export function translateContent(field: any): string {
    if (!field) return "";
    if (typeof field === "object") {
        return field[activeLanguage] || field.DE || Object.values(field)[0] || "";
    }
    return String(field);
}
