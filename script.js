// WoW Classic Leveling Calculator JavaScript

// XP requirements for MoP Classic (1-90)
const xpTableMoP = {
    1: 0, 2: 400, 3: 900, 4: 1400, 5: 2100, 6: 2800, 7: 3600, 8: 4500, 9: 5400, 10: 6500,
    11: 6960, 12: 7700, 13: 8800, 14: 9700, 15: 10800, 16: 12000, 17: 13100, 18: 14240, 19: 15400, 20: 16600,
    21: 17920, 22: 19200, 23: 20400, 24: 21760, 25: 23120, 26: 24400, 27: 25760, 28: 27120, 29: 29040, 30: 31040,
    31: 33280, 32: 35680, 33: 38400, 34: 41120, 35: 44000, 36: 46960, 37: 49920, 38: 52960, 39: 56160, 40: 74300,
    41: 78500, 42: 82800, 43: 87100, 44: 91600, 45: 96300, 46: 101000, 47: 105800, 48: 110700, 49: 115700, 50: 120900,
    51: 126100, 52: 131500, 53: 137000, 54: 142500, 55: 148200, 56: 154000, 57: 159900, 58: 165800, 59: 172000, 60: 290000,
    61: 317000, 62: 292400, 63: 292400, 64: 309600, 65: 320000, 66: 331600, 67: 585000, 68: 648000, 69: 717000, 70: 624800,
    71: 630800, 72: 638100, 73: 838000, 74: 847000, 75: 667800, 76: 680300, 77: 694100, 78: 709200, 79: 725600, 80: 1686300,
    81: 2121500, 82: 2669000, 83: 3434200, 84: 4582500, 85: 13000000, 86: 15080000, 87: 18980000, 88: 22880000, 89: 27560000, 90: 0
};

// XP requirements for TBC Anniversary (1-70) - Patch 2.4.3
const xpTableTBC = {
    1: 0, 2: 900, 3: 1400, 4: 2100, 5: 2800, 6: 3600, 7: 4500, 8: 5400, 9: 6500, 10: 7600,
    11: 8700, 12: 9800, 13: 11000, 14: 12300, 15: 13600, 16: 15000, 17: 16400, 18: 17800, 19: 19300, 20: 20800,
    21: 22400, 22: 24000, 23: 25500, 24: 27200, 25: 28900, 26: 30500, 27: 32200, 28: 33900, 29: 36300, 30: 38800,
    31: 41600, 32: 44600, 33: 48000, 34: 51400, 35: 55000, 36: 58700, 37: 62400, 38: 66200, 39: 70200, 40: 74300,
    41: 78500, 42: 82800, 43: 87100, 44: 91600, 45: 96300, 46: 101000, 47: 105800, 48: 110700, 49: 115700, 50: 120900,
    51: 126100, 52: 131500, 53: 137000, 54: 142500, 55: 148200, 56: 154000, 57: 159900, 58: 165800, 59: 172000, 60: 494000,
    61: 574700, 62: 614400, 63: 650300, 64: 682300, 65: 710200, 66: 734100, 67: 753700, 68: 768900, 69: 779700, 70: 0
};

// Zone recommendations by level ranges
const zoneRecommendations = {
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
        { name: "The Barrens", level: "10-20", faction: "Horde" },
        { name: "Silverpine Forest", level: "10-20", faction: "Horde" },
        { name: "Ghostlands", level: "10-20", faction: "Horde" }
    ],
    "20-30": [
        { name: "Redridge Mountains", level: "20-30", faction: "Alliance" },
        { name: "Wetlands", level: "20-30", faction: "Alliance" },
        { name: "Ashenvale", level: "20-30", faction: "Alliance" },
        { name: "Stonetalon Mountains", level: "20-30", faction: "Both" },
        { name: "Thousand Needles", level: "20-30", faction: "Both" },
        { name: "Hillsbrad Foothills", level: "20-30", faction: "Horde" }
    ],
    "30-40": [
        { name: "Stranglethorn Vale", level: "30-40", faction: "Both" },
        { name: "Desolace", level: "30-40", faction: "Both" },
        { name: "Southern Barrens", level: "30-40", faction: "Both" },
        { name: "Arathi Highlands", level: "30-40", faction: "Both" },
        { name: "Badlands", level: "30-40", faction: "Both" }
    ],
    "40-50": [
        { name: "Eastern Plaguelands", level: "40-50", faction: "Both" },
        { name: "Western Plaguelands", level: "40-50", faction: "Both" },
        { name: "Tanaris", level: "40-50", faction: "Both" },
        { name: "Feralas", level: "40-50", faction: "Both" },
        { name: "Azshara", level: "40-50", faction: "Both" }
    ],
    "50-60": [
        { name: "Un'Goro Crater", level: "50-60", faction: "Both" },
        { name: "Felwood", level: "50-60", faction: "Both" },
        { name: "Winterspring", level: "50-60", faction: "Both" },
        { name: "Burning Steppes", level: "50-60", faction: "Both" },
        { name: "Swamp of Sorrows", level: "50-60", faction: "Both" }
    ],
    "60-70": [
        { name: "Hellfire Peninsula", level: "60-70", faction: "Both" },
        { name: "Zangarmarsh", level: "60-70", faction: "Both" },
        { name: "Nagrand", level: "60-70", faction: "Both" },
        { name: "Blade's Edge Mountains", level: "60-70", faction: "Both" },
        { name: "Netherstorm", level: "60-70", faction: "Both" }
    ],
    "70-80": [
        { name: "Borean Tundra", level: "70-80", faction: "Both" },
        { name: "Dragonblight", level: "70-80", faction: "Both" },
        { name: "Grizzly Hills", level: "70-80", faction: "Both" },
        { name: "Zul'Drak", level: "70-80", faction: "Both" },
        { name: "Icecrown", level: "70-80", faction: "Both" }
    ],
    "80-85": [
        { name: "Mount Hyjal", level: "80-85", faction: "Both" },
        { name: "Vashj'ir", level: "80-85", faction: "Both" },
        { name: "Deepholm", level: "80-85", faction: "Both" },
        { name: "Uldum", level: "80-85", faction: "Both" },
        { name: "Twilight Highlands", level: "80-85", faction: "Both" }
    ],
    "85-90": [
        { name: "The Jade Forest", level: "85-90", faction: "Both" },
        { name: "Valley of the Four Winds", level: "85-90", faction: "Both" },
        { name: "Krasarang Wilds", level: "85-90", faction: "Both" },
        { name: "Kun-Lai Summit", level: "85-90", faction: "Both" },
        { name: "Townlong Steppes", level: "85-90", faction: "Both" },
        { name: "Dread Wastes", level: "85-90", faction: "Both" }
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


    let baseXPPerHour = 150000;
    if (version === 'tbc') {
        // TBC XP rates are generally lower than MoP rates
        switch (playStyle) {
            case 'questing':
                baseXPPerHour = currentLevel < 15 ? 40000 : currentLevel < 40 ? 80000 : currentLevel < 58 ? 100000 : 250000;
                break;
            case 'dungeon':
                baseXPPerHour = currentLevel < 15 ? 45000 : currentLevel < 40 ? 90000 : currentLevel < 58 ? 120000 : 280000;
                break;
            case 'mixed':
                baseXPPerHour = currentLevel < 15 ? 42000 : currentLevel < 40 ? 85000 : currentLevel < 58 ? 110000 : 265000;
                break;
            case 'pvp':
                baseXPPerHour = currentLevel < 15 ? 30000 : currentLevel < 40 ? 60000 : currentLevel < 58 ? 80000 : 180000;
                break;
        }
    } else {
        // MoP Rates (existing)
        switch (playStyle) {
            case 'questing':
                baseXPPerHour = currentLevel < 15 ? 60000 : currentLevel < 60 ? 150000 : currentLevel < 80 ? 240000 : 300000;
                break;
            case 'dungeon':
                baseXPPerHour = currentLevel < 15 ? 70000 : currentLevel < 60 ? 180000 : currentLevel < 80 ? 280000 : 350000;
                break;
            case 'mixed':
                baseXPPerHour = currentLevel < 15 ? 65000 : currentLevel < 60 ? 165000 : currentLevel < 80 ? 260000 : 325000;
                break;
            case 'pvp':
                baseXPPerHour = currentLevel < 15 ? 50000 : currentLevel < 60 ? 120000 : currentLevel < 80 ? 200000 : 250000;
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
    const zoneList = document.getElementById('zoneList');
    zoneList.innerHTML = '';

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
