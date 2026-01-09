// Initialization functions for all objects

function initializeRedDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Calculate initial tangential velocity based on nearby massive objects
    let vx = 0;
    let vy = 0;
    
    // Check for nearby blue dot
    if (typeof blueDotX !== 'undefined' && blueDotX !== null) {
        const dx = blueDotX - x;
        const dy = blueDotY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0 && distance < rectangleWidth * 0.5) {
            // Calculate tangential direction (perpendicular to radial direction)
            const radialAngle = Math.atan2(dy, dx);
            const tangentialAngle = radialAngle + Math.PI / 2; // 90 degrees perpendicular
            // Tangential velocity magnitude based on distance (closer = faster)
            const speed = Math.min(15, 30 * (1 - distance / (rectangleWidth * 0.5)));
            vx = Math.cos(tangentialAngle) * speed;
            vy = Math.sin(tangentialAngle) * speed;
        }
    }
    
    // Check for nearby green dots
    if (typeof greenDots !== 'undefined' && greenDots.length > 0) {
        for (let i = 0; i < greenDots.length; i++) {
            const dx = greenDots[i].x - x;
            const dy = greenDots[i].y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0 && distance < rectangleWidth * 0.5) {
                const radialAngle = Math.atan2(dy, dx);
                const tangentialAngle = radialAngle + Math.PI / 2;
                const speed = Math.min(15, 30 * (1 - distance / (rectangleWidth * 0.5)));
                vx += Math.cos(tangentialAngle) * speed * 0.5; // Add with 50% weight
                vy += Math.sin(tangentialAngle) * speed * 0.5;
            }
        }
    }
    
    // Check for nearby earth
    if (typeof earth !== 'undefined' && earth !== null) {
        const dx = earth.x - x;
        const dy = earth.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0 && distance < rectangleWidth * 0.5) {
            const radialAngle = Math.atan2(dy, dx);
            const tangentialAngle = radialAngle + Math.PI / 2;
            const speed = Math.min(15, 30 * (1 - distance / (rectangleWidth * 0.5)));
            vx += Math.cos(tangentialAngle) * speed * 0.5;
            vy += Math.sin(tangentialAngle) * speed * 0.5;
        }
    }
    
    // Return red dot object with position, velocity, mass, radius, collision counts, and trail
    // Decay time: exponential distribution with mean 10 seconds
    const decayTime = -10 * Math.log(Math.random()); // Exponential decay with average 10 seconds
    
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: CONFIG.redMass, // Full mass for regular red dots
        radius: CONFIG.dotRadius / 2, // Full radius for regular red dots
        blueCollisionCount: 0, // Track collisions with blue dot
        greenCollisionCount: 0, // Track collisions with green dots
        trail: [],
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        cloudFadeAmount: 1.0, // Fade amount when in clouds (1.0 = fully visible, 0.0 = deleted)
        decayTime: 0, // Time since creation (will decay to minired when reaches decayTimeThreshold)
        decayTimeThreshold: decayTime, // Random decay threshold (exponential distribution, mean 10s)
        antigravityActive: false, // Antigravity state (activated on earth collision)
        antigravityTimeRemaining: 0, // Time remaining for antigravity (3 seconds)
        lastWindchimeTime: 0 // Track last windchime play time for antigravity sound
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
    
    // Decay time for minireds: half-life of 10 seconds
    const miniredDecayTime = -10 * Math.log(Math.random()); // Exponential decay with half-life 10 seconds
    
    const miniRed1 = {
        x: parentDot.x + Math.cos(angle1) * offset,
        y: parentDot.y + Math.sin(angle1) * offset,
        vx: parentDot.vx,
        vy: parentDot.vy,
        mass: miniMass,
        radius: miniRadius,
        blueCollisionCount: 0, // Reset collision counts
        greenCollisionCount: 0,
        trail: [],
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        decayTime: 0, // Time since creation (half-life decay, 0 to decayTimeThreshold)
        decayTimeThreshold: miniredDecayTime, // Random decay threshold (exponential distribution, half-life 10s)
        antigravityActive: false, // Antigravity state (activated on earth collision)
        antigravityTimeRemaining: 0, // Time remaining for antigravity (3 seconds)
        lastWindchimeTime: 0 // Track last windchime play time for antigravity sound
        // Note: mini-reds don't have cloudFadeAmount - they're exempt from cloud effects
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
        trail: [],
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        decayTime: 0, // Time since creation (half-life decay, 0 to decayTimeThreshold)
        decayTimeThreshold: -10 * Math.log(Math.random()), // Random decay threshold for second minired
        antigravityActive: false, // Antigravity state (activated on earth collision)
        antigravityTimeRemaining: 0, // Time remaining for antigravity (3 seconds)
        lastWindchimeTime: 0 // Track last windchime play time for antigravity sound
        // Note: mini-reds don't have cloudFadeAmount - they're exempt from cloud effects
    };
    
    // Replace the parent dot with the first mini-red
    redDots[index] = miniRed1;
    // Add the second mini-red
    redDots.push(miniRed2);
    
    // Play flute D6 sound when mini-reds are created
    if (typeof playFluteD6 === 'function') {
        playFluteD6();
    }
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
    
    // Reset fade-in time
    blueDotFadeInTime = 0;
    
    // Generate a name for the blue dot
    blueDotName = generateBlueDotName();
}

// Generate a star name with consonant-vowel pattern
// Average length 5, min 3, max 8
function generateStarName() {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    
    // Generate length: weighted toward 5, but between 3 and 8
    // Use a triangular distribution centered at 5
    let length;
    const rand = Math.random();
    if (rand < 0.4) {
        // 40% chance: length 4-6 (centered around 5)
        length = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6
    } else if (rand < 0.7) {
        // 30% chance: length 3 or 7
        length = Math.random() < 0.5 ? 3 : 7;
    } else {
        // 30% chance: length 8
        length = 8;
    }
    
    // Ensure within bounds
    length = Math.max(3, Math.min(8, length));
    
    // Generate name with consonant-vowel pattern
    let name = '';
    for (let i = 0; i < length; i++) {
        if (i % 2 === 0) {
            // Even indices: consonants
            name += consonants[Math.floor(Math.random() * consonants.length)];
        } else {
            // Odd indices: vowels
            name += vowels[Math.floor(Math.random() * vowels.length)];
        }
    }
    
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
}

// Generate a blue dot name with vowel-consonant-accented-vowel pattern
// Length 2 to 6 letters
function generateBlueDotName() {
    const vowels = 'aeiou';
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const accentedVowels = 'áéíóú';
    
    // Generate length: 2 to 6 letters
    const length = Math.floor(Math.random() * 5) + 2; // 2, 3, 4, 5, or 6
    
    // Generate name with pattern: vowel consonant accented-vowel ...
    let name = '';
    for (let i = 0; i < length; i++) {
        if (i % 3 === 0) {
            // Every 3rd position starting at 0: vowel
            name += vowels[Math.floor(Math.random() * vowels.length)];
        } else if (i % 3 === 1) {
            // Every 3rd position starting at 1: consonant
            name += consonants[Math.floor(Math.random() * consonants.length)];
        } else {
            // Every 3rd position starting at 2: accented vowel
            name += accentedVowels[Math.floor(Math.random() * accentedVowels.length)];
        }
    }
    
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateCrescentName() {
    // Generate name with formula: digit digit digit punctuation mark letter (from any script)
    const digits = '0123456789';
    const punctuation = '!?.,;:';
    
    // Letters from various scripts (Unicode ranges)
    // Latin, Greek, Cyrillic, Arabic, Hebrew, Chinese, Japanese, Korean, etc.
    const letters = [
        // Latin (A-Z, a-z)
        ...Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)), // A-Z
        ...Array.from({length: 26}, (_, i) => String.fromCharCode(97 + i)), // a-z
        // Greek
        'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω',
        'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
        // Cyrillic
        'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я',
        'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я',
        // Arabic
        'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي',
        // Hebrew
        'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
        // Chinese/Japanese/Korean (common characters)
        '中', '日', '本', '韓', '国', '한', '글', '漢', '字', 'ひ', 'ら', 'が', 'な', 'カ', 'タ', 'カ', 'ナ',
        // Other scripts
        'Ω', 'α', 'β', 'π', 'Σ', 'Δ', 'λ', 'μ', 'ν', 'ξ', 'ρ', 'τ', 'φ', 'χ', 'ψ'
    ];
    
    // Generate: digit digit digit punctuation letter
    const digit1 = digits[Math.floor(Math.random() * digits.length)];
    const digit2 = digits[Math.floor(Math.random() * digits.length)];
    const digit3 = digits[Math.floor(Math.random() * digits.length)];
    const punct = punctuation[Math.floor(Math.random() * punctuation.length)];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    
    return digit1 + digit2 + digit3 + punct + letter;
}

function initializeGreenDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Calculate initial tangential velocity based on nearby massive objects
    let vx = 0;
    let vy = 0;
    
    // Check for nearby blue dot
    if (typeof blueDotX !== 'undefined' && blueDotX !== null) {
        const dx = blueDotX - x;
        const dy = blueDotY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0 && distance < rectangleWidth * 0.5) {
            const radialAngle = Math.atan2(dy, dx);
            const tangentialAngle = radialAngle + Math.PI / 2;
            const speed = Math.min(12, 25 * (1 - distance / (rectangleWidth * 0.5)));
            vx = Math.cos(tangentialAngle) * speed;
            vy = Math.sin(tangentialAngle) * speed;
        }
    }
    
    // Check for nearby earth
    if (typeof earth !== 'undefined' && earth !== null) {
        const dx = earth.x - x;
        const dy = earth.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0 && distance < rectangleWidth * 0.5) {
            const radialAngle = Math.atan2(dy, dx);
            const tangentialAngle = radialAngle + Math.PI / 2;
            const speed = Math.min(12, 25 * (1 - distance / (rectangleWidth * 0.5)));
            vx += Math.cos(tangentialAngle) * speed * 0.5;
            vy += Math.sin(tangentialAngle) * speed * 0.5;
        }
    }
    
    // Check for other nearby green dots
    if (typeof greenDots !== 'undefined' && greenDots.length > 0) {
        for (let i = 0; i < greenDots.length; i++) {
            const dx = greenDots[i].x - x;
            const dy = greenDots[i].y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0 && distance < rectangleWidth * 0.5) {
                const radialAngle = Math.atan2(dy, dx);
                const tangentialAngle = radialAngle + Math.PI / 2;
                const speed = Math.min(12, 25 * (1 - distance / (rectangleWidth * 0.5)));
                vx += Math.cos(tangentialAngle) * speed * 0.3;
                vy += Math.sin(tangentialAngle) * speed * 0.3;
            }
        }
    }
    
    // Return green dot object with position, velocity, trail, antigravity state, and cloud time
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        trail: [],
        blueCollisionCount: 0, // Track collisions with blue dot for antigravity
        greenCollisionCount: 0, // Track collisions with other green dots for antigravity
        antigravityActive: false,
        antigravityTimeRemaining: 0,
        cloudTime: 0, // Track time spent in clouds (for antigravity activation)
        lastWindchimeTime: 0, // Track last windchime play time for antigravity sound
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        antigravityTextTime: -1, // Time remaining for antigravity text display (-1 = not showing, 1.5 = showing, counts down to 0)
        wasInCloud: false, // Track if green dot was in cloud last frame (to only apply momentum change on entry)
        name: generateStarName() // Generate a unique name for this star
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
    
    // Random radius: up to 10x the width of green star (green star width = CONFIG.dotRadius * 2)
    // So radius should be between CONFIG.dotRadius * 4 and CONFIG.dotRadius * 20
    const minRadius = CONFIG.dotRadius * 4; // 2x green star width
    const maxRadius = CONFIG.dotRadius * 20; // 10x green star width
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
    
    // Return cloud object with position, radius, shape data, and mass (clouds don't move)
    return {
        x: x,
        y: y,
        radius: radius,
        puffs: puffs,
        mass: CONFIG.redMass * 0.1, // Default mass: 0.1x red mass
        fadeInTime: 0 // Time since creation (for fade-in effect, 0 to 1.0 seconds)
    };
}

// Function to change cloud shape and acquire mass
function changeCloudShapeAndMass(cloud) {
    // Generate new random cloud shape (4 to 8 puffs)
    const numPuffs = Math.floor(Math.random() * 5) + 4; // Random between 4 and 8
    const puffs = [];
    
    for (let i = 0; i < numPuffs; i++) {
        // Random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const distance = (Math.random() * 0.4 + 0.1) * cloud.radius; // 10% to 50% of radius from center
        const puffX = cloud.x + Math.cos(angle) * distance;
        const puffY = cloud.y + Math.sin(angle) * distance;
        // Random puff size (30% to 80% of base radius)
        const puffRadius = cloud.radius * (0.3 + Math.random() * 0.5);
        
        puffs.push({ x: puffX, y: puffY, r: puffRadius });
    }
    
    // Update cloud shape
    cloud.puffs = puffs;
    
    // Acquire mass from 0.5 to 2 times red mass
    cloud.mass = CONFIG.redMass * (0.5 + Math.random() * 1.5); // Random between 0.5 and 2.0
}

function initializeYellowCrescent(x, y) {
    // Create yellow crescent at the specified position (where cloud was)
    // Initial velocity: set to 0
    const vx = 0;
    const vy = 0;
    
    // Return yellow crescent object with position, velocity, mass, and radius
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: CONFIG.yellowCrescentMass,
        radius: CONFIG.dotRadius * 1.5, // Slightly larger than red dots
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        decayTime: 0, // Time since creation (radioactive decay, 0 to 10 seconds)
        dissolveTime: -1, // Time in dissolve transition (0 to 0.5 seconds, -1 if not dissolving)
        transformType: null, // 'blue' or 'red' - set when decay completes
        name: generateCrescentName(), // Generate a unique name for this crescent
        antigravityActive: false, // Antigravity state (activated on earth collision)
        antigravityTimeRemaining: 0, // Time remaining for antigravity (3 seconds)
        lastWindchimeTime: 0 // Track last windchime play time for antigravity sound
    };
}

function initializeEarth() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    
    // Calculate initial tangential velocity based on nearby massive objects
    let vx = 0;
    let vy = 0;
    
    // Check for nearby blue dot
    if (typeof blueDotX !== 'undefined' && blueDotX !== null) {
        const dx = blueDotX - x;
        const dy = blueDotY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0 && distance < rectangleWidth * 0.5) {
            const radialAngle = Math.atan2(dy, dx);
            const tangentialAngle = radialAngle + Math.PI / 2;
            const speed = Math.min(10, 20 * (1 - distance / (rectangleWidth * 0.5)));
            vx = Math.cos(tangentialAngle) * speed;
            vy = Math.sin(tangentialAngle) * speed;
        }
    }
    
    // Check for nearby green dots
    if (typeof greenDots !== 'undefined' && greenDots.length > 0) {
        for (let i = 0; i < greenDots.length; i++) {
            const dx = greenDots[i].x - x;
            const dy = greenDots[i].y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0 && distance < rectangleWidth * 0.5) {
                const radialAngle = Math.atan2(dy, dx);
                const tangentialAngle = radialAngle + Math.PI / 2;
                const speed = Math.min(10, 20 * (1 - distance / (rectangleWidth * 0.5)));
                vx += Math.cos(tangentialAngle) * speed * 0.5;
                vy += Math.sin(tangentialAngle) * speed * 0.5;
            }
        }
    }
    
    // Generate Earth name in a random language
    earthName = generateEarthName();
    
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: CONFIG.redMass * 50, // Mass of 50 reds (increased by factor of 10)
        radius: CONFIG.dotRadius * 1.0, // Same size as orange crescent
        fadeInTime: 0 // Time since creation (for fade-in effect, 0 to 1.0 seconds)
    };
}

function initializeComet() {
    // Create a comet that enters from any edge of the starfield
    // Randomly choose which edge (0=top, 1=right, 2=bottom, 3=left)
    const edge = Math.floor(Math.random() * 4);
    
    let x, y;
    const speed = 20; // 20px/s initial velocity
    let vx, vy;
    
    // Position on the chosen edge
    if (edge === 0) {
        // Top edge
        x = rectangleX + Math.random() * rectangleWidth;
        y = rectangleY;
        // Random direction pointing inward (downward)
        const angle = Math.PI / 2 + (Math.random() - 0.5) * Math.PI; // 0 to PI (pointing down)
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
    } else if (edge === 1) {
        // Right edge
        x = rectangleX + rectangleWidth;
        y = rectangleY + Math.random() * rectangleHeight;
        // Random direction pointing inward (leftward)
        const angle = Math.PI + (Math.random() - 0.5) * Math.PI; // PI/2 to 3PI/2 (pointing left)
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
    } else if (edge === 2) {
        // Bottom edge
        x = rectangleX + Math.random() * rectangleWidth;
        y = rectangleY + rectangleHeight;
        // Random direction pointing inward (upward)
        const angle = 3 * Math.PI / 2 + (Math.random() - 0.5) * Math.PI; // PI to 2PI (pointing up)
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
    } else {
        // Left edge
        x = rectangleX;
        y = rectangleY + Math.random() * rectangleHeight;
        // Random direction pointing inward (rightward)
        const angle = (Math.random() - 0.5) * Math.PI; // -PI/2 to PI/2 (pointing right)
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
    }
    
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: 0, // Comets have zero mass
        radius: CONFIG.dotRadius * 0.75, // Slightly smaller than red dot
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        lastRedDotTime: 0, // Time since last red dot was created
        nextRedDotInterval: -10 * Math.log(Math.random()) // Exponential distribution, average 10 seconds (increased from 2s)
    };
}

function initializeOrangeCrescent(x, y, vx = 0, vy = 0) {
    // Create orange crescent at the specified position
    // Return orange crescent object with position, velocity, mass, and radius
    return {
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: 15, // Orange crescent mass = 15
        radius: CONFIG.dotRadius * 1.0, // Reduced by 1/3 (was 1.5, now 1.0)
        fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
        decayTime: 0, // Time since creation (radioactive decay, 0 to 5 seconds half-life)
        fadeOutTime: -1, // Time remaining for fade-out (-1 = not fading, >= 0 = fading out)
        name: generateCrescentName(), // Generate a unique name for this crescent
        antigravityActive: false, // Antigravity state (activated on earth collision)
        antigravityTimeRemaining: 0, // Time remaining for antigravity (3 seconds)
        lastWindchimeTime: 0 // Track last windchime play time for antigravity sound
    };
}

// Title translations (with proper capitalization for each language)
const titleTranslations = {
    english: "If a Video Game Designer Had Made the Solar System",
    spanish: "Si un Diseñador de Videojuegos Hubiera Hecho el Sistema Solar",
    catalan: "Si un Dissenyador de Videojocs Hagués Fet el Sistema Solar",
    italian: "Se un Progettista di Videogiochi Avesse Fatto il Sistema Solare",
    german: "Wenn ein Videospiel-Designer das Sonnensystem Gemacht Hätte",
    czech: "Kdyby Návrhář Videoher Udělal Sluneční Soustavu",
    japanese: "もしビデオゲームデザイナーが太陽系を作っていたら",
    hindi: "यदि एक वीडियो गेम डिज़ाइनर ने सौर मंडल बनाया होता",
    simplifiedChinese: "如果视频游戏设计师创造了太阳系",
    hawaiian: "Inā Ua Hana Kekahi Mea Hoʻolālā Pāʻani Wikiō i ka Pōʻai Lā",
    swedish: "Om en Speldesigner Hade Skapat Solsystemet",
    danish: "Hvis en Spildesigner Havde Lavet Solsystemet",
    icelandic: "Ef Tölvuleikjahönnuður Hefði Búið Til Sólkerfið",
    oldNorse: "Ef Leikjaskapari Hafa Gjört Sólkerfið",
    walloon: "Si on Dizeu d' Djeus Vidèyo Åreut Fait l' Sisteme Solrece",
    basque: "Bideo-joko Diseinatzaile Batek Eguzki Sistema Egin Izu Balu",
    frisian: "As in Fideospultsje-Ûntwerper it Sinnestelsel Makke Hie",
    dutch: "Als een Videogameontwerper het Zonnestelsel Had Gemaakt",
    ukrainian: "Якби Дизайнер Відеоігор Створив Сонячну Систему",
    bulgarian: "Ако Дизайнер на Видеоигри Направи Слънчевата Система",
    armenian: "Եթե Վիդեո Խաղերի Դիզայներն Էր Ստեղծել Արեգակնային Համակարգը",
    galician: "Se un Deseñador de Videoxogos Fixera o Sistema Solar",
    portuguese: "Se um Designer de Videogames Tivesse Feito o Sistema Solar",
    irish: "Dá mBa Dhearadh Cluiche Físeáin a Rinne an Córas Gréine",
    zulu: "Uma Umklami Wevidiyo Game Wayenze Isistimu Yelanga",
    afrikaans: "As 'n Videospeletjie-Ontwerper die Sonnestelsel Gemaak Het",
    finnish: "Jos Videopelisuunnittelija Olisi Tehnyt Aurinkokunnan",
    estonian: "Kui Videomängu Disainer Oleks Loonud Päikesesüsteemi",
    ancientGreek: "Εἰ ὁ Βιδεοπαιγνίου Δημιουργὸς τὸν Ἠλιακὸν Σύστημα Ἐποίησεν",
    arabic: "لو أن مصمم ألعاب فيديو صنع النظام الشمسي",
    farsi: "اگر یک طراح بازی ویدیویی منظومه شمسی را ساخته بود",
    tamil: "ஒரு வீடியோ கேம் வடிவமைப்பாளர் சூரிய மண்டலத்தை உருவாக்கியிருந்தால்",
    frenchBraille: "Si un Concepteur de Jeux Vidéo Avait Créé le Système Solaire"
};

// Random quotations from Einstein, Newton, and David Bowie's 'Life on Mars'
const randomQuotations = {
    english: [
        "Imagination is more important than knowledge.",
        "The important thing is not to stop questioning.",
        "I have no special talent. I am only passionately curious.",
        "If I have seen further, it is by standing on the shoulders of giants.",
        "To every action there is always opposed an equal reaction.",
        "It's a god-awful small affair to the girl with the mousy hair.",
        "But the film is a saddening bore.",
        "It's on America's tortured brow that Mickey Mouse has grown up a cow."
    ],
    spanish: [
        "La imaginación es más importante que el conocimiento.",
        "Lo importante es no dejar de cuestionar.",
        "No tengo talento especial. Solo soy apasionadamente curioso.",
        "Si he visto más lejos, es por estar sobre hombros de gigantes.",
        "A toda acción siempre se opone una reacción igual.",
        "Es un asunto terriblemente pequeño para la chica del pelo ratón.",
        "Pero la película es un aburrimiento triste.",
        "Es en la frente torturada de América que Mickey Mouse ha crecido una vaca."
    ],
    catalan: [
        "La imaginació és més important que el coneixement.",
        "L'important és no deixar de qüestionar.",
        "No tinc talent especial. Només sóc apassionadament curiós.",
        "Si he vist més lluny, és per estar sobre espatlles de gegants.",
        "A tota acció sempre s'oposa una reacció igual.",
        "És un assumpte terriblement petit per a la noia del pèl ratolí.",
        "Però la pel·lícula és un avorriment trist.",
        "És a la front torturada d'Amèrica que Mickey Mouse ha crescut una vaca."
    ],
    italian: [
        "L'immaginazione è più importante della conoscenza.",
        "L'importante è non smettere di interrogarsi.",
        "Non ho talento speciale. Sono solo appassionatamente curioso.",
        "Se ho visto più lontano, è stando sulle spalle dei giganti.",
        "Ad ogni azione si oppone sempre una reazione uguale.",
        "È una faccenda terribilmente piccola per la ragazza dai capelli topo.",
        "Ma il film è una noia triste.",
        "È sulla fronte torturata d'America che Topolino è cresciuto una mucca."
    ],
    german: [
        "Phantasie ist wichtiger als Wissen.",
        "Wichtig ist, nicht aufzuhören zu fragen.",
        "Ich habe kein besonderes Talent. Ich bin nur leidenschaftlich neugierig.",
        "Wenn ich weiter gesehen habe, so deshalb, weil ich auf den Schultern von Riesen stand.",
        "Jeder Aktion ist immer eine gleiche Reaktion entgegengesetzt.",
        "Es ist eine gott-erbärmlich kleine Angelegenheit für das Mädchen mit den mausigen Haaren.",
        "Aber der Film ist eine traurige Langeweile.",
        "Es ist auf Amerikas gequälter Stirn, dass Mickey Mouse eine Kuh groß geworden ist."
    ],
    czech: [
        "Představivost je důležitější než znalosti.",
        "Důležité je nepřestat se ptát.",
        "Nemám žádný zvláštní talent. Jsem jen vášnivě zvědavý.",
        "Pokud jsem viděl dál, je to tím, že stojím na ramenou obrů.",
        "Každé akci se vždy staví proti stejná reakce.",
        "Je to hrozně malá záležitost pro dívku s myšími vlasy.",
        "Ale film je smutná nuda.",
        "Je to na mučeném čele Ameriky, že Mickey Mouse vyrostl krávu."
    ],
    japanese: [
        "想像力は知識よりも重要です。",
        "重要なのは、疑問を持ち続けることです。",
        "特別な才能はありません。ただ情熱的に好奇心旺盛です。",
        "より遠くを見たのは、巨人の肩の上に立っているからです。",
        "あらゆる作用には、常に等しい反作用が対立します。",
        "ネズミ色の髪の女の子にとって、それは恐ろしく小さな出来事です。",
        "しかし、映画は悲しい退屈です。",
        "アメリカの苦しめられた額で、ミッキーマウスが牛に成長したのです。"
    ],
    hindi: [
        "कल्पना ज्ञान से अधिक महत्वपूर्ण है।",
        "महत्वपूर्ण बात यह है कि सवाल करना बंद न करें।",
        "मेरे पास कोई विशेष प्रतिभा नहीं है। मैं केवल जुनूनी रूप से उत्सुक हूं।",
        "अगर मैंने आगे देखा है, तो यह दिग्गजों के कंधों पर खड़े होने से है।",
        "हर क्रिया के लिए हमेशा एक समान प्रतिक्रिया का विरोध होता है।",
        "यह चूहे जैसे बालों वाली लड़की के लिए एक भयानक छोटा मामला है।",
        "लेकिन फिल्म एक दुखद उबाऊ है।",
        "यह अमेरिका के यातनाग्रस्त माथे पर है कि मिकी माउस एक गाय बड़ा हो गया है।"
    ],
    simplifiedChinese: [
        "想象力比知识更重要。",
        "重要的是不要停止质疑。",
        "我没有特殊才能。我只是充满激情地好奇。",
        "如果我看到了更远的地方，那是因为站在巨人的肩膀上。",
        "每个作用总是有一个相等的反作用。",
        "对于那个有老鼠般头发的女孩来说，这是一件非常小的事情。",
        "但这部电影是一个令人悲伤的乏味。",
        "正是在美国受折磨的额头上，米老鼠长成了一头牛。"
    ],
    hawaiian: [
        "ʻOi aku ka manaʻo ma mua o ka ʻike.",
        "He mea nui ka hoʻomau ʻana i ka nīnau.",
        "ʻAʻohe koʻu talena kūikawā. Ua ʻano ʻano wau wale nō.",
        "Inā ua ʻike aku au i kahi mamao, no ka kū ʻana ma luna o nā poʻohiwi o nā kānaka nui.",
        "I kēlā me kēia hana, aia kekahi pane like.",
        "He mea liʻiliʻi loa ia no ka kaikamahine me ka lauoho ʻiole.",
        "Akā, he mea hoʻohuoi ka kiʻi ʻoniʻoni.",
        "Ma ka lae ʻeha o ʻAmelika i ulu ai ʻo Mickey Mouse i bipi."
    ],
    swedish: [
        "Fantasi är viktigare än kunskap.",
        "Det viktiga är att inte sluta ifrågasätta.",
        "Jag har ingen särskild talang. Jag är bara passionerat nyfiken.",
        "Om jag har sett längre, är det genom att stå på jättarnas axlar.",
        "Till varje handling finns alltid en lika reaktion.",
        "Det är en gud-avskyvärd liten affär för flickan med det mössiga håret.",
        "Men filmen är en sorglig tråkighet.",
        "Det är på Amerikas torterade panna som Musse Pigg har vuxit upp en ko."
    ],
    danish: [
        "Fantasi er vigtigere end viden.",
        "Det vigtige er ikke at stoppe med at stille spørgsmål.",
        "Jeg har ingen særlig talent. Jeg er kun lidenskabeligt nysgerrig.",
        "Hvis jeg har set længere, er det ved at stå på kæmpers skuldre.",
        "Til enhver handling er der altid en lige reaktion.",
        "Det er en gud-forfærdelig lille affære for pigen med det musede hår.",
        "Men filmen er en sørgelig kedsomhed.",
        "Det er på Amerikas torturerede pande, at Mickey Mouse er vokset op en ko."
    ],
    icelandic: [
        "Ímyndunarafl er mikilvægara en þekking.",
        "Það mikilvæga er að hætta ekki að spyrja.",
        "Ég hef enga sérstaka hæfileika. Ég er bara ástríðufulllega forvitinn.",
        "Ef ég hef séð lengra, er það með því að standa á öxlum risanna.",
        "Fyrir hverja aðgerð er alltaf jafn viðbrögð.",
        "Það er guð-hryllilega lítið mál fyrir stúlkuna með músahár.",
        "En kvikmyndin er sorgleg leiðindi.",
        "Það er á pínuðu enni Ameríku sem Mickey Mouse hefur vaxið upp kú."
    ],
    oldNorse: [
        "Ímyndunarafl er mikilvægara en þekking.",
        "Þat mikilvæga er at hætta ekki at spyrja.",
        "Ek hefi enga sérstaka hæfileika. Ek em bara ástríðufulllega forvitinn.",
        "Ef ek hefi séð lengra, er þat með því at standa á öxlum risanna.",
        "Fyrir hverja aðgerð er alltaf jafn viðbrögð.",
        "Þat er guð-hryllilega lítið mál fyrir stúlkuna með músahár.",
        "En kvikmyndin er sorgleg leiðindi.",
        "Þat er á pínuðu enni Ameríku sem Mickey Mouse hefir vaxið upp kú."
    ],
    walloon: [
        "L' imådjinåcion est pus importante ki l' saveur.",
        "L' importante, c' est di n' nén s' arester di dmander.",
        "Dji n' a pont d' talint special. Dji soye seulmint passioné curieus.",
        "Si dji m' a veyou pus lon, c' est pa stå so les spales des djudlås.",
        "A tchaeke accion, i gn a todi ene egale reaccion.",
        "C' est ene pitite afwaire po l' båshele avou les tchveas d' sori.",
        "Mins l' fime, c' est ene tristèsse.",
        "C' est so l' front torturé d' Amerike ki Mickey Mouse a crexhou ene vatche."
    ],
    basque: [
        "Irudimena ezagutza baino garrantzitsuagoa da.",
        "Garrantzitsua da galderak egiteari ez uztea.",
        "Ez dut talentu berezirik. Besterik gabe, pasioz bitxia naiz.",
        "Urrunago ikusi badut, erraldoien sorbaldetan nagoelako da.",
        "Ekintza bakoitzari beti erantzun berdin bat dago kontrajarrita.",
        "Sagu ileko neskarentzat gertaera txiki bat da.",
        "Baina filma aspergarri triste bat da.",
        "Amerikako kopetan da Mickey Mouse behi bat hazi dena."
    ],
    frisian: [
        "Fantasij is wichtiger as kennis.",
        "It wichtichste is net ophâlde mei freegjen.",
        "Ik haw gjin bysûndere talint. Ik bin allinnich passyfolle nijsgjirrich.",
        "As ik fierder sjoen haw, is it troch op skouders fan reuzen te stean.",
        "Oan elke aksje is altyd in gelikweardige reaksje tsjinsteld.",
        "It is in god-ferfelige lytse saak foar it famke mei it mûze-eftige hier.",
        "Mar de film is in drôve ferfeeling.",
        "It is op Amerika syn martele foarholle dat Mickey Mouse in ko grut wurden is."
    ],
    dutch: [
        "Verbeelding is belangrijker dan kennis.",
        "Het belangrijke is niet stoppen met vragen stellen.",
        "Ik heb geen bijzonder talent. Ik ben alleen gepassioneerd nieuwsgierig.",
        "Als ik verder heb gezien, is het door op de schouders van reuzen te staan.",
        "Op elke actie is er altijd een gelijke reactie.",
        "Het is een god-afschuwelijke kleine affaire voor het meisje met het muisachtige haar.",
        "Maar de film is een treurige verveling.",
        "Het is op Amerika's gemartelde voorhoofd dat Mickey Mouse een koe is opgegroeid."
    ],
    ukrainian: [
        "Уява важливіша за знання.",
        "Важливо не припиняти ставити питання.",
        "У мене немає особливого таланту. Я лише пристрасно цікавий.",
        "Якщо я бачив далі, це тому, що стою на плечах гігантів.",
        "На кожну дію завжди є рівна протидія.",
        "Це бог-жахлива маленька справа для дівчини з мишастим волоссям.",
        "Але фільм - це сумна нудьга.",
        "Це на змученому чолі Америки, що Міккі Маус виріс корову."
    ],
    bulgarian: [
        "Въображението е по-важно от знанието.",
        "Важното е да не спираме да задаваме въпроси.",
        "Нямам специален талант. Просто съм страстно любопитен.",
        "Ако съм видял по-далеч, това е защото стоя на раменете на гиганти.",
        "На всяко действие винаги има равна реакция.",
        "Това е бог-ужасна малка работа за момичето с миши косми.",
        "Но филмът е тъжна скука.",
        "Това е на измъченото чело на Америка, че Мики Маус е израснал крава."
    ],
    armenian: [
        "Երևակայությունը ավելի կարևոր է, քան գիտելիքը:",
        "Կարևորը չդադարել հարցեր տալն է:",
        "Ես հատուկ տաղանդ չունեմ: Ես միայն կրքոտ հետաքրքրասեր եմ:",
        "Եթե ես ավելի հեռու եմ տեսել, դա այն պատճառով է, որ կանգնած եմ հսկաների ուսերի վրա:",
        "Յուրաքանչյուր գործողությանը միշտ հակադրվում է հավասար արձագանք:",
        "Դա աստված-սարսափելի փոքր գործ է մկնանման մազերով աղջկա համար:",
        "Բայց ֆիլմը տխուր ձանձրույթ է:",
        "Դա Ամերիկայի տանջված ճակատին է, որ Միկի Մաուսը աճել է կով:"
    ],
    galician: [
        "A imaxinación é máis importante que o coñecemento.",
        "O importante é non deixar de cuestionar.",
        "Non teño talento especial. Só son apaixonadamente curioso.",
        "Se vin máis lonxe, é por estar sobre os ombreiros de xigantes.",
        "A toda acción sempre se opón unha reacción igual.",
        "É un asunto terriblemente pequeno para a rapaza do pelo de rato.",
        "Pero a película é un aburrimento triste.",
        "É na fronte torturada de América que Mickey Mouse creceu unha vaca."
    ],
    portuguese: [
        "A imaginação é mais importante que o conhecimento.",
        "O importante é não parar de questionar.",
        "Não tenho talento especial. Sou apenas apaixonadamente curioso.",
        "Se vi mais longe, é por estar sobre os ombros de gigantes.",
        "A toda ação sempre se opõe uma reação igual.",
        "É um assunto terrivelmente pequeno para a garota com cabelo de rato.",
        "Mas o filme é um tédio triste.",
        "É na testa torturada da América que Mickey Mouse cresceu uma vaca."
    ],
    irish: [
        "Tá an tsamhlaíocht níos tábhachtaí ná an t-eolas.",
        "Is é an rud tábhachtach gan stopadh a chur le ceisteanna.",
        "Níl aon tallann speisialta agam. Níl mé ach go paiseanta fiosrach.",
        "Má chonaic mé níos faide, is trí sheasamh ar ghuaille na bhfathach é.",
        "Gach gníomh, tá freagairt chomhionann i gcoinne i gcónaí.",
        "Is cás beag uafásach é don chailín leis an gruaig luchóg.",
        "Ach is bréan brónach é an scannán.",
        "Is ar éadan céasta Mheiriceá a d'fhás Mickey Mouse bó."
    ]
};

// Language order for cycling (excluding English which appears every 10 resets)
const languageOrder = [
    'spanish', 'catalan', 'italian', 'german', 'czech', 'japanese', 'hindi',
    'simplifiedChinese', 'hawaiian', 'swedish', 'danish', 'icelandic', 'oldNorse',
    'walloon', 'basque', 'frisian', 'dutch', 'ukrainian', 'bulgarian', 'armenian',
    'galician', 'portuguese', 'irish', 'zulu', 'afrikaans', 'finnish', 'estonian',
    'ancientGreek', 'arabic', 'farsi', 'tamil', 'frenchBraille'
];

function generateEarthName() {
    // Translations of "Earth" in various languages
    const earthTranslations = {
        english: 'Earth',
        spanish: 'Tierra',
        catalan: 'Terra',
        italian: 'Terra',
        german: 'Erde',
        czech: 'Země',
        japanese: '地球',
        hindi: 'पृथ्वी',
        simplifiedChinese: '地球',
        hawaiian: 'Honua',
        swedish: 'Jorden',
        danish: 'Jorden',
        icelandic: 'Jörð',
        oldNorse: 'Jörð',
        walloon: 'Tere',
        basque: 'Lurra',
        frisian: 'Ierde',
        dutch: 'Aarde',
        ukrainian: 'Земля',
        bulgarian: 'Земя',
        armenian: 'Երկիր',
        galician: 'Terra',
        portuguese: 'Terra',
        irish: 'An Domhan',
        zulu: 'Umhlaba',
        afrikaans: 'Aarde',
        finnish: 'Maa',
        estonian: 'Maa',
        ancientGreek: 'Γῆ',
        arabic: 'الأرض',
        farsi: 'زمین',
        tamil: 'பூமி',
        frenchBraille: 'Terre'
    };
    
    // Pick a random language from the language order list
    const randomIndex = Math.floor(Math.random() * languageOrder.length);
    const selectedLanguage = languageOrder[randomIndex];
    
    return earthTranslations[selectedLanguage] || earthTranslations.english;
}

// Function to adjust title font size to fit on two lines
function adjustTitleFontSize(titleElement) {
    titleElement.style.fontSize = ''; // Reset to default
    titleElement.style.whiteSpace = 'normal'; // Allow wrapping
    titleElement.style.lineHeight = '1.4'; // Line height for two lines
    const computedStyle = window.getComputedStyle(titleElement);
    let fontSize = parseFloat(computedStyle.fontSize);
    const minFontSize = 12;
    const containerWidth = titleElement.parentElement.clientWidth - 40; // Account for padding
    const maxHeight = 100; // Maximum height for two lines (title-container height)
    
    // Check if text fits in two lines, reduce font size if needed
    titleElement.style.fontSize = fontSize + 'px';
    let textHeight = titleElement.scrollHeight;
    
    while (textHeight > maxHeight && fontSize > minFontSize) {
        fontSize -= 1;
        titleElement.style.fontSize = fontSize + 'px';
        textHeight = titleElement.scrollHeight; // Recalculate after change
    }
}

// Async function to update title with fade transition
async function updateTitle(useAutoCycle = false) {
    if (titleUpdateInProgress) return; // Prevent overlapping updates
    
    titleUpdateInProgress = true;
    const titleElement = document.querySelector('h1');
    if (!titleElement) {
        titleUpdateInProgress = false;
        return;
    }
    
    const cycleCount = useAutoCycle ? autoTitleCycleCount : resetCount;
    let newText = '';
    
    // Determine what to show
    const shouldShowQuotation = cycleCount > 0 && cycleCount % 5 === 0;
    const shouldShowEnglish = cycleCount % 10 === 0 || !lastNineLanguages.includes('english');
    
    if (shouldShowQuotation) {
        // Show random quotation
        const allLanguages = Object.keys(randomQuotations);
        const randomLang = allLanguages[Math.floor(Math.random() * allLanguages.length)];
        const quotes = randomQuotations[randomLang];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        newText = randomQuote;
    } else if (shouldShowEnglish) {
        newText = titleTranslations.english;
    } else {
        // Cycle through languages in order
        const lang = languageOrder[currentLanguageIndex % languageOrder.length];
        newText = titleTranslations[lang];
        currentLanguageIndex = (currentLanguageIndex + 1) % languageOrder.length;
    }
    
    // Update lastNineLanguages
    const currentLang = Object.keys(titleTranslations).find(key => titleTranslations[key] === newText) || 'english';
    lastNineLanguages.shift();
    lastNineLanguages.push(currentLang);
    
    // Increment the appropriate counter
    if (useAutoCycle) {
        autoTitleCycleCount++;
    }
    
    // Fade out old title
    titleElement.style.opacity = '0';
    
    // Wait for fade out to complete (0.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Change text content while invisible
    titleElement.textContent = newText;
    
    // Adjust font size to fit on one line
    adjustTitleFontSize(titleElement);
    
    // Fade in new title
    titleElement.style.opacity = '1';
    
    // Reset flag after fade completes
    setTimeout(() => {
        titleUpdateInProgress = false;
    }, 500);
}

// Reset function to reinitialize all objects
function resetSimulation() {
    // Increment reset counter
    resetCount++;
    
    // Update title language (based on reset count)
    // On initial page load (resetCount === 1), ensure title is English
    // On subsequent resets (resetCount > 1), follow normal title cycling rules
    if (resetCount === 1) {
        // First load - ensure title is English (it's already in HTML, but explicitly set it)
        const titleElement = document.querySelector('h1');
        if (titleElement) {
            titleElement.textContent = titleTranslations.english;
            adjustTitleFontSize(titleElement);
        }
    } else {
        updateTitle(false); // false = use reset count, not automatic cycling
    }
    
    // Reset automatic title cycling state
    autoTitleCycleCount = 0;
    autoTitleCyclingStarted = false;
    lastAutoTitleChangeTime = 0;
    titleUpdateInProgress = false;
    
    // Clear red dots array
    redDots.length = 0;
    
    // Clear green dots array
    greenDots.length = 0;
    
    // Clear clouds
    clouds.length = 0;
    
    // Clear yellow crescents
    yellowCrescents.length = 0;
    
    // Clear orange crescents
    orangeCrescents.length = 0;
    
    // Clear comets
    comets.length = 0;
    
    // Reset earth
    earth = null;
    earthTrail.length = 0;
    
    
    // Clear trails
    blueTrail.length = 0;
    
    // Reset antigravity state
    blueAntigravityActive = false;
    blueAntigravityTimeRemaining = 0;
    blueGreenAntigravityCount = 0;
    blueCloudTime = 0; // Reset blue cloud time
    lastBlueWindchimeTime = 0; // Reset blue windchime timer
    lastOrganChordTime = 0; // Reset organ chord timer
    blueDotFadeInTime = 0; // Reset blue dot fade-in time
    
    // Reset antigravity text display (so it can show again on next simulation)
    antigravityTextShown = false;
    antigravityTextTime = -1;
    
    // Reinitialize blue dot with random position (do this first so other objects can use it for tangential velocity)
    initializeBlueDot();
    
    // Initialize earth at the start (do this early so other objects can use it for tangential velocity)
    earth = initializeEarth();
    
    // Red dots are no longer created at initialization - only from comets
    // (No initial red dots created)
    
    // Initialize green dots: 1 in 10 chance of 2 or 3 green stars, otherwise 1
    let numGreenDots = 1; // Default: 1 green star
    if (Math.random() < 0.1) { // 1 in 10 chance (10%)
        numGreenDots = Math.floor(Math.random() * 2) + 2; // Random number from 2 to 3
    }
    for (let i = 0; i < numGreenDots; i++) {
        greenDots.push(initializeGreenDot());
    }
    
    // Initialize one cloud at the start
    clouds.push(initializeCloud());
    
    // Reset spontaneous cloud generation timer
    lastSpontaneousCloudTime = 0;
    spontaneousCloudInterval = -20 * Math.log(Math.random()); // Exponential distribution, average 20 seconds
    
    // Reset spontaneous comet generation timer
    lastSpontaneousCometTime = 0;
    spontaneousCometInterval = -24 * Math.log(Math.random()); // Exponential distribution, average 24 seconds
    
    // Reset collision counts
    blueGreenCollisionCount = 0;
    
    // Reset timer
    startTime = Date.now();
}
