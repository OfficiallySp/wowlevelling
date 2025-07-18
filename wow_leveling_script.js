// WoW Classic Leveling Calculator JavaScript

// Experience tables for each expansion
const experienceData = {
    vanilla: {
        maxLevel: 60,
        xpTable: generateXPTable(60, 'vanilla'),
        avgXPPerHour: {
            questing: 35000,
            dungeons: 45000,
            pvp: 25000,
            grinding: 30000
        }
    },
    tbc: {
        maxLevel: 70,
        xpTable: generateXPTable(70, 'tbc'),
        avgXPPerHour: {
            questing: 45000,
            dungeons: 55000,
            pvp: 30000,
            grinding: 35000
        }
    },
    wotlk: {
        maxLevel: 80,
        xpTable: generateXPTable(80, 'wotlk'),
        avgXPPerHour: {
            questing: 55000,
            dungeons: 65000,
            pvp: 35000,
            grinding: 40000
        }
    },
    cataclysm: {
        maxLevel: 85,
        xpTable: generateXPTable(85, 'cataclysm'),
        avgXPPerHour: {
            questing: 65000,
            dungeons: 75000,
            pvp: 40000,
            grinding: 45000
        }
    },
    mop: {
        maxLevel: 90,
        xpTable: generateXPTable(90, 'mop'),
        avgXPPerHour: {
            questing: 75000,
            dungeons: 85000,
            pvp: 45000,
            grinding: 50000
        }
    }
};

// Zone recommendations for each expansion
const zoneRecommendations = {
    vanilla: [
        { name: "Elwynn Forest", level: "1-10", expansion: "Vanilla" },
        { name: "Westfall", level: "10-20", expansion: "Vanilla" },
        { name: "Redridge Mountains", level: "15-25", expansion: "Vanilla" },
        { name: "Stranglethorn Vale", level: "30-45", expansion: "Vanilla" },
        { name: "Tanaris", level: "40-50", expansion: "Vanilla" },
        { name: "Un'Goro Crater", level: "48-55", expansion: "Vanilla" },
        { name: "Felwood", level: "48-55", expansion: "Vanilla" },
        { name: "Western Plaguelands", level: "51-58", expansion: "Vanilla" },
        { name: "Eastern Plaguelands", level: "53-60", expansion: "Vanilla" }
    ],
    tbc: [
        { name: "Hellfire Peninsula", level: "58-63", expansion: "TBC" },
        { name: "Zangarmarsh", level: "60-64", expansion: "TBC" },
        { name: "Nagrand", level: "64-67", expansion: "TBC" },
        { name: "Blade's Edge Mountains", level: "65-68", expansion: "TBC" },
        { name: "Netherstorm", level: "67-70", expansion: "TBC" },
        { name: "Shadowmoon Valley", level: "67-70", expansion: "TBC" }
    ],
    wotlk: [
        { name: "Borean Tundra", level: "68-72", expansion: "WotLK" },
        { name: "Dragonblight", level: "71-74", expansion: "WotLK" },
        { name: "Grizzly Hills", level: "73-75", expansion: "WotLK" },
        { name: "Zul'Drak", level: "74-77", expansion: "WotLK" },
        { name: "Sholazar Basin", level: "76-78", expansion: "WotLK" },
        { name: "Icecrown", level: "77-80", expansion: "WotLK" },
        { name: "The Storm Peaks", level: "77-80", expansion: "WotLK" }
    ],
    cataclysm: [
        { name: "Mount Hyjal", level: "80-82", expansion: "Cataclysm" },
        { name: "Vashj'ir", level: "80-82", expansion: "Cataclysm" },
        { name: "Deepholm", level: "82-83", expansion: "Cataclysm" },
        { name: "Uldum", level: "83-84", expansion: "Cataclysm" },
        { name: "Twilight Highlands", level: "84-85", expansion: "Cataclysm" }
    ],
    mop: [
        { name: "The Jade Forest", level: "85-86", expansion: "MoP" },
        { name: "Valley of the Four Winds", level: "86-87", expansion: "MoP" },
        { name: "Krasarang Wilds", level: "86-87", expansion: "MoP" },
        { name: "Kun-Lai Summit", level: "87-88", expansion: "MoP" },
        { name: "Townlong Steppes", level: "88-89", expansion: "MoP" },
        { name: "Dread Wastes", level: "89-90", expansion: "MoP" }
    ]
};

// Generate XP table for each expansion
function generateXPTable(maxLevel, expansion) {
    const table = {};
    
    for (let level = 1; level < maxLevel; level++) {
        let xpRequired;
        
        if (expansion === 'vanilla') {
            if (level <= 10) {
                xpRequired = level * 100;
            } else if (level <= 20) {
                xpRequired = (level - 10) * 1000 + 1000;
            } else if (level <= 30) {
                xpRequired = (level - 20) * 2000 + 11000;
            } else if (level <= 40) {
                xpRequired = (level - 30) * 3000 + 31000;
            } else if (level <= 50) {
                xpRequired = (level - 40) * 4000 + 61000;
            } else {
                xpRequired = (level - 50) * 5000 + 101000;
            }
        } else if (expansion === 'tbc') {
            if (level <= 60) {
                xpRequired = generateXPTable(60, 'vanilla')[level] || 0;
            } else {
                xpRequired = (level - 60) * 200000 + 200000;
            }
        } else if (expansion === 'wotlk') {
            if (level <= 70) {
                xpRequired = generateXPTable(70, 'tbc')[level] || 0;
            } else {
                xpRequired = (level - 70) * 250000 + 250000;
            }
        } else if (expansion === 'cataclysm') {
            if (level <= 80) {
                xpRequired = generateXPTable(80, 'wotlk')[level] || 0;
            } else {
                xpRequired = (level - 80) * 300000 + 300000;
            }
        } else if (expansion === 'mop') {
            if (level <= 85) {
                xpRequired = generateXPTable(85, 'cataclysm')[level] || 0;
            } else {
                xpRequired = (level - 85) * 350000 + 350000;
            }
        }
        
        table[level] = Math.floor(xpRequired);
    }
    
    return table;
}

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
    
    if (currentLevel >= targetLevel) {
        resultsDiv.innerHTML = '<p style="color: #ff6b6b;">Current level must be lower than target level!</p>';
        return;
    }
    
    const expansionData = experienceData[expansion];
    const xpTable = expansionData.xpTable;
    const baseXPPerHour = expansionData.avgXPPerHour[selectedMethod];
    
    // Calculate total XP needed
    let totalXPNeeded = 0;
    for (let level = currentLevel; level < targetLevel; level++) {
        totalXPNeeded += xpTable[level] || 0;
    }
    
    // Calculate XP modifiers
    let xpModifier = 1.0;
    const activeModifiers = [];
    
    if (restXPCheckbox.checked) {
        xpModifier *= 1.5; // Rested XP averages to 50% bonus over leveling period
        activeModifiers.push('Rested XP (+50% average)');
    }
    
    if (heirloomXPCheckbox.checked) {
        xpModifier *= 1.45;
        activeModifiers.push('Heirloom Bonus (+45%)');
    }
    
    if (recruitAFriendCheckbox.checked) {
        xpModifier *= 4.0; // 300% bonus = 4x total XP
        activeModifiers.push('Recruit-a-Friend (+300%)');
    }
    
    // Calculate effective XP per hour
    const effectiveXPPerHour = baseXPPerHour * xpModifier;
    
    // Calculate time needed
    const hoursNeeded = totalXPNeeded / effectiveXPPerHour;
    const daysNeeded = hoursNeeded / 24;
    
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
    
    // Display results
    resultsDiv.innerHTML = `
        <div class="result-item">
            <div class="result-label">Total Experience Needed:</div>
            <div class="result-value">${totalXPNeeded.toLocaleString()} XP</div>
        </div>
        <div class="result-item">
            <div class="result-label">Base XP/Hour (${selectedMethod}):</div>
            <div class="result-value">${baseXPPerHour.toLocaleString()} XP/hour</div>
        </div>
        <div class="result-item">
            <div class="result-label">Effective XP/Hour:</div>
            <div class="result-value">${Math.floor(effectiveXPPerHour).toLocaleString()} XP/hour</div>
        </div>
        <div class="result-item">
            <div class="result-label">Time to Level:</div>
            <div class="result-value">${formatTime(hoursNeeded)}</div>
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