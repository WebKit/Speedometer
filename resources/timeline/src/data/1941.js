export default [
    {
        id: "card-1941-10-15",
        date: "1941-10-15",
        title: {
            DE: "Zuse Z3 – Der erste funktionsfähige Computer der Welt",
            FR: "Zuse Z3 - Le premier ordinateur fonctionnel au monde",
            IT: "Zuse Z3 - Il primo computer funzionante al mondo",
        },
        description: {
            DE: "Mit der Vorstellung der **Zuse Z3** in Berlin präsentierte **Konrad Zuse** den ersten vollautomatischen, programmierbaren und programmgesteuerten digitalen **Rechenautomaten** der Welt. Die Z3 bestand aus ca. 2.000 **elektromagnetischen Relais** (600 im Rechenwerk, 1.400 im Speicherwerk). Sie arbeitete mit binärer Gleitkomma-Arithmetik und las Programme von gelochtem 35mm-Kinofilm. Im Gegensatz zum späteren ENIAC nutzte die Z3 bereits das binäre System. Zuse verzichtete auf bedingte Sprünge, um die Maschine einfach zu halten. Dennoch bewies der Informatiker Raúl Rojas im Jahr 1998, dass die Z3 **turingmächtig** (Turing-komplett) war, da Programme in Schleifen ausgeführt und das Band modifiziert werden konnte. Das Original der Z3 wurde 1943 bei einem Bombenangriff zerstört. Ein Nachbau steht heute im Deutschen Museum in München und erinnert an diesen Geburtsmoment des Computerzeitalters.",
            FR: "En présentant le **Zuse Z3** à Berlin, **Konrad Zuse** a dévoilé le premier **calculateur numérique** au monde entièrement automatique, programmable et contrôlé par programme. Le Z3 était construit avec environ 2 000 **relais électromagnétiques**. Il utilisait le calcul binaire à virgule flottante et lisait ses instructions depuis un film 35 mm perforé. Contrairement à l'ENIAC américain, plus tardif, le Z3 exploitait déjà pleinement le système binaire. Bien que dépourvu de branchements conditionnels directs, il a été prouvé par le chercheur Raúl Rojas en 1998 que le Z3 était **Turing-complet**, faisant de lui le premier véritable ordinateur de l'histoire. Détruit par des bombardements en 1943, une réplique historique est exposée au Deutsches Museum de Munich, témoignant de cette prouesse technologique pionnière.",
            IT: "Con la presentazione dello **Zuse Z3** a Berlino, **Konrad Zuse** mostrò al mondo il primo **calcolatore digitale** completamente automatico, programmabile e controllato da programma. Lo Z3 era composto da circa 2.000 **relè elettromagnetici**. Funzionava con aritmetica binaria a virgola mobile e leggeva le istruzioni da una pellicola cinematografica perforata da 35 mm. A differenza del successivo ENIAC, lo Z3 utilizzava già la logica binaria. Zuse escluse i salti condizionati per semplicità strutturale. Ciononostante, nel 1998 Raúl Rojas dimostrò che lo Z3 era **Turing-completo**, classificandolo come il primo computer funzionante della storia. La macchina originale fu distrutta dai bombardamenti nel 1943. Una replica fedele si trova oggi al Deutsches Museum di Monaco, a testimonianza di questa pietra miliare dell'informatica. Dettagli su [Wikipedia](https://it.wikipedia.org/wiki/Z3_%28computer%29).",
        },
        tags: ["hardware", "milestone"],
        type: "table",
        width: 650,
        stats: {
            clockSpeed: "5 Hz bis 10 Hz",
            memory: "64 Wörter (à 22 Bit)",
            transistors: "2.000 electromagnetic Relais",
        },
        cells: [
            ["Eigenschaft", "Zuse Z3 (1941)", "Zuse Z1 (1938)", "Colossus (1943)"],
            ["Technologie", "Relais", "Mechanische Bleche", "Vakuumröhren"],
            ["Taktfrequenz", "5-10 Hz", "1 Hz (manuell)", "5.000 Hz"],
            ["Zahlensystem", "Binär", "Binär", "Binär"],
            ["Speicher", "64 Wörter à 22 Bit", "16 Wörter à 24 Bit", "Temporäre Register"],
            ["Turingmächtig", "Ja (1998 bewiesen)", "Nein (blockiert)", "Nein (Spezialrechner)"],
        ],
        links: {
            wikipedia: {
                DE: "https://de.wikipedia.org/wiki/Zuse_Z3",
                FR: "https://fr.wikipedia.org/wiki/Zuse_3",
                IT: "https://it.wikipedia.org/wiki/Z3_%28computer%29",
            },
        },
    },
];
