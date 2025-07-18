// WoW Classic Leveling Calculator JavaScript

// Accurate XP requirements for each level (from Cataclysm/MOP)
const accurateXPTable = {
    1: 0, 2: 400, 3: 900, 4: 1400, 5: 2100, 6: 2800, 7: 3600, 8: 4500, 9: 5400, 10: 6500,
    11: 7600, 12: 8800, 13: 10100, 14: 11400, 15: 12900, 16: 14400, 17: 16000, 18: 17700, 19: 19400, 20: 21300,
    21: 23200, 22: 25200, 23: 27300, 24: 29400, 25: 31700, 26: 34000, 27: 36500, 28: 39100, 29: 41800, 30: 44600,
    31: 47600, 32: 50800, 33: 54100, 34: 57500, 35: 61000, 36: 64600, 37: 68300, 38: 72100, 39: 76000, 40: 80000,
    41: 84100, 42: 88300, 43: 92600, 44: 97000, 45: 101500, 46: 106100, 47: 110800, 48: 115600, 49: 120500, 50: 125500,
    51: 130700, 52: 136000, 53: 141400, 54: 146900, 55: 152500, 56: 158200, 57: 164000, 58: 169900, 59: 175900, 60: 182000,
    61: 188200, 62: 194500, 63: 200900, 64: 207400, 65: 214000, 66: 220700, 67: 227500, 68: 234400, 69: 241400, 70: 248500,
    71: 255700, 72: 263000, 73: 270400, 74: 277900, 75: 285500, 76: 293200, 77: 301000, 78: 308900, 79: 316900, 80: 325000,
    81: 333200, 82: 341500, 83: 349900, 84: 358400, 85: 367000, 86: 375700, 87: 384500, 88: 393400, 89: 402400, 90: 411500
};

// Experience tables for each expansion
const experienceData = {
    vanilla: {
        maxLevel: 60,
        xpTable: extractXPTableForExpansion(60),
        avgXPPerHour: {
            questing: 35000,
            dungeons: 45000,
            pvp: 25000,
            grinding: 30000
        }
    },
    tbc: {
        maxLevel: 70,
        xpTable: extractXPTableForExpansion(70),
        avgXPPerHour: {
            questing: 45000,
            dungeons: 55000,
            pvp: 30000,
            grinding: 35000
        }
    },
    wotlk: {
        maxLevel: 80,
        xpTable: extractXPTableForExpansion(80),
        avgXPPerHour: {
            questing: 55000,
            dungeons: 65000,
            pvp: 35000,
            grinding: 40000
        }
    },
    cataclysm: {
        maxLevel: 85,
        xpTable: extractXPTableForExpansion(85),
        avgXPPerHour: {
            questing: 65000,
            dungeons: 75000,
            pvp: 40000,
            grinding: 45000
        }
    },
    mop: {
        maxLevel: 90,
        xpTable: extractXPTableForExpansion(90),
        avgXPPerHour: {
            questing: 75000,
            dungeons: 85000,
            pvp: 45000,
            grinding: 50000
        }
    }
};

// Extract XP table for specific expansion max level
function extractXPTableForExpansion(maxLevel) {
    const table = {};
    for (let level = 1; level <= maxLevel; level++) {
        table[level] = accurateXPTable[level] || 0;
    }
    return table;
}

// Enhanced zone recommendations with more accurate data
const zoneRecommendations = {
    vanilla: [
        { name: "Elwynn Forest", level: "1-10", expansion: "Vanilla", faction: "Alliance" },
        { name: "Dun Morogh", level: "1-10", expansion: "Vanilla", faction: "Alliance" },
        { name: "Teldrassil", level: "1-10", expansion: "Vanilla", faction: "Alliance" },
        { name: "Durotar", level: "1-10", expansion: "Vanilla", faction: "Horde" },
        { name: "Mulgore", level: "1-10", expansion: "Vanilla", faction: "Horde" },
        { name: "Tirisfal Glades", level: "1-10", expansion: "Vanilla", faction: "Horde" },
        { name: "Westfall", level: "10-20", expansion: "Vanilla", faction: "Alliance" },
        { name: "Loch Modan", level: "10-20", expansion: "Vanilla", faction: "Alliance" },
        { name: "Darkshore", level: "10-20", expansion: "Vanilla", faction: "Alliance" },
        { name: "The Barrens", level: "10-20", expansion: "Vanilla", faction: "Horde" },
        { name: "Silverpine Forest", level: "10-20", expansion: "Vanilla", faction: "Horde" },
        { name: "Redridge Mountains", level: "20-30", expansion: "Vanilla", faction: "Alliance" },
        { name: "Wetlands", level: "20-30", expansion: "Vanilla", faction: "Alliance" },
        { name: "Ashenvale", level: "20-30", expansion: "Vanilla", faction: "Both" },
        { name: "Stonetalon Mountains", level: "20-30", expansion: "Vanilla", faction: "Both" },
        { name: "Thousand Needles", level: "20-30", expansion: "Vanilla", faction: "Both" },
        { name: "Stranglethorn Vale", level: "30-40", expansion: "Vanilla", faction: "Both" },
        { name: "Desolace", level: "30-40", expansion: "Vanilla", faction: "Both" },
        { name: "Arathi Highlands", level: "30-40", expansion: "Vanilla", faction: "Both" },
        { name: "Badlands", level: "30-40", expansion: "Vanilla", faction: "Both" },
        { name: "Tanaris", level: "40-50", expansion: "Vanilla", faction: "Both" },
        { name: "Feralas", level: "40-50", expansion: "Vanilla", faction: "Both" },
        { name: "Azshara", level: "40-50", expansion: "Vanilla", faction: "Both" },
        { name: "Un'Goro Crater", level: "50-60", expansion: "Vanilla", faction: "Both" },
        { name: "Felwood", level: "50-60", expansion: "Vanilla", faction: "Both" },
        { name: "Winterspring", level: "50-60", expansion: "Vanilla", faction: "Both" },
        { name: "Eastern Plaguelands", level: "50-60", expansion: "Vanilla", faction: "Both" },
        { name: "Western Plaguelands", level: "50-60", expansion: "Vanilla", faction: "Both" }
    ],
    tbc: [
        { name: "Hellfire Peninsula", level: "58-63", expansion: "TBC", faction: "Both" },
        { name: "Zangarmarsh", level: "60-64", expansion: "TBC", faction: "Both" },
        { name: "Nagrand", level: "64-67", expansion: "TBC", faction: "Both" },
        { name: "Blade's Edge Mountains", level: "65-68", expansion: "TBC", faction: "Both" },
        { name: "Netherstorm", level: "67-70", expansion: "TBC", faction: "Both" },
        { name: "Shadowmoon Valley", level: "67-70", expansion: "TBC", faction: "Both" }
    ],
    wotlk: [
        { name: "Borean Tundra", level: "68-72", expansion: "WotLK", faction: "Both" },
        { name: "Howling Fjord", level: "68-72", expansion: "WotLK", faction: "Both" },
        { name: "Dragonblight", level: "71-74", expansion: "WotLK", faction: "Both" },
        { name: "Grizzly Hills", level: "73-75", expansion: "WotLK", faction: "Both" },
        { name: "Zul'Drak", level: "74-77", expansion: "WotLK", faction: "Both" },
        { name: "Sholazar Basin", level: "76-78", expansion: "WotLK", faction: "Both" },
        { name: "Icecrown", level: "77-80", expansion: "WotLK", faction: "Both" },
        { name: "The Storm Peaks", level: "77-80", expansion: "WotLK", faction: "Both" }
    ],
    cataclysm: [
        { name: "Mount Hyjal", level: "80-82", expansion: "Cataclysm", faction: "Both" },
        { name: "Vashj'ir", level: "80-82", expansion: "Cataclysm", faction: "Both" },
        { name: "Deepholm", level: "82-83", expansion: "Cataclysm", faction: "Both" },
        { name: "Uldum", level: "83-84", expansion: "Cataclysm", faction: "Both" },
        { name: "Twilight Highlands", level: "84-85", expansion: "Cataclysm", faction: "Both" }
    ],
    mop: [
        { name: "The Jade Forest", level: "85-86", expansion: "MoP", faction: "Both" },
        { name: "Valley of the Four Winds", level: "86-87", expansion: "MoP", faction: "Both" },
        { name: "Krasarang Wilds", level: "86-87", expansion: "MoP", faction: "Both" },
        { name: "Kun-Lai Summit", level: "87-88", expansion: "MoP", faction: "Both" },
        { name: "Townlong Steppes", level: "88-89", expansion: "MoP", faction: "Both" },
        { name: "Dread Wastes", level: "89-90", expansion: "MoP", faction: "Both" }
    ]
};

// DOM elements
const expansionSelect = document.getElementById('expansion');
const currentLevelInput = document.getElementById('currentLevel');
const targetLevelInput = document.getElementById('targetLevel');
const calculateBtn = document.getElementById('calculateBtn');
const resultsDiv = document.getElementById('results');
const zoneRecommendationsDiv = document.getElementById('zoneRecommendations');

// Method buttons
const methodButtons = document.querySelectorAll('.method-btn');
let selectedMethod = 'questing';

// Modifier checkboxes
const restXPCheckbox = document.getElementById('restXP');
const heirloomXPCheckbox = document.getElementById('heirloomXP');
const recruitAFriendCheckbox = document.getElementById('recruitAFriend');

// Event listeners
expansionSelect.addEventListener('change', updateLevelLimits);
methodButtons.forEach(btn => {
    btn.addEventListener('click', selectMethod);
});
calculateBtn.addEventListener('click', calculateLevelingTime);

// Initialize
updateLevelLimits();

function updateLevelLimits() {
    const expansion = expansionSelect.value;
    const maxLevel = experienceData[expansion].maxLevel;
    
    currentLevelInput.max = maxLevel;
    targetLevelInput.max = maxLevel;
    
    // Update target level if it exceeds max
    if (parseInt(targetLevelInput.value) > maxLevel) {
        targetLevelInput.value = maxLevel;
    }
    
    // Update current level if it exceeds max
    if (parseInt(currentLevelInput.value) > maxLevel) {
        currentLevelInput.value = maxLevel - 1;
    }
}

function selectMethod(event) {
    methodButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    selectedMethod = event.target.id.replace('Btn', '');
}

function calculateLevelingTime() {
    const expansion = expansionSelect.value;
    const currentLevel = parseInt(currentLevelInput.value);
    const targetLevel = parseInt(targetLevelInput.value);
    const currentXP = parseInt(document.getElementById('currentXP')?.value || 0);
    
    if (currentLevel >= targetLevel) {
        resultsDiv.innerHTML = '<p style="color: #ff6b6b;">Current level must be lower than target level!</p>';
        return;
    }
    
    const expansionData = experienceData[expansion];
    const xpTable = expansionData.xpTable;
    
    // Calculate dynamic XP per hour based on level and play style
    let baseXPPerHour = calculateDynamicXPPerHour(currentLevel, selectedMethod);
    
    // Calculate total XP needed
    let totalXPNeeded = 0;
    
    // Add remaining XP for current level
    const currentLevelXP = xpTable[currentLevel + 1] || 0;
    totalXPNeeded += Math.max(0, currentLevelXP - currentXP);
    
    // Add XP for all levels in between
    for (let level = currentLevel + 1; level < targetLevel; level++) {
        totalXPNeeded += xpTable[level + 1] || 0;
    }
    
    // Calculate XP modifiers
    let xpModifier = 1.0;
    const activeModifiers = [];
    
    if (restXPCheckbox.checked) {
        xpModifier *= 1.1; // Rested XP (+10% average)
        activeModifiers.push('Rested XP (+10%)');
    }
    
    if (heirloomXPCheckbox.checked) {
        xpModifier *= 1.2; // Heirloom gear (+20%)
        activeModifiers.push('Heirloom Bonus (+20%)');
    }
    
    if (recruitAFriendCheckbox.checked) {
        xpModifier *= 4.0; // 300% bonus = 4x total XP
        activeModifiers.push('Recruit-a-Friend (+300%)');
    }
    
    // Apply XP bonus (reduce needed XP)
    const effectiveXPNeeded = Math.floor(totalXPNeeded / xpModifier);
    
    // Calculate time needed
    const hoursNeeded = effectiveXPNeeded / baseXPPerHour;
    
    // Format time
    const formatTime = (hours) => {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        const minutes = Math.floor((hours % 1) * 60);
        
        let result = '';
        if (days > 0) result += `${days}d `;
        if (remainingHours > 0) result += `${remainingHours}h `;
        if (minutes > 0) result += `${minutes}m`;
        
        return result || '0m';
    };
    
    // Current level progress
    const currentLevelTotalXP = xpTable[currentLevel + 1] || 0;
    const progressPercent = currentLevelTotalXP > 0 ? (currentXP / currentLevelTotalXP) * 100 : 0;
    
    // Display results
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="result-label">Total Experience Needed:</div>
            <div class="result-value">${effectiveXPNeeded.toLocaleString()} XP</div>
        </div>
        <div class="result-item">
            <div class="result-label">Base XP/Hour (${selectedMethod}):</div>
            <div class="result-value">${baseXPPerHour.toLocaleString()} XP/hour</div>
        </div>
        <div class="result-item">
            <div class="result-label">Estimated Time:</div>
            <div class="result-value">${formatTime(hoursNeeded)}</div>
        </div>
        <div class="result-item">
            <div class="result-label">Current Level Progress:</div>
            <div class="result-value">${currentXP.toLocaleString()} / ${currentLevelTotalXP.toLocaleString()} (${progressPercent.toFixed(1)}%)</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
        </div>
        <div class="result-item">
            <div class="result-label">Levels Remaining:</div>
            <div class="result-value">${targetLevel - currentLevel}</div>
        </div>
        ${activeModifiers.length > 0 ? `
        <div class="result-item">
            <div class="result-label">Active Modifiers:</div>
            <div class="result-value">${activeModifiers.join(', ')}</div>
        </div>
        ` : ''}
    `;
    
    // Update zone recommendations
    updateZoneRecommendations(expansion, currentLevel, targetLevel);
}

// Calculate dynamic XP per hour based on level and play style
function calculateDynamicXPPerHour(currentLevel, playStyle) {
    let baseXPPerHour = 50000; // Base XP per hour
    
    switch (playStyle) {
        case 'questing':
            baseXPPerHour = currentLevel < 15 ? 30000 : currentLevel < 60 ? 80000 : 120000;
            break;
        case 'dungeons':
            baseXPPerHour = currentLevel < 15 ? 40000 : currentLevel < 60 ? 100000 : 150000;
            break;
        case 'pvp':
            baseXPPerHour = currentLevel < 15 ? 20000 : currentLevel < 60 ? 60000 : 100000;
            break;
        case 'grinding':
            baseXPPerHour = currentLevel < 15 ? 25000 : currentLevel < 60 ? 70000 : 110000;
            break;
    }
    
    return baseXPPerHour;
}

function updateZoneRecommendations(expansion, currentLevel, targetLevel) {
    const zones = zoneRecommendations[expansion] || [];
    const relevantZones = zones.filter(zone => {
        const [minLevel, maxLevel] = zone.level.split('-').map(l => parseInt(l));
        return maxLevel >= currentLevel && minLevel <= targetLevel;
    });
    
    if (relevantZones.length === 0) {
        zoneRecommendationsDiv.innerHTML = `
            <h3>Recommended Zones</h3>
            <p>No specific zone recommendations available for this level range.</p>
        `;
        return;
    }
    
    const zoneHTML = relevantZones.map(zone => `
        <div class="zone-item">
            <div class="zone-name">${zone.name}</div>
            <div class="zone-level">Level ${zone.level}</div>
            <div class="zone-faction ${zone.faction.toLowerCase()}">${zone.faction}</div>
            <div class="expansion-tag">${zone.expansion}</div>
        </div>
    `).join('');
    
    zoneRecommendationsDiv.innerHTML = `
        <h3>Recommended Zones</h3>
        <div class="zone-list">
            ${zoneHTML}
        </div>
    `;
}

// Add event listener for current XP input
document.addEventListener('DOMContentLoaded', function() {
    const currentXPInput = document.getElementById('currentXP');
    if (currentXPInput) {
        currentXPInput.addEventListener('input', calculateLevelingTime);
    }
});