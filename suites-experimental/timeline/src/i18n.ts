// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

import m from "mithril";

export type Language = "DE" | "FR" | "IT" | "ZH" | "JP";

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
    ZH: {
        title: "電腦歷史",
        subtitle: "1900 - 2026",
        filter: "篩選：",
        transistors: "電晶體：",
        clockSpeed: "時脈頻率：",
        memory: "記憶體：",
        year: "年份",
        cpu: "CPU：",
        gpu: "GPU：",
        tpu: "TPU：",
        // Category tags
        cat_hardware: "硬體",
        cat_software: "軟體",
        cat_consumer: "消費級",
        cat_networking: "網路",
        cat_web: "Web 與網際網路",
        cat_milestone: "里程碑",
        cat_gaming: "遊戲",
        cat_art: "藝術",
        cat_military: "軍事",
        cat_politics: "政治",
        cat_medicine: "醫療",
        cat_science: "科學",
        cat_default: "常規",
        wikipedia: "維基百科 ↗",
        searchPlaceholder: "搜尋...",
        suggestionsTitle: "建議",
        noMatches: "沒有找到匹配項",
    },
    JP: {
        title: "コンピューターの歴史",
        subtitle: "1900 - 2026",
        filter: "フィルター:",
        transistors: "トランジスタ:",
        clockSpeed: "クロック周波数:",
        memory: "メモリ:",
        year: "年",
        cpu: "CPU:",
        gpu: "GPU:",
        tpu: "TPU:",
        // Category tags
        cat_hardware: "ハードウェア",
        cat_software: "ソフトウェア",
        cat_consumer: "コンシューマー",
        cat_networking: "ネットワーク",
        cat_web: "Web & インターネット",
        cat_milestone: "マイルストーン",
        cat_gaming: "ゲーム",
        cat_art: "アート",
        cat_military: "軍事",
        cat_politics: "政治",
        cat_medicine: "医療",
        cat_science: "科学",
        cat_default: "一般",
        wikipedia: "Wikipedia ↗",
        searchPlaceholder: "検索...",
        suggestionsTitle: "候補",
        noMatches: "一致する結果が見つかりません",
    },
};

export type TranslationKey = keyof (typeof translations)["DE"];

export const t = (key: TranslationKey | string): string => {
    const langObj = translations[activeLanguage] || translations["DE"];
    return langObj[key as TranslationKey] || translations["DE"][key as TranslationKey] || key;
};

export function translateContent(field: any): string {
    if (!field)
        return "";
    if (typeof field === "object") {
        const lang = activeLanguage;
        if (field[lang])
            return field[lang];
        if (lang === "JP" && field.JA)
            return field.JA;
        if (lang === "ZH" && field.TW)
            return field.TW;
        if (field.ZH)
            return field.ZH;
        if (field.TW)
            return field.TW;
        return field.DE || Object.values(field)[0] || "";
    }
    return String(field);
}
