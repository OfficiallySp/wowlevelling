// WoW Classic Leveling Calculator JavaScript

// XP requirements for each level (1-90) with MoP prepatch reductions applied
const xpTable = {
    1: 0, 2: 400, 3: 900, 4: 1400, 5: 2100, 6: 2800, 7: 3600, 8: 4500, 9: 5400, 10: 6500,
    11: 7600, 12: 8700, 13: 10000, 14: 11400, 15: 12900, 16: 14400, 17: 16000, 18: 17700, 19: 19400, 20: 21300,
    21: 23200, 22: 25200, 23: 27300, 24: 29400, 25: 31700, 26: 34000, 27: 36500, 28: 39100, 29: 41800, 30: 44600,
    31: 47600, 32: 50800, 33: 54100, 34: 57500, 35: 61000, 36: 64600, 37: 68300, 38: 72100, 39: 76000, 40: 80000,
    41: 84100, 42: 88300, 43: 92600, 44: 97000, 45: 101500, 46: 106100, 47: 110800, 48: 115600, 49: 120500, 50: 125500,
    51: 130700, 52: 136000, 53: 141400, 54: 146900, 55: 152500, 56: 158200, 57: 164000, 58: 169900, 59: 175900, 60: 290000,
    61: 317000, 62: 349000, 63: 292400, 64: 428000, 65: 475000, 66: 527000, 67: 585000, 68: 648000, 69: 717000, 70: 813000,
    71: 821000, 72: 830000, 73: 838000, 74: 847000, 75: 855000, 76: 865000, 77: 873000, 78: 882000, 79: 891000, 80: 1686300,
    81: 2121500, 82: 1788000, 83: 2324000, 84: 2291500, 85: 3250000, 86: 4050000, 87: 5100000, 88: 6400000, 89: 7750000, 90: 0
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

function calculateLeveling() {
    const currentLevel = parseInt(document.getElementById('currentLevel').value);
    const targetLevel = parseInt(document.getElementById('targetLevel').value);
    const currentXP = parseInt(document.getElementById('currentXP').value) || 0;
    const xpBonus = parseInt(document.getElementById('xpBonus').value);
    const playStyle = document.getElementById('playStyle').value;

    if (currentLevel >= targetLevel) {
        alert('Target level must be higher than current level!');
        return;
    }

    // Calculate total XP needed
    let totalXPNeeded = 0;
    
    // Add remaining XP for current level
    const currentLevelXP = xpTable[currentLevel + 1] || 0;
    totalXPNeeded += (currentLevelXP - currentXP);

    // Add XP for all levels in between
    for (let level = currentLevel + 1; level < targetLevel; level++) {
        totalXPNeeded += xpTable[level + 1] || 0;
    }

    // Apply XP bonus
    const effectiveXPNeeded = Math.floor(totalXPNeeded * (100 / (100 + xpBonus)));

    // Calculate XP per hour based on play style (MoP prepatch rates)
    let baseXPPerHour = 100000; // Base XP per hour (prepatch enhanced)
    switch (playStyle) {
        case 'questing':
            baseXPPerHour = currentLevel < 15 ? 50000 : currentLevel < 60 ? 120000 : currentLevel < 80 ? 180000 : 250000;
            break;
        case 'dungeon':
            baseXPPerHour = currentLevel < 15 ? 60000 : currentLevel < 60 ? 150000 : currentLevel < 80 ? 220000 : 300000;
            break;
        case 'mixed':
            baseXPPerHour = currentLevel < 15 ? 55000 : currentLevel < 60 ? 135000 : currentLevel < 80 ? 200000 : 275000;
            break;
        case 'pvp':
            baseXPPerHour = currentLevel < 15 ? 40000 : currentLevel < 60 ? 100000 : currentLevel < 80 ? 150000 : 200000;
            break;
    }

    const estimatedHours = Math.ceil(effectiveXPNeeded / baseXPPerHour);
    const estimatedDays = Math.floor(estimatedHours / 24);
    const remainingHours = estimatedHours % 24;

    // Update results
    document.getElementById('totalXP').textContent = effectiveXPNeeded.toLocaleString();
    
    let timeString = '';
    if (estimatedDays > 0) {
        timeString = `${estimatedDays} days, ${remainingHours} hours`;
    } else {
        timeString = `${estimatedHours} hours`;
    }
    document.getElementById('estimatedTime').textContent = timeString;
    
    document.getElementById('xpPerHour').textContent = baseXPPerHour.toLocaleString();
    document.getElementById('levelsRemaining').textContent = targetLevel - currentLevel;

    // Current level progress
    const currentLevelTotalXP = xpTable[currentLevel + 1] || 0;
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
    calculateLeveling();
});

// Auto-calculate when inputs change
document.getElementById('currentLevel').addEventListener('input', calculateLeveling);
document.getElementById('targetLevel').addEventListener('input', calculateLeveling);
document.getElementById('currentXP').addEventListener('input', calculateLeveling);
document.getElementById('xpBonus').addEventListener('change', calculateLeveling);
document.getElementById('playStyle').addEventListener('change', calculateLeveling);