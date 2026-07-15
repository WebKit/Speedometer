/**
 * 1950s Black & White Blueprint / Planning Design Content & Specification Data
 * Style reference: STYLE_CONFIG in src/graphics.js
 * All narrative steps, badges, and technical specs conform to the monochrome blueprint drafting theme
 * on a pure black background (#000000), enhanced by gradual organic watercolor animation reveals.
 */
export const STAGES = [
    {
        id: "step-1",
        year: "1780",
        title: "Early Settlement",
        subtitle: "Timber Clearing & Rudimentary Shelter",
        paragraphs: [
            "The rugged New England frontier in 1780 presented a formidable wilderness of virgin old-growth hemlock, white oak, and sugar maple. Early homesteaders arrived with rudimentary hand tools, clearing dense canopy and wrestling with glacial till to carve out a small, survivable clearing in the forest. Every square foot of cleared land required immense physical labor, transforming the untamed woodland into the beginnings of a permanent agrarian settlement.",
            "Construction began immediately by felling massive timber trees to fashion hand-hewn logs. Broadaxes and adzes were used to square the timbers, which were carefully notched and interlocked at the corners with a dovetail log corner notch without iron nails. Mud, clay, and dried woodland moss were painstakingly rammed into the chinks between logs to create a windbreak against the punishing sub-zero winters and gale-force winds.",
            "Survival during these formative decades relied entirely on localized natural resources. A shallow dug well tapped the immediate surface water table, while a massive dry-laid fieldstone hearth section served as the sole source of thermal heating, illumination, and daily cooking. This initial 320-square-foot cabin represented a fragile human foothold in an otherwise untamed ecological landscape.",
            "The perimeter of the clearing was delineated by split-rail worm fences crafted from durable cedar and chestnut logs. These interlocking zigzag barriers kept wild grazing animals away from early subsistence vegetable patches without requiring post-hole digging in the rocky, frost-heaved soil.",
            "Throughout the harsh winter months, the central stone hearth acted as the structural and social nucleus of the homestead. Heat radiated from the massive fieldstone chimney stack, warming the sleeping loft above and preserving dried herbs, smoked provisions, and root vegetables stored in the crawlspace below.",
        ],
        description:
            "The rugged New England frontier in 1780 presented a formidable wilderness of virgin old-growth hemlock, white oak, and sugar maple. Early homesteaders arrived with rudimentary hand tools, clearing dense canopy and wrestling with glacial till to carve out a small, survivable clearing in the forest. Every square foot of cleared land required immense physical labor, transforming the untamed woodland into the beginnings of a permanent agrarian settlement.\n\nConstruction began immediately by felling massive timber trees to fashion hand-hewn logs. Broadaxes and adzes were used to square the timbers, which were carefully notched and interlocked at the corners with a dovetail log corner notch without iron nails. Mud, clay, and dried woodland moss were painstakingly rammed into the chinks between logs to create a windbreak against the punishing sub-zero winters and gale-force winds.\n\nSurvival during these formative decades relied entirely on localized natural resources. A shallow dug well tapped the immediate surface water table, while a massive dry-laid fieldstone hearth section served as the sole source of thermal heating, illumination, and daily cooking. This initial 320-square-foot cabin represented a fragile human foothold in an otherwise untamed ecological landscape.",
        specs: [
            { label: "Material", value: "Old-Growth Timber" },
            { label: "Foundation", value: "Direct Soil / Log Sills" },
            { label: "Tools", value: "Hand Axe, Broadaxe, Adze" },
            { label: "Footprint", value: "320 sq. ft." },
        ],
    },
    {
        id: "step-2",
        year: "1795",
        title: "Mortise-and-Tenon Framing",
        subtitle: "Heavy Timber Joinery & Structural Rigidity",
        paragraphs: [
            "As the initial settlement matured, builders sought greater structural longevity and architectural volume by transitioning from rough log construction to sophisticated heavy timber framing. Seasoned white oak and eastern white pine were selected for their exceptional structural rigidity and resistance to decay across multi-story spans.",
            "Master housewrights employed precision hand tools including T-handled auger bits for mortise boring deep circular cavities, followed by heavy framing chisels to clear rectangular mortise slots. Post and girt connections were painstakingly scribed and fitted on the ground to ensure exact geometric alignment before erection.",
            "Each structural joint relied on precision joinery rather than metal fasteners. Tenons carved at the ends of connecting girts and summer beams slid snugly into corresponding mortise pockets, creating a robust framework capable of supporting heavy second-story live loads and resisting lateral wind shear.",
            "To lock the joinery permanently in place, master craftsmen utilized draw-boring techniques with tapered wooden treenail pegs. Offset holes were drilled through the mortise and tenon, and seasoned hickory pegs were driven home, pulling the joint tightly together under tremendous mechanical tension.",
            "The raising of the timber bents was a communal undertaking requiring block and tackle pulleys, wooden pikes, and coordinated manpower. Once raised and pegged, the self-supporting timber cage stood braced against New England storm gales, forming an enduring skeleton that would endure centuries.",
        ],
        description:
            "As the initial settlement matured, builders sought greater structural longevity and architectural volume by transitioning from rough log construction to sophisticated heavy timber framing. Seasoned white oak and eastern white pine were selected for their exceptional structural rigidity and resistance to decay across multi-story spans.\n\nMaster housewrights employed precision hand tools including T-handled auger bits for mortise boring deep circular cavities, followed by heavy framing chisels to clear rectangular mortise slots. Post and girt connections were painstakingly scribed and fitted on the ground to ensure exact geometric alignment before erection.\n\nEach structural joint relied on precision joinery rather than metal fasteners. Tenons carved at the ends of connecting girts and summer beams slid snugly into corresponding mortise pockets, creating a robust framework capable of supporting heavy second-story live loads and resisting lateral wind shear.",
        specs: [
            { label: "Joinery", value: "Mortise-and-Tenon" },
            { label: "Fasteners", value: "Draw-Bored Treenails" },
            { label: "Tooling", value: "T-Handle Auger Bit" },
            { label: "Timber", value: "Seasoned White Oak" },
        ],
    },
    {
        id: "step-3",
        year: "1810",
        title: "Geology & Landscape",
        subtitle: "Bedrock Adaptation & Natural Drainage",
        paragraphs: [
            "As agricultural operations expanded, builders sought permanent subterranean storage by engaging directly with the site's underlying geology. Deep excavations for enlarged root cellars exposed dense veins of metamorphic granite bedrock and impervious clay subsoils, requiring structural adaptation rather than resistance.",
            "Dry-laid fieldstone footings were laboriously assembled right atop the granite glacial erratic footing ledge cleared from surrounding arable meadows. Master stonemasons keyed these massive granite foundations directly onto the bedrock shelf without mortar, relying on gravity and precise geometric friction to resist heave from seasonal freeze-thaw cycles and heavy frost penetration.",
            "Subterranean cutaway profiling revealed the complex stratification of topsoil, glacial till, and bedrock shelves. By understanding these natural geological horizons, builders anchored the bearing walls directly over structural ledges capable of distributing multi-ton loads without differential settlement.",
            "To protect timber sills from rot and groundwater inundation, homesteaders engineered gravity perimeter trench drainage around foundation walls. By mapping the natural topography and subterranean hydrological flow, they diverted seasonal runoff away from the cellar walls, establishing an enduring relationship between the domestic footprint and the natural contour of the land.",
            "The cellar floor itself was stepped and leveled directly into the granite shelf, creating cool, stable thermal zones (+420m ASL elevation) where root crops and preserved provisions remained at a steady 50°F year-round, shielded from surface frost.",
        ],
        description:
            "As agricultural operations expanded, builders sought permanent subterranean storage by engaging directly with the site's underlying geology. Deep excavations for enlarged root cellars exposed dense veins of metamorphic granite bedrock and impervious clay subsoils, requiring structural adaptation rather than resistance.\n\nDry-laid fieldstone footings were laboriously assembled right atop the granite glacial erratic footing ledge cleared from surrounding arable meadows. Master stonemasons keyed these massive granite foundations directly onto the bedrock shelf without mortar, relying on gravity and precise geometric friction to resist heave from seasonal freeze-thaw cycles and heavy frost penetration.\n\nTo protect timber sills from rot and groundwater inundation, homesteaders engineered gravity perimeter trench drainage around foundation walls. By mapping the natural topography and subterranean hydrological flow, they diverted seasonal runoff away from the cellar walls, establishing an enduring relationship between the domestic footprint and the natural contour of the land.",
        specs: [
            { label: "Substratum", value: "Granite Bedrock" },
            { label: "Footing", value: "Dry-Laid Fieldstone" },
            { label: "Drainage", value: "Gravity Trenching" },
            { label: "Elevation", value: "+420m ASL" },
        ],
    },
    {
        id: "step-4",
        year: "1835",
        title: "Watercourse & Millwright",
        subtitle: "Hydraulic Power & Mechanical Transmission",
        paragraphs: [
            "The presence of a perennial stream running along the valley contour prompted the construction of a mechanized watercourse and timber milling facility. By damming the brook and excavating a regulated millrace, homesteaders harnessed hydraulic potential to replace exhaustive manual sawing with automated kinetic power.",
            "At the heart of the hydraulic works stood a wooden overshot waterwheel bucket profile engineered by specialized millwrights. Water delivered via an elevated wooden flume poured into carefully angled buckets, maximizing gravitational torque and rotational momentum across the central oak axle.",
            "Flume flow and water velocity were controlled precisely through vertical iron-bound sluice gates. By raising or lowering the weir gate with mechanical rack-and-pinion levers, the miller adjusted hydraulic output in real-time to match seasonal water volume and sawing load variations.",
            "Rotational kinetic energy from the waterwheel was transmitted inland through an intricate train featuring a trundle lantern crown gear and heavy wooden drive shafts. Masterfully carved applewood cog teeth meshed smoothly to step up rotational speed and redirect torque 90 degrees upward into the mill floor.",
            "This mechanical gearing powered vertical reciprocating saw blades and heavy rotating granite millstones. The automated output transformed local forestry and grain harvesting, multiplying productivity twelvefold and turning the homestead into a regional agricultural hub.",
        ],
        description:
            "The presence of a perennial stream running along the valley contour prompted the construction of a mechanized watercourse and timber milling facility. By damming the brook and excavating a regulated millrace, homesteaders harnessed hydraulic potential to replace exhaustive manual sawing with automated kinetic power.\n\nAt the heart of the hydraulic works stood a wooden overshot waterwheel bucket profile engineered by specialized millwrights. Water delivered via an elevated wooden flume poured into carefully angled buckets, maximizing gravitational torque and rotational momentum across the central oak axle.\n\nRotational kinetic energy from the waterwheel was transmitted inland through an intricate train featuring a trundle lantern crown gear and heavy wooden drive shafts. Masterfully carved applewood cog teeth meshed smoothly to step up rotational speed and redirect torque 90 degrees upward into the mill floor.",
        specs: [
            { label: "Power Source", value: "16-Blade Overshot Wheel" },
            { label: "Transmission", value: "Trundle Crown Gears" },
            { label: "Head Height", value: "14-Foot Drop" },
            { label: "Output", value: "12 Horsepower Equiv." },
        ],
    },
    {
        id: "step-5",
        year: "1860",
        title: "Industrial Revolution",
        subtitle: "Steam-Milled Lumber & Iron Reinforcement",
        paragraphs: [
            "By the mid-nineteenth century, the arrival of steam-powered sawmills and regional rail networks revolutionized rural building practices. Heavy post-and-beam timber framing gave way to balloon framing, utilizing standardized, steam-milled dimensioned lumber attached with mass-produced cut wire nails. This industrial shift accelerated construction speed and allowed for more flexible interior layouts.",
            "Standardized 2x4 framing members arrived by rail, where each steam-milled 2x4 balloon framing stud on sill plate rose continuously from the foundation all the way to the roof rafters. This continuous framing method allowed for rapid assembly by smaller work crews using machine-cut nails, transforming residential construction from a specialized craft into an industrial assembly process.",
            "Industrial metallurgy provided significant structural reinforcement and spatial expansion. Wrought iron tie-rods, cast-iron lintels, and masonry reinforcements enabled taller, multi-story additions with expansive window openings that flooded interior parlors with natural light and improved ventilation across the entire homestead.",
            "Across long floor spans, a wrought iron tie-rod with turnbuckle was anchored through exterior plates. By tightening these metal rods, builders counteracted outward structural spreading and locked the framing rigidly under heavy second-story loads.",
            "Technological modernization extended deep into homestead infrastructure with the introduction of mechanized water pumping systems. Hand-driven and steam-powered mechanical pumps drew pristine water from deep aquifers directly into indoor copper plumbing, fundamentally transforming domestic labor, sanitation hygiene, and the daily rhythm of agrarian life.",
        ],
        description:
            "By the mid-nineteenth century, the arrival of steam-powered sawmills and regional rail networks revolutionized rural building practices. Heavy post-and-beam timber framing gave way to balloon framing, utilizing standardized, steam-milled dimensioned lumber attached with mass-produced cut wire nails. This industrial shift accelerated construction speed and allowed for more flexible interior layouts.\n\nIndustrial metallurgy provided significant structural reinforcement and spatial expansion. Wrought iron tie-rods, cast-iron lintels, and masonry reinforcements enabled taller, multi-story additions with expansive window openings that flooded interior parlors with natural light and improved ventilation across the entire homestead.\n\nTechnological modernization extended deep into homestead infrastructure with the introduction of mechanized water pumping systems. Hand-driven and steam-powered mechanical pumps drew pristine water from deep aquifers directly into indoor copper plumbing, fundamentally transforming domestic labor, sanitation hygiene, and the daily rhythm of agrarian life.",
        specs: [
            { label: "Framing", value: "Balloon Framing (2x4)" },
            { label: "Reinforcement", value: "Wrought Iron Tie-Rods" },
            { label: "Utilities", value: "Steam Mechanized Pump" },
            { label: "Footprint", value: "1,200 sq. ft." },
        ],
    },
    {
        id: "step-6",
        year: "1885",
        title: "Victorian Expansion",
        subtitle: "Ornamental Millwork & Gas Lighting Infrastructure",
        paragraphs: [
            "As agricultural wealth reached its zenith in the late nineteenth century, the homestead underwent a decorative Victorian expansion. Aesthetic tastes shifted toward ornate Queen Anne detailing, prominent wraparound verandas, and complex multi-gabled roof profiles that expressed domestic pride and craftsmanship.",
            "High-speed steam-powered spindle lathes in regional millwork shops produced intricate decorative components, such as a spindle lathe turned porch baluster profile. Elaborate turned balusters, gingerbread gable scrollwork, and chamfered porch columns were shipped by rail and assembled to transform the exterior facade with rich architectural shadow lines.",
            "The exterior skin was enhanced with patterned fish-scale cedar shingles, decorative frieze boards, and projected bay windows. These multi-faceted fenestrations captured morning and afternoon sunlight while creating elegant interior alcoves for parlor seating and botanical conservatories.",
            "Interior modernization took a giant leap forward with the installation of a centralized gas illumination network fed by a threaded black-iron gas pipe manifold. Heavy threaded black-iron gas pipes were plumbed through basement walls and floor cavities, distributing fuel safely to wall-mounted brass sconces and overhead chandeliers.",
            "The soft glow of gas lighting extended active domestic life far beyond twilight hours. Combined with ornamental plaster ceiling medallions and embossed wallcoverings, the homestead achieved an unprecedented level of interior refinement and technological comfort.",
        ],
        description:
            "As agricultural wealth reached its zenith in the late nineteenth century, the homestead underwent a decorative Victorian expansion. Aesthetic tastes shifted toward ornate Queen Anne detailing, prominent wraparound verandas, and complex multi-gabled roof profiles that expressed domestic pride and craftsmanship.\n\nHigh-speed steam-powered spindle lathes in regional millwork shops produced intricate decorative components, such as a spindle lathe turned porch baluster profile. Elaborate turned balusters, gingerbread gable scrollwork, and chamfered porch columns were shipped by rail and assembled to transform the exterior facade with rich architectural shadow lines.\n\nInterior modernization took a giant leap forward with the installation of a centralized gas illumination network fed by a threaded black-iron gas pipe manifold. Heavy threaded black-iron gas pipes were plumbed through basement walls and floor cavities, distributing fuel safely to wall-mounted brass sconces and overhead chandeliers.",
        specs: [
            { label: "Millwork", value: "Spindle Lathe Balusters" },
            { label: "Lighting", value: "Black-Iron Gas Manifold" },
            { label: "Siding", value: "Fish-Scale Shingles" },
            { label: "Style", value: "Victorian / Queen Anne" },
        ],
    },
    {
        id: "step-7",
        year: "1900",
        title: "Gradual Farm Improvements",
        subtitle: "Agrarian Complex & Stone Boundary Walls",
        paragraphs: [
            "At the turn of the twentieth century, decades of agricultural prosperity culminated in the transformation of the isolated homestead into a sophisticated, multi-building agrarian complex. The domestic dwelling was flanked by towering timber frame barns, specialized granaries, and livestock outbuildings designed for maximum operational efficiency.",
            "Miles of dry-stone boundary walls, built from generations of frost-heaved fieldstones, crisscrossed the rolling landscape where a dry-stone boundary wall with pollinator cavity demarcated pasture lands. Master stonemasons assembled these walls without mortar, deliberately incorporating internal gaps for wildlife.",
            "These enduring stone enclosures not only organized the agrarian layout and contained grazing herds, but also created vital microhabitats for native small mammals, songbirds, and beneficial solitary bees that pollinated the adjacent fruit orchards.",
            "Water management reached a new level of sophistication through structured irrigation channels regulated by an adjustable irrigation sluice weir gate. Precision wooden weir gates allowed farmers to divert exact volumes of stream water into gravity-fed orchard furrows.",
            "By harnessing and directing nearby perennial streams through engineered granite culverts, farmers established thriving heirloom orchards and expansive grain fields, sustaining a resilient, self-sufficient rural economy across 45 cultivated acres.",
        ],
        description:
            "At the turn of the twentieth century, decades of agricultural prosperity culminated in the transformation of the isolated homestead into a sophisticated, multi-building agrarian complex. The domestic dwelling was flanked by towering timber frame barns, specialized granaries, and livestock outbuildings designed for maximum operational efficiency.\n\nMiles of dry-stone boundary walls, built from generations of frost-heaved fieldstones, crisscrossed the rolling landscape where a dry-stone boundary wall with pollinator cavity demarcated pasture lands. Master stonemasons assembled these walls without mortar, deliberately incorporating internal gaps for wildlife.\n\nWater management reached a new level of sophistication through structured irrigation channels regulated by an adjustable irrigation sluice weir gate. Precision wooden weir gates allowed farmers to divert exact volumes of stream water into gravity-fed orchard furrows.",
        specs: [
            { label: "Outbuildings", value: "Timber Barn & Granary" },
            { label: "Enclosure", value: "Dry-Stone Boundary Walls" },
            { label: "Irrigation", value: "Sluice Weir Gates" },
            { label: "Acreage", value: "45 Acres Cultivated" },
        ],
    },
    {
        id: "step-8",
        year: "1925",
        title: "Electrification & Heating",
        subtitle: "Knob-and-Tube Wiring & Hydronic Radiators",
        paragraphs: [
            "The arrival of rural electrification in 1925 marked one of the most profound technological milestones in the homestead's history. Power lines strung from regional hydroelectric generators brought clean, continuous electrical current right to the farmhouse service entrance.",
            "Electricians routed copper conductors through ceiling and floor joists supported by each porcelain knob-and-tube insulator. These glazed ceramic tubes and cleats maintained safe physical separation between live wires and dry wooden framing, preventing electrical spark arcs while powering overhead lighting circuits.",
            "In tandem with electrical illumination, central heating replaced scattered wood-burning parlor stoves. A high-capacity coal-fired boiler installed in the cellar circulated heated water through closed-loop iron piping to cast-iron hot water radiators positioned under windows throughout the house.",
            "The fluted, multi-column shape of each cast-iron hot water radiator fin profile maximized surface area for convective air currents and gentle thermal radiation. This hydronic system delivered draft-free, uniform warmth across every room, stabilizing interior temperatures during harsh winter freezes.",
            "On the exterior clapboard siding near the service entry, an external watt-hour induction meter disk spun continuously inside its glass enclosure. This spinning electromechanical disc tracked cumulative power usage, connecting the rural dwelling directly to the modern energy economy.",
        ],
        description:
            "The arrival of rural electrification in 1925 marked one of the most profound technological milestones in the homestead's history. Power lines strung from regional hydroelectric generators brought clean, continuous electrical current right to the farmhouse service entrance.\n\nElectricians routed copper conductors through ceiling and floor joists supported by each porcelain knob-and-tube insulator. These glazed ceramic tubes and cleats maintained safe physical separation between live wires and dry wooden framing, preventing electrical spark arcs while powering overhead lighting circuits.\n\nThe fluted, multi-column shape of each cast-iron hot water radiator fin profile maximized surface area for convective air currents and gentle thermal radiation. This hydronic system delivered draft-free, uniform warmth across every room, stabilizing interior temperatures during harsh winter freezes.",
        specs: [
            { label: "Electrical", value: "Knob-and-Tube Wiring" },
            { label: "Heating", value: "Hydronic Cast Radiators" },
            { label: "Metering", value: "Spinning Induction Disk" },
            { label: "Voltage", value: "110V AC Single-Phase" },
        ],
    },
    {
        id: "step-9",
        year: "1950",
        title: "Decline & Abandonment",
        subtitle: "Weathering, Roof Sag & Botanical Reclamation",
        paragraphs: [
            "Following post-war economic shifts and the rapid industrialization of agriculture, the historic homestead experienced a profound transition as cultivation ceased and human occupants departed. Left without regular maintenance, the structure entered a prolonged period of architectural weathering and environmental exposure.",
            "Winter freeze-thaw cycles and heavy snow accumulation initiated structural compromise across the roofline, visible in weathered timber siding erosion & rafter sag curve. Untreated timber rafters sagged downward under persistent moisture loads, creating a pronounced deflection that dislodged slate shingles from their battens.",
            "On the exterior walls, decades of wind-driven rain caused severe grain erosion across the cedar siding. Lime mortar joints between fieldstones leached away under acidic rainfall, leaving exterior foundation walls vulnerable to moisture intrusion and differential frost settlement.",
            "In the absence of human intervention, ecological succession rapidly reclaimed the built environment as a pioneer tree root masonry fracture formed along the footing. Pioneer saplings and sugar maples took root in the accumulated leaf litter along the foundation, driving sturdy roots into masonry joints.",
            "Wild grapevines, poison ivy, and Virginia creeper climbed the siding, enveloping cracked windowpanes and framing bents in a dense botanical canopy. The decaying architecture slowly merged back into the surrounding forest ecosystem, entering a state of romantic structural repose.",
        ],
        description:
            "Following post-war economic shifts and the rapid industrialization of agriculture, the historic homestead experienced a profound transition as cultivation ceased and human occupants departed. Left without regular maintenance, the structure entered a prolonged period of architectural weathering and environmental exposure.\n\nWinter freeze-thaw cycles and heavy snow accumulation initiated structural compromise across the roofline, visible in weathered timber siding erosion & rafter sag curve. Untreated timber rafters sagged downward under persistent moisture loads, creating a pronounced deflection that dislodged slate shingles from their battens.\n\nIn the absence of human intervention, ecological succession rapidly reclaimed the built environment as a pioneer tree root masonry fracture formed along the footing. Pioneer saplings and sugar maples took root in the accumulated leaf litter along the foundation, driving sturdy roots into masonry joints.",
        specs: [
            { label: "Structural State", value: "Compromised / Rafter Sag" },
            { label: "Weathering", value: "Severe Mortar Leaching" },
            { label: "Overgrowth", value: "Pioneer Root Fractures" },
            { label: "Human Occupancy", value: "0 (Abandoned)" },
        ],
    },
    {
        id: "step-10",
        year: "1965",
        title: "Emergency Shoring & Stabilization",
        subtitle: "Screw-Jack Columns & Structural Halts",
        paragraphs: [
            "Alarmed by the imminent threat of catastrophic collapse, local historical preservationists and structural engineers intervened in 1965 to execute emergency stabilization measures. Their primary goal was to arrest ongoing structural deflection and weatherproof the vulnerable building envelope before the harsh winter season.",
            "In the damp root cellar, engineers inserted an adjustable screw-jack steel lally column beneath the sagging main summer beams and girders. By turning the threaded collars with heavy wrenches, teams applied upward jacking force to halt downward deflection and stabilize the compromised timber structure.",
            "Where historic oak sill plates had rotted entirely from ground contact, temporary reinforced concrete pads were poured onto the basement dirt floor. The screw-jack columns transferred multi-ton dead loads directly onto these new concrete footings, bypassing the deteriorated perimeter masonry.",
            "On the exterior, structural stabilization strapping was applied across bulging masonry sections, while utility service was tracked by an external watt-hour induction meter disk. Modern weatherproof service panels were installed to provide safe temporary site power for restoration machinery and diagnostic illumination.",
            "Compromised sections of the sagging roof structure were covered with heavy tar canvas sheeting and timber battens. This rapid weatherproofing intervention successfully sealed out rain and snowmelt, preserving the historic timber skeleton while comprehensive architectural restoration plans were prepared.",
        ],
        description:
            "Alarmed by the imminent threat of catastrophic collapse, local historical preservationists and structural engineers intervened in 1965 to execute emergency stabilization measures. Their primary goal was to arrest ongoing structural deflection and weatherproof the vulnerable building envelope before the harsh winter season.\n\nIn the damp root cellar, engineers inserted an adjustable screw-jack steel lally column beneath the sagging main summer beams and girders. By turning the threaded collars with heavy wrenches, teams applied upward jacking force to halt downward deflection and stabilize the compromised timber structure.\n\nOn the exterior, structural stabilization strapping was applied across bulging masonry sections, while utility service was tracked by an external watt-hour induction meter disk. Modern weatherproof service panels were installed to provide safe temporary site power for restoration machinery and diagnostic illumination.",
        specs: [
            { label: "Shoring", value: "Screw-Jack Lally Columns" },
            { label: "Load Transfer", value: "Temporary Concrete Pads" },
            { label: "Weatherproofing", value: "Heavy Tar Canvas Sheeting" },
            { label: "Status", value: "Emergency Stabilization" },
        ],
    },
    {
        id: "step-11",
        year: "1980",
        title: "Modernization Planning",
        subtitle: "Blueprint Overlays & Hydraulic Jacking",
        paragraphs: [
            "A new chapter of formal preservation commenced in 1980 as conservation engineers and historic architects initiated a rigorous, scientific restoration program. Detailed structural assessments and crisp technical blueprint overlays (A-101) were generated to map every timber framing member and masonry defect with millimeter precision.",
            "To correct two centuries of differential foundation settlement, teams positioned a 12-ton hydraulic jack ram under joists and bearing girders. Working in synchronized increments monitored by laser transit realignment, the jacks gently lifted the sagging floors back to true horizontal datum without overstressing historic joints.",
            "Where historic timber girders exhibited excessive deflection under modern design criteria, concealed structural steel C-channel grids and steel lintels were inserted parallel to the original oak beams. This hidden structural reinforcement carried all heavy floor live loads while preserving the authentic visual aesthetic of the exposed 18th-century timbers.",
            "Deteriorated sections of the white oak sill plates were surgically excavated and repaired using a pressure injection epoxy resin splice. Liquid epoxy resins infused under pressure bonded period-correct hardwood prosthetics to sound ancient timber, restoring full compressive and tensile strength.",
            "This meticulous conservation methodology successfully bridged historical preservation integrity with modern residential building codes. The stabilized and reinforced shell now stood fully capable of supporting contemporary domestic living standards while celebrating its authentic material history.",
        ],
        description:
            "A new chapter of formal preservation commenced in 1980 as conservation engineers and historic architects initiated a rigorous, scientific restoration program. Detailed structural assessments and crisp technical blueprint overlays (A-101) were generated to map every timber framing member and masonry defect with millimeter precision.\n\nTo correct two centuries of differential foundation settlement, teams positioned a 12-ton hydraulic jack ram under joists and bearing girders. Working in synchronized increments monitored by laser transit realignment, the jacks gently lifted the sagging floors back to true horizontal datum without overstressing historic joints.\n\nDeteriorated sections of the white oak sill plates were surgically excavated and repaired using a pressure injection epoxy resin splice. Liquid epoxy resins infused under pressure bonded period-correct hardwood prosthetics to sound ancient timber, restoring full compressive and tensile strength.",
        specs: [
            { label: "Methodology", value: "Structural Conservation" },
            { label: "Lifting", value: "12-Ton Hydraulic Rams" },
            { label: "Repair", value: "Epoxy Resin Splice" },
            { label: "Target Load", value: "Modern Code Compliance" },
        ],
    },
    {
        id: "step-12",
        year: "1995",
        title: "Radon Mitigation & Perimeter Drainage",
        subtitle: "Subterranean Soil Gas Control & French Drains",
        paragraphs: [
            "Deep subterranean geotechnical assessments conducted during basement restoration revealed natural soil gas permeability across the underlying granite bedrock strata. Radioactive radon gas rising from decaying uranium in the deep ledge required active subterranean soil mechanics and gas interception to ensure healthy indoor air quality.",
            "Engineers excavated a sub-slab radon suction core pit beneath the newly poured basement concrete slab. Perforated collection pipes embedded inside washed drainage gravel intercepted soil gas before it could penetrate the living space, directing it into a sealed vertical riser pipe.",
            "An inline continuous PVC exhaust fan system mounted in the attic created permanent negative pressure beneath the basement floor slab. Soil gases drawn into the suction core pit were safely evacuated and discharged above the roofline high into the atmosphere.",
            "Simultaneously, groundwater infiltration was eliminated by installing a perforated PVC French drain in washed gravel laid at the exterior footing level (-12 Ft. Below Grade). Perforated PVC conduits wrapped in permeable geotextile fabric intercepted subterranean groundwater.",
            "This subterranean drainage network relieved hydrostatic groundwater pressure vectors acting against foundation walls. Water draining into the washed gravel was diverted away by gravity to a daylight discharge basin in the lower meadow, leaving the granite cellar permanently bone-dry.",
        ],
        description:
            "Deep subterranean geotechnical assessments conducted during basement restoration revealed natural soil gas permeability across the underlying granite bedrock strata. Radioactive radon gas rising from decaying uranium in the deep ledge required active subterranean soil mechanics and gas interception to ensure healthy indoor air quality.\n\nEngineers excavated a sub-slab radon suction core pit beneath the newly poured basement concrete slab. Perforated collection pipes embedded inside washed drainage gravel intercepted soil gas before it could penetrate the living space, directing it into a sealed vertical riser pipe.\n\nSimultaneously, groundwater infiltration was eliminated by installing a perforated PVC French drain in washed gravel laid at the exterior footing level (-12 Ft. Below Grade). Perforated PVC conduits wrapped in permeable geotextile fabric intercepted subterranean groundwater.",
        specs: [
            { label: "Soil Gas", value: "Sub-Slab Radon Suction" },
            { label: "Drainage", value: "Perforated PVC French Drain" },
            { label: "Substratum", value: "Granite / Washed Gravel" },
            { label: "Fan System", value: "Continuous Inline Exhaust" },
        ],
    },
    {
        id: "step-13",
        year: "2010",
        title: "Ecological Insulation & Glazing",
        subtitle: "Thermal Envelopes & Triple Glazing",
        paragraphs: [
            "In response to 21st-century environmental engineering mandates and zero-carbon energy targets, the homestead underwent a comprehensive high-performance thermal retrofitting. The primary focus was creating a continuous, airtight building envelope without altering the historic exterior architectural profile.",
            "Inside the wall cavities between exterior cedar siding and interior framing, contractors sprayed an R-45 closed-cell spray foam wall cavity barrier. This monolithic polyurethane foam insulation expanded to seal every gap, crack, and mortise joint, establishing an impenetrable barrier against air leakage and vapor diffusion.",
            "All perimeter rim joists, attic rafters, and foundation interfaces were meticulously sealed with elastomeric membranes. This zero-draft encapsulation eliminated convective heat loss and transformed the drafty historic structure into a high-efficiency thermal vessel.",
            "Historic window openings were fitted with a triple-pane Low-E argon glazing profile set in insulated hardwood sash frames. The argon gas fill between the three glass panes provided superior thermal resistance while Low-E metallic coatings reflected interior radiant heat back into the living space.",
            "By eradicating thermal bridging across walls and fenestration, the building achieved an exceptional overall U-factor (0.022 BTUs/hr-sq.ft-°F). Coupled with deep ground-source geothermal loops bored 400 feet into bedrock, the home achieved whisper-quiet, ultra-efficient radiant climate control.",
        ],
        description:
            "In response to 21st-century environmental engineering mandates and zero-carbon energy targets, the homestead underwent a comprehensive high-performance thermal retrofitting. The primary focus was creating a continuous, airtight building envelope without altering the historic exterior architectural profile.\n\nInside the wall cavities between exterior cedar siding and interior framing, contractors sprayed an R-45 closed-cell spray foam wall cavity barrier. This monolithic polyurethane foam insulation expanded to seal every gap, crack, and mortise joint, establishing an impenetrable barrier against air leakage and vapor diffusion.\n\nHistoric window openings were fitted with a triple-pane Low-E argon glazing profile set in insulated hardwood sash frames. The argon gas fill between the three glass panes provided superior thermal resistance while Low-E metallic coatings reflected interior radiant heat back into the living space.",
        specs: [
            { label: "Envelope", value: "Closed-Cell Foam (R-45)" },
            { label: "Glazing", value: "Triple-Pane Low-E Argon" },
            { label: "Air Sealing", value: "Elastomeric Vapor Barrier" },
            { label: "HVAC", value: "Geothermal Radiant Loop" },
        ],
    },
    {
        id: "step-14",
        year: "Present",
        title: "Present Modern Design",
        subtitle: "Minimalist Architectural Synthesis & Energy Independence",
        paragraphs: [
            "Today, the homestead stands as a breathtaking architectural synthesis of centuries-old agrarian craftsmanship and uncompromising minimalist contemporary design. The restored 1780 fieldstone hearth and hand-hewn white oak timbers serve as tactile, historical monuments anchored within an expansive, light-filled modern interior.",
            "Bold structural engineering defines the contemporary addition, featuring a cantilevered steel W12x50 moment connection. These high-strength steel beams support frameless floor-to-ceiling glass curtain walls that dissolve the visual boundary between the interior living space and the surrounding meadow landscape.",
            "The high-contrast juxtaposition between rough historic masonry, textured old-growth oak, and sleek industrial black steel creates a dynamic visual dialogue across 240 years of architectural history. Every structural transition is celebrated with crisp, honest detailing.",
            "Energy independence is achieved through advanced microgrid infrastructure utilizing a bi-directional V2H battery rack in the utility annex. This intelligent storage system balances clean energy generated by discreet rooftop cantilevered solar PV arrays (R-60 Core roof system) with electric vehicle fast-charging.",
            "Operating at net-negative carbon emissions (-15% positive generation), the 3,800-square-foot residence powers daily living and a Level 2 EV charging bay entirely from renewable resources. By honoring every era of its built heritage while pioneering future structural and ecological design, the homestead exemplifies timeless living architecture.",
        ],
        description:
            "Today, the homestead stands as a breathtaking architectural synthesis of centuries-old agrarian craftsmanship and uncompromising minimalist contemporary design. The restored 1780 fieldstone hearth and hand-hewn white oak timbers serve as tactile, historical monuments anchored within an expansive, light-filled modern interior.\n\nBold structural engineering defines the contemporary addition, featuring a cantilevered steel W12x50 moment connection. These high-strength steel beams support frameless floor-to-ceiling glass curtain walls that dissolve the visual boundary between the interior living space and the surrounding meadow landscape.\n\nEnergy independence is achieved through advanced microgrid infrastructure utilizing a bi-directional V2H battery rack in the utility annex. This intelligent storage system balances clean energy generated by discreet rooftop cantilevered solar PV arrays (R-60 Core roof system) with electric vehicle fast-charging.",
        specs: [
            { label: "Footprint / EV", value: "3,800 sq. ft. / Level 2 EV Bay" },
            { label: "Structure", value: "Cantilevered W12x50 Steel" },
            { label: "Microgrid", value: "Bi-Directional V2H Battery" },
            { label: "Net Energy", value: "-15% (Positive Generation)" },
        ],
    },
    {
        id: "step-15",
        year: "Geotechnical",
        title: "Geotechnical Engineering Drill-down",
        subtitle: "Soil Mechanics & Stress Bulb Distribution",
        paragraphs: [
            "A dedicated geotechnical engineering drill-down reveals the complex subterranean soil mechanics governing foundation stability under the restored 3,800-square-foot residence. Subsurface bore logs and strata profiling map the exact load transfer paths from surface footings down to deep bedrock ledges.",
            "Beneath the dry-laid fieldstone footings, structural loads propagate through glacial till layers where the soil strata stress bulb distribution curve models subterranean bearing contour lines. Charting these contours demonstrates how pressure widens and attenuates as depth increases into the dense substratum.",
            "Laboratory soil mechanics testing confirms a safe soil bearing capacity of 3.5 tons per square foot across the compacted glacial till and clay horizons. This robust bearing threshold ensures zero differential settlement under multi-story dead and live loads.",
            "Lateral subterranean analysis focuses on a hydrostatic groundwater pressure vector acting against the deep basement retaining walls (-12 Ft. Below Grade). During heavy seasonal rainfall, saturated soil attempts to exert immense horizontal shear force against perimeter masonry.",
            "The combination of washed gravel backfill, geotextile filtration fabric, and sub-slab perimeter drainage channels completely intercepts and dissipates these hydrostatic vectors. By reducing lateral water pressure to absolute zero, the geotechnical design guarantees perpetual subterranean structural integrity.",
        ],
        description:
            "A dedicated geotechnical engineering drill-down reveals the complex subterranean soil mechanics governing foundation stability under the restored 3,800-square-foot residence. Subsurface bore logs and strata profiling map the exact load transfer paths from surface footings down to deep bedrock ledges.\n\nBeneath the dry-laid fieldstone footings, structural loads propagate through glacial till layers where the soil strata stress bulb distribution curve models subterranean bearing contour lines. Charting these contours demonstrates how pressure widens and attenuates as depth increases into the dense substratum.\n\nLateral subterranean analysis focuses on a hydrostatic groundwater pressure vector acting against the deep basement retaining walls (-12 Ft. Below Grade). During heavy seasonal rainfall, saturated soil attempts to exert immense horizontal shear force against perimeter masonry.",
        specs: [
            { label: "Discipline", value: "Geotechnical Engineering" },
            { label: "Bearing Capacity", value: "3.5 Tons / Sq. Ft." },
            { label: "Stress Model", value: "Boussinesq Stress Bulb" },
            { label: "Water Table", value: "-12 Ft. Below Grade" },
        ],
    },
    {
        id: "step-16",
        year: "Thermodynamics",
        title: "Thermodynamics Drill-down",
        subtitle: "Heat Flux & Dew-Point Condensation Planes",
        paragraphs: [
            "A rigorous building physics and thermodynamics drill-down quantifies the thermal envelope performance across the hybrid historic and contemporary wall sections. Advanced finite element thermal modeling verifies heat flux vectors across every material boundary.",
            "Critical to envelope longevity is exact dew-point condensation plane tracking within the multi-layered wall assembly. Temperature and vapor pressure gradients are plotted across exterior cedar siding, air gaps, wood fiber sheathing, and interior closed-cell foam.",
            "Thermal analysis confirms that the dew-point temperature plane occurs exclusively on the exterior face of the vapor-impermeable closed-cell foam insulation. This ensures that any interstitial moisture remains outside the timber framing, preventing winter condensation, mold formation, and structural wood rot.",
            "Continuous exterior wood fiber insulation board overlays achieve complete infrared thermal bridging elimination across structural posts and studs. Thermographic heat flux mapping proves zero cold spotting and uniform surface temperatures across interior walls (U-Factor: 0.022 BTUs/hr-sq.ft-°F).",
            "Multi-layer conductive, convective, and radiative heat transfer calculations demonstrate a staggering 94.2% reduction in total thermal loss compared to the 1780 log cabin baseline. This thermodynamic mastery enables ultra-low-energy climate comfort in any extreme weather conditions.",
        ],
        description:
            "A rigorous building physics and thermodynamics drill-down quantifies the thermal envelope performance across the hybrid historic and contemporary wall sections. Advanced finite element thermal modeling verifies heat flux vectors across every material boundary.\n\nCritical to envelope longevity is exact dew-point condensation plane tracking within the multi-layered wall assembly. Temperature and vapor pressure gradients are plotted across exterior cedar siding, air gaps, wood fiber sheathing, and interior closed-cell foam.\n\nContinuous exterior wood fiber insulation board overlays achieve complete infrared thermal bridging elimination across structural posts and studs. Thermographic heat flux mapping proves zero cold spotting and uniform surface temperatures across interior walls (U-Factor: 0.022 BTUs/hr-sq.ft-°F).",
        specs: [
            { label: "Discipline", value: "Building Thermodynamics" },
            { label: "U-Factor", value: "0.022 BTUs/hr-sq.ft-°F" },
            { label: "Dew-Point", value: "Exterior of Vapor Barrier" },
            { label: "Heat Loss Reduc.", value: "94.2% vs. 1780 Baseline" },
        ],
    },
    {
        id: "step-17",
        year: "Kinematics",
        title: "Structural Kinematics Drill-down",
        subtitle: "Load Vectors & Shear Deflection",
        paragraphs: [
            "The final engineering analysis presents a comprehensive structural kinematics drill-down examining static equilibrium, dynamic moment resistance, and wind-load deflection across the entire architectural complex. Vector mechanics illustrate the exact equilibrium of forces keeping the structure upright.",
            "A dead vs live load vector diagram maps the continuous downward gravity loads from roof snow accumulation down through timber trusses, girders, and steel columns into the granite footings. Permanent dead loads (32 lbs/sq.ft.) and transient live loads (40 lbs/sq.ft.) are cleanly separated in structural calculations.",
            "Under severe storm simulations featuring 90 mph wind gusts, lateral wind forces exert overturning moments against the exterior facades. Structural moment vector analysis demonstrates how the hybrid steel moment frame and braced timber shear walls work in unison to resist rotational uplift.",
            "Precision optical and strain gauge monitoring verifies wind moment shear-wall deflection limits across top-story spans. Even under maximum peak wind shear, lateral story drift is restricted to less than 0.25 inches (deflection index L/360), well below structural damage thresholds.",
            "This kinematic equilibrium between gravity loads, shear resistance, and elastic deflection limits validates the structural synthesis. By uniting 18th-century timber craftsmanship with 21st-century steel moment engineering, the Homestead Dossier achieves structural perfection that will stand for generations to come.",
        ],
        description:
            "The final engineering analysis presents a comprehensive structural kinematics drill-down examining static equilibrium, dynamic moment resistance, and wind-load deflection across the entire architectural complex. Vector mechanics illustrate the exact equilibrium of forces keeping the structure upright.\n\nA dead vs live load vector diagram maps the continuous downward gravity loads from roof snow accumulation down through timber trusses, girders, and steel columns into the granite footings. Permanent dead loads (32 lbs/sq.ft.) and transient live loads (40 lbs/sq.ft.) are cleanly separated in structural calculations.\n\nPrecision optical and strain gauge monitoring verifies wind moment shear-wall deflection limits across top-story spans. Even under maximum peak wind shear, lateral story drift is restricted to less than 0.25 inches (deflection index L/360), well below structural damage thresholds.",
        specs: [
            { label: "Discipline", value: "Structural Kinematics" },
            { label: "Dead Load", value: "32 lbs / sq. ft." },
            { label: "Live Load", value: "40 lbs / sq. ft." },
            { label: "Shear Deflection", value: "Max L/360 @ 90 mph" },
        ],
    },
];
