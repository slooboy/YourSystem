// Initialization functions for all objects

function initializeRedDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    const vx = 0;
    const vy = 0;
    
    // Return red dot object with position, velocity, mass, radius, collision counts, and trail
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: CONFIG.redMass, // Full mass for regular red dots
        radius: CONFIG.dotRadius / 2, // Full radius for regular red dots
        blueCollisionCount: 0, // Track collisions with blue dot
        greenCollisionCount: 0, // Track collisions with green dots
        trail: []
    };
}

// Function to split a red dot into two mini-reds
function splitRedDot(index) {
    if (index < 0 || index >= redDots.length) return;
    
    const parentDot = redDots[index];
    const miniMass = CONFIG.redMass * 0.5; // 0.5 times the mass
    const miniRadius = CONFIG.dotRadius / 4; // Half the diameter (half the radius)
    
    // Create two mini-reds at slightly offset positions
    const offset = parentDot.radius; // Small offset to prevent overlap
    const angle1 = Math.random() * Math.PI * 2; // Random direction for first mini-red
    const angle2 = angle1 + Math.PI; // Opposite direction for second mini-red
    
    const miniRed1 = {
        x: parentDot.x + Math.cos(angle1) * offset,
        y: parentDot.y + Math.sin(angle1) * offset,
        vx: parentDot.vx,
        vy: parentDot.vy,
        mass: miniMass,
        radius: miniRadius,
        blueCollisionCount: 0, // Reset collision counts
        greenCollisionCount: 0,
        trail: []
    };
    
    const miniRed2 = {
        x: parentDot.x + Math.cos(angle2) * offset,
        y: parentDot.y + Math.sin(angle2) * offset,
        vx: parentDot.vx,
        vy: parentDot.vy,
        mass: miniMass,
        radius: miniRadius,
        blueCollisionCount: 0, // Reset collision counts
        greenCollisionCount: 0,
        trail: []
    };
    
    // Replace the parent dot with the first mini-red
    redDots[index] = miniRed1;
    // Add the second mini-red
    redDots.push(miniRed2);
    
    // Play flute D6 sound when mini-reds are created
    playFluteD6();
}

function initializeBlueDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    blueDotX = minX + Math.random() * (maxX - minX);
    blueDotY = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    blueVx = 0;
    blueVy = 0;
}

function initializeGreenDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    const vx = 0;
    const vy = 0;
    
    // Return green dot object with position, velocity, trail, antigravity state, and cloud time
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        trail: [],
        blueCollisionCount: 0, // Track collisions with blue dot for antigravity
        antigravityActive: false,
        antigravityTimeRemaining: 0,
        cloudTime: 0, // Track time spent in clouds (for antigravity activation)
        lastWindchimeTime: 0 // Track last windchime play time for antigravity sound
    };
}

function initializeCloud() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Random radius: 2x to 5x the width of green star (green star width = CONFIG.dotRadius * 2)
    // So radius should be between CONFIG.dotRadius * 4 and CONFIG.dotRadius * 10
    const minRadius = CONFIG.dotRadius * 4; // 2x green star width
    const maxRadius = CONFIG.dotRadius * 10; // 5x green star width
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    
    // Generate random cloud shape (4 to 8 puffs)
    const numPuffs = Math.floor(Math.random() * 5) + 4; // Random between 4 and 8
    const puffs = [];
    
    for (let i = 0; i < numPuffs; i++) {
        // Random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const distance = (Math.random() * 0.4 + 0.1) * radius; // 10% to 50% of radius from center
        const puffX = x + Math.cos(angle) * distance;
        const puffY = y + Math.sin(angle) * distance;
        // Random puff size (30% to 80% of base radius)
        const puffRadius = radius * (0.3 + Math.random() * 0.5);
        
        puffs.push({ x: puffX, y: puffY, r: puffRadius });
    }
    
    // Return cloud object with position, radius, and shape data (clouds don't move)
    return {
        x: x,
        y: y,
        radius: radius,
        puffs: puffs
    };
}


// Title translations (with proper capitalization for each language)
const titleTranslations = {
    english: "If a Video Game Designer Had Made the Solar System",
    spanish: "Si Un Diseñador De Videojuegos Hubiera Hecho El Sistema Solar",
    catalan: "Si Un Dissenyador De Videojocs Hagués Fet El Sistema Solar",
    italian: "Se Un Designer Di Videogiochi Avesse Fatto Il Sistema Solare",
    german: "Wenn Ein Videospiel-Designer Das Sonnensystem Gemacht Hätte",
    czech: "Kdyby Návrhář Videoher Udělal Sluneční Soustavu",
    japanese: "もしゲームデザイナーが太陽系を作っていたら",
    hindi: "अगर एक वीडियो गेम डिज़ाइनर ने सौर मंडल बनाया होता",
    chinese: "如果电子游戏设计师创造了太阳系",
    hawaiian: "Inā Ua Hana Kahi Mea Hoʻolālā Pāʻani Wikiō I Ka Pōʻai Lā",
    swedish: "Om En Speldesigner Hade Gjort Solsystemet",
    danish: "Hvis En Spildesigner Havde Lavet Solsystemet",
    icelandic: "Ef Leikjahönnuður Hefði Búið Til Sólkerfið",
    oldNorse: "Ef Leikjaskapari Hafi Gjört Sólkerfið",
    walloon: "Si On Dizineu D' Djeus Vidèo Åreut Fait L' Sisteme Solaire",
    basque: "Bideo Joko Diseinatzaile Batek Eguzki Sistema Egin Izan Balu"
};

// Language list (for random selection)
const languageOrder = [
    'spanish', 'catalan', 'italian', 'german', 'czech', 'japanese', 
    'hindi', 'chinese', 'hawaiian', 'swedish', 'danish', 'icelandic', 
    'oldNorse', 'walloon', 'basque'
];

// Random quotations from Einstein, Newton, or David Bowie's "Life on Mars" (at most 12 words)
const randomQuotations = [
    // Einstein quotes
    "Imagination is more important than knowledge.",
    "The important thing is not to stop questioning.",
    "Reality is merely an illusion, albeit a very persistent one.",
    "God does not play dice with the universe.",
    "The distinction between past, present and future is only a stubbornly persistent illusion.",
    "I have no special talent. I am only passionately curious.",
    "Try not to become a person of success, but rather try to become a person of value.",
    "The only source of knowledge is experience.",
    "Logic will get you from A to B. Imagination will take you everywhere.",
    "Science without religion is lame, religion without science is blind.",
    // Newton quotes
    "If I have seen further it is by standing on the shoulders of Giants.",
    "I can calculate the motion of heavenly bodies but not the madness of people.",
    "To every action there is always opposed an equal reaction.",
    "Nature is pleased with simplicity.",
    "What we know is a drop, what we don't know is an ocean.",
    "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things.",
    "I was like a boy playing on the sea-shore, and diverting myself now and then finding a smoother pebble.",
    "Plato is my friend, Aristotle is my friend, but my greatest friend is truth.",
    // David Bowie "Life on Mars" lyrics
    "It's a god-awful small affair",
    "To the girl with the mousy hair",
    "But her friend is nowhere to be seen",
    "Now she walks through her sunken dream",
    "To the seat with the clearest view",
    "And she's hooked to the silver screen",
    "But the film is a saddening bore",
    "For she's lived it ten times or more",
    "She could spit in the eyes of fools",
    "As they ask her to focus on",
    "Sailors fighting in the dance hall",
    "Oh man! Look at those cavemen go",
    "It's the freakiest show",
    "Take a look at the Lawman",
    "Beating up the wrong guy",
    "Oh man! Wonder if he'll ever know",
    "He's in the best selling show",
    "Is there life on Mars?"
];

// Function to update the title based on reset count
function updateTitle() {
    const titleElement = document.querySelector('h1');
    if (!titleElement) return;
    
    let selectedLanguage = 'english';
    
    // Every 5th reset (5, 10, 15, 20, ...) use random quotation from Einstein, Newton, or Bowie
    if (resetCount > 0 && resetCount % 5 === 0) {
        const quoteIndex = Math.floor(Math.random() * randomQuotations.length);
        titleElement.textContent = randomQuotations[quoteIndex];
        // Update last two languages (treat quotation as a special case, doesn't count toward English requirement)
        lastTwoLanguages[0] = lastTwoLanguages[1];
        lastTwoLanguages[1] = 'quotation';
        return;
    }
    
    // The reset after a 5th reset (6, 11, 16, 21, ...) revert to English original
    if (resetCount > 0 && resetCount % 5 === 1) {
        selectedLanguage = 'english';
    } else {
        // Check if English hasn't been shown in the last two resets (ensures English at least every 3 resets)
        if (lastTwoLanguages[0] !== 'english' && lastTwoLanguages[1] !== 'english') {
            selectedLanguage = 'english';
        } else {
            // Cycle through languages in order
            selectedLanguage = languageOrder[currentLanguageIndex];
            currentLanguageIndex = (currentLanguageIndex + 1) % languageOrder.length;
        }
    }
    
    // Update last two languages
    lastTwoLanguages[0] = lastTwoLanguages[1];
    lastTwoLanguages[1] = selectedLanguage;
    
    titleElement.textContent = titleTranslations[selectedLanguage];
}

// Reset function to reinitialize all objects
function resetSimulation() {
    // Increment reset counter
    resetCount++;
    
    // Update title language (every 3rd reset)
    updateTitle();
    
    // Clear red dots array
    redDots.length = 0;
    
    // Clear green dots array
    greenDots.length = 0;
    
    // Clear clouds
    clouds.length = 0;
    
    // Clear trails
    blueTrail.length = 0;
    
    // Reset antigravity state
    blueAntigravityActive = false;
    blueAntigravityTimeRemaining = 0;
    blueGreenAntigravityCount = 0;
    blueCloudTime = 0; // Reset blue cloud time
    lastBlueWindchimeTime = 0; // Reset blue windchime timer
    lastOrganChordTime = 0; // Reset organ chord timer
    
    // Initialize random number of red dots (2 to 8)
    const numRedDots = Math.floor(Math.random() * 7) + 2; // Random number from 2 to 8
    for (let i = 0; i < numRedDots; i++) {
        redDots.push(initializeRedDot());
    }
    
    // Initialize green dots: 1 in 10 chance of 2 or 3 green stars, otherwise 1
    let numGreenDots = 1; // Default: 1 green star
    if (Math.random() < 0.1) { // 1 in 10 chance (10%)
        numGreenDots = Math.floor(Math.random() * 2) + 2; // Random number from 2 to 3
    }
    for (let i = 0; i < numGreenDots; i++) {
        greenDots.push(initializeGreenDot());
    }
    
    // Reinitialize blue dot with random position
    initializeBlueDot();
    
    // Initialize one cloud at the start
    clouds.push(initializeCloud());
    
    // Reset collision counts
    blueGreenCollisionCount = 0;
    
    // Reset timer
    startTime = Date.now();
}
