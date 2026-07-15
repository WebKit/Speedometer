// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

// Central source of truth for all timeline category tags, their translations and styling.

export const TAGS = {
    hardware: { id: "hardware", label: { DE: "Hardware", FR: "Matériel", IT: "Hardware", TW: "硬體", JP: "ハードウェア" }, color: "#38bdf8", bgColor: "rgba(56, 189, 248, 0.1)" },
    software: { id: "software", label: { DE: "Software", FR: "Logiciel", IT: "Software", TW: "軟體", JP: "ソフトウェア" }, color: "#34d399", bgColor: "rgba(52, 211, 153, 0.1)" },
    consumer: { id: "consumer", label: { DE: "Konsumenten", FR: "Grand public", IT: "Consumer", TW: "消費級", JP: "コンシューマー" }, color: "#c084fc", bgColor: "rgba(192, 132, 252, 0.1)" },
    networking: { id: "networking", label: { DE: "Netzwerk", FR: "Réseau", IT: "Networking", TW: "網路通訊", JP: "ネットワーク" }, color: "#fbbf24", bgColor: "rgba(251, 191, 36, 0.1)" },
    web: { id: "web", label: { DE: "Web & Internet", FR: "Web & Internet", IT: "Web & Internet", TW: "Web 與網際網路", JP: "Web & インターネット" }, color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.1)" },
    milestone: { id: "milestone", label: { DE: "Meilenstein", FR: "Jalon", IT: "Pietra miliare", TW: "里程碑", JP: "マイルストーン" }, color: "#f87171", bgColor: "rgba(248, 113, 113, 0.1)" },
    gaming: { id: "gaming", label: { DE: "Spiele", FR: "Jeux", IT: "Gaming", TW: "遊戲", JP: "ゲーム" }, color: "#ec4899", bgColor: "rgba(236, 72, 153, 0.1)" },
    art: { id: "art", label: { DE: "Kunst", FR: "Art", IT: "Arte", TW: "藝術", JP: "アート" }, color: "#f97316", bgColor: "rgba(249, 115, 22, 0.1)" },
    military: { id: "military", label: { DE: "Militär", FR: "Militaire", IT: "Militare", TW: "軍事", JP: "軍事" }, color: "#64748b", bgColor: "rgba(100, 116, 139, 0.1)" },
    politics: { id: "politics", label: { DE: "Politik", FR: "Politique", IT: "Politica", TW: "政治", JP: "政治" }, color: "#e11d48", bgColor: "rgba(225, 29, 72, 0.1)" },
    medicine: { id: "medicine", label: { DE: "Medizin", FR: "Médecine", IT: "Medicina", TW: "醫療", JP: "医療" }, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" },
    science: { id: "science", label: { DE: "Wissenschaft", FR: "Science", IT: "Scienza", TW: "科學", JP: "科学" }, color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.1)" },
    ai: { id: "ai", label: { DE: "Künstliche Intelligenz", FR: "Intelligence Artificielle", IT: "Intelligenza Artificiale", TW: "人工智慧", JP: "人工知能" }, color: "#818cf8", bgColor: "rgba(129, 140, 248, 0.1)" },
    theory: { id: "theory", label: { DE: "Theorie & Konzepte", FR: "Théorie & Concepts", IT: "Teoria & Concetti", TW: "理論與概念", JP: "理論 & コンセプト" }, color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)" },
    security: { id: "security", label: { DE: "Sicherheit", FR: "Sécurité", IT: "Sicurezza", TW: "資訊安全", JP: "セキュリティ" }, color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)" },
    robotics: { id: "robotics", label: { DE: "Robotik", FR: "Robotique", IT: "Robotica", TW: "機器人技術", JP: "ロボティクス" }, color: "#14b8a6", bgColor: "rgba(20, 184, 166, 0.1)" },
    space: { id: "space", label: { DE: "Raumfahrt", FR: "Espace", IT: "Spazio", TW: "航太科技", JP: "宇宙開発" }, color: "#6366f1", bgColor: "rgba(99, 102, 241, 0.1)" },
    data: { id: "data", label: { DE: "Daten", FR: "Données", IT: "Dati", TW: "資料與數據", JP: "データ" }, color: "#0ea5e9", bgColor: "rgba(14, 165, 233, 0.1)" },
    cloud: { id: "cloud", label: { DE: "Cloud", FR: "Cloud", IT: "Cloud", TW: "雲端運算", JP: "クラウド" }, color: "#38bdf8", bgColor: "rgba(56, 189, 248, 0.1)" },
    mobile: { id: "mobile", label: { DE: "Mobil", FR: "Mobile", IT: "Mobile", TW: "行動裝置", JP: "モバイル" }, color: "#d946ef", bgColor: "rgba(217, 70, 239, 0.1)" },
    algorithm: { id: "algorithm", label: { DE: "Algorithmen", FR: "Algorithmes", IT: "Algoritmi", TW: "演算法", JP: "アルゴリズム" }, color: "#f97316", bgColor: "rgba(249, 115, 22, 0.1)" },
    language: { id: "language", label: { DE: "Sprache", FR: "Langage", IT: "Linguaggio", TW: "程式語言", JP: "プログラミング言語" }, color: "#84cc16", bgColor: "rgba(132, 204, 22, 0.1)" },
    math: { id: "math", label: { DE: "Mathematik", FR: "Mathématiques", IT: "Matematica", TW: "數學", JP: "数学" }, color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.1)" },
    people: { id: "people", label: { DE: "Personen", FR: "Personnes", IT: "Persone", TW: "重要人物", JP: "人物" }, color: "#f43f5e", bgColor: "rgba(244, 63, 94, 0.1)" },
    company: { id: "company", label: { DE: "Unternehmen", FR: "Entreprise", IT: "Azienda", TW: "企業組織", JP: "企業" }, color: "#64748b", bgColor: "rgba(100, 116, 139, 0.1)" },
    law: { id: "law", label: { DE: "Recht", FR: "Droit", IT: "Legge", TW: "法律規範", JP: "法律 & 規制" }, color: "#e11d48", bgColor: "rgba(225, 29, 72, 0.1)" },
    business: { id: "business", label: { DE: "Wirtschaft", FR: "Affaires", IT: "Business", TW: "商業與經濟", JP: "ビジネス" }, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" },
    media: { id: "media", label: { DE: "Medien", FR: "Médias", IT: "Media", TW: "多媒體", JP: "メディア" }, color: "#ec4899", bgColor: "rgba(236, 72, 153, 0.1)" },
    entertainment: { id: "entertainment", label: { DE: "Unterhaltung", FR: "Divertissement", IT: "Intrattenimento", TW: "娛樂產業", JP: "エンターテインメント" }, color: "#d946ef", bgColor: "rgba(217, 70, 239, 0.1)" },
    music: { id: "music", label: { DE: "Musik", FR: "Musique", IT: "Musica", TW: "音樂", JP: "音楽" }, color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.1)" },
    film: { id: "film", label: { DE: "Film", FR: "Film", IT: "Film", TW: "電影與影像", JP: "映画 & 映像" }, color: "#f43f5e", bgColor: "rgba(244, 63, 94, 0.1)" },
    network: { id: "network", label: { DE: "Netzwerk", FR: "Réseau", IT: "Rete", TW: "網路架構", JP: "ネットワーク" }, color: "#fbbf24", bgColor: "rgba(251, 191, 36, 0.1)" },
    os: { id: "os", label: { DE: "Betriebssystem", FR: "Système d'exploitation", IT: "Sistema operativo", TW: "作業系統", JP: "OS" }, color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.1)" },
    internet: { id: "internet", label: { DE: "Internet", FR: "Internet", IT: "Internet", TW: "網際網路", JP: "インターネット" }, color: "#38bdf8", bgColor: "rgba(56, 189, 248, 0.1)" },
    ethics: { id: "ethics", label: { DE: "Ethik", FR: "Éthique", IT: "Etica", TW: "倫理道德", JP: "倫理" }, color: "#e11d48", bgColor: "rgba(225, 29, 72, 0.1)" },
    crypto: { id: "crypto", label: { DE: "Kryptografie", FR: "Cryptographie", IT: "Crittografia", TW: "密碼學", JP: "暗号技術" }, color: "#6366f1", bgColor: "rgba(99, 102, 241, 0.1)" },
    quantum: { id: "quantum", label: { DE: "Quanten", FR: "Quantique", IT: "Quantistica", TW: "量子計算", JP: "量子コンピュータ" }, color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.1)" },
    policy: { id: "policy", label: { DE: "Richtlinien", FR: "Politique", IT: "Politica", TW: "政策規範", JP: "ポリシー & 規制" }, color: "#64748b", bgColor: "rgba(100, 116, 139, 0.1)" },
    education: { id: "education", label: { DE: "Bildung", FR: "Éducation", IT: "Istruzione", TW: "教育普及", JP: "教育" }, color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" },
    research: { id: "research", label: { DE: "Forschung", FR: "Recherche", IT: "Ricerca", TW: "學術研究", JP: "研究開発" }, color: "#84cc16", bgColor: "rgba(132, 204, 22, 0.1)" },
    default: { id: "default", label: { DE: "Allgemein", FR: "Général", IT: "Generale", TW: "常規", JP: "一般" }, color: "#94a3b8", bgColor: "rgba(148, 163, 184, 0.1)" },
};

export { getPreciseYear, calculateDensityCurve, getDensityAtYear } from "./density.js";
