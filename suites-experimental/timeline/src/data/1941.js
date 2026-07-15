export default [
    {
        id: "card-1941-10-15",
        date: "1941-10-15",
        title: {
            DE: "Zuse Z3 – Der erste funktionsfähige Computer der Welt",
            FR: "Zuse Z3 - Le premier ordinateur fonctionnel au monde",
            IT: "Zuse Z3 - Il primo computer funzionante al mondo",
            TW: "Zuse Z3 — 世界上第一台可程式電腦",
            JP: "Zuse Z3 — 世界初の動作可能なプログラム制御コンピュータ",
        },
        description: {
            DE: "Mit der Vorstellung der **Zuse Z3** in Berlin präsentierte **Konrad Zuse** den ersten vollautomatischen, programmierbaren und programmgesteuerten digitalen **Rechenautomaten** der Welt. Die Z3 bestand aus ca. 2.000 **elektromagnetischen Relais** (600 im Rechenwerk, 1.400 im Speicherwerk). Sie arbeitete mit binärer Gleitkomma-Arithmetik und las Programme von gelochtem 35mm-Kinofilm. Im Gegensatz zum späteren ENIAC nutzte die Z3 bereits das binäre System. Zuse verzichtete auf bedingte Sprünge, um die Maschine einfach zu halten. Dennoch bewies der Informatiker Raúl Rojas im Jahr 1998, dass die Z3 **turingmächtig** (Turing-komplett) war, da Programme in Schleifen ausgeführt und das Band modifiziert werden konnte. Das Original der Z3 wurde 1943 bei einem Bombenangriff zerstört. Ein Nachbau steht heute im Deutschen Museum in München und erinnert an diesen Geburtsmoment des Computerzeitalters.",
            FR: "En présentant le **Zuse Z3** à Berlin, **Konrad Zuse** a dévoilé le premier **calculateur numérique** au monde entièrement automatique, programmable et contrôlé par programme. Le Z3 était construit avec environ 2 000 **relais électromagnétiques**. Il utilisait le calcul binaire à virgule flottante et lisait ses instructions depuis un film 35 mm perforé. Contrairement à l'ENIAC américain, plus tardif, le Z3 exploitait déjà pleinement le système binaire. Bien que dépourvu de branchements conditionnels directs, il a été prouvé par le chercheur Raúl Rojas en 1998 que le Z3 était **Turing-complet**, faisant de lui le premier véritable ordinateur de l'histoire. Détruit par des bombardements en 1943, une réplique historique est exposée au Deutsches Museum de Munich, témoignant de cette prouesse technologique pionnière.",
            IT: "Con la presentazione dello **Zuse Z3** a Berlino, **Konrad Zuse** mostrò al mondo il primo **calcolatore digitale** completamente automatico, programmabile e controllato da programma. Lo Z3 era composto da circa 2.000 **relè elettromagnetici**. Funzionava con aritmetica binaria a virgola mobile e leggeva le istruzioni da una pellicola cinematografica perforata da 35 mm. A differenza del successivo ENIAC, lo Z3 utilizzava già la logica binaria. Zuse escluse i salti condizionati per semplicità strutturale. Ciononostante, nel 1998 Raúl Rojas dimostrò che lo Z3 era **Turing-completo**, classificandolo come il primo computer funzionante della storia. La macchina originale fu distrutta dai bombardamenti nel 1943. Una replica fedele si trova oggi al Deutsches Museum di Monaco, a testimonianza di questa pietra miliare dell'informatica. Dettagli su [Wikipedia](https://it.wikipedia.org/wiki/Z3_%28computer%29).",
            TW: "德國工程師**康拉德·楚澤**於1941年5月在柏林向科學家團隊展示了**Zuse Z3**。Z3是有史以來首台完全可運行且採用**二進位浮點運算**的**全自動程式控制電腦**。機器由大約2600個電磁繼電器構建而成（其中1400個用於記憶體，1200個用於算術運算與控制器），擁有64個字的儲存空間，每個字長22位元。其程式指令透過打孔35毫米電影膠片條輸入並逐條執行。1998年，電腦科學家勞爾·羅哈斯（Raul Rojas）進一步在數學上證明了Z3具備**圖靈完備性**（Turing Complete）。Z3毫無爭議地標誌著現代全自動計算設備的真正起源。",
            JP: "ドイツのエンジニア**コンラート・ツーゼ**は、1941年5月にベルリンで**Zuse Z3**を公開しました。これは世界で初めて完全に動作した、**2進浮動小数点演算**を行う**プログラム制御式完全自動コンピュータ**です。約2600個の電話用電磁リレー（記憶装置に1400個、演算・制御装置に1200個）から構築され、22ビット長のワードを64個格納できるメモリを備えていました。プログラムはパンチされた35ミリ映画フィルムのループから読み取られて実行されました。1998年、計算機科学者ラウル・ロハスによってZ3が理論上**チューリング完全**であることが厳密に証明され、現代の汎用自動コンピュータの幕開けを象徴する偉業として歴史に刻まれています。",
        },
        tags: ["hardware", "milestone"],
        type: "table",
        width: 650,
        links: {
            wikipedia: {
                DE: "https://de.wikipedia.org/wiki/Zuse_Z3",
                FR: "https://fr.wikipedia.org/wiki/Zuse_3",
                IT: "https://it.wikipedia.org/wiki/Z3_%28computer%29",
                TW: "https://zh.wikipedia.org/wiki/Z3%E8%AE%A1%E7%AE%97%E6%9C%BA",
                JP: "https://ja.wikipedia.org/wiki/Z3_(%E3%82%B3%E3%83%B3%E3%83%94%E3%83%A5%E3%83%BC%E3%82%BF)",
            },
        },
        cells: [
            ["Eigenschaft", "Zuse Z3 (1941)", "Zuse Z1 (1938)", "Colossus (1943)"],
            ["Technologie", "Relais", "Mechanische Bleche", "Vakuumröhren"],
            ["Taktfrequenz", "5-10 Hz", "1 Hz (manuell)", "5.000 Hz"],
            ["Zahlensystem", "Binär", "Binär", "Binär"],
            ["Speicher", "64 Wörter à 22 Bit", "16 Wörter à 24 Bit", "Temporäre Register"],
            ["Turingmächtig", "Ja (1998 bewiesen)", "Nein (blockiert)", "Nein (Spezialrechner)"],
        ],
        stats: {
            clockSpeed: "5 Hz bis 10 Hz",
            memory: "64 Wörter (à 22 Bit)",
            transistors: "2.000 electromagnetic Relais",
        },
    },
];
