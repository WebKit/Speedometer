// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "src", "data");

const decadeSummaries = {
    1900: "Frühe mechanische Rechenmaschinen und der Beginn der Lochkartentechnik.",
    1910: "Fortschritte in der Tabelliermaschinen-Technologie und theoretische Konzepte.",
    1920: "Zunehmende Verbreitung elektromechanischer Maschinen.",
    1930: "Die Entwicklung der ersten frei programmierbaren mechanischen Rechner.",
    1940: "Der Durchbruch elektronischer Röhrenrechner und speicherprogrammierbarer Computer.",
    1950: "Der Übergang von Röhren zu Transistoren, kommerzielle Großrechner und erste höhere Sprachen.",
    1960: "Etablierung von Mainframes, integrierte Schaltkreise (Mikrochips) und erste Computernetzwerke.",
    1970: "Die Ära der Mikroprozessoren und die Entstehung der ersten Personal Computer.",
    1980: "Massenverbreitung von PCs, grafische Benutzeroberflächen und das Zeitalter der Heimcomputer.",
    1990: "Der rasante Aufstieg des World Wide Web und massive Steigerung der Taktfrequenzen.",
    2000: "Breitband-Internet, Multi-Core-Prozessoren und Laptops überholen Desktop-PCs.",
    2010: "Das Jahrzehnt der Smartphones, Cloud-Computing, Deep Learning und leistungsstarker GPUs.",
    2020: "Quantencomputer-Meilensteine, allgegenwärtige KI-Modelle und neue Chiplet-Designs.",
};

const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".js"));
let activeDecades = new Set();
let filesByYear = {};

for (const file of files) {
    const year = parseInt(file.replace(".js", ""), 10);
    if (!isNaN(year))
        filesByYear[year] = file;
}

const sortedYears = Object.keys(filesByYear)
    .map(Number)
    .sort((a, b) => a - b);

for (const year of sortedYears) {
    const decade = Math.floor(year / 10) * 10;
    const isFirstInDecade = !activeDecades.has(decade);

    if (isFirstInDecade)
        activeDecades.add(decade);

    const filePath = path.join(dataDir, filesByYear[year]);
    let content = fs.readFileSync(filePath, "utf-8");

    // We can evaluate it by removing export default, parsing as JSON, or eval
    // The files look like: export default [\n  {\n ...\n  },\n ...\n];

    // A safe way to modify the JS since it's just JSON array exported:
    const jsonStr = content.replace(/^export default\s+/, "").replace(/;\s*$/, "");

    try {
        let arr = eval(`(${jsonStr})`);

        if (isFirstInDecade) {
            // keep the header, but modify description
            const header = arr.find((item) => item.type === "header" || item.id.startsWith("header-"));
            if (header) {
                header.description = decadeSummaries[decade] || `Meilensteine der ${decade}er Jahre.`;
                header.title = `Jahrzehnt ${decade}er`;
                header.type = "text"; // store as normal data too
                header.width = 380; // standard width for text card
            }
        } else {
            // remove any old headers
            arr = arr.filter((item) => !(item.type === "header" || item.id.startsWith("header-")));
        }

        const newContent = `export default ${JSON.stringify(arr, null, 4)};\n`;
        fs.writeFileSync(filePath, newContent, "utf-8");
        console.log(`Updated ${year}.js (isFirstInDecade: ${isFirstInDecade})`);
    } catch (e) {
        console.error(`Error parsing ${year}.js:`, e);
    }
}
