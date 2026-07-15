/**
 * 1950s Black & White Blueprint / Planning Design
 * Style reference: STYLE_CONFIG in src/graphics.js
 * Mandates pure black background (#000000), crisp B&W geometry, slanted borders,
 * independent drop shadow angles, and gradual organic watercolor animation reveals.
 */
import { STAGES } from "./content.js";
import { initGraphics, updateGraphics } from "./graphics.js";
import { initScrollamaEngine } from "./engine-scrollama.js";

const INLINE_ILLUSTRATIONS = {
    "step-1": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-1.1: DOVETAIL LOG CORNER NOTCH</text>
            <rect x="60" y="50" width="180" height="45" stroke="#ffffff" stroke-width="2" fill="#0c0c0c"/>
            <rect x="60" y="105" width="180" height="45" stroke="#ffffff" stroke-width="2" fill="#0c0c0c"/>
            <path d="M60 50 L95 72.5 L60 95" stroke="#ffffff" stroke-width="2" fill="none"/>
            <line x1="70" y1="55" x2="230" y2="55" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            <line x1="70" y1="110" x2="230" y2="110" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            <line x1="260" y1="72.5" x2="380" y2="72.5" stroke="#D12B3E" stroke-width="1.5" stroke-dasharray="4 2"/>
            <circle cx="260" cy="72.5" r="3" fill="#D12B3E"/>
            <text x="270" y="66" fill="#D12B3E" font-family="monospace" font-size="11">SLOPE TAPER 1:4 (DRAINAGE)</text>
            <line x1="260" y1="127.5" x2="380" y2="127.5" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="270" y="122" fill="#D12B3E" font-family="monospace" font-size="11">BROADAXE HEWN OAK SILL</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-1.2: DRY-LAID FIELDSTONE HEARTH SECTION</text>
            <rect x="50" y="140" width="400" height="40" stroke="#ffffff" stroke-width="2" fill="#080808"/>
            <path d="M50 140 L80 180 M120 140 L150 180 M190 140 L220 180 M260 140 L290 180 M330 140 L360 180 M400 140 L430 180" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
            <rect x="180" y="45" width="140" height="95" stroke="#ffffff" stroke-width="2.2" fill="#111111"/>
            <path d="M190 60 H310 M190 85 H310 M190 110 H310 M240 45 V60 M270 60 V85 M210 85 V110 M260 110 V140" stroke="#ffffff" stroke-width="1.5"/>
            <line x1="340" y1="92" x2="440" y2="92" stroke="#D12B3E" stroke-width="1.5"/>
            <polygon points="340,92 348,88 348,96" fill="#D12B3E"/>
            <text x="355" y="86" fill="#D12B3E" font-family="monospace" font-size="11">CENTRAL MASS CHIMNEY</text>
        </svg>`,
    ],
    "step-2": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-2.1: DRAW-BORE TREENAIL OFFSET JOINT</text>
            <rect x="100" y="60" width="140" height="90" stroke="#ffffff" stroke-width="2" fill="#0e0e0e"/>
            <rect x="240" y="80" width="120" height="50" stroke="#ffffff" stroke-width="2" fill="#141414"/>
            <circle cx="210" cy="105" r="10" stroke="#ffffff" stroke-width="1.8" fill="none"/>
            <circle cx="213" cy="105" r="8" stroke="#D12B3E" stroke-width="1.5" stroke-dasharray="2 2" fill="none"/>
            <line x1="213" y1="50" x2="213" y2="160" stroke="#D12B3E" stroke-width="1.5"/>
            <polygon points="213,160 209,150 217,150" fill="#D12B3E"/>
            <text x="250" y="58" fill="#D12B3E" font-family="monospace" font-size="11">3.1 MM PIN OFFSET TENSION</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-2.2: TIMBER BENT ASSEMBLY RIGGING</text>
            <line x1="80" y1="160" x2="420" y2="160" stroke="#ffffff" stroke-width="2"/>
            <line x1="150" y1="160" x2="150" y2="60" stroke="#ffffff" stroke-width="2.2"/>
            <line x1="150" y1="60" x2="330" y2="60" stroke="#ffffff" stroke-width="2.2"/>
            <line x1="330" y1="60" x2="330" y2="160" stroke="#ffffff" stroke-width="2.2"/>
            <line x1="150" y1="110" x2="190" y2="60" stroke="#ffffff" stroke-width="1.8"/>
            <line x1="330" y1="110" x2="290" y2="60" stroke="#ffffff" stroke-width="1.8"/>
            <line x1="350" y1="60" x2="440" y2="40" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="360" y="34" fill="#D12B3E" font-family="monospace" font-size="11">PULLEY RIGGING POINT</text>
        </svg>`,
    ],
    "step-3": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-3.1: SUBTERRANEAN GRAVITY DRAIN TRENCH</text>
            <polygon points="120,60 380,60 330,160 170,160" stroke="#ffffff" stroke-width="2" fill="#0a0a0a"/>
            <circle cx="250" cy="135" r="18" stroke="#ffffff" stroke-width="2" fill="#151515"/>
            <path d="M120 60 L170 160 M150 60 L190 160 M380 60 L330 160 M350 60 L310 160" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
            <line x1="268" y1="135" x2="420" y2="135" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="280" y="128" fill="#D12B3E" font-family="monospace" font-size="11">PERFORATED CLAY TILE DATUM</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-3.2: SPRING HOUSE THERMAL ENVELOPE</text>
            <rect x="130" y="70" width="240" height="90" stroke="#ffffff" stroke-width="2" fill="#0e0e0e"/>
            <rect x="150" y="130" width="200" height="30" stroke="#ffffff" stroke-width="1.5" fill="rgba(255,255,255,0.1)"/>
            <path d="M130 70 L250 35 L370 70" stroke="#ffffff" stroke-width="2.2" fill="none"/>
            <line x1="380" y1="145" x2="460" y2="145" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="385" y="138" fill="#D12B3E" font-family="monospace" font-size="11">CONSTANT 48°F WATER</text>
        </svg>`,
    ],
    "step-4": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-4.1: OVERSHOT WATERWHEEL BUCKET PROFILE</text>
            <circle cx="160" cy="115" r="65" stroke="#ffffff" stroke-width="2" fill="none"/>
            <circle cx="160" cy="115" r="50" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <circle cx="160" cy="115" r="14" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <path d="M160 50 L175 65 M225 115 L210 130 M160 180 L145 165 M95 115 L110 100" stroke="#ffffff" stroke-width="2"/>
            <line x1="225" y1="115" x2="390" y2="115" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="240" y="108" fill="#D12B3E" font-family="monospace" font-size="11">16 OAK BUCKET CAVITIES</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-4.2: TRUNDLE LANTERN CROWN GEAR MESH</text>
            <rect x="120" y="85" width="110" height="24" stroke="#ffffff" stroke-width="2" fill="#141414"/>
            <rect x="226" y="55" width="24" height="84" stroke="#ffffff" stroke-width="2" fill="#181818"/>
            <line x1="230" y1="97" x2="380" y2="97" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="245" y="90" fill="#D12B3E" font-family="monospace" font-size="11">90° TORQUE TRANSLATION</text>
        </svg>`,
    ],
    "step-5": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-5.1: BALLOON FRAMING STUD-TO-SILL JOINT</text>
            <rect x="180" y="130" width="140" height="30" stroke="#ffffff" stroke-width="2" fill="#0e0e0e"/>
            <rect x="210" y="45" width="22" height="85" stroke="#ffffff" stroke-width="2" fill="#121212"/>
            <rect x="268" y="45" width="22" height="85" stroke="#ffffff" stroke-width="2" fill="#121212"/>
            <line x1="232" y1="85" x2="370" y2="85" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="245" y="78" fill="#D12B3E" font-family="monospace" font-size="11">CONTINUOUS 2X4 DIMENSION STUD</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-5.2: WROUGHT IRON TURNBUCKLE TIE-ROD</text>
            <line x1="80" y1="110" x2="210" y2="110" stroke="#ffffff" stroke-width="3"/>
            <rect x="210" y="98" width="80" height="24" stroke="#ffffff" stroke-width="2" fill="#1a1a1a"/>
            <line x1="290" y1="110" x2="420" y2="110" stroke="#ffffff" stroke-width="3"/>
            <line x1="250" y1="122" x2="380" y2="160" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="280" y="172" fill="#D12B3E" font-family="monospace" font-size="11">REVERSE THREAD TENSION COLLAR</text>
        </svg>`,
    ],
    "step-6": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-6.1: SPINDLE LATHE TURNED BALUSTER PROFILE</text>
            <path d="M230 45 C215 65 245 85 230 105 C215 125 245 145 230 165" stroke="#ffffff" stroke-width="2.2" fill="none"/>
            <path d="M270 45 C285 65 255 85 270 105 C285 125 255 145 270 165" stroke="#ffffff" stroke-width="2.2" fill="none"/>
            <line x1="250" y1="40" x2="250" y2="170" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
            <line x1="275" y1="105" x2="410" y2="105" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="285" y="98" fill="#D12B3E" font-family="monospace" font-size="11">HIGH-SPEED TURNED CHISEL CUT</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-6.2: BLACK-IRON GAS MANIFOLD DISTRIBUTOR</text>
            <line x1="100" y1="115" x2="400" y2="115" stroke="#ffffff" stroke-width="4"/>
            <circle cx="200" cy="115" r="8" fill="#ffffff"/>
            <circle cx="300" cy="115" r="8" fill="#ffffff"/>
            <line x1="200" y1="115" x2="200" y2="60" stroke="#ffffff" stroke-width="2.5"/>
            <line x1="300" y1="115" x2="300" y2="60" stroke="#ffffff" stroke-width="2.5"/>
            <line x1="315" y1="85" x2="440" y2="85" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="320" y="78" fill="#D12B3E" font-family="monospace" font-size="11">THREADED 3/4" PIPE TEE</text>
        </svg>`,
    ],
    "step-7": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-7.1: TIMBER BANK BARN HAY LOFT HOIST</text>
            <rect x="120" y="60" width="260" height="110" stroke="#ffffff" stroke-width="2" fill="#0a0a0a"/>
            <polygon points="120,60 250,30 380,60" stroke="#ffffff" stroke-width="2" fill="none"/>
            <circle cx="250" cy="50" r="8" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <line x1="250" y1="58" x2="250" y2="130" stroke="#ffffff" stroke-width="1.5"/>
            <line x1="260" y1="80" x2="420" y2="80" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="270" y="73" fill="#D12B3E" font-family="monospace" font-size="11">GRAVITY PULLEY TRACK DATUM</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-7.2: TERRACOTTA PERIMETER DRAINAGE TILE</text>
            <circle cx="210" cy="115" r="35" stroke="#ffffff" stroke-width="2.2" fill="#0f0f0f"/>
            <circle cx="210" cy="115" r="25" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <path d="M150 160 H270 M160 170 H260" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            <line x1="248" y1="115" x2="410" y2="115" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="258" y="108" fill="#D12B3E" font-family="monospace" font-size="11">POROUS CLAY INFILTRATION JOINT</text>
        </svg>`,
    ],
    "step-8": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-8.1: PORCELAIN KNOB-AND-TUBE CERAMIC INSULATOR</text>
            <rect x="140" y="90" width="220" height="30" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <rect x="220" y="65" width="28" height="25" rx="4" stroke="#ffffff" stroke-width="2" fill="#1c1c1c"/>
            <line x1="80" y1="77" x2="420" y2="77" stroke="#ffffff" stroke-width="2.2"/>
            <line x1="250" y1="77" x2="390" y2="50" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="260" y="44" fill="#D12B3E" font-family="monospace" font-size="11">CERAMIC JOIST STANDOFF CLEAT</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-8.2: CAST-IRON HYDRONIC RADIATOR FIN SECTION</text>
            <rect x="150" y="65" width="26" height="95" rx="6" stroke="#ffffff" stroke-width="2" fill="#121212"/>
            <rect x="190" y="65" width="26" height="95" rx="6" stroke="#ffffff" stroke-width="2" fill="#121212"/>
            <rect x="230" y="65" width="26" height="95" rx="6" stroke="#ffffff" stroke-width="2" fill="#121212"/>
            <rect x="270" y="65" width="26" height="95" rx="6" stroke="#ffffff" stroke-width="2" fill="#121212"/>
            <line x1="145" y1="145" x2="305" y2="145" stroke="#ffffff" stroke-width="4"/>
            <line x1="300" y1="110" x2="430" y2="110" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="310" y="103" fill="#D12B3E" font-family="monospace" font-size="11">HIGH THERMAL MASS COLUMN</text>
        </svg>`,
    ],
    "step-9": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-9.1: STRUCTURAL RIDGE DEFLECTION & SAG</text>
            <path d="M100 130 Q250 165 400 130" stroke="#ffffff" stroke-width="2.5" fill="none"/>
            <line x1="100" y1="130" x2="400" y2="130" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
            <line x1="250" y1="130" x2="250" y2="147" stroke="#D12B3E" stroke-width="2"/>
            <polygon points="250,147 246,140 254,140" fill="#D12B3E"/>
            <text x="265" y="142" fill="#D12B3E" font-family="monospace" font-size="11">4.8 INCH RIDGE SAG DEFLECTION</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-9.2: SEVERE MORTAR LEACHING & TREE ROOT INVASION</text>
            <rect x="120" y="60" width="220" height="100" stroke="#ffffff" stroke-width="2" fill="#0d0d0d"/>
            <path d="M120 90 H340 M120 125 H340 M200 60 V90 M270 90 V125 M180 125 V160" stroke="#ffffff" stroke-width="1.8"/>
            <path d="M340 80 Q310 110 325 155" stroke="#ffffff" stroke-width="2.5" fill="none"/>
            <line x1="330" y1="115" x2="440" y2="115" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="335" y="108" fill="#D12B3E" font-family="monospace" font-size="11">BIOLOGICAL WEDGING FAILURE</text>
        </svg>`,
    ],
    "step-10": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-10.1: SCREW-JACK STEEL LALLY COLUMN THREAD</text>
            <rect x="225" y="45" width="50" height="120" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <line x1="225" y1="75" x2="275" y2="85" stroke="#ffffff" stroke-width="2"/>
            <line x1="225" y1="95" x2="275" y2="105" stroke="#ffffff" stroke-width="2"/>
            <line x1="225" y1="115" x2="275" y2="125" stroke="#ffffff" stroke-width="2"/>
            <rect x="210" y="85" width="80" height="16" stroke="#ffffff" stroke-width="2.2" fill="#1a1a1a"/>
            <line x1="290" y1="93" x2="420" y2="93" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="295" y="86" fill="#D12B3E" font-family="monospace" font-size="11">ADJUSTABLE ACME THREAD COLLAR</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-10.2: TEMPORARY CONCRETE FOOTING BEARING PAD</text>
            <polygon points="180,140 320,140 350,175 150,175" stroke="#ffffff" stroke-width="2" fill="#141414"/>
            <rect x="235" y="65" width="30" height="75" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <line x1="335" y1="158" x2="450" y2="158" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="340" y="151" fill="#D12B3E" font-family="monospace" font-size="11">POURED LOAD SPREADER DATUM</text>
        </svg>`,
    ],
    "step-11": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-11.1: HYDRAULIC JACKING & RE-LEVELING DATUM</text>
            <rect x="160" y="110" width="180" height="28" stroke="#ffffff" stroke-width="2" fill="#0e0e0e"/>
            <rect x="220" y="145" width="60" height="35" stroke="#ffffff" stroke-width="2" fill="#181818"/>
            <line x1="250" y1="145" x2="250" y2="138" stroke="#ffffff" stroke-width="3"/>
            <line x1="340" y1="124" x2="450" y2="124" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="345" y="117" fill="#D12B3E" font-family="monospace" font-size="11">PRECISION 12-TON LIFT POINT</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-11.2: CONCEALED C-CHANNEL LINTEL REINFORCEMENT</text>
            <rect x="180" y="80" width="140" height="44" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <path d="M180 80 H210 V114 H180 M320 80 H290 V114 H320" stroke="#ffffff" stroke-width="2.5" fill="none"/>
            <line x1="320" y1="102" x2="440" y2="102" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="325" y="95" fill="#D12B3E" font-family="monospace" font-size="11">STRUCTURAL STEEL C-CHANNEL</text>
        </svg>`,
    ],
    "step-12": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-12.1: SUB-SLAB RADON SUCTION PIT CORE</text>
            <rect x="140" y="120" width="220" height="25" stroke="#ffffff" stroke-width="2" fill="#0a0a0a"/>
            <rect x="210" y="145" width="80" height="35" stroke="#ffffff" stroke-width="2" fill="#141414"/>
            <rect x="240" y="60" width="20" height="85" stroke="#ffffff" stroke-width="2" fill="#181818"/>
            <line x1="260" y1="90" x2="410" y2="90" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="265" y="83" fill="#D12B3E" font-family="monospace" font-size="11">4" PVC ACTIVE SUCTION RISER</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-12.2: PERFORATED PVC FRENCH DRAINAGE LOOP</text>
            <circle cx="210" cy="120" r="30" stroke="#ffffff" stroke-width="2.2" fill="#111111"/>
            <circle cx="210" cy="142" r="4" fill="#ffffff"/>
            <circle cx="192" cy="135" r="4" fill="#ffffff"/>
            <circle cx="228" cy="135" r="4" fill="#ffffff"/>
            <line x1="240" y1="120" x2="410" y2="120" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="248" y="113" fill="#D12B3E" font-family="monospace" font-size="11">GEOTEXTILE FABRIC GRAVEL ENCASEMENT</text>
        </svg>`,
    ],
    "step-13": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-13.1: CLOSED-CELL SPRAY FOAM CAVITY SEAL</text>
            <rect x="160" y="60" width="180" height="100" stroke="#ffffff" stroke-width="2" fill="#0a0a0a"/>
            <path d="M160 75 C180 60 200 90 220 75 C240 60 260 90 280 75 C300 60 320 90 340 75" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none"/>
            <path d="M160 115 C180 100 200 130 220 115 C240 100 260 130 280 115 C300 100 320 130 340 115" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none"/>
            <line x1="340" y1="105" x2="450" y2="105" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="345" y="98" fill="#D12B3E" font-family="monospace" font-size="11">R-45 CONTINUOUS FOAM MATRIX</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-13.2: GEOTHERMAL BOREHOLE HEAT EXCHANGE LOOP</text>
            <rect x="220" y="50" width="60" height="130" stroke="#ffffff" stroke-width="2" fill="#0d0d0d"/>
            <line x1="242" y1="50" x2="242" y2="165" stroke="#ffffff" stroke-width="2"/>
            <line x1="258" y1="50" x2="258" y2="165" stroke="#ffffff" stroke-width="2"/>
            <path d="M242 165 C242 175 258 175 258 165" stroke="#ffffff" stroke-width="2" fill="none"/>
            <line x1="280" y1="110" x2="430" y2="110" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="285" y="103" fill="#D12B3E" font-family="monospace" font-size="11">400 FT VERTICAL CLOSED LOOP</text>
        </svg>`,
    ],
    "step-14": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-14.1: HISTORIC POST-AND-BEAM EXPOSED INTERIOR</text>
            <rect x="120" y="60" width="40" height="110" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <rect x="160" y="60" width="200" height="36" stroke="#ffffff" stroke-width="2" fill="#141414"/>
            <line x1="360" y1="78" x2="460" y2="78" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="365" y="71" fill="#D12B3E" font-family="monospace" font-size="11">PRESERVED 1780 HEWN TIMBER</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-14.2: BI-DIRECTIONAL V2H BATTERY STORAGE</text>
            <rect x="170" y="70" width="160" height="95" rx="8" stroke="#ffffff" stroke-width="2.2" fill="#0f0f0f"/>
            <rect x="220" y="55" width="60" height="15" stroke="#ffffff" stroke-width="2" fill="#161616"/>
            <path d="M250 90 L240 115 H255 L245 140" stroke="#ffffff" stroke-width="2.5" fill="none"/>
            <line x1="330" y1="115" x2="450" y2="115" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="335" y="108" fill="#D12B3E" font-family="monospace" font-size="11">MICROGRID SOLID-STATE DATUM</text>
        </svg>`,
    ],
    "step-15": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-15.1: BOUSSINESQ STRESS BULB SOIL ATTENUATION</text>
            <rect x="200" y="55" width="100" height="30" stroke="#ffffff" stroke-width="2" fill="#141414"/>
            <path d="M170 85 Q250 120 330 85" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <path d="M140 85 Q250 155 360 85" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <path d="M110 85 Q250 190 390 85" stroke="#ffffff" stroke-width="1.5" fill="none"/>
            <line x1="330" y1="130" x2="440" y2="130" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="335" y="123" fill="#D12B3E" font-family="monospace" font-size="11">ISOBAR STRESS DISSIPATION</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-15.2: HYDROSTATIC GROUNDWATER PRESSURE VECTOR</text>
            <rect x="220" y="60" width="35" height="110" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <line x1="140" y1="85" x2="220" y2="85" stroke="#ffffff" stroke-width="2"/>
            <polygon points="220,85 210,80 210,90" fill="#ffffff"/>
            <line x1="160" y1="120" x2="220" y2="120" stroke="#ffffff" stroke-width="2"/>
            <polygon points="220,120 210,115 210,125" fill="#ffffff"/>
            <line x1="255" y1="100" x2="410" y2="100" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="260" y="93" fill="#D12B3E" font-family="monospace" font-size="11">LATERAL HYDROSTATIC THRUST</text>
        </svg>`,
    ],
    "step-16": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-16.1: DEW-POINT CONDENSATION PLANE INTERSECTION</text>
            <rect x="140" y="60" width="90" height="110" stroke="#ffffff" stroke-width="2" fill="#0e0e0e"/>
            <rect x="230" y="60" width="130" height="110" stroke="#ffffff" stroke-width="2" fill="#141414"/>
            <line x1="230" y1="50" x2="230" y2="180" stroke="#D12B3E" stroke-width="2.5" stroke-dasharray="6 3"/>
            <text x="245" y="165" fill="#D12B3E" font-family="monospace" font-size="11">DEW-POINT ISOTHERM DATUM</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-16.2: INFRARED FLUX MATRIX THERMAL BRIDGING ELIMINATION</text>
            <rect x="150" y="70" width="200" height="85" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <line x1="120" y1="95" x2="150" y2="95" stroke="#ffffff" stroke-width="1.8"/>
            <line x1="120" y1="130" x2="150" y2="130" stroke="#ffffff" stroke-width="1.8"/>
            <line x1="350" y1="112" x2="460" y2="112" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="355" y="105" fill="#D12B3E" font-family="monospace" font-size="11">ZERO THERMAL BRIDGING PROFILE</text>
        </svg>`,
    ],
    "step-17": [
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">DETAIL A-17.1: DEAD VS LIVE LOAD VECTOR RESOLUTION</text>
            <rect x="220" y="80" width="60" height="90" stroke="#ffffff" stroke-width="2" fill="#111111"/>
            <line x1="250" y1="35" x2="250" y2="80" stroke="#ffffff" stroke-width="2.5"/>
            <polygon points="250,80 244,70 256,70" fill="#ffffff"/>
            <line x1="280" y1="120" x2="430" y2="120" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="285" y="113" fill="#D12B3E" font-family="monospace" font-size="11">32 PSF DEAD + 40 PSF LIVE LOAD</text>
        </svg>`,
        `<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
            <text x="15" y="24" fill="#ffffff" font-family="monospace" font-weight="bold" font-size="13">SECTION B-17.2: WIND MOMENT SHEAR DEFLECTION DRIFT (L/360)</text>
            <polygon points="170,165 290,165 310,65 190,65" stroke="#ffffff" stroke-width="2" fill="none"/>
            <line x1="120" y1="85" x2="190" y2="85" stroke="#ffffff" stroke-width="2.5"/>
            <polygon points="190,85 180,79 180,91" fill="#ffffff"/>
            <line x1="310" y1="115" x2="440" y2="115" stroke="#D12B3E" stroke-width="1.5"/>
            <text x="315" y="108" fill="#D12B3E" font-family="monospace" font-size="11">MAX STORY DRIFT INDEX L/360</text>
        </svg>`,
    ],
};

function renderStageSections() {
    const container = document.getElementById("scrolly-container");
    if (!container)
        return;

    container.innerHTML = "";
    STAGES.forEach((stage, idx) => {
        const stageEl = document.createElement("section");
        const isOdd = idx % 2 === 0; // 0-indexed: 0 is Stage 1 (odd -> text left), 1 is Stage 2 (even -> text right)
        stageEl.setAttribute("class", `stage-section ${isOdd ? "layout-text-left" : "layout-text-right"}`);
        stageEl.setAttribute("id", `stage-section-${idx}`);
        stageEl.setAttribute("data-stage-index", String(idx));

        const specsHtml = stage.specs
            .map(
                (spec) => `
            <div class="spec-item">
                <span class="spec-label">${spec.label}</span>
                <span class="spec-value">${spec.value}</span>
            </div>`
            )
            .join("");

        const descHtml = Array.isArray(stage.paragraphs)
            ? stage.paragraphs
                .map((p, pIdx) => {
                    const illList = INLINE_ILLUSTRATIONS[stage.id] || [];
                    let illPrefix = "";
                    if (pIdx === 1 && illList[0])
                        illPrefix = `<div class="step-inline-illustration" style="opacity: 1 !important; transition: none !important; animation: none !important; background: transparent !important; border: 2px solid var(--ink-secondary); border-radius: 6px; margin: 16px 0; padding: 12px; text-align: center;">${illList[0]}</div>`;
                    else if (pIdx === 3 && illList[1])
                        illPrefix = `<div class="step-inline-illustration" style="opacity: 1 !important; transition: none !important; animation: none !important; background: transparent !important; border: 2px solid var(--ink-secondary); border-radius: 6px; margin: 16px 0; padding: 12px; text-align: center;">${illList[1]}</div>`;

                    return `${illPrefix}
                <p class="step-paragraph-item step-description" data-p-index="${pIdx}">${p}</p>`;
                })
                .join("")
            : `<p class="step-paragraph-item step-description" data-p-index="0">${stage.description}</p>`;

        const narrativeHtml = `
            <div class="stage-narrative-column">
                <article id="step-${idx + 1}" class="step ${idx === 0 ? "is-active" : ""}" data-index="${idx}">
                    <span class="step-meta">Stage ${idx + 1} // ${stage.year}</span>
                    <h2 class="step-title">${stage.title}: ${stage.subtitle}</h2>
                    <div class="step-body">${descHtml}</div>
                    <div class="step-specs">${specsHtml}</div>
                </article>
            </div>
        `;

        const graphicHtml = `
            <div class="stage-graphic-column" aria-label="Interactive architectural display for Stage ${idx + 1}">
                <div class="graphic-sticky-wrapper">
                    <canvas class="graphic-canvas" id="graphic-canvas-${idx}"></canvas>
                    <svg class="graphic-svg" id="graphic-svg-${idx}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet"></svg>
                    <div class="caption" id="graphic-caption-${idx}">Stage ${idx + 1}: ${stage.title}</div>
                </div>
            </div>
        `;

        stageEl.innerHTML = narrativeHtml + graphicHtml;
        container.appendChild(stageEl);

        const pItems = stageEl.querySelectorAll(".step-paragraph-item");
        pItems.forEach((item) => {
            item.addEventListener("click", () => {
                item.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        });
    });
}

function renderFloatingTOC() {
    const tocList = document.getElementById("toc-list");
    if (!tocList)
        return;

    tocList.innerHTML = `<div id="toc-active-indicator" class="toc-active-indicator"></div>${STAGES.map(
        (stage, idx) => `
            <li class="toc-item-wrapper">
                <button class="toc-item ${idx === 0 ? "is-active" : ""}" data-index="${idx}">
                    <span class="toc-num">0${idx + 1}</span>
                    <span class="toc-label">${stage.title}</span>
                </button>
            </li>
        `
    ).join("")}`;

    const buttons = tocList.querySelectorAll(".toc-item");
    buttons.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            if (typeof window.stepTo === "function")
                window.stepTo(idx);
        });
    });

    const toggleBtn = document.getElementById("toc-toggle-btn");
    const floatingToc = document.getElementById("floating-toc");
    const toggleSymbol = document.getElementById("toc-toggle-symbol");
    if (toggleBtn && floatingToc && !toggleBtn.dataset.listenerAttached) {
        toggleBtn.dataset.listenerAttached = "true";
        toggleBtn.addEventListener("click", () => {
            const isCollapsed = floatingToc.classList.toggle("is-collapsed");
            toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
            if (toggleSymbol)
                toggleSymbol.textContent = isCollapsed ? "[ + ]" : "[ - ]";

            if (!isCollapsed && typeof window.forceScrollytellingUpdate === "function")
                window.forceScrollytellingUpdate();
        });
    }
}

function renderBottomTimeline() {
    const timelinePoints = document.getElementById("timeline-points");
    if (timelinePoints) {
        timelinePoints.innerHTML = "";
        STAGES.forEach((stage, idx) => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.className = "timeline-point";
            btn.type = "button";
            btn.textContent = `${stage.year}`;
            btn.setAttribute("aria-label", `Jump to Stage ${idx + 1}: ${stage.year}`);
            btn.addEventListener("click", () => {
                const targetEl = document.getElementById(`stage-section-${idx}`);
                if (targetEl)
                    targetEl.scrollIntoView({ behavior: "smooth" });
            });
            li.appendChild(btn);
            timelinePoints.appendChild(li);
        });
    }
}

window.forceScrollytellingUpdate = function () {
    const floatingToc = document.getElementById("floating-toc");
    if (floatingToc) {
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        const header = document.querySelector(".page-header");
        const threshold = header ? header.offsetHeight - 50 : 300;
        const shouldShowTOC = scrollY > threshold;
        if (shouldShowTOC) {
            if (floatingToc.classList.contains("is-hidden")) {
                floatingToc.classList.remove("is-hidden");
                floatingToc.classList.add("is-visible");
            }
        } else {
            if (!floatingToc.classList.contains("is-hidden")) {
                floatingToc.classList.add("is-hidden");
                floatingToc.classList.remove("is-visible");
            }
        }
    }

    const sections = Array.from(document.querySelectorAll(".stage-section"));
    if (sections.length === 0)
        return;

    const viewportCenter = window.innerHeight * 0.5;
    let activeIndex = -1;
    let activeProgress = 0.0;

    // Phase 1: Check if any section straddles the viewport center
    for (let idx = 0; idx < sections.length; idx++) {
        const secEl = sections[idx];
        const rect = secEl.getBoundingClientRect();
        if (rect.top <= viewportCenter && rect.bottom > viewportCenter) {
            activeIndex = idx;
            if (rect.height > 0) {
                if (rect.top >= 0) {
                    activeProgress = 0.0;
                } else {
                    const prog = -rect.top / Math.max(1, rect.height - window.innerHeight * 0.5);
                    activeProgress = Math.max(0.0, Math.min(1.0, prog));
                }
            }
            break;
        }
    }

    // Phase 2: If in a gap or out of bounds, find the section with the closest center
    if (activeIndex === -1) {
        let minDistance = Infinity;
        for (let idx = 0; idx < sections.length; idx++) {
            const secEl = sections[idx];
            const rect = secEl.getBoundingClientRect();
            const secCenter = rect.top + rect.height * 0.5;
            const dist = Math.abs(secCenter - viewportCenter);
            if (dist < minDistance) {
                minDistance = dist;
                activeIndex = idx;
                if (secCenter < viewportCenter)
                    activeProgress = 1.0;
                else
                    activeProgress = 0.0;
            }
        }
    }

    const steps = Array.from(document.querySelectorAll(".step"));
    steps.forEach((stepEl, idx) => {
        if (idx === activeIndex) {
            if (!stepEl.classList.contains("is-active"))
                stepEl.classList.add("is-active");
        } else {
            if (stepEl.classList.contains("is-active"))
                stepEl.classList.remove("is-active");
        }
    });

    const stageLabel = document.getElementById("active-stage-label");
    if (stageLabel && STAGES[activeIndex])
        stageLabel.textContent = `STAGE ${activeIndex + 1}: ${STAGES[activeIndex].title.toUpperCase()}`;

    const tocItems = document.querySelectorAll(".toc-item");
    const indicator = document.getElementById("toc-active-indicator");
    tocItems.forEach((item, idx) => {
        if (idx === activeIndex) {
            if (!item.classList.contains("is-active"))
                item.classList.add("is-active");
            if (indicator) {
                const wrapper = item.closest(".toc-item-wrapper") || item.parentElement || item;
                const offsetTop = wrapper.offsetTop;
                const height = wrapper.offsetHeight;
                indicator.style.transform = `translateY(${offsetTop}px)`;
                indicator.style.height = `${height}px`;
            }
        } else {
            if (item.classList.contains("is-active"))
                item.classList.remove("is-active");
        }
    });

    const bottomTimeline = document.getElementById("bottom-timeline-overlay");
    if (bottomTimeline) {
        if (bottomTimeline.classList.contains("is-hidden")) {
            bottomTimeline.classList.remove("is-hidden");
            bottomTimeline.classList.add("is-visible");
        }
        const points = bottomTimeline.querySelectorAll(".timeline-point");
        points.forEach((pt, idx) => {
            if (idx === activeIndex) {
                if (!pt.classList.contains("is-active"))
                    pt.classList.add("is-active");
            } else {
                if (pt.classList.contains("is-active"))
                    pt.classList.remove("is-active");
            }
        });
    }

    updateGraphics(activeIndex, activeProgress);
};

window.scrollToStep = function (index) {
    const sections = document.querySelectorAll(".stage-section");
    if (index >= 0 && index < sections.length) {
        const secEl = sections[index];
        secEl.scrollIntoView({ behavior: "instant", block: "start" });
        if (typeof window.forceScrollytellingUpdate === "function")
            window.forceScrollytellingUpdate();
    }
};

for (let i = 0; i < STAGES.length; i++) {
    window[`stepTo${i}`] = function () {
        window.scrollToStep(i);
    };
}

window.stepTo = function (index) {
    window.scrollToStep(index);
};

window._scrubProgress = 0.0;

window.resetScrub = function () {
    window._scrubProgress = 0.0;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (typeof window.forceScrollytellingUpdate === "function")
        window.forceScrollytellingUpdate();
};

window.scrubNext = function () {
    window._scrubProgress = Math.min(1.0, window._scrubProgress + 1.0 / 30.0);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: maxScroll * window._scrubProgress, behavior: "instant" });
    if (typeof window.forceScrollytellingUpdate === "function")
        window.forceScrollytellingUpdate();
};

window.scrubPrev = function () {
    window._scrubProgress = Math.max(0.0, window._scrubProgress - 1.0 / 30.0);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: maxScroll * window._scrubProgress, behavior: "instant" });
    if (typeof window.forceScrollytellingUpdate === "function")
        window.forceScrollytellingUpdate();
};

window.scrubForward = window.scrubNext;
window.scrubBackward = window.scrubPrev;

function initApp() {
    renderStageSections();
    renderFloatingTOC();
    renderBottomTimeline();
    initGraphics();

    initScrollamaEngine(updateGraphics);

    const handleScroll = () => {
        if (typeof window.forceScrollytellingUpdate === "function")
            window.forceScrollytellingUpdate();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    if (typeof window.forceScrollytellingUpdate === "function")
        window.forceScrollytellingUpdate();
}

if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initApp);
else
    initApp();
