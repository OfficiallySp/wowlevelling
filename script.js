// WoW Leveling Calculator
// -----------------------------------------------------------------------------
// XP tables verified 19 September 2026 against Warcraft Wiki "Experience to level"
// (https://warcraft.wiki.gg/wiki/Experience_to_level).
//
// Convention: XP_TABLES.x[level - 1] = experience required to advance FROM that
// level to the next one. This matches the wiki tables directly, so the numbers
// can be re-checked without re-indexing them.
//
// Which table each live version uses:
//   WoW Forever      - vanilla 1.12 curve. Blizzard confirmed the 1-60 curve is
//                      unchanged; only the XP sources were retuned.
//   Classic Era      - vanilla 1.12 curve.
//   TBC Anniversary  - post-patch 2.3 curve (levels 11-59 cut by up to ~18%).
//   MoP Classic      - post-patch 5.3 curve. MoP Classic's Escalation patch
//                      (31 March 2026) applied the 33% cut to levels 85-89.
// -----------------------------------------------------------------------------

const XP_TABLES = {
    // Vanilla / Classic - total 1-60: 4,084,700
    vanilla: [
        400, 900, 1400, 2100, 2800, 3600, 4500, 5400, 6500, 7600,
        8800, 10100, 11400, 12900, 14400, 16000, 17700, 19400, 21300, 23200,
        25200, 27300, 29400, 31700, 34000, 36400, 38900, 41400, 44300, 47400,
        50800, 54500, 58600, 62800, 67100, 71600, 76100, 80800, 85700, 90700,
        95800, 101000, 106300, 111800, 117500, 123200, 129100, 135100, 141200, 147500,
        153900, 160400, 167100, 173900, 180800, 187900, 195000, 202300, 209800
    ],

    // The Burning Crusade, post-2.3 - total 1-70: 10,141,700 (3,379,400 of it is 1-60)
    tbc: [
        400, 900, 1400, 2100, 2800, 3600, 4500, 5400, 6500, 7600,
        8700, 9800, 11000, 12300, 13600, 15000, 16400, 17800, 19300, 20800,
        22400, 24000, 25500, 27200, 28900, 30500, 32200, 33900, 36300, 38800,
        41600, 44600, 48000, 51400, 55000, 58700, 62400, 66200, 70200, 74300,
        78500, 82800, 87100, 91600, 96300, 101000, 105800, 110700, 115700, 120900,
        126100, 131500, 137000, 142500, 148200, 154000, 159900, 165800, 172000, 494000,
        574700, 614400, 650300, 682300, 710200, 734100, 753700, 768900, 779700
    ],

    // Mists of Pandaria, post-5.3 - total 1-90: 95,883,400 (64,990,000 of it is 85-90)
    mop: [
        400, 900, 1400, 2100, 2800, 3600, 4500, 5400, 6500, 6080,
        6960, 7840, 8800, 9840, 10800, 12000, 13120, 14240, 15400, 16640,
        17920, 19200, 20400, 21760, 23120, 24400, 25760, 27120, 29040, 31040,
        33280, 35680, 38400, 41120, 44000, 46960, 49920, 52960, 56160, 74300,
        78500, 82800, 87100, 91600, 96300, 101000, 105800, 110700, 115700, 120900,
        126100, 131500, 137000, 142500, 148200, 154000, 159900, 165800, 172000, 290000,
        317000, 349000, 386000, 428000, 475000, 527000, 585000, 648000, 717000, 812700,
        821000, 830000, 838000, 847000, 855300, 865000, 873000, 882000, 891000, 1686300,
        2121500, 2642640, 3434200, 4582500, 8670000, 10050000, 12650000, 15250000, 18370000
    ]
};

// How fast you play, relative to the baseline rates below.
// Baseline ("average") assumes a normal route, no guide addon, some downtime.
const PACE_MULTIPLIERS = {
    casual: 0.6,
    average: 1.0,
    optimized: 1.6
};

// -----------------------------------------------------------------------------
// Zone recommendations
// -----------------------------------------------------------------------------

const ZONES_CLASSIC = {
    "1-10": [
        { name: "Elwynn Forest", level: "1-10", faction: "Alliance" },
        { name: "Dun Morogh", level: "1-10", faction: "Alliance" },
        { name: "Teldrassil", level: "1-10", faction: "Alliance" },
        { name: "Durotar", level: "1-10", faction: "Horde" },
        { name: "Mulgore", level: "1-10", faction: "Horde" },
        { name: "Tirisfal Glades", level: "1-10", faction: "Horde" }
    ],
    "10-20": [
        { name: "Westfall", level: "10-20", faction: "Alliance" },
        { name: "Loch Modan", level: "10-20", faction: "Alliance" },
        { name: "Darkshore", level: "10-20", faction: "Alliance" },
        { name: "The Barrens", level: "10-25", faction: "Horde" },
        { name: "Silverpine Forest", level: "10-20", faction: "Horde" }
    ],
    "20-30": [
        { name: "Redridge Mountains", level: "15-25", faction: "Alliance" },
        { name: "Duskwood", level: "18-30", faction: "Alliance" },
        { name: "Wetlands", level: "20-30", faction: "Alliance" },
        { name: "Hillsbrad Foothills", level: "20-30", faction: "Horde" },
        { name: "Ashenvale", level: "18-30", faction: "Both" },
        { name: "Stonetalon Mountains", level: "15-27", faction: "Both" },
        { name: "Thousand Needles", level: "25-35", faction: "Both" }
    ],
    "30-40": [
        { name: "Stranglethorn Vale", level: "30-45", faction: "Both" },
        { name: "Arathi Highlands", level: "30-40", faction: "Both" },
        { name: "Desolace", level: "30-40", faction: "Both" },
        { name: "Dustwallow Marsh", level: "35-45", faction: "Both" },
        { name: "Badlands", level: "35-45", faction: "Both" }
    ],
    "40-50": [
        { name: "Tanaris", level: "40-50", faction: "Both" },
        { name: "Feralas", level: "40-50", faction: "Both" },
        { name: "The Hinterlands", level: "40-50", faction: "Both" },
        { name: "Searing Gorge", level: "43-50", faction: "Both" },
        { name: "Azshara", level: "45-55", faction: "Both" }
    ],
    "50-60": [
        { name: "Un'Goro Crater", level: "48-55", faction: "Both" },
        { name: "Felwood", level: "48-55", faction: "Both" },
        { name: "Western Plaguelands", level: "50-58", faction: "Both" },
        { name: "Eastern Plaguelands", level: "53-60", faction: "Both" },
        { name: "Winterspring", level: "53-60", faction: "Both" },
        { name: "Burning Steppes", level: "50-58", faction: "Both" },
        { name: "Blasted Lands", level: "48-55", faction: "Both" },
        { name: "Silithus", level: "55-60", faction: "Both" }
    ]
};

// Forever keeps the Classic world and adds four new zones plus expanded old ones.
const ZONES_FOREVER = {
    "1-12": [
        { name: "Zephras Isle", level: "1-12", faction: "Skyborne", isNew: true },
        { name: "Elwynn Forest", level: "1-10", faction: "Alliance" },
        { name: "Dun Morogh", level: "1-10", faction: "Alliance" },
        { name: "Teldrassil", level: "1-10", faction: "Alliance" },
        { name: "Durotar", level: "1-10", faction: "Horde" },
        { name: "Mulgore", level: "1-10", faction: "Horde" },
        { name: "Tirisfal Glades", level: "1-10", faction: "Horde" }
    ],
    "12-20": [
        { name: "Westfall", level: "10-20", faction: "Alliance" },
        { name: "Loch Modan", level: "10-20", faction: "Alliance" },
        { name: "Darkshore", level: "10-20", faction: "Alliance" },
        { name: "The Barrens", level: "10-25", faction: "Horde" },
        { name: "Silverpine Forest", level: "10-20", faction: "Horde" }
    ],
    "20-30": [
        { name: "Wetlands", level: "20-30", faction: "Alliance", isNew: true, note: "Expanded questing" },
        { name: "Redridge Mountains", level: "15-25", faction: "Alliance" },
        { name: "Duskwood", level: "18-30", faction: "Alliance" },
        { name: "Hillsbrad Foothills", level: "20-30", faction: "Horde" },
        { name: "Ashenvale", level: "18-30", faction: "Both" },
        { name: "Stonetalon Mountains", level: "15-27", faction: "Both" },
        { name: "Thousand Needles", level: "25-35", faction: "Both" }
    ],
    "30-40": [
        { name: "The Riverglades", level: "35-45", faction: "Both", isNew: true, note: "150+ new quests" },
        { name: "Desolace", level: "30-40", faction: "Both", isNew: true, note: "Expanded questing" },
        { name: "Stranglethorn Vale", level: "30-45", faction: "Both" },
        { name: "Arathi Highlands", level: "30-40", faction: "Both" },
        { name: "Dustwallow Marsh", level: "35-45", faction: "Both" },
        { name: "Badlands", level: "35-45", faction: "Both" }
    ],
    "40-50": [
        { name: "The Riverglades", level: "35-45", faction: "Both", isNew: true },
        { name: "Krol'dok Stronghold", level: "40-45", faction: "Outdoor dungeon", isNew: true },
        { name: "Tanaris", level: "40-50", faction: "Both" },
        { name: "Feralas", level: "40-50", faction: "Both" },
        { name: "The Hinterlands", level: "40-50", faction: "Both" },
        { name: "Searing Gorge", level: "43-50", faction: "Both" },
        { name: "Azshara", level: "45-55", faction: "Both" }
    ],
    "50-60": [
        { name: "Shen'dralas", level: "Level range TBA", faction: "Both", isNew: true },
        { name: "Mount Hyjal", level: "60 - endgame", faction: "Both", isNew: true },
        { name: "Un'Goro Crater", level: "48-55", faction: "Both" },
        { name: "Felwood", level: "48-55", faction: "Both" },
        { name: "Western Plaguelands", level: "50-58", faction: "Both" },
        { name: "Eastern Plaguelands", level: "53-60", faction: "Both" },
        { name: "Winterspring", level: "53-60", faction: "Both" },
        { name: "Burning Steppes", level: "50-58", faction: "Both" },
        { name: "Silithus", level: "55-60", faction: "Both" }
    ]
};

const ZONES_TBC = {
    "1-12": [
        { name: "Elwynn Forest", level: "1-12", faction: "Alliance" },
        { name: "Dun Morogh", level: "1-12", faction: "Alliance" },
        { name: "Teldrassil", level: "1-12", faction: "Alliance" },
        { name: "Azuremyst Isle", level: "1-12", faction: "Alliance" },
        { name: "Durotar", level: "1-12", faction: "Horde" },
        { name: "Mulgore", level: "1-12", faction: "Horde" },
        { name: "Tirisfal Glades", level: "1-12", faction: "Horde" },
        { name: "Eversong Woods", level: "1-12", faction: "Horde" }
    ],
    "12-20": [
        { name: "Westfall", level: "10-20", faction: "Alliance" },
        { name: "Loch Modan", level: "10-20", faction: "Alliance" },
        { name: "Darkshore", level: "10-20", faction: "Alliance" },
        { name: "Bloodmyst Isle", level: "12-20", faction: "Alliance" },
        { name: "The Barrens", level: "10-25", faction: "Horde" },
        { name: "Silverpine Forest", level: "10-20", faction: "Horde" },
        { name: "Ghostlands", level: "10-20", faction: "Horde" }
    ],
    "20-30": [
        { name: "Redridge Mountains", level: "15-25", faction: "Alliance" },
        { name: "Duskwood", level: "18-30", faction: "Alliance" },
        { name: "Wetlands", level: "20-30", faction: "Alliance" },
        { name: "Stonetalon Mountains", level: "15-27", faction: "Both" },
        { name: "Ashenvale", level: "18-30", faction: "Both" },
        { name: "Hillsbrad Foothills", level: "20-30", faction: "Horde" }
    ],
    "30-40": [
        { name: "Stranglethorn Vale", level: "30-45", faction: "Both" },
        { name: "Desolace", level: "30-40", faction: "Both" },
        { name: "Arathi Highlands", level: "30-40", faction: "Both" },
        { name: "Thousand Needles", level: "25-35", faction: "Both" },
        { name: "Badlands", level: "35-45", faction: "Both" }
    ],
    "40-50": [
        { name: "Tanaris", level: "40-50", faction: "Both" },
        { name: "Feralas", level: "40-50", faction: "Both" },
        { name: "The Hinterlands", level: "40-50", faction: "Both" },
        { name: "Searing Gorge", level: "43-50", faction: "Both" },
        { name: "Azshara", level: "45-55", faction: "Both" }
    ],
    "50-58": [
        { name: "Un'Goro Crater", level: "48-55", faction: "Both" },
        { name: "Felwood", level: "48-55", faction: "Both" },
        { name: "Western Plaguelands", level: "50-58", faction: "Both" },
        { name: "Eastern Plaguelands", level: "53-60", faction: "Both" },
        { name: "Winterspring", level: "53-60", faction: "Both" },
        { name: "Burning Steppes", level: "50-58", faction: "Both" }
    ],
    "58-70": [
        { name: "Hellfire Peninsula", level: "58-63", faction: "Both" },
        { name: "Zangarmarsh", level: "60-64", faction: "Both" },
        { name: "Terokkar Forest", level: "62-65", faction: "Both" },
        { name: "Nagrand", level: "64-67", faction: "Both" },
        { name: "Blade's Edge Mountains", level: "65-68", faction: "Both" },
        { name: "Netherstorm", level: "67-70", faction: "Both" },
        { name: "Shadowmoon Valley", level: "67-70", faction: "Both" }
    ]
};

const ZONES_MOP = {
    "1-10": [
        { name: "Elwynn Forest", level: "1-10", faction: "Alliance" },
        { name: "Dun Morogh", level: "1-10", faction: "Alliance" },
        { name: "Teldrassil", level: "1-10", faction: "Alliance" },
        { name: "Azuremyst Isle", level: "1-10", faction: "Alliance" },
        { name: "Durotar", level: "1-10", faction: "Horde" },
        { name: "Mulgore", level: "1-10", faction: "Horde" },
        { name: "Tirisfal Glades", level: "1-10", faction: "Horde" },
        { name: "Eversong Woods", level: "1-10", faction: "Horde" },
        { name: "The Wandering Isle", level: "1-10", faction: "Pandaren" }
    ],
    "10-20": [
        { name: "Westfall", level: "10-15", faction: "Alliance" },
        { name: "Loch Modan", level: "10-20", faction: "Alliance" },
        { name: "Darkshore", level: "10-20", faction: "Alliance" },
        { name: "Northern Barrens", level: "10-20", faction: "Horde" },
        { name: "Silverpine Forest", level: "10-20", faction: "Horde" },
        { name: "Ghostlands", level: "10-20", faction: "Horde" }
    ],
    "20-30": [
        { name: "Redridge Mountains", level: "15-20", faction: "Alliance" },
        { name: "Duskwood", level: "20-25", faction: "Alliance" },
        { name: "Wetlands", level: "20-25", faction: "Alliance" },
        { name: "Ashenvale", level: "20-25", faction: "Both" },
        { name: "Stonetalon Mountains", level: "25-30", faction: "Both" },
        { name: "Hillsbrad Foothills", level: "20-25", faction: "Horde" },
        { name: "Southern Barrens", level: "30-35", faction: "Horde" }
    ],
    "30-40": [
        { name: "Northern Stranglethorn", level: "25-30", faction: "Both" },
        { name: "Cape of Stranglethorn", level: "30-35", faction: "Both" },
        { name: "Desolace", level: "30-35", faction: "Both" },
        { name: "Dustwallow Marsh", level: "35-40", faction: "Both" },
        { name: "Western Plaguelands", level: "35-40", faction: "Both" },
        { name: "Eastern Plaguelands", level: "40-45", faction: "Both" }
    ],
    "40-50": [
        { name: "Tanaris", level: "45-50", faction: "Both" },
        { name: "Felwood", level: "45-50", faction: "Both" },
        { name: "Un'Goro Crater", level: "50-55", faction: "Both" },
        { name: "Winterspring", level: "50-55", faction: "Both" },
        { name: "Burning Steppes", level: "50-55", faction: "Both" },
        { name: "Swamp of Sorrows", level: "50-55", faction: "Both" }
    ],
    "50-60": [
        { name: "Blasted Lands", level: "55-60", faction: "Both" },
        { name: "Silithus", level: "55-60", faction: "Both" },
        { name: "Hellfire Peninsula", level: "58-63", faction: "Both" }
    ],
    "60-70": [
        { name: "Hellfire Peninsula", level: "58-63", faction: "Both" },
        { name: "Zangarmarsh", level: "60-64", faction: "Both" },
        { name: "Terokkar Forest", level: "62-65", faction: "Both" },
        { name: "Nagrand", level: "64-67", faction: "Both" },
        { name: "Blade's Edge Mountains", level: "65-68", faction: "Both" },
        { name: "Netherstorm", level: "67-70", faction: "Both" }
    ],
    "70-80": [
        { name: "Borean Tundra", level: "68-72", faction: "Both" },
        { name: "Howling Fjord", level: "68-72", faction: "Both" },
        { name: "Dragonblight", level: "71-74", faction: "Both" },
        { name: "Grizzly Hills", level: "73-75", faction: "Both" },
        { name: "Zul'Drak", level: "74-77", faction: "Both" },
        { name: "Sholazar Basin", level: "76-78", faction: "Both" },
        { name: "Storm Peaks", level: "77-80", faction: "Both" },
        { name: "Icecrown", level: "77-80", faction: "Both" }
    ],
    "80-85": [
        { name: "Mount Hyjal", level: "80-82", faction: "Both" },
        { name: "Vashj'ir", level: "80-82", faction: "Both" },
        { name: "Deepholm", level: "82-83", faction: "Both" },
        { name: "Uldum", level: "83-84", faction: "Both" },
        { name: "Twilight Highlands", level: "84-85", faction: "Both" }
    ],
    "85-90": [
        { name: "The Jade Forest", level: "85-86", faction: "Both" },
        { name: "Valley of the Four Winds", level: "86-87", faction: "Both" },
        { name: "Krasarang Wilds", level: "86-87", faction: "Both" },
        { name: "Kun-Lai Summit", level: "87-88", faction: "Both" },
        { name: "Townlong Steppes", level: "88-89", faction: "Both" },
        { name: "Dread Wastes", level: "89-90", faction: "Both" }
    ]
};

// -----------------------------------------------------------------------------
// Version configuration
// -----------------------------------------------------------------------------
// Rate bands are XP/hour at the "average" pace with no XP bonus active, and
// apply while your level is below `upTo`. They are calibrated so a full run
// lands inside the completion times players actually report (see README).

const GAME_VERSIONS = {
    forever: {
        label: "WoW Forever (1-60)",
        maxLevel: 60,
        xpTable: XP_TABLES.vanilla,
        zones: ZONES_FOREVER,
        note: "WoW Forever launches 4 November 2026 (beta since 17 September). The 1-60 XP curve is unchanged from Classic, but dungeon mob XP is cut and dungeon quest XP is raised, so questing is intended to be the fastest route. Rates below are pre-launch estimates and will be updated once live data lands.",
        rates: {
            questing: [[10, 21000], [20, 30000], [30, 44000], [40, 58000], [50, 71000], [60, 86000]],
            dungeon: [[10, 13000], [20, 18000], [30, 27000], [40, 35000], [50, 43000], [60, 52000]],
            mixed: [[10, 22000], [20, 31000], [30, 46000], [40, 60000], [50, 74000], [60, 89000]],
            pvp: [[10, 8000], [20, 11000], [30, 15000], [40, 20000], [50, 25000], [60, 30000]]
        },
        bonuses: [
            { id: "rested", label: "Rested XP (typical play)", value: 15 },
            { id: "restedHeavy", label: "Always rested (alt / short sessions)", value: 30 },
            { id: "joyous", label: "Joyous Journeys-style buff, if enabled", value: 50 }
        ]
    },

    classic: {
        label: "Classic Era (1-60)",
        maxLevel: 60,
        xpTable: XP_TABLES.vanilla,
        zones: ZONES_CLASSIC,
        note: "Classic Era and Hardcore realms run the original 1.12 XP curve - 4,084,700 XP from 1 to 60, with no heirlooms and no XP buffs.",
        rates: {
            questing: [[10, 18000], [20, 26000], [30, 38000], [40, 50000], [50, 62000], [60, 75000]],
            dungeon: [[10, 12000], [20, 22000], [30, 36000], [40, 48000], [50, 55000], [60, 62000]],
            mixed: [[10, 17000], [20, 27000], [30, 40000], [40, 53000], [50, 64000], [60, 77000]],
            pvp: [[10, 6000], [20, 9000], [30, 13000], [40, 17000], [50, 21000], [60, 26000]]
        },
        bonuses: [
            { id: "rested", label: "Rested XP (typical play)", value: 15 },
            { id: "restedHeavy", label: "Always rested (alt / short sessions)", value: 30 }
        ]
    },

    tbc: {
        label: "TBC Anniversary (1-70)",
        maxLevel: 70,
        xpTable: XP_TABLES.tbc,
        zones: ZONES_TBC,
        note: "TBC Anniversary opened the Dark Portal on 5 February 2026 and uses the post-2.3 curve, so levels 11-59 need up to ~18% less XP than vanilla. Outland (58-70) is roughly 70% of the total XP but the fastest half of the run.",
        rates: {
            questing: [[10, 25000], [20, 38000], [30, 55000], [40, 72000], [50, 92000], [58, 125000], [62, 300000], [66, 420000], [70, 480000]],
            dungeon: [[10, 15000], [20, 34000], [30, 55000], [40, 75000], [50, 95000], [58, 120000], [62, 280000], [66, 400000], [70, 460000]],
            mixed: [[10, 25000], [20, 40000], [30, 58000], [40, 76000], [50, 97000], [58, 130000], [62, 310000], [66, 435000], [70, 500000]],
            pvp: [[10, 10000], [20, 16000], [30, 24000], [40, 32000], [50, 41000], [58, 55000], [70, 150000]]
        },
        bonuses: [
            { id: "rested", label: "Rested XP (typical play)", value: 15 },
            { id: "restedHeavy", label: "Always rested (alt / short sessions)", value: 30 },
            { id: "joyous", label: "Joyous Journeys buff, if Blizzard enables it", value: 50 }
        ]
    },

    mop: {
        label: "MoP Classic (1-90)",
        maxLevel: 90,
        xpTable: XP_TABLES.mop,
        zones: ZONES_MOP,
        note: "MoP Classic is on patch 5.5.3 / Siege of Orgrimmar. The Escalation patch (31 March 2026) applied the 5.3 cut, so 85-90 now needs 64,990,000 XP instead of 97,500,000. The Joyous Journeys +50% buff ran 21 April - early June 2026 and is no longer active.",
        rates: {
            questing: [[10, 45000], [20, 65000], [30, 140000], [40, 210000], [50, 350000], [60, 575000], [70, 1200000], [80, 1950000], [85, 3700000], [90, 7400000]],
            dungeon: [[15, 50000], [30, 160000], [40, 230000], [50, 390000], [60, 645000], [70, 1380000], [80, 2240000], [85, 4150000], [90, 8500000]],
            mixed: [[10, 48000], [20, 70000], [30, 150000], [40, 225000], [50, 375000], [60, 620000], [70, 1290000], [80, 2100000], [85, 4000000], [90, 8000000]],
            pvp: [[20, 35000], [30, 75000], [40, 115000], [50, 190000], [60, 315000], [70, 660000], [80, 1070000], [85, 2030000], [90, 4070000]]
        },
        bonuses: [
            { id: "rested", label: "Rested XP (typical play)", value: 15 },
            { id: "heirlooms", label: "Heirloom chest + shoulders", value: 20 },
            { id: "guild", label: "Guild perk: Fast Track", value: 10 },
            { id: "joyous", label: "Joyous Journeys buff, if it returns", value: 50 }
        ]
    }
};

// -----------------------------------------------------------------------------
// Calculator
// -----------------------------------------------------------------------------

function getVersion() {
    return GAME_VERSIONS[document.getElementById('gameVersion').value] || GAME_VERSIONS.forever;
}

// XP needed to advance from `level` to the next one.
function xpToAdvance(version, level) {
    return version.xpTable[level - 1] || 0;
}

function xpPerHourAt(version, playStyle, level) {
    const bands = version.rates[playStyle] || version.rates.questing;
    for (const [upTo, rate] of bands) {
        if (level < upTo) return rate;
    }
    return bands[bands.length - 1][1];
}

function activeBonus() {
    let total = 0;
    document.querySelectorAll('.xp-bonus-option input:checked').forEach(input => {
        total += parseInt(input.value, 10) || 0;
    });
    return total;
}

function renderBonusOptions() {
    const version = getVersion();
    const container = document.getElementById('xpBonuses');
    if (!container) return;

    const checked = new Set(
        Array.from(container.querySelectorAll('input:checked')).map(input => input.dataset.bonusId)
    );

    container.innerHTML = '';
    version.bonuses.forEach(bonus => {
        const wrapper = document.createElement('label');
        wrapper.className = 'xp-bonus-option';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = bonus.value;
        input.dataset.bonusId = bonus.id;
        // Rested and "always rested" describe the same buff, so they never stack.
        if (checked.has(bonus.id)) input.checked = true;
        input.addEventListener('change', function () {
            if (this.checked && (this.dataset.bonusId === 'rested' || this.dataset.bonusId === 'restedHeavy')) {
                const other = this.dataset.bonusId === 'rested' ? 'restedHeavy' : 'rested';
                const otherInput = container.querySelector(`input[data-bonus-id="${other}"]`);
                if (otherInput) otherInput.checked = false;
            }
            calculateLeveling();
        });

        const text = document.createElement('span');
        text.textContent = `${bonus.label} (+${bonus.value}%)`;

        wrapper.appendChild(input);
        wrapper.appendChild(text);
        container.appendChild(wrapper);
    });
}

let activeVersionId = null;

function updateGameVersion() {
    const versionId = document.getElementById('gameVersion').value;
    const version = GAME_VERSIONS[versionId] || GAME_VERSIONS.forever;
    const previous = GAME_VERSIONS[activeVersionId];
    const currentLevelInput = document.getElementById('currentLevel');
    const targetLevelInput = document.getElementById('targetLevel');

    currentLevelInput.max = version.maxLevel - 1;
    targetLevelInput.max = version.maxLevel;

    const target = parseInt(targetLevelInput.value, 10);
    if (previous && target === previous.maxLevel) {
        // Target was parked at the old level cap, so follow the new one.
        targetLevelInput.value = version.maxLevel;
    } else if (target > version.maxLevel) {
        targetLevelInput.value = version.maxLevel;
    }
    if (parseInt(currentLevelInput.value, 10) >= version.maxLevel) {
        currentLevelInput.value = version.maxLevel - 1;
    }

    const noteEl = document.getElementById('versionNote');
    if (noteEl) noteEl.textContent = version.note;

    activeVersionId = versionId;
    renderBonusOptions();
    calculateLeveling();
}

function formatDuration(totalMinutes) {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = Math.round(totalMinutes % 60);

    if (days > 0) return `${days} days, ${hours} hours, ${minutes} minutes`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
}

function calculateLeveling() {
    const version = getVersion();
    const currentLevel = parseInt(document.getElementById('currentLevel').value, 10);
    const targetLevel = parseInt(document.getElementById('targetLevel').value, 10);
    const currentXP = parseInt(document.getElementById('currentXP').value, 10) || 0;
    const playStyle = document.getElementById('playStyle').value;
    const pace = PACE_MULTIPLIERS[document.getElementById('pace').value] || 1;
    const bonus = activeBonus();

    if (!currentLevel || !targetLevel || currentLevel >= targetLevel || targetLevel > version.maxLevel) {
        return;
    }

    // Walk level by level: both the XP required and the XP/hour you can earn
    // change as you go, so a single flat rate over a long span is way off.
    let totalXPNeeded = 0;
    let totalHours = 0;

    for (let level = currentLevel; level < targetLevel; level++) {
        const levelXP = xpToAdvance(version, level);
        const remaining = level === currentLevel ? Math.max(0, levelXP - currentXP) : levelXP;
        const effectiveRate = xpPerHourAt(version, playStyle, level) * pace * (1 + bonus / 100);

        totalXPNeeded += remaining;
        totalHours += remaining / effectiveRate;
    }

    const averageRate = totalHours > 0 ? Math.round(totalXPNeeded / totalHours) : 0;

    document.getElementById('totalXP').textContent = totalXPNeeded.toLocaleString();
    document.getElementById('estimatedTime').textContent = formatDuration(totalHours * 60);
    document.getElementById('xpPerHour').textContent = averageRate.toLocaleString();
    document.getElementById('levelsRemaining').textContent = targetLevel - currentLevel;

    const bonusEl = document.getElementById('activeBonus');
    if (bonusEl) {
        bonusEl.textContent = bonus > 0 ? `+${bonus}% XP` : 'None';
    }

    const currentLevelXP = xpToAdvance(version, currentLevel);
    const progressPercent = currentLevelXP > 0 ? Math.min(100, (currentXP / currentLevelXP) * 100) : 0;
    document.getElementById('levelProgress').textContent =
        `${currentXP.toLocaleString()} / ${currentLevelXP.toLocaleString()} (${progressPercent.toFixed(1)}%)`;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;

    updateZoneRecommendations(currentLevel, targetLevel);

    // Every input path ends up here, so this is the one place the shareable URL
    // needs keeping in step.
    syncUrl();
}

function updateZoneRecommendations(currentLevel, targetLevel) {
    const version = getVersion();
    const zoneList = document.getElementById('zoneList');
    zoneList.innerHTML = '';

    const relevantRanges = Object.keys(version.zones).filter(range => {
        const [min, max] = range.split('-').map(Number);
        return currentLevel <= max && targetLevel >= min;
    });

    relevantRanges.forEach(range => {
        version.zones[range].forEach(zone => {
            const zoneElement = document.createElement('div');
            zoneElement.className = 'zone-item';

            const name = document.createElement('div');
            name.className = 'zone-name';
            name.textContent = zone.name;
            if (zone.isNew) {
                const badge = document.createElement('span');
                badge.className = 'zone-new-badge';
                badge.textContent = 'NEW';
                name.appendChild(badge);
            }

            const detail = document.createElement('div');
            detail.className = 'zone-level';
            const levelText = /^\d/.test(zone.level) ? `Level ${zone.level}` : zone.level;
            detail.textContent = zone.note
                ? `${levelText} - ${zone.faction} - ${zone.note}`
                : `${levelText} - ${zone.faction}`;

            zoneElement.appendChild(name);
            zoneElement.appendChild(detail);
            zoneList.appendChild(zoneElement);
        });
    });
}

// -----------------------------------------------------------------------------
// Shareable state
// -----------------------------------------------------------------------------
// The inputs are mirrored into the query string as you change them, so a result
// pasted into Discord or Reddit opens the way the sender left it. Values that
// match the selected version's defaults are left out, which keeps a plain visit
// on a clean URL. Every page carries a canonical tag pointing at its bare path,
// so the parameter variants never compete with it in search results.

const VERSION_PAGE_PATHS = {
    forever: '/wow-forever/',
    classic: '/classic-era/',
    tbc: '/tbc-anniversary/',
    mop: '/mop-classic/'
};

const PLAY_STYLES = ['questing', 'dungeon', 'mixed', 'pvp'];

// Set by the generator on the per-version pages, absent on the hub page. On the
// hub the version picker switches in place; on a version page it navigates.
function pinnedVersionId() {
    return (document.body && document.body.dataset.version) || null;
}

function selectedVersionId() {
    return document.getElementById('gameVersion').value;
}

function currentState() {
    const version = getVersion();
    return {
        version: selectedVersionId(),
        from: parseInt(document.getElementById('currentLevel').value, 10) || 1,
        to: parseInt(document.getElementById('targetLevel').value, 10) || version.maxLevel,
        xp: parseInt(document.getElementById('currentXP').value, 10) || 0,
        style: document.getElementById('playStyle').value,
        pace: document.getElementById('pace').value,
        bonuses: Array.from(document.querySelectorAll('.xp-bonus-option input:checked'))
            .map(input => input.dataset.bonusId)
    };
}

// `versionId` is the version the link will open, which is not always the one
// currently selected - switching version on a version page builds a link for the
// destination before navigating.
function stateParams(state, versionId) {
    const version = GAME_VERSIONS[versionId] || GAME_VERSIONS.forever;
    const params = new URLSearchParams();

    if (!pinnedVersionId() && state.version !== 'forever') params.set('v', state.version);
    if (state.from !== 1) params.set('from', state.from);
    if (state.to !== version.maxLevel) params.set('to', state.to);
    if (state.xp > 0) params.set('xp', state.xp);
    if (state.style !== 'questing') params.set('style', state.style);
    if (state.pace !== 'average') params.set('pace', state.pace);
    if (state.bonuses.length) params.set('bonus', state.bonuses.join(','));

    return params;
}

// replaceState rather than pushState: the back button should leave the page, not
// walk back through every keystroke in the level fields.
function syncUrl() {
    if (!window.history || !window.history.replaceState) return;
    const query = stateParams(currentState(), selectedVersionId()).toString();
    history.replaceState(null, '', query ? '?' + query : window.location.pathname);
}

function applyUrlState() {
    // Read before anything else: updateGameVersion() below triggers a syncUrl
    // that would overwrite the query string we are restoring from.
    const params = new URLSearchParams(window.location.search);
    const pinned = pinnedVersionId();

    const requested = pinned || params.get('v');
    if (requested && GAME_VERSIONS[requested]) {
        document.getElementById('gameVersion').value = requested;
    }

    // Sets the level bounds and renders this version's bonus checkboxes.
    updateGameVersion();

    const version = getVersion();
    const clamp = function (raw, min, max, fallback) {
        const value = parseInt(raw, 10);
        if (!Number.isFinite(value)) return fallback;
        return Math.min(max, Math.max(min, value));
    };

    const target = clamp(params.get('to'), 2, version.maxLevel, version.maxLevel);
    document.getElementById('targetLevel').value = target;
    document.getElementById('currentLevel').value = clamp(params.get('from'), 1, target - 1, 1);
    document.getElementById('currentXP').value = clamp(params.get('xp'), 0, Number.MAX_SAFE_INTEGER, 0);

    const style = params.get('style');
    if (PLAY_STYLES.indexOf(style) !== -1) document.getElementById('playStyle').value = style;

    const pace = params.get('pace');
    if (Object.prototype.hasOwnProperty.call(PACE_MULTIPLIERS, pace)) {
        document.getElementById('pace').value = pace;
    }

    const wanted = (params.get('bonus') || '').split(',').filter(Boolean);
    document.querySelectorAll('.xp-bonus-option input').forEach(function (input) {
        input.checked = wanted.indexOf(input.dataset.bonusId) !== -1;
    });
    // Rested and "always rested" are the same buff at different intensities, so a
    // hand-edited link asking for both keeps only the lighter one.
    const rested = document.querySelector('.xp-bonus-option input[data-bonus-id="rested"]');
    const restedHeavy = document.querySelector('.xp-bonus-option input[data-bonus-id="restedHeavy"]');
    if (rested && restedHeavy && rested.checked && restedHeavy.checked) restedHeavy.checked = false;

    calculateLeveling();
}

function onVersionSelect() {
    const versionId = selectedVersionId();
    const pinned = pinnedVersionId();

    if (!pinned) {
        updateGameVersion();
        return;
    }

    const previous = GAME_VERSIONS[pinned];
    const next = GAME_VERSIONS[versionId];
    const state = currentState();

    // Mirror the in-place behaviour: a target parked at the old cap follows the
    // new one, anything else is carried across and clamped.
    if (state.to === previous.maxLevel) state.to = next.maxLevel;
    state.to = Math.min(state.to, next.maxLevel);
    state.from = Math.min(state.from, state.to - 1);

    const query = stateParams(state, versionId).toString();
    window.location.href = VERSION_PAGE_PATHS[versionId] + (query ? '?' + query : '');
}

function initCopyLink() {
    const button = document.getElementById('copyLinkBtn');
    if (!button) return;

    button.addEventListener('click', async function () {
        syncUrl();
        const originalLabel = button.textContent;
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // The clipboard API needs a secure context; fall back to a selection.
            const field = document.createElement('input');
            field.value = window.location.href;
            document.body.appendChild(field);
            field.select();
            document.execCommand('copy');
            field.remove();
        }
        button.textContent = 'Link copied!';
        setTimeout(function () {
            button.textContent = originalLabel;
        }, 2000);
    });
}

const RXP_DISCOUNT_CODE = 'FGJCV0TO7U';

function initRestedXpAffiliate() {
    const copyBtn = document.getElementById('rxpCopyCode');
    const codeEl = document.getElementById('rxpDiscountCode');
    if (!copyBtn || !codeEl) return;

    copyBtn.addEventListener('click', async function() {
        const originalLabel = copyBtn.textContent;
        try {
            await navigator.clipboard.writeText(RXP_DISCOUNT_CODE);
            copyBtn.textContent = 'Copied!';
        } catch {
            const range = document.createRange();
            range.selectNodeContents(codeEl);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
            copyBtn.textContent = 'Copied!';
        }
        setTimeout(function() {
            copyBtn.textContent = originalLabel;
        }, 2000);
    });
}

// Guarded so the offline rate-calibration check below can require this file in
// Node, where there is no document.
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initRestedXpAffiliate();
        initCopyLink();
        applyUrlState();

        document.getElementById('currentLevel').addEventListener('input', calculateLeveling);
        document.getElementById('targetLevel').addEventListener('input', calculateLeveling);
        document.getElementById('currentXP').addEventListener('input', calculateLeveling);
        document.getElementById('playStyle').addEventListener('change', calculateLeveling);
        document.getElementById('pace').addEventListener('change', calculateLeveling);
    });
}

// Exported for the offline rate-calibration check (see README); ignored in browsers.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { XP_TABLES, GAME_VERSIONS, PACE_MULTIPLIERS };
}
