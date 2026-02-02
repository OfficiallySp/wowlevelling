// WoW Classic Leveling Calculator JavaScript
// XP Data sourced from Wowpedia (https://wowpedia.fandom.com/wiki/Experience_to_level)

// XP requirements for MoP Classic (1-90) - Pre-Patch 5.3 values
// MoP Classic uses the original un-nerfed XP curve before the 33% reduction in patch 5.3
const xpTableMoP = {
    // Levels 1-10 (base values with Cataclysm 20% reduction applied to 10+)
    1: 0, 2: 400, 3: 900, 4: 1400, 5: 2100, 6: 2800, 7: 3600, 8: 4500, 9: 5400, 10: 6500,
    // Levels 11-20 (with 20% reduction from Cataclysm)
    11: 6960, 12: 7840, 13: 8800, 14: 9840, 15: 10800, 16: 12000, 17: 13120, 18: 14240, 19: 15400, 20: 16640,
    // Levels 21-30
    21: 17920, 22: 19200, 23: 20400, 24: 21760, 25: 23120, 26: 24400, 27: 25760, 28: 27120, 29: 29040, 30: 31040,
    // Levels 31-40
    31: 33280, 32: 35680, 33: 38400, 34: 41120, 35: 44000, 36: 46960, 37: 49920, 38: 52960, 39: 56160, 40: 74300,
    // Levels 41-50
    41: 78500, 42: 82800, 43: 87100, 44: 91600, 45: 96300, 46: 101000, 47: 105800, 48: 110700, 49: 115700, 50: 120900,
    // Levels 51-60
    51: 126100, 52: 131500, 53: 137000, 54: 142500, 55: 148200, 56: 154000, 57: 159900, 58: 165800, 59: 172000, 60: 290000,
    // Levels 61-70 (Outland - with WotLK reductions)
    61: 317000, 62: 349000, 63: 386000, 64: 428000, 65: 475000, 66: 527000, 67: 585000, 68: 648000, 69: 717000, 70: 812700,
    // Levels 71-80 (Northrend - with Patch 4.3 reductions)
    71: 821000, 72: 830000, 73: 838000, 74: 847000, 75: 855300, 76: 865000, 77: 873000, 78: 882000, 79: 891000, 80: 1686300,
    // Levels 81-85 (Cataclysm)
    81: 2121500, 82: 2669000, 83: 3434200, 84: 4582500,
    // Levels 85-90 (Pandaria - PRE-5.3 values, no 33% reduction)
    85: 13000000, 86: 15080000, 87: 18980000, 88: 22880000, 89: 27560000, 90: 0
};

// XP requirements for TBC Anniversary (1-70) - Post-Patch 2.3 values
// Patch 2.3 reduced XP requirements for levels 20-60 and increased quest XP rewards
const xpTableTBC = {
    // Levels 1-10 (unchanged from vanilla)
    1: 0, 2: 400, 3: 900, 4: 1400, 5: 2100, 6: 2800, 7: 3600, 8: 4500, 9: 5400, 10: 7600,
    // Levels 11-20 (with 2.3 reductions starting at 11)
    11: 8700, 12: 9800, 13: 11000, 14: 12300, 15: 13600, 16: 15000, 17: 16400, 18: 17800, 19: 19300, 20: 20800,
    // Levels 21-30 (with 2.3 ~18% reduction)
    21: 22400, 22: 24000, 23: 25500, 24: 27200, 25: 28900, 26: 30500, 27: 32200, 28: 33900, 29: 36300, 30: 38800,
    // Levels 31-40
    31: 41600, 32: 44600, 33: 48000, 34: 51400, 35: 55000, 36: 58700, 37: 62400, 38: 66200, 39: 70200, 40: 74300,
    // Levels 41-50
    41: 78500, 42: 82800, 43: 87100, 44: 91600, 45: 96300, 46: 101000, 47: 105800, 48: 110700, 49: 115700, 50: 120900,
    // Levels 51-60
    51: 126100, 52: 131500, 53: 137000, 54: 142500, 55: 148200, 56: 154000, 57: 159900, 58: 165800, 59: 172000, 60: 494000,
    // Levels 61-70 (Outland)
    61: 574700, 62: 614400, 63: 650300, 64: 682300, 65: 710200, 66: 734100, 67: 753700, 68: 768900, 69: 779700, 70: 0
};

// Zone recommendations by level ranges (sourced from Wowhead zone guides)
// TBC zones use Classic TBC level ranges, MoP zones include Cataclysm revamps
const zoneRecommendationsTBC = {
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

const zoneRecommendationsMoP = {
    "1-10": [
        { name: "Elwynn Forest", level: "1-10", faction: "Alliance" },
        { name: "Dun Morogh", level: "1-10", faction: "Alliance" },
        { name: "Teldrassil", level: "1-10", faction: "Alliance" },
        { name: "Azuremyst Isle", level: "1-10", faction: "Alliance" },
        { name: "Durotar", level: "1-10", faction: "Horde" },
        { name: "Mulgore", level: "1-10", faction: "Horde" },
        { name: "Tirisfal Glades", level: "1-10", faction: "Horde" },
        { name: "Eversong Woods", level: "1-10", faction: "Horde" }
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

function updateGameVersion() {
    const version = document.getElementById('gameVersion').value;
    const currentLevelInput = document.getElementById('currentLevel');
    const targetLevelInput = document.getElementById('targetLevel');
    
    if (version === 'tbc') {
        currentLevelInput.max = 69;
        targetLevelInput.max = 70;
        if (parseInt(targetLevelInput.value) > 70) {
            targetLevelInput.value = 70;
        }
        if (parseInt(currentLevelInput.value) >= 70) {
            currentLevelInput.value = 69;
        }
    } else {
        currentLevelInput.max = 89;
        targetLevelInput.max = 90;
    }
    
    calculateLeveling();
}

function calculateLeveling() {
    const version = document.getElementById('gameVersion').value;
    const currentLevel = parseInt(document.getElementById('currentLevel').value);
    const targetLevel = parseInt(document.getElementById('targetLevel').value);
    const currentXP = parseInt(document.getElementById('currentXP').value) || 0;
    const xpBonus = parseInt(document.getElementById('xpBonus').value);
    const playStyle = document.getElementById('playStyle').value;

    const currentXpTable = version === 'tbc' ? xpTableTBC : xpTableMoP;
    const maxLevel = version === 'tbc' ? 70 : 90;

    if (currentLevel >= targetLevel) {
        // Only alert if we haven't already adjusted input which might trigger this
        // alert('Target level must be higher than current level!');
        return;
    }

    // Calculate total XP needed
    let totalXPNeeded = 0;
    
    // Add remaining XP for current level
    const currentLevelXP = currentXpTable[currentLevel + 1] || 0;
    totalXPNeeded += (currentLevelXP - currentXP);

    // Add XP for all levels in between
    for (let level = currentLevel + 1; level < targetLevel; level++) {
        totalXPNeeded += currentXpTable[level + 1] || 0;
    }

    // Apply XP bonus
    const effectiveXPNeeded = Math.floor(totalXPNeeded * (100 / (100 + xpBonus)));


    // XP per hour rates based on real player data and leveling guides
    // Sources: ExpertBeacon, Wowhead, community leveling data
    // TBC Classic: Casual 72-96 hours, Experienced 48-72 hours for 1-70
    // MoP Classic: Optimized 16-38 hours, Casual 50-100+ hours for 1-90
    
    let baseXPPerHour = 150000;
    if (version === 'tbc') {
        // TBC Anniversary XP rates
        // Total XP 1-70 ≈ 9.6M, targeting 48-96 hours = 100k-200k XP/hour average
        switch (playStyle) {
            case 'questing':
                // Most efficient method for TBC, especially with quest helper addons
                if (currentLevel < 10) baseXPPerHour = 25000;      // Starter zones
                else if (currentLevel < 20) baseXPPerHour = 50000; // Early zones
                else if (currentLevel < 40) baseXPPerHour = 90000; // Mid-game
                else if (currentLevel < 58) baseXPPerHour = 120000; // Late classic content
                else baseXPPerHour = 200000; // Outland (faster quests, better rewards)
                break;
            case 'dungeon':
                // Dungeon grinding with good groups, includes queue times
                if (currentLevel < 15) baseXPPerHour = 30000;      // Limited dungeons
                else if (currentLevel < 40) baseXPPerHour = 100000; // Classic dungeons
                else if (currentLevel < 58) baseXPPerHour = 130000; // Higher level dungeons
                else baseXPPerHour = 220000; // TBC dungeons (excellent XP)
                break;
            case 'mixed':
                // Quest while in dungeon queue - generally optimal
                if (currentLevel < 15) baseXPPerHour = 28000;
                else if (currentLevel < 40) baseXPPerHour = 95000;
                else if (currentLevel < 58) baseXPPerHour = 125000;
                else baseXPPerHour = 210000;
                break;
            case 'pvp':
                // Battleground XP is slower but can be fun
                if (currentLevel < 20) baseXPPerHour = 20000;
                else if (currentLevel < 40) baseXPPerHour = 50000;
                else if (currentLevel < 58) baseXPPerHour = 70000;
                else baseXPPerHour = 120000; // TBC BGs
                break;
        }
    } else {
        // MoP Classic XP rates
        // Total XP 1-90 ≈ 127M (pre-5.3), with 85-90 being ~97M alone
        // Targeting 50-100 hours = 1.3M-2.5M XP/hour average
        switch (playStyle) {
            case 'questing':
                // Standard questing, most consistent method
                if (currentLevel < 15) baseXPPerHour = 50000;       // Starter zones
                else if (currentLevel < 40) baseXPPerHour = 150000;  // Classic zones (streamlined)
                else if (currentLevel < 60) baseXPPerHour = 200000;  // Late classic
                else if (currentLevel < 70) baseXPPerHour = 400000;  // Outland
                else if (currentLevel < 80) baseXPPerHour = 600000;  // Northrend
                else if (currentLevel < 85) baseXPPerHour = 1500000; // Cataclysm (huge XP requirements)
                else baseXPPerHour = 3500000; // Pandaria (massive XP, efficient quests)
                break;
            case 'dungeon':
                // Dungeon spam, very efficient with instant queues (tank/healer)
                if (currentLevel < 15) baseXPPerHour = 60000;
                else if (currentLevel < 40) baseXPPerHour = 180000;
                else if (currentLevel < 60) baseXPPerHour = 250000;
                else if (currentLevel < 70) baseXPPerHour = 500000;
                else if (currentLevel < 80) baseXPPerHour = 750000;
                else if (currentLevel < 85) baseXPPerHour = 2000000;
                else baseXPPerHour = 4500000; // Pandaria dungeons + monkey runs
                break;
            case 'mixed':
                // Quest while in queue - optimal for DPS with longer queues
                if (currentLevel < 15) baseXPPerHour = 55000;
                else if (currentLevel < 40) baseXPPerHour = 165000;
                else if (currentLevel < 60) baseXPPerHour = 225000;
                else if (currentLevel < 70) baseXPPerHour = 450000;
                else if (currentLevel < 80) baseXPPerHour = 675000;
                else if (currentLevel < 85) baseXPPerHour = 1750000;
                else baseXPPerHour = 4000000;
                break;
            case 'pvp':
                // BG leveling, slower but available
                if (currentLevel < 20) baseXPPerHour = 35000;
                else if (currentLevel < 40) baseXPPerHour = 100000;
                else if (currentLevel < 60) baseXPPerHour = 150000;
                else if (currentLevel < 70) baseXPPerHour = 300000;
                else if (currentLevel < 80) baseXPPerHour = 450000;
                else if (currentLevel < 85) baseXPPerHour = 1000000;
                else baseXPPerHour = 2500000;
                break;
        }
    }

    const estimatedTotalMinutes = Math.ceil(effectiveXPNeeded / baseXPPerHour * 60);
    const estimatedDays = Math.floor(estimatedTotalMinutes / (24 * 60));
    const remainingMinutes = estimatedTotalMinutes % (24 * 60);
    const estimatedHours = Math.floor(remainingMinutes / 60);
    const finalMinutes = remainingMinutes % 60;

    // Update results
    document.getElementById('totalXP').textContent = effectiveXPNeeded.toLocaleString();
    
    let timeString = '';
    if (estimatedDays > 0) {
        timeString = `${estimatedDays} days, ${estimatedHours} hours, ${finalMinutes} minutes`;
    } else if (estimatedHours > 0) {
        timeString = `${estimatedHours} hours, ${finalMinutes} minutes`;
    } else {
        timeString = `${finalMinutes} minutes`;
    }
    document.getElementById('estimatedTime').textContent = timeString;
    
    document.getElementById('xpPerHour').textContent = baseXPPerHour.toLocaleString();
    document.getElementById('levelsRemaining').textContent = targetLevel - currentLevel;

    // Current level progress
    const currentLevelTotalXP = currentXpTable[currentLevel + 1] || 0;
    const progressPercent = currentLevelTotalXP > 0 ? (currentXP / currentLevelTotalXP) * 100 : 0;
    document.getElementById('levelProgress').textContent = `${currentXP.toLocaleString()} / ${currentLevelTotalXP.toLocaleString()} (${progressPercent.toFixed(1)}%)`;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;

    // Update zone recommendations
    updateZoneRecommendations(currentLevel, targetLevel);
}

function updateZoneRecommendations(currentLevel, targetLevel) {
    const version = document.getElementById('gameVersion').value;
    const zoneList = document.getElementById('zoneList');
    zoneList.innerHTML = '';

    // Select the appropriate zone recommendations based on game version
    const zoneRecommendations = version === 'tbc' ? zoneRecommendationsTBC : zoneRecommendationsMoP;

    // Determine which level ranges to show
    const levelRanges = Object.keys(zoneRecommendations);
    const relevantRanges = levelRanges.filter(range => {
        const [min, max] = range.split('-').map(Number);
        return currentLevel <= max && targetLevel >= min;
    });

    relevantRanges.forEach(range => {
        const zones = zoneRecommendations[range];
        zones.forEach(zone => {
            const zoneElement = document.createElement('div');
            zoneElement.className = 'zone-item';
            zoneElement.innerHTML = `
                <div class="zone-name">${zone.name}</div>
                <div class="zone-level">Level ${zone.level} - ${zone.faction}</div>
            `;
            zoneList.appendChild(zoneElement);
        });
    });
}

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial max levels based on default selection (TBC)
    updateGameVersion(); 
    calculateLeveling();
});

// Auto-calculate when inputs change
document.getElementById('currentLevel').addEventListener('input', calculateLeveling);
document.getElementById('targetLevel').addEventListener('input', calculateLeveling);
document.getElementById('currentXP').addEventListener('input', calculateLeveling);
document.getElementById('xpBonus').addEventListener('change', calculateLeveling);
document.getElementById('playStyle').addEventListener('change', calculateLeveling);
