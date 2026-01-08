// Animation loop

function animate() {
    // Ensure context is initialized
    if (!ensureContext()) {
        requestAnimationFrame(animate);
        return;
    }
    
    // Check if canvas and context are ready
    if (!canvas || !ctx || canvas.width === 0 || canvas.height === 0) {
        console.log('Canvas check failed:', { canvas: !!canvas, ctx: !!ctx, width: canvas?.width, height: canvas?.height });
        requestAnimationFrame(animate);
        return;
    }
    
    // Calculate delta time
    let deltaTime;
    if (lastUpdateTime === 0) {
        deltaTime = 0.016; // ~60fps for first frame
    } else {
        deltaTime = (Date.now() / 1000) - lastUpdateTime;
    }
    lastUpdateTime = Date.now() / 1000;
    
    // Limit deltaTime to prevent large jumps
    deltaTime = Math.min(deltaTime, 0.1);
    
    // Get current time for timing calculations
    const currentTime = (Date.now() - startTime) / 1000;
    
    // Spontaneous comet generation (average every 120 seconds)
    lastSpontaneousCometTime += deltaTime;
    if (lastSpontaneousCometTime >= spontaneousCometInterval) {
        comets.push(initializeComet());
        lastSpontaneousCometTime = 0;
        // Generate next interval (exponential distribution, average 24 seconds)
        spontaneousCometInterval = -24 * Math.log(Math.random());
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create state objects for all objects (for physics calculations)
    const redDotStates = redDots.map(dot => ({ x: dot.x, y: dot.y, vx: dot.vx, vy: dot.vy }));
    const blueDotState = { x: blueDotX, y: blueDotY, vx: blueVx, vy: blueVy };
    const greenDotStates = greenDots.map(dot => ({ x: dot.x, y: dot.y, vx: dot.vx, vy: dot.vy }));
    const yellowCrescentStates = yellowCrescents.map(crescent => ({ x: crescent.x, y: crescent.y, vx: crescent.vx, vy: crescent.vy }));
    const orangeCrescentStates = orangeCrescents.map(crescent => ({ x: crescent.x, y: crescent.y, vx: crescent.vx, vy: crescent.vy }));
    const cometStates = comets.map(comet => ({ x: comet.x, y: comet.y, vx: comet.vx, vy: comet.vy }));
    
    // Earth state (single object)
    let earthState = null;
    if (earth) {
        earthState = { x: earth.x, y: earth.y, vx: earth.vx, vy: earth.vy };
    }
    
    // Apply gravitational forces between all pairs of objects
    // Red dots with each other (using individual masses)
    for (let i = 0; i < redDotStates.length; i++) {
        for (let j = i + 1; j < redDotStates.length; j++) {
            applyGravitationalForce(redDotStates[i], redDotStates[j], redDots[i].mass, redDots[j].mass, deltaTime);
        }
    }
    
    // Red dots with blue dot
    for (let i = 0; i < redDotStates.length; i++) {
        applyGravitationalForce(redDotStates[i], blueDotState, redDots[i].mass, CONFIG.blueMass, deltaTime, false, blueAntigravityActive);
    }
    
    // Red dots with green dots
    for (let i = 0; i < redDotStates.length; i++) {
        for (let j = 0; j < greenDotStates.length; j++) {
            applyGravitationalForce(redDotStates[i], greenDotStates[j], redDots[i].mass, greenMass, deltaTime, false, greenDots[j].antigravityActive);
        }
    }
    
    // Blue with green dots
    for (let i = 0; i < greenDotStates.length; i++) {
        applyGravitationalForce(blueDotState, greenDotStates[i], CONFIG.blueMass, greenMass, deltaTime, blueAntigravityActive, greenDots[i].antigravityActive);
    }
    
    // Green dots with each other
    for (let i = 0; i < greenDotStates.length; i++) {
        for (let j = i + 1; j < greenDotStates.length; j++) {
            applyGravitationalForce(greenDotStates[i], greenDotStates[j], greenMass, greenMass, deltaTime, greenDots[i].antigravityActive, greenDots[j].antigravityActive);
        }
    }
    
    // Yellow crescents with red dots
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        for (let j = 0; j < redDotStates.length; j++) {
            applyGravitationalForce(yellowCrescentStates[i], redDotStates[j], yellowCrescents[i].mass, redDots[j].mass, deltaTime);
        }
    }
    
    // Yellow crescents with blue dot
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        applyGravitationalForce(yellowCrescentStates[i], blueDotState, yellowCrescents[i].mass, CONFIG.blueMass, deltaTime, false, blueAntigravityActive);
    }
    
    // Yellow crescents with green dots
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        for (let j = 0; j < greenDotStates.length; j++) {
            applyGravitationalForce(yellowCrescentStates[i], greenDotStates[j], yellowCrescents[i].mass, greenMass, deltaTime, false, greenDots[j].antigravityActive);
        }
    }
    
    // Yellow crescents with each other
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        for (let j = i + 1; j < yellowCrescentStates.length; j++) {
            applyGravitationalForce(yellowCrescentStates[i], yellowCrescentStates[j], yellowCrescents[i].mass, yellowCrescents[j].mass, deltaTime);
        }
    }
    
    // Earth with all other objects (if earth exists)
    if (earthState && earth) {
        // Earth with red dots
        for (let i = 0; i < redDotStates.length; i++) {
            applyGravitationalForce(earthState, redDotStates[i], earth.mass, redDots[i].mass, deltaTime);
        }
        // Earth with blue dot
        applyGravitationalForce(earthState, blueDotState, earth.mass, CONFIG.blueMass, deltaTime, false, blueAntigravityActive);
        // Earth with green dots
        for (let i = 0; i < greenDotStates.length; i++) {
            applyGravitationalForce(earthState, greenDotStates[i], earth.mass, greenMass, deltaTime, false, greenDots[i].antigravityActive);
        }
        // Earth with yellow crescents
        for (let i = 0; i < yellowCrescentStates.length; i++) {
            applyGravitationalForce(earthState, yellowCrescentStates[i], earth.mass, yellowCrescents[i].mass, deltaTime);
        }
        // Earth with orange crescents
        for (let i = 0; i < orangeCrescentStates.length; i++) {
            applyGravitationalForce(earthState, orangeCrescentStates[i], earth.mass, orangeCrescents[i].mass, deltaTime);
        }
        // Earth with clouds
        for (let i = 0; i < clouds.length; i++) {
            const cloud = clouds[i];
            const cloudState = { x: cloud.x, y: cloud.y, vx: 0, vy: 0 };
            applyGravitationalForce(earthState, cloudState, earth.mass, cloud.mass, deltaTime);
        }
    }
    
    // Comets with all other objects
    for (let i = 0; i < cometStates.length; i++) {
        // Comets with red dots
        for (let j = 0; j < redDotStates.length; j++) {
            applyGravitationalForce(cometStates[i], redDotStates[j], comets[i].mass, redDots[j].mass, deltaTime);
        }
        // Comets with blue dot
        applyGravitationalForce(cometStates[i], blueDotState, comets[i].mass, CONFIG.blueMass, deltaTime, false, blueAntigravityActive);
        // Comets with green dots
        for (let j = 0; j < greenDotStates.length; j++) {
            applyGravitationalForce(cometStates[i], greenDotStates[j], comets[i].mass, greenMass, deltaTime, false, greenDots[j].antigravityActive);
        }
        // Comets with yellow crescents
        for (let j = 0; j < yellowCrescentStates.length; j++) {
            applyGravitationalForce(cometStates[i], yellowCrescentStates[j], comets[i].mass, yellowCrescents[j].mass, deltaTime);
        }
        // Comets with orange crescents
        for (let j = 0; j < orangeCrescentStates.length; j++) {
            applyGravitationalForce(cometStates[i], orangeCrescentStates[j], comets[i].mass, orangeCrescents[j].mass, deltaTime);
        }
        // Comets with earth
        if (earthState) {
            applyGravitationalForce(cometStates[i], earthState, comets[i].mass, earth.mass, deltaTime);
        }
        // Comets with clouds
        for (let j = 0; j < clouds.length; j++) {
            const cloud = clouds[j];
            const cloudState = { x: cloud.x, y: cloud.y, vx: 0, vy: 0 };
            applyGravitationalForce(cometStates[i], cloudState, comets[i].mass, cloud.mass, deltaTime);
        }
    }
    
    // Clouds with all other objects (clouds have individual mass, default 0.1x red mass)
    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        const cloudState = { x: cloud.x, y: cloud.y, vx: 0, vy: 0 }; // Clouds don't move
        
        // Clouds with red dots (using individual masses)
        for (let j = 0; j < redDotStates.length; j++) {
            applyGravitationalForce(cloudState, redDotStates[j], cloud.mass, redDots[j].mass, deltaTime);
        }
        // Clouds with blue dot
        applyGravitationalForce(cloudState, blueDotState, cloud.mass, CONFIG.blueMass, deltaTime, false, blueAntigravityActive);
        // Clouds with green dots
        for (let j = 0; j < greenDotStates.length; j++) {
            applyGravitationalForce(cloudState, greenDotStates[j], cloud.mass, greenMass, deltaTime, false, greenDots[j].antigravityActive);
        }
    }
    
    // Floor gravity: floor has mass of 1 red, positioned at center of bottom edge
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    const floorX = (minX + maxX) / 2; // Center of floor
    const floorY = maxY; // Bottom edge
    const floorState = { x: floorX, y: floorY, vx: 0, vy: 0 }; // Floor doesn't move
    const floorMass = CONFIG.redMass; // Floor mass = 1 red
    
    // Floor with red dots
    for (let i = 0; i < redDotStates.length; i++) {
        applyGravitationalForce(floorState, redDotStates[i], floorMass, redDots[i].mass, deltaTime);
    }
    
    // Floor with blue dot
    applyGravitationalForce(floorState, blueDotState, floorMass, CONFIG.blueMass, deltaTime, false, blueAntigravityActive);
    
    // Floor with green dots
    for (let i = 0; i < greenDotStates.length; i++) {
        applyGravitationalForce(floorState, greenDotStates[i], floorMass, greenMass, deltaTime, false, greenDots[i].antigravityActive);
    }
    
    // Floor with yellow crescents
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        applyGravitationalForce(floorState, yellowCrescentStates[i], floorMass, yellowCrescents[i].mass, deltaTime);
    }
    
    // Floor with orange crescents
    for (let i = 0; i < orangeCrescentStates.length; i++) {
        applyGravitationalForce(floorState, orangeCrescentStates[i], floorMass, orangeCrescents[i].mass, deltaTime);
    }
    
    // Floor with earth
    if (earthState && earth) {
        applyGravitationalForce(floorState, earthState, floorMass, earth.mass, deltaTime);
    }
    
    // Floor with clouds
    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        const cloudState = { x: cloud.x, y: cloud.y, vx: 0, vy: 0 };
        applyGravitationalForce(floorState, cloudState, floorMass, cloud.mass, deltaTime);
    }
    
    // Floor with comets
    for (let i = 0; i < cometStates.length; i++) {
        applyGravitationalForce(floorState, cometStates[i], floorMass, comets[i].mass, deltaTime);
    }
    
    // Update all red dots positions (using the state objects that have accumulated gravitational forces)
    // Track new red dots to create (to avoid modifying array during iteration)
    const newRedDotsToCreate = [];
    for (let i = 0; i < redDotStates.length; i++) {
        const result = updateDotPosition(redDotStates[i], CONFIG.gravity, deltaTime);
        
        // Cap speed at 250px/s
        capVelocity(redDotStates[i], 250);
        
        // Gradually slow down if moving faster than 30px/s
        graduallySlowDown(redDotStates[i], deltaTime);
        
        // Apply speed limit after wall collision
        if (result.wallHit) {
            reduceVelocityIfTooFast(redDotStates[i]);
        }
        
        // New rule: if there are only 2 red dots and one hits a wall, create a new red dot
        if (result.wallHit && redDots.length === 2) {
            newRedDotsToCreate.push(initializeRedDot());
        }
    }
    
    // Add new red dots after the loop
    for (let i = 0; i < newRedDotsToCreate.length; i++) {
        redDots.push(newRedDotsToCreate[i]);
    }
    
    // Update blue dot position using physics (same gravity for all)
    const blueResult = updateDotPosition(blueDotState, CONFIG.gravity, deltaTime);
    
    // Cap speed at 150px/s
    capVelocity(blueDotState, 150);
    
    // Gradually slow down if moving faster than 30px/s
    graduallySlowDown(blueDotState, deltaTime);
    
    // Apply speed limit after wall collision
    if (blueResult.wallHit) {
        reduceVelocityIfTooFast(blueDotState);
    }
    
    // Update all green dots positions (using the state objects that have accumulated gravitational forces)
    for (let i = 0; i < greenDotStates.length; i++) {
        const result = updateDotPosition(greenDotStates[i], CONFIG.gravity, deltaTime);
        
        // Cap speed at 250px/s
        capVelocity(greenDotStates[i], 250);
        
        // Gradually slow down if moving faster than 30px/s
        graduallySlowDown(greenDotStates[i], deltaTime);
        
        // Apply speed limit after wall collision
        if (result.wallHit) {
            reduceVelocityIfTooFast(greenDotStates[i]);
        }
    }
    
    // Update all yellow crescents positions (using the state objects that have accumulated gravitational forces)
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        const result = updateDotPosition(yellowCrescentStates[i], CONFIG.gravity, deltaTime);
        
        // Cap speed at 150px/s
        capVelocity(yellowCrescentStates[i], 150);
        
        // Gradually slow down if moving faster than 30px/s
        graduallySlowDown(yellowCrescentStates[i], deltaTime);
        
        // Apply speed limit after wall collision
        if (result.wallHit) {
            reduceVelocityIfTooFast(yellowCrescentStates[i]);
        }
    }
    
    // Update all orange crescents positions (using the state objects that have accumulated gravitational forces)
    for (let i = 0; i < orangeCrescentStates.length; i++) {
        const result = updateDotPosition(orangeCrescentStates[i], CONFIG.gravity, deltaTime);
        
        // Cap speed at 150px/s
        capVelocity(orangeCrescentStates[i], 150);
        
        // Gradually slow down if moving faster than 30px/s
        graduallySlowDown(orangeCrescentStates[i], deltaTime);
        
        // Apply speed limit after wall collision
        if (result.wallHit) {
            reduceVelocityIfTooFast(orangeCrescentStates[i]);
        }
    }
    
    // Update earth position (if earth exists)
    if (earthState && earth) {
        const earthResult = updateDotPosition(earthState, CONFIG.gravity, deltaTime);
        
        // Cap speed at 150px/s
        capVelocity(earthState, 150);
        
        // Gradually slow down if moving faster than 30px/s
        graduallySlowDown(earthState, deltaTime);
        
        // Apply speed limit after wall collision
        if (earthResult.wallHit) {
            reduceVelocityIfTooFast(earthState);
        }
        
        // Update earth object from state
        earth.x = earthState.x;
        earth.y = earthState.y;
        earth.vx = earthState.vx;
        earth.vy = earthState.vy;
    }
    
    // Update comet positions (comets don't bounce, they disappear on edge)
    const cometsToRemove = [];
    for (let i = 0; i < cometStates.length; i++) {
        // Apply gravity
        cometStates[i].vy += CONFIG.gravity * deltaTime;
        
        // Update position
        cometStates[i].x += cometStates[i].vx * deltaTime;
        cometStates[i].y += cometStates[i].vy * deltaTime;
        
        // Gradually slow down if moving faster than 30px/s
        graduallySlowDown(cometStates[i], deltaTime);
        
        // Update time since last red dot creation
        comets[i].lastRedDotTime += deltaTime;
        
        // Check if it's time to create a new red dot (average every 2 seconds)
        if (comets[i].lastRedDotTime >= comets[i].nextRedDotInterval) {
            // Calculate perpendicular direction to comet's velocity
            const cometSpeed = Math.sqrt(cometStates[i].vx * cometStates[i].vx + cometStates[i].vy * cometStates[i].vy);
            let perpX = 0;
            let perpY = 0;
            
            if (cometSpeed > 0) {
                // Normalize velocity to get direction
                const dirX = cometStates[i].vx / cometSpeed;
                const dirY = cometStates[i].vy / cometSpeed;
                
                // Perpendicular direction (rotate 90 degrees): (-dirY, dirX) or (dirY, -dirX)
                // Randomly choose positive or negative
                const sign = Math.random() < 0.5 ? -1 : 1;
                perpX = -dirY * sign;
                perpY = dirX * sign;
            } else {
                // If comet has no velocity, use random direction
                const angle = Math.random() * Math.PI * 2;
                perpX = Math.cos(angle);
                perpY = Math.sin(angle);
            }
            
            // Create new red dot at comet's position, offset slightly in perpendicular direction
            // Offset by a small amount (e.g., 5 pixels) in the perpendicular direction
            const offsetDistance = 5;
            const newRedDot = initializeRedDot();
            newRedDot.x = comets[i].x + perpX * offsetDistance;
            newRedDot.y = comets[i].y + perpY * offsetDistance;
            newRedDot.vx = 0; // Initial velocity of 0
            newRedDot.vy = 0; // Initial velocity of 0
            redDots.push(newRedDot);
            
            // Reset timer and generate next interval
            comets[i].lastRedDotTime = 0;
            comets[i].nextRedDotInterval = -2 * Math.log(Math.random()); // Exponential distribution, average 2 seconds
        }
        
        // Check if comet has hit an edge (disappear instead of bouncing)
        const minX = rectangleX;
        const maxX = rectangleX + rectangleWidth;
        const minY = rectangleY;
        const maxY = rectangleY + rectangleHeight;
        
        if (cometStates[i].x <= minX || cometStates[i].x >= maxX || 
            cometStates[i].y <= minY || cometStates[i].y >= maxY) {
            // Comet hit edge - mark for removal
            cometsToRemove.push(i);
        } else {
            // Update comet object from state
            comets[i].x = cometStates[i].x;
            comets[i].y = cometStates[i].y;
            comets[i].vx = cometStates[i].vx;
            comets[i].vy = cometStates[i].vy;
        }
    }
    
    // Remove comets that hit edges (process in reverse order to avoid index issues)
    for (let i = cometsToRemove.length - 1; i >= 0; i--) {
        const index = cometsToRemove[i];
        if (index >= 0 && index < comets.length) {
            comets.splice(index, 1);
        }
    }
    
    // Apply cloud drag effect - objects passing through clouds lose half their momentum
    // Track red dots in clouds for fade-based deletion
    // Track time blue and green dots spend in clouds for antigravity activation
    const redDotsToRemove = []; // Track indices of red dots that have faded to 0
    const redDotsToSplit = []; // Track indices of red dots that exited clouds with fade > 0
    const redDotsInCloud = new Set(); // Track which red dots are currently in clouds
    const redDotsPlayedSound = new Set(); // Track which red dots have already played the sound this frame
    
    // First pass: check if blue and green dots are in any cloud
    let blueInCloud = false;
    const greenInCloud = new Array(greenDotStates.length).fill(false);
    
    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        const cloudRadius = cloud.radius; // Use individual cloud radius
        
        // Check red dots - track which are in clouds and apply fade
        for (let j = 0; j < redDotStates.length; j++) {
            const dx = redDotStates[j].x - cloud.x;
            const dy = redDotStates[j].y - cloud.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < cloudRadius) {
                // Check if this is a mini-red (mini-reds are exempt from cloud effects)
                const miniRadius = CONFIG.dotRadius / 4;
                if (redDots[j].radius !== miniRadius) {
                    // Regular red dot is inside cloud
                    redDotsInCloud.add(j);
                    
                    // Initialize cloudFadeAmount if not present
                    if (redDots[j].cloudFadeAmount === undefined) {
                        redDots[j].cloudFadeAmount = 1.0;
                    }
                    
                    // Fade by 25% per second (0.25 * deltaTime)
                    redDots[j].cloudFadeAmount -= 0.25 * deltaTime;
                    
                    // Clamp fade amount to 0
                    if (redDots[j].cloudFadeAmount <= 0) {
                        redDots[j].cloudFadeAmount = 0;
                        // Mark for removal if faded to 0
                        if (!redDotsToRemove.includes(j)) {
                            redDotsToRemove.push(j);
                        }
                    }
                    
                    // Play breathy vocal "waaah" sound for red-grey collision (once per red dot)
                    if (!redDotsPlayedSound.has(j)) {
                        if (typeof playBreathyVocalWaaah === 'function') {
                            playBreathyVocalWaaah();
                        }
                        redDotsPlayedSound.add(j);
                    }
                }
            }
        }
        
        // Check blue dot
        const blueDx = blueDotState.x - cloud.x;
        const blueDy = blueDotState.y - cloud.y;
        const blueDistance = Math.sqrt(blueDx * blueDx + blueDy * blueDy);
        if (blueDistance < cloudRadius) {
            blueInCloud = true; // Blue dot is in a cloud
            
            // 1 in 10 chance to double momentum, otherwise halve it
            if (Math.random() < 0.1) {
                blueDotState.vx *= 2.0;
                blueDotState.vy *= 2.0;
            } else {
                blueDotState.vx *= 0.5;
                blueDotState.vy *= 0.5;
            }
            
            // Ensure minimum velocity of 0.5px/s
            const blueSpeed = Math.sqrt(blueDotState.vx * blueDotState.vx + blueDotState.vy * blueDotState.vy);
            if (blueSpeed > 0 && blueSpeed < 0.5) {
                const scale = 0.5 / blueSpeed;
                blueDotState.vx *= scale;
                blueDotState.vy *= scale;
            }
            
            // Track time blue dot spends in cloud
            blueCloudTime += deltaTime;
            
            // Activate antigravity if blue dot has been in cloud for 10 seconds
            if (blueCloudTime >= 10.0 && !blueAntigravityActive) {
                blueAntigravityActive = true;
                blueAntigravityTimeRemaining = 3.0; // 3 seconds
                blueCloudTime = 0; // Reset cloud time
                
                // Show "ANTIGRAVITY" text next to blue dot (up to 2 times total)
                if (antigravityTextCount < 2) {
                    antigravityTextCount++;
                    blueAntigravityTextTime = 1.5; // Show for 1 second, then fade over 0.5 seconds
                }
                
                // Ensure blue dot has at least 50px/s velocity when entering antigravity
                const currentSpeed = Math.sqrt(blueDotState.vx * blueDotState.vx + blueDotState.vy * blueDotState.vy);
                if (currentSpeed < 50) {
                    const randomSpeed = Math.random() * 200 + 50; // Random between 50 and 250 pixels/second
                    const randomAngle = Math.random() * Math.PI * 2; // Random direction
                    blueVx = Math.cos(randomAngle) * randomSpeed;
                    blueVy = Math.sin(randomAngle) * randomSpeed;
                    blueDotState.vx = blueVx;
                    blueDotState.vy = blueVy;
                }
                
                // Create yellow crescent and two red dots at cloud position
                const cloudIndex = clouds.findIndex(c => {
                    const dx = blueDotState.x - c.x;
                    const dy = blueDotState.y - c.y;
                    return Math.sqrt(dx * dx + dy * dy) < c.radius;
                });
                if (cloudIndex >= 0) {
                    const cloud = clouds[cloudIndex];
                    const newYellow = initializeYellowCrescent(cloud.x, cloud.y);
                    // Cap velocity at 45 px/s on creation
                    const speed = Math.sqrt(newYellow.vx * newYellow.vx + newYellow.vy * newYellow.vy);
                    if (speed > 45) {
                        const scale = 45 / speed;
                        newYellow.vx *= scale;
                        newYellow.vy *= scale;
                    }
                    yellowCrescents.push(newYellow);
                    
                    // Create two new red dots at cloud position
                    const redDot1 = initializeRedDot();
                    redDot1.x = cloud.x + (Math.random() - 0.5) * 20; // Slight offset
                    redDot1.y = cloud.y + (Math.random() - 0.5) * 20;
                    redDots.push(redDot1);
                    
                    const redDot2 = initializeRedDot();
                    redDot2.x = cloud.x + (Math.random() - 0.5) * 20; // Slight offset
                    redDot2.y = cloud.y + (Math.random() - 0.5) * 20;
                    redDots.push(redDot2);
                    
                    // Change cloud shape and acquire mass instead of removing
                    changeCloudShapeAndMass(cloud);
                    if (typeof playWoodblockClap === 'function') {
                        playWoodblockClap();
                    }
                }
            }
        } else {
            // Blue dot is not in any cloud - reset cloud time
            blueCloudTime = 0;
        }
        
        // Check green dots
        for (let j = 0; j < greenDotStates.length; j++) {
            const greenDx = greenDotStates[j].x - cloud.x;
            const greenDy = greenDotStates[j].y - cloud.y;
            const greenDistance = Math.sqrt(greenDx * greenDx + greenDy * greenDy);
            if (greenDistance < cloudRadius) {
                greenInCloud[j] = true; // Green dot is in a cloud
                
                // Only apply momentum change when first entering cloud (not every frame)
                if (!greenDots[j].wasInCloud) {
                    // 1 in 10 chance to double momentum, otherwise halve it
                    if (Math.random() < 0.1) {
                        greenDotStates[j].vx *= 2.0;
                        greenDotStates[j].vy *= 2.0;
                    } else {
                        greenDotStates[j].vx *= 0.5;
                        greenDotStates[j].vy *= 0.5;
                    }
                    
                    // Ensure minimum velocity of 10px/s when entering
                    const greenSpeed = Math.sqrt(greenDotStates[j].vx * greenDotStates[j].vx + greenDotStates[j].vy * greenDotStates[j].vy);
                    if (greenSpeed > 0 && greenSpeed < 10) {
                        const scale = 10 / greenSpeed;
                        greenDotStates[j].vx *= scale;
                        greenDotStates[j].vy *= scale;
                    }
                }
                
                // Track time green dot spends in cloud
                greenDots[j].cloudTime += deltaTime;
                
                // Activate antigravity if green dot has been in cloud for 10 seconds
                if (greenDots[j].cloudTime >= 10.0 && !greenDots[j].antigravityActive) {
                    greenDots[j].antigravityActive = true;
                    greenDots[j].antigravityTimeRemaining = 3.0; // 3 seconds
                    greenDots[j].cloudTime = 0; // Reset cloud time
                    
                    // Show "ANTIGRAVITY" text next to green dot (up to 2 times total)
                    if (antigravityTextCount < 2) {
                        antigravityTextCount++;
                        greenDots[j].antigravityTextTime = 1.5; // Show for 1 second, then fade over 0.5 seconds
                    }
                    
                    // Ensure green dot has at least 50px/s velocity when entering antigravity
                    const currentSpeed = Math.sqrt(greenDotStates[j].vx * greenDotStates[j].vx + greenDotStates[j].vy * greenDotStates[j].vy);
                    if (currentSpeed < 50) {
                        const randomSpeed = Math.random() * 200 + 50; // Random between 50 and 250 pixels/second
                        const randomAngle = Math.random() * Math.PI * 2; // Random direction
                        greenDots[j].vx = Math.cos(randomAngle) * randomSpeed;
                        greenDots[j].vy = Math.sin(randomAngle) * randomSpeed;
                        greenDotStates[j].vx = greenDots[j].vx;
                        greenDotStates[j].vy = greenDots[j].vy;
                    }
                    
                    // Create yellow crescent and two red dots at cloud position
                    const cloudIndex = clouds.findIndex(c => {
                        const dx = greenDotStates[j].x - c.x;
                        const dy = greenDotStates[j].y - c.y;
                        return Math.sqrt(dx * dx + dy * dy) < c.radius;
                    });
                    if (cloudIndex >= 0) {
                        const cloud = clouds[cloudIndex];
                        const newYellow = initializeYellowCrescent(cloud.x, cloud.y);
                        // Cap velocity at 45 px/s on creation
                        const speed = Math.sqrt(newYellow.vx * newYellow.vx + newYellow.vy * newYellow.vy);
                        if (speed > 45) {
                            const scale = 45 / speed;
                            newYellow.vx *= scale;
                            newYellow.vy *= scale;
                        }
                        yellowCrescents.push(newYellow);
                        
                        // Create two new red dots at cloud position
                        const redDot1 = initializeRedDot();
                        redDot1.x = cloud.x + (Math.random() - 0.5) * 20; // Slight offset
                        redDot1.y = cloud.y + (Math.random() - 0.5) * 20;
                        redDots.push(redDot1);
                        
                        const redDot2 = initializeRedDot();
                        redDot2.x = cloud.x + (Math.random() - 0.5) * 20; // Slight offset
                        redDot2.y = cloud.y + (Math.random() - 0.5) * 20;
                        redDots.push(redDot2);
                        
                        // Change cloud shape and acquire mass instead of removing
                        changeCloudShapeAndMass(cloud);
                        if (typeof playWoodblockClap === 'function') {
                            playWoodblockClap();
                        }
                    }
                }
            } else {
                // Green dot is not in any cloud - reset cloud time and wasInCloud flag
                greenDots[j].cloudTime = 0;
                greenDots[j].wasInCloud = false;
            }
        }
    }
    
    // Update wasInCloud flags for next frame (after processing all clouds)
    for (let j = 0; j < greenDots.length; j++) {
        greenDots[j].wasInCloud = greenInCloud[j];
    }
    
    // Check for earth collisions with all objects
    if (earthState && earth) {
        const earthRadius = earth.radius;
        
        // Earth with red dots
        for (let i = 0; i < redDotStates.length; i++) {
            if (checkDotCollision(earthState, redDotStates[i], earth.mass, redDots[i].mass, earthRadius, CONFIG.collisionRadius)) {
                // Play boing sound for earth collision
                if (typeof playBoing === 'function') {
                    playBoing();
                }
            }
        }
        
        // Earth with blue dot
        if (checkDotCollision(earthState, blueDotState, earth.mass, CONFIG.blueMass, earthRadius, CONFIG.collisionRadius)) {
            // Play boing sound for earth collision
            if (typeof playBoing === 'function') {
                playBoing();
            }
            
            // Apply speed limit after collision
            reduceVelocityIfTooFast(earthState);
            reduceVelocityIfTooFast(blueDotState);
            
            // Ensure minimum velocity to prevent sticking (similar to cloud logic)
            const earthSpeed = Math.sqrt(earthState.vx * earthState.vx + earthState.vy * earthState.vy);
            if (earthSpeed > 0 && earthSpeed < 0.5) {
                const scale = 0.5 / earthSpeed;
                earthState.vx *= scale;
                earthState.vy *= scale;
            }
            
            const blueSpeed = Math.sqrt(blueDotState.vx * blueDotState.vx + blueDotState.vy * blueDotState.vy);
            if (blueSpeed > 0 && blueSpeed < 0.5) {
                const scale = 0.5 / blueSpeed;
                blueDotState.vx *= scale;
                blueDotState.vy *= scale;
            }
        }
        
        // Earth with green dots
        for (let i = 0; i < greenDotStates.length; i++) {
            if (checkDotCollision(earthState, greenDotStates[i], earth.mass, greenMass, earthRadius, CONFIG.collisionRadius)) {
                // Play boing sound for earth collision
                if (typeof playBoing === 'function') {
                    playBoing();
                }
                
                // Apply speed limit after collision
                reduceVelocityIfTooFast(earthState);
                reduceVelocityIfTooFast(greenDotStates[i]);
                
                // Ensure minimum velocity to prevent sticking (similar to cloud logic)
                const earthSpeed = Math.sqrt(earthState.vx * earthState.vx + earthState.vy * earthState.vy);
                if (earthSpeed > 0 && earthSpeed < 0.5) {
                    const scale = 0.5 / earthSpeed;
                    earthState.vx *= scale;
                    earthState.vy *= scale;
                }
                
                const greenSpeed = Math.sqrt(greenDotStates[i].vx * greenDotStates[i].vx + greenDotStates[i].vy * greenDotStates[i].vy);
                if (greenSpeed > 0 && greenSpeed < 0.5) {
                    const scale = 0.5 / greenSpeed;
                    greenDotStates[i].vx *= scale;
                    greenDotStates[i].vy *= scale;
                }
            }
        }
        
        // Earth with yellow crescents
        for (let i = 0; i < yellowCrescentStates.length; i++) {
            if (checkDotCollision(earthState, yellowCrescentStates[i], earth.mass, yellowCrescents[i].mass, earthRadius, CONFIG.collisionRadius)) {
                // Play boing sound for earth collision
                if (typeof playBoing === 'function') {
                    playBoing();
                }
            }
        }
        
        // Earth with orange crescents
        for (let i = 0; i < orangeCrescentStates.length; i++) {
            if (checkDotCollision(earthState, orangeCrescentStates[i], earth.mass, orangeCrescents[i].mass, earthRadius, CONFIG.collisionRadius)) {
                // Play boing sound for earth collision
                if (typeof playBoing === 'function') {
                    playBoing();
                }
            }
        }
    }
    
    // Check for collisions between all pairs of dots (with mass-based physics)
    // Track red dots that need to be split
    const redDotsToSplitCollision = [];
    // Track mini-red pairs that should merge into a regular red (0.05 chance)
    const miniRedPairsToMerge = [];
    // Track mini-red pairs that should create one mini-red and an orange crescent (1 in 80 chance)
    const miniRedPairsToCreateOrangeCrescent = [];
    
    // Red dots with each other (using individual masses and radii)
    // Note: Red-red collisions do NOT count toward splitting
    for (let i = 0; i < redDotStates.length; i++) {
        for (let j = i + 1; j < redDotStates.length; j++) {
            if (checkDotCollision(redDotStates[i], redDotStates[j], redDots[i].mass, redDots[j].mass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
                // Play guitar D pluck sound for red-red collision
                if (typeof playGuitarDPluck === 'function') {
                    playGuitarDPluck();
                }
                
                // Apply speed limit after collision
                reduceVelocityIfTooFast(redDotStates[i]);
                reduceVelocityIfTooFast(redDotStates[j]);
                
                // Check if both are mini-reds (mini-reds have radius = CONFIG.dotRadius / 4)
                const miniRadius = CONFIG.dotRadius / 4;
                if (redDots[i].radius === miniRadius && redDots[j].radius === miniRadius) {
                    const randomValue = Math.random();
                    // 1 in 80 chance (1.25%) to create one mini-red and an orange crescent
                    if (randomValue < 0.0125) {
                        miniRedPairsToCreateOrangeCrescent.push({ i: i, j: j });
                    } else if (randomValue < 0.0625) {
                        // 0.05 chance (5%) to merge into a regular red (only if not creating orange crescent)
                        miniRedPairsToMerge.push({ i: i, j: j });
                    }
                }
            }
        }
    }
    
    // Red dots with blue dot (using individual masses and radii)
    // These collisions count toward splitting
    for (let i = 0; i < redDotStates.length; i++) {
        if (checkDotCollision(redDotStates[i], blueDotState, redDots[i].mass, CONFIG.blueMass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
            // Play piano C# sound for blue-red collision
            if (typeof playPianoCSharp === 'function') {
                playPianoCSharp();
            }
            
            // Apply speed limit after collision
            reduceVelocityIfTooFast(redDotStates[i]);
            reduceVelocityIfTooFast(blueDotState);
            
            const totalCollisions = redDots[i].blueCollisionCount + redDots[i].greenCollisionCount;
            redDots[i].blueCollisionCount++;
            
            // Check if should split: 20 total collisions, then 1 in 5 chance on next collision
            if (totalCollisions >= 20 && Math.random() < 0.2) {
                redDotsToSplitCollision.push(i);
            }
        }
    }
    
    // Red dots with green dots (using individual masses and radii)
    // These collisions count toward splitting
    for (let i = 0; i < redDotStates.length; i++) {
        for (let j = 0; j < greenDotStates.length; j++) {
            if (checkDotCollision(redDotStates[i], greenDotStates[j], redDots[i].mass, greenMass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
                // Play violin pizzicato high E sound for red-green collision
                if (typeof playViolinPizzicatoHighE === 'function') {
                    playViolinPizzicatoHighE();
                }
                
                // Apply speed limit after collision
                reduceVelocityIfTooFast(redDotStates[i]);
                reduceVelocityIfTooFast(greenDotStates[j]);
                
                const totalCollisions = redDots[i].blueCollisionCount + redDots[i].greenCollisionCount;
                redDots[i].greenCollisionCount++;
                
                // Check if should split: 20 total collisions, then 1 in 5 chance on next collision
                if (totalCollisions >= 20 && Math.random() < 0.2) {
                    redDotsToSplitCollision.push(i);
                }
            }
        }
    }
    
    // Blue with green dots
    for (let i = 0; i < greenDotStates.length; i++) {
        if (checkDotCollision(blueDotState, greenDotStates[i], CONFIG.blueMass, greenMass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
            // Play organ F2 sound for blue-green collision
            if (typeof playOrganF2 === 'function') {
                playOrganF2();
            }
            
            // Apply speed limit after collision
            reduceVelocityIfTooFast(blueDotState);
            reduceVelocityIfTooFast(greenDotStates[i]);
            
            // Apply random 0-0.5 multiplier to blue's y velocity
            const randomMultiplier = Math.random() * 0.5; // Random value between 0 and 0.5
            blueDotState.vy *= randomMultiplier;
            
            blueGreenCollisionCount++;
            blueGreenAntigravityCount++;
            greenDots[i].blueCollisionCount++;
            
            // Generate second cloud after 10 blue-green collisions (only if less than 2 clouds exist)
            if (blueGreenCollisionCount >= 10 && clouds.length < 2) {
                clouds.push(initializeCloud());
                blueGreenCollisionCount = 0; // Reset counter after generating
            }
            
            // Activate blue antigravity after 75 blue-green collisions (3 seconds)
            if (blueGreenAntigravityCount >= 75 && !blueAntigravityActive) {
                blueAntigravityActive = true;
                blueAntigravityTimeRemaining = 3.0; // 3 seconds
                blueGreenAntigravityCount = 0; // Reset counter
                
                // Show "ANTIGRAVITY" text if this is the first time
                if (!antigravityTextShown) {
                    antigravityTextShown = true;
                    antigravityTextTime = 1.5; // Show for 1 second, then fade over 0.5 seconds
                }
                
                // Ensure blue dot has at least 50px/s velocity when entering antigravity
                const currentSpeed = Math.sqrt(blueDotState.vx * blueDotState.vx + blueDotState.vy * blueDotState.vy);
                if (currentSpeed < 50) {
                    // If speed is too low, give it a random velocity of at least 50px/s
                    const randomSpeed = Math.random() * 200 + 50; // Random between 50 and 250 pixels/second
                    const randomAngle = Math.random() * Math.PI * 2; // Random direction
                    blueVx = Math.cos(randomAngle) * randomSpeed;
                    blueVy = Math.sin(randomAngle) * randomSpeed;
                    blueDotState.vx = blueVx;
                    blueDotState.vy = blueVy;
                }
            }
            
            // Activate green antigravity after 150 blue-green collisions (3 seconds)
            if (greenDots[i].blueCollisionCount >= 150 && !greenDots[i].antigravityActive) {
                greenDots[i].antigravityActive = true;
                greenDots[i].antigravityTimeRemaining = 3.0; // 3 seconds
                greenDots[i].blueCollisionCount = 0; // Reset counter
                
                // Ensure green dot has at least 50px/s velocity when entering antigravity
                const currentSpeed = Math.sqrt(greenDotStates[i].vx * greenDotStates[i].vx + greenDotStates[i].vy * greenDotStates[i].vy);
                if (currentSpeed < 50) {
                    // If speed is too low, give it a random velocity of at least 50px/s
                    const randomSpeed = Math.random() * 200 + 50; // Random between 50 and 250 pixels/second
                    const randomAngle = Math.random() * Math.PI * 2; // Random direction
                    greenDots[i].vx = Math.cos(randomAngle) * randomSpeed;
                    greenDots[i].vy = Math.sin(randomAngle) * randomSpeed;
                    greenDotStates[i].vx = greenDots[i].vx;
                    greenDotStates[i].vy = greenDots[i].vy;
                }
            }
        }
    }
    
    // Green dots with each other
    for (let i = 0; i < greenDotStates.length; i++) {
        for (let j = i + 1; j < greenDotStates.length; j++) {
            if (checkDotCollision(greenDotStates[i], greenDotStates[j], greenMass, greenMass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
                // Play harmonica Eb3 sound for green-green collision
                if (typeof playHarmonicaEb3 === 'function') {
                    playHarmonicaEb3();
                }
                
                // Apply speed limit after collision
                reduceVelocityIfTooFast(greenDotStates[i]);
                reduceVelocityIfTooFast(greenDotStates[j]);
                
                // Increment collision counters for both green dots
                greenDots[i].greenCollisionCount++;
                greenDots[j].greenCollisionCount++;
                
                // Activate antigravity for first green dot after 150 green-green collisions (3 seconds)
                if (greenDots[i].greenCollisionCount >= 150 && !greenDots[i].antigravityActive) {
                    greenDots[i].antigravityActive = true;
                    greenDots[i].antigravityTimeRemaining = 3.0; // 3 seconds
                    greenDots[i].greenCollisionCount = 0; // Reset counter
                    
                    // Show "ANTIGRAVITY" text next to green dot (up to 2 times total)
                    if (antigravityTextCount < 2) {
                        antigravityTextCount++;
                        greenDots[j].antigravityTextTime = 1.5; // Show for 1 second, then fade over 0.5 seconds
                    }
                    
                    // Ensure green dot has at least 50px/s velocity when entering antigravity
                    const currentSpeed = Math.sqrt(greenDotStates[i].vx * greenDotStates[i].vx + greenDotStates[i].vy * greenDotStates[i].vy);
                    if (currentSpeed < 50) {
                        // If speed is too low, give it a random velocity of at least 50px/s
                        const randomSpeed = Math.random() * 200 + 50; // Random between 50 and 250 pixels/second
                        const randomAngle = Math.random() * Math.PI * 2; // Random direction
                        greenDots[i].vx = Math.cos(randomAngle) * randomSpeed;
                        greenDots[i].vy = Math.sin(randomAngle) * randomSpeed;
                        greenDotStates[i].vx = greenDots[i].vx;
                        greenDotStates[i].vy = greenDots[i].vy;
                    }
                }
                
                // Activate antigravity for second green dot after 150 green-green collisions (3 seconds)
                if (greenDots[j].greenCollisionCount >= 150 && !greenDots[j].antigravityActive) {
                    greenDots[j].antigravityActive = true;
                    greenDots[j].antigravityTimeRemaining = 3.0; // 3 seconds
                    greenDots[j].greenCollisionCount = 0; // Reset counter
                    
                    // Ensure green dot has at least 50px/s velocity when entering antigravity
                    const currentSpeed = Math.sqrt(greenDotStates[j].vx * greenDotStates[j].vx + greenDotStates[j].vy * greenDotStates[j].vy);
                    if (currentSpeed < 50) {
                        // If speed is too low, give it a random velocity of at least 50px/s
                        const randomSpeed = Math.random() * 200 + 50; // Random between 50 and 250 pixels/second
                        const randomAngle = Math.random() * Math.PI * 2; // Random direction
                        greenDots[j].vx = Math.cos(randomAngle) * randomSpeed;
                        greenDots[j].vy = Math.sin(randomAngle) * randomSpeed;
                        greenDotStates[j].vx = greenDots[j].vx;
                        greenDotStates[j].vy = greenDots[j].vy;
                    }
                }
            }
        }
    }
    
    // Yellow crescents with red dots
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        for (let j = 0; j < redDotStates.length; j++) {
            if (checkDotCollision(yellowCrescentStates[i], redDotStates[j], yellowCrescents[i].mass, redDots[j].mass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
                // Play tomtom bump sound for yellow crescent collision
                if (typeof playTomtomBump === 'function') {
                    playTomtomBump();
                }
                
                // Apply speed limit after collision
                reduceVelocityIfTooFast(yellowCrescentStates[i]);
                reduceVelocityIfTooFast(redDotStates[j]);
            }
        }
    }
    
    // Yellow crescents with blue dot
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        if (checkDotCollision(yellowCrescentStates[i], blueDotState, yellowCrescents[i].mass, CONFIG.blueMass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
            // Play tomtom bump sound for yellow crescent collision
            if (typeof playTomtomBump === 'function') {
                playTomtomBump();
            }
            
            // Apply speed limit after collision
            reduceVelocityIfTooFast(yellowCrescentStates[i]);
            reduceVelocityIfTooFast(blueDotState);
        }
    }
    
    // Yellow crescents with green dots
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        for (let j = 0; j < greenDotStates.length; j++) {
            if (checkDotCollision(yellowCrescentStates[i], greenDotStates[j], yellowCrescents[i].mass, greenMass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
                // Play tomtom bump sound for yellow crescent collision
                if (typeof playTomtomBump === 'function') {
                    playTomtomBump();
                }
                
                // Apply speed limit after collision
                reduceVelocityIfTooFast(yellowCrescentStates[i]);
                reduceVelocityIfTooFast(greenDotStates[j]);
            }
        }
    }
    
    // Yellow crescents with each other
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        for (let j = i + 1; j < yellowCrescentStates.length; j++) {
            if (checkDotCollision(yellowCrescentStates[i], yellowCrescentStates[j], yellowCrescents[i].mass, yellowCrescents[j].mass, CONFIG.collisionRadius, CONFIG.collisionRadius)) {
                // Play tomtom bump sound for yellow crescent collision
                if (typeof playTomtomBump === 'function') {
                    playTomtomBump();
                }
                
                // Apply speed limit after collision
                reduceVelocityIfTooFast(yellowCrescentStates[i]);
                reduceVelocityIfTooFast(yellowCrescentStates[j]);
            }
        }
    }
    
    // Update redDots array with final positions/velocities from all collisions
    for (let i = 0; i < redDotStates.length; i++) {
        redDots[i].x = redDotStates[i].x;
        redDots[i].y = redDotStates[i].y;
        redDots[i].vx = redDotStates[i].vx;
        redDots[i].vy = redDotStates[i].vy;
    }
    
    blueDotX = blueDotState.x;
    blueDotY = blueDotState.y;
    blueVx = blueDotState.vx;
    blueVy = blueDotState.vy;
    
    // Update greenDots array with final positions/velocities from all collisions
    for (let i = 0; i < greenDotStates.length; i++) {
        greenDots[i].x = greenDotStates[i].x;
        greenDots[i].y = greenDotStates[i].y;
        greenDots[i].vx = greenDotStates[i].vx;
        greenDots[i].vy = greenDotStates[i].vy;
    }
    
    // Update yellowCrescents array with final positions/velocities
    for (let i = 0; i < yellowCrescentStates.length; i++) {
        yellowCrescents[i].x = yellowCrescentStates[i].x;
        yellowCrescents[i].y = yellowCrescentStates[i].y;
        yellowCrescents[i].vx = yellowCrescentStates[i].vx;
        yellowCrescents[i].vy = yellowCrescentStates[i].vy;
        
        // Cap velocity at 45 px/s on creation (check if this is a newly created yellow crescent)
        // Newly created yellow crescents have fadeInTime === 0 or very small
        if (yellowCrescents[i].fadeInTime !== undefined && yellowCrescents[i].fadeInTime < 0.2) {
            const speed = Math.sqrt(yellowCrescents[i].vx * yellowCrescents[i].vx + yellowCrescents[i].vy * yellowCrescents[i].vy);
            if (speed > 45) {
                const scale = 45 / speed;
                yellowCrescents[i].vx *= scale;
                yellowCrescents[i].vy *= scale;
                // Also update the state object to keep them in sync
                yellowCrescentStates[i].vx = yellowCrescents[i].vx;
                yellowCrescentStates[i].vy = yellowCrescents[i].vy;
            }
        }
    }
    
    // Update orangeCrescents array with final positions/velocities
    for (let i = 0; i < orangeCrescentStates.length; i++) {
        orangeCrescents[i].x = orangeCrescentStates[i].x;
        orangeCrescents[i].y = orangeCrescentStates[i].y;
        orangeCrescents[i].vx = orangeCrescentStates[i].vx;
        orangeCrescents[i].vy = orangeCrescentStates[i].vy;
    }
    
    // Check for cloud-cloud collisions (clouds don't move, so check if they overlap)
    const cloudsToRemove = [];
    for (let i = 0; i < clouds.length; i++) {
        for (let j = i + 1; j < clouds.length; j++) {
            const dx = clouds[j].x - clouds[i].x;
            const dy = clouds[j].y - clouds[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = clouds[i].radius + clouds[j].radius; // Sum of both cloud radii
            
            // If clouds overlap, mark one for removal
            if (distance < minDistance) {
                // Remove the second cloud (index j)
                cloudsToRemove.push(j);
            }
        }
    }
    
    // Remove clouds that collided (process in reverse order to avoid index issues)
    const uniqueCloudsToRemove = [...new Set(cloudsToRemove)].sort((a, b) => b - a);
    for (let i = 0; i < uniqueCloudsToRemove.length; i++) {
        const index = uniqueCloudsToRemove[i];
        if (index >= 0 && index < clouds.length) {
            clouds.splice(index, 1);
            if (typeof playWoodblockClap === 'function') {
                playWoodblockClap();
            }
        }
    }
    
    // Split red dots that have reached 20 collisions and passed the 1 in 5 chance (process in reverse order to avoid index issues)
    const uniqueRedDotsToSplitCollision = [...new Set(redDotsToSplitCollision)].sort((a, b) => b - a);
    for (let i = 0; i < uniqueRedDotsToSplitCollision.length; i++) {
        const index = uniqueRedDotsToSplitCollision[i];
        if (index >= 0 && index < redDots.length) {
            const totalCollisions = redDots[index].blueCollisionCount + redDots[index].greenCollisionCount;
            if (totalCollisions >= 20) {
                splitRedDot(index);
                // After splitting, indices may have shifted, so we need to recalculate removal indices
                // For now, we'll handle removals by checking positions directly after splitting
            }
        }
    }
    
    // Process mini-red pairs that create orange crescents (process in reverse order of larger index to avoid index issues)
    // Sort pairs by larger index first (descending)
    miniRedPairsToCreateOrangeCrescent.sort((a, b) => Math.max(b.i, b.j) - Math.max(a.i, a.j));
    for (let i = 0; i < miniRedPairsToCreateOrangeCrescent.length; i++) {
        const pair = miniRedPairsToCreateOrangeCrescent[i];
        const idx1 = pair.i;
        const idx2 = pair.j;
        
        // Ensure indices are still valid and both are still mini-reds
        if (idx1 >= 0 && idx1 < redDots.length && idx2 >= 0 && idx2 < redDots.length && idx1 !== idx2) {
            const miniRadius = CONFIG.dotRadius / 4;
            if (redDots[idx1].radius === miniRadius && redDots[idx2].radius === miniRadius) {
                // Calculate midpoint position and average velocity
                const midX = (redDots[idx1].x + redDots[idx2].x) / 2;
                const midY = (redDots[idx1].y + redDots[idx2].y) / 2;
                const avgVx = (redDots[idx1].vx + redDots[idx2].vx) / 2;
                const avgVy = (redDots[idx1].vy + redDots[idx2].vy) / 2;
                
                // Remove both mini-reds (remove larger index first)
                const largerIdx = Math.max(idx1, idx2);
                const smallerIdx = Math.min(idx1, idx2);
                redDots.splice(largerIdx, 1);
                redDots.splice(smallerIdx, 1);
                
                // Create one mini-red at midpoint
                const newMiniRed = {
                    x: midX,
                    y: midY,
                    vx: avgVx,
                    vy: avgVy,
                    mass: CONFIG.redMass * 0.5,
                    radius: miniRadius,
                    blueCollisionCount: 0,
                    greenCollisionCount: 0,
                    trail: [],
                    fadeInTime: 0
                };
                redDots.push(newMiniRed);
                
                // Create orange crescent at midpoint
                const orangeCrescent = initializeOrangeCrescent(midX, midY, avgVx, avgVy);
                orangeCrescents.push(orangeCrescent);
                
                // Play flute D6 sound when orange crescent is created
                if (typeof playFluteD6 === 'function') {
                    playFluteD6();
                }
            }
        }
    }
    
    // Merge mini-red pairs into regular reds (process in reverse order of larger index to avoid index issues)
    // Sort pairs by larger index first (descending)
    miniRedPairsToMerge.sort((a, b) => Math.max(b.i, b.j) - Math.max(a.i, a.j));
    for (let i = 0; i < miniRedPairsToMerge.length; i++) {
        const pair = miniRedPairsToMerge[i];
        const idx1 = pair.i;
        const idx2 = pair.j;
        
        // Ensure indices are still valid and both are still mini-reds
        if (idx1 >= 0 && idx1 < redDots.length && idx2 >= 0 && idx2 < redDots.length && idx1 !== idx2) {
            const miniRadius = CONFIG.dotRadius / 4;
            if (redDots[idx1].radius === miniRadius && redDots[idx2].radius === miniRadius) {
                // Calculate midpoint position and average velocity
                const midX = (redDots[idx1].x + redDots[idx2].x) / 2;
                const midY = (redDots[idx1].y + redDots[idx2].y) / 2;
                const avgVx = (redDots[idx1].vx + redDots[idx2].vx) / 2;
                const avgVy = (redDots[idx1].vy + redDots[idx2].vy) / 2;
                
                // Remove both mini-reds (remove larger index first)
                const largerIdx = Math.max(idx1, idx2);
                const smallerIdx = Math.min(idx1, idx2);
                redDots.splice(largerIdx, 1);
                redDots.splice(smallerIdx, 1);
                
                // Create new regular red dot at midpoint
                const newRedDot = {
                    x: midX,
                    y: midY,
                    vx: avgVx,
                    vy: avgVy,
                    mass: CONFIG.redMass,
                    radius: CONFIG.dotRadius / 2, // Match regular red dot size
                    blueCollisionCount: 0,
                    greenCollisionCount: 0,
                    trail: [],
                    fadeInTime: 0, // Time since creation (for fade-in effect, 0 to 1.0 seconds)
                    cloudFadeAmount: 1.0 // Fade amount when in clouds (1.0 = fully visible, 0.0 = deleted)
                };
                redDots.push(newRedDot);
            }
        }
    }
    
    // Check for red dots that exited clouds (have fade < 1.0 but are not currently in a cloud)
    // If they have fade > 0, split them into two mini-reds
    for (let i = 0; i < redDots.length; i++) {
        const miniRadius = CONFIG.dotRadius / 4;
        // Skip mini-reds
        if (redDots[i].radius === miniRadius) {
            continue;
        }
        
        // Initialize cloudFadeAmount if not present
        if (redDots[i].cloudFadeAmount === undefined) {
            redDots[i].cloudFadeAmount = 1.0;
        }
        
        // Check if this red dot has faded (cloudFadeAmount < 1.0) but is not currently in a cloud
        // This means it exited a cloud with fade remaining
        if (redDots[i].cloudFadeAmount < 1.0 && !redDotsInCloud.has(i)) {
            // Red dot exited cloud with fade remaining - split into two mini-reds
            if (redDots[i].cloudFadeAmount > 0 && !redDotsToSplit.includes(i)) {
                redDotsToSplit.push(i);
            }
        }
        
        // Reset fade amount if not in cloud and hasn't been marked for splitting
        // (so it can fade again if it re-enters)
        if (!redDotsInCloud.has(i) && !redDotsToSplit.includes(i) && redDots[i].cloudFadeAmount < 1.0) {
            redDots[i].cloudFadeAmount = 1.0;
        }
    }
    
    // Split red dots that exited clouds with fade > 0 (process in reverse order to avoid index issues)
    const uniqueRedDotsToSplit = [...new Set(redDotsToSplit)].sort((a, b) => b - a);
    for (let i = 0; i < uniqueRedDotsToSplit.length; i++) {
        const index = uniqueRedDotsToSplit[i];
        if (index >= 0 && index < redDots.length) {
            const miniRadius = CONFIG.dotRadius / 4;
            if (redDots[index].radius !== miniRadius && redDots[index].cloudFadeAmount > 0) {
                splitRedDot(index);
            }
        }
    }
    
    // Remove red dots that faded to 0 in clouds (process in reverse order to avoid index issues)
    const uniqueRedDotsToRemove = [...new Set(redDotsToRemove)].sort((a, b) => b - a);
    for (let i = 0; i < uniqueRedDotsToRemove.length; i++) {
        const index = uniqueRedDotsToRemove[i];
        if (index >= 0 && index < redDots.length) {
            const miniRadius = CONFIG.dotRadius / 4;
            // Only remove regular reds that have faded to 0
            if (redDots[index].radius !== miniRadius && redDots[index].cloudFadeAmount <= 0) {
                redDots.splice(index, 1);
            }
        }
    }
    
    // If there's only one red dot left, convert a grey cloud into two red dots
    if (redDots.length === 1 && clouds.length > 0) {
        // Remove one cloud
        clouds.splice(0, 1); // Remove the first cloud
        if (typeof playWoodblockClap === 'function') {
            playWoodblockClap();
        }
        
        // Create two new red dots at random positions
        redDots.push(initializeRedDot());
        redDots.push(initializeRedDot());
    }
    
    // Auto-reset if there are 1000 or more red dots (including mini-reds)
    if (redDots.length >= 1000) {
        resetSimulation();
        return; // Exit early since we reset
    }
    
    // Update antigravity timers
    if (blueAntigravityActive) {
        blueAntigravityTimeRemaining -= deltaTime;
        if (blueAntigravityTimeRemaining <= 0) {
            blueAntigravityActive = false;
            blueAntigravityTimeRemaining = 0;
        } else {
            // Play windchime sound periodically while antigravity is active
            if (currentTime - lastBlueWindchimeTime >= windchimeInterval) {
                if (typeof playWindchime === 'function') {
                    playWindchime();
                }
                lastBlueWindchimeTime = currentTime;
            }
        }
    }
    
    // Update green dots antigravity timers
    for (let i = 0; i < greenDots.length; i++) {
        if (greenDots[i].antigravityActive) {
            greenDots[i].antigravityTimeRemaining -= deltaTime;
            if (greenDots[i].antigravityTimeRemaining <= 0) {
                greenDots[i].antigravityActive = false;
                greenDots[i].antigravityTimeRemaining = 0;
            } else {
                // Play windchime sound periodically while antigravity is active
                if (currentTime - greenDots[i].lastWindchimeTime >= windchimeInterval) {
                    if (typeof playWindchime === 'function') {
                        playWindchime();
                    }
                    greenDots[i].lastWindchimeTime = currentTime;
                }
            }
        }
    }
    
    // Update yellow crescents: decay and dissolve
    const yellowCrescentsToTransform = [];
    for (let i = yellowCrescents.length - 1; i >= 0; i--) {
        const yellow = yellowCrescents[i];
        
        // Update fade-in time
        if (yellow.fadeInTime !== undefined) {
            yellow.fadeInTime += deltaTime;
            if (yellow.fadeInTime > 1.0) {
                yellow.fadeInTime = 1.0; // Clamp at max
            }
        }
        
        // Update decay time (radioactive decay over 10 seconds)
        if (yellow.decayTime !== undefined) {
            yellow.decayTime += deltaTime;
            
            // If decay completes and not yet dissolving, start dissolve
            if (yellow.decayTime >= 10.0 && (yellow.dissolveTime === undefined || yellow.dissolveTime === -1)) {
                yellow.dissolveTime = 0;
                // Randomly choose transform type: 10% blue, 90% red
                yellow.transformType = Math.random() < 0.1 ? 'blue' : 'red';
            }
            
            // Update dissolve time if dissolving
            if (yellow.dissolveTime !== undefined && yellow.dissolveTime >= 0 && yellow.dissolveTime < 0.5) {
                yellow.dissolveTime += deltaTime;
                
                // If dissolve completes, mark for transformation
                if (yellow.dissolveTime >= 0.5) {
                    yellowCrescentsToTransform.push(i);
                }
            }
        }
    }
    
    // Transform yellow crescents that completed dissolve
    for (let i = 0; i < yellowCrescentsToTransform.length; i++) {
        const index = yellowCrescentsToTransform[i];
        if (index >= 0 && index < yellowCrescents.length) {
            const yellow = yellowCrescents[index];
            
            if (yellow.transformType === 'blue') {
                // Transform to blue dot - update both global state and state object
                blueDotX = yellow.x;
                blueDotY = yellow.y;
                blueVx = yellow.vx;
                blueVy = yellow.vy;
                blueDotFadeInTime = 0; // Reset fade-in for new blue dot
                // Also update blueDotState for this frame
                blueDotState.x = yellow.x;
                blueDotState.y = yellow.y;
                blueDotState.vx = yellow.vx;
                blueDotState.vy = yellow.vy;
            } else if (yellow.transformType === 'red') {
                // Transform to red dot
                const newRed = initializeRedDot();
                newRed.x = yellow.x;
                newRed.y = yellow.y;
                newRed.vx = yellow.vx;
                newRed.vy = yellow.vy;
                redDots.push(newRed);
            }
            
            // Remove the yellow crescent
            yellowCrescents.splice(index, 1);
        }
    }
    
    // Update fade-in times for all objects
    const fadeInDuration = 1.0; // 1.0 seconds to fully fade in (2x the previous duration)
    
    // Update fade-in times and decay for red dots
    const redDotsToDecay = [];
    for (let i = 0; i < redDots.length; i++) {
        const red = redDots[i];
        
        // Update fade-in time
        if (red.fadeInTime !== undefined) {
            red.fadeInTime += deltaTime;
            if (red.fadeInTime > fadeInDuration) {
                red.fadeInTime = fadeInDuration; // Clamp at max
            }
        }
        
        // Update decay time for regular red dots (exponential decay with average 10 seconds)
        const miniRadius = CONFIG.dotRadius / 4;
        if (red.radius !== miniRadius && red.decayTime !== undefined && red.decayTimeThreshold !== undefined) {
            red.decayTime += deltaTime;
            
            // If decay threshold reached, mark for decay to minired
            if (red.decayTime >= red.decayTimeThreshold) {
                redDotsToDecay.push(i);
            }
        }
        
        // Update decay time for mini-reds (half-life of 10 seconds)
        if (red.radius === miniRadius && red.decayTime !== undefined && red.decayTimeThreshold !== undefined) {
            red.decayTime += deltaTime;
            
            // If decay threshold reached, mark for decay
            if (red.decayTime >= red.decayTimeThreshold) {
                redDotsToDecay.push(i);
            }
        }
    }
    
    // Decay red dots to mini-reds (process in reverse order to avoid index issues)
    for (let i = redDotsToDecay.length - 1; i >= 0; i--) {
        const index = redDotsToDecay[i];
        if (index >= 0 && index < redDots.length) {
            const red = redDots[index];
            const miniRadius = CONFIG.dotRadius / 4;
            
            if (red.radius !== miniRadius) {
                // Regular red dot decays to mini-red
                const miniMass = CONFIG.redMass * 0.5;
                // Decay time for minireds: half-life of 10 seconds
                const miniredDecayTime = -10 * Math.log(Math.random()); // Exponential decay with half-life 10 seconds
                redDots[index] = {
                    x: red.x,
                    y: red.y,
                    vx: red.vx,
                    vy: red.vy,
                    mass: miniMass,
                    radius: miniRadius,
                    blueCollisionCount: red.blueCollisionCount,
                    greenCollisionCount: red.greenCollisionCount,
                    trail: [], // Mini-reds don't have trails
                    fadeInTime: 0, // Reset fade-in for new minired
                    decayTime: 0, // Time since creation (half-life decay, 0 to decayTimeThreshold)
                    decayTimeThreshold: miniredDecayTime // Random decay threshold (exponential distribution, half-life 10s)
                    // Note: mini-reds don't have cloudFadeAmount
                };
                
                // Play flute D6 sound when red decays to minired
                if (typeof playFluteD6 === 'function') {
                    playFluteD6();
                }
            } else {
                // Mini-red decays - 1 in 100 chance to transform into another object
                const randomValue = Math.random();
                if (randomValue < 0.01) {
                    // 1 in 100 chance: transform into another object
                    const objectType = Math.random();
                    const x = red.x;
                    const y = red.y;
                    const vx = red.vx;
                    const vy = red.vy;
                    
                    // Remove the mini-red
                    redDots.splice(index, 1);
                    
                    // Create new object based on random selection
                    if (objectType < 0.2) {
                        // 20% chance: red dot
                        const newRed = initializeRedDot();
                        newRed.x = x;
                        newRed.y = y;
                        newRed.vx = vx;
                        newRed.vy = vy;
                        redDots.push(newRed);
                    } else if (objectType < 0.4) {
                        // 20% chance: green dot
                        const newGreen = initializeGreenDot();
                        newGreen.x = x;
                        newGreen.y = y;
                        newGreen.vx = vx;
                        newGreen.vy = vy;
                        greenDots.push(newGreen);
                    } else if (objectType < 0.6) {
                        // 20% chance: yellow crescent
                        const newYellow = initializeYellowCrescent(x, y);
                        newYellow.vx = vx;
                        newYellow.vy = vy;
                        yellowCrescents.push(newYellow);
                    } else if (objectType < 0.8) {
                        // 20% chance: orange crescent
                        const newOrange = initializeOrangeCrescent(x, y, vx, vy);
                        orangeCrescents.push(newOrange);
                    } else {
                        // 20% chance: cloud
                        const newCloud = initializeCloud();
                        newCloud.x = x;
                        newCloud.y = y;
                        clouds.push(newCloud);
                    }
                } else {
                    // 99 in 100 chance: just remove the mini-red
                    redDots.splice(index, 1);
                }
            }
        }
    }
    
    if (blueDotFadeInTime !== undefined) {
        blueDotFadeInTime += deltaTime;
        if (blueDotFadeInTime > fadeInDuration) {
            blueDotFadeInTime = fadeInDuration; // Clamp at max
        }
    }
    
    for (let i = 0; i < greenDots.length; i++) {
        if (greenDots[i].fadeInTime !== undefined) {
            greenDots[i].fadeInTime += deltaTime;
            if (greenDots[i].fadeInTime > fadeInDuration) {
                greenDots[i].fadeInTime = fadeInDuration; // Clamp at max
            }
        }
    }
    
    for (let i = 0; i < yellowCrescents.length; i++) {
        if (yellowCrescents[i].fadeInTime !== undefined) {
            yellowCrescents[i].fadeInTime += deltaTime;
            if (yellowCrescents[i].fadeInTime > fadeInDuration) {
                yellowCrescents[i].fadeInTime = fadeInDuration; // Clamp at max
            }
        }
    }
    
    // Update fade-in time for earth
    if (earth && earth.fadeInTime !== undefined) {
        earth.fadeInTime += deltaTime;
        if (earth.fadeInTime > fadeInDuration) {
            earth.fadeInTime = fadeInDuration; // Clamp at max
        }
    }
    
    // Update fade-in times and decay for orange crescents
    const orangeCrescentsToRemove = [];
    for (let i = orangeCrescents.length - 1; i >= 0; i--) {
        const orange = orangeCrescents[i];
        
        // Update fade-in time
        if (orange.fadeInTime !== undefined) {
            orange.fadeInTime += deltaTime;
            if (orange.fadeInTime > fadeInDuration) {
                orange.fadeInTime = fadeInDuration; // Clamp at max
            }
        }
        
        // Update decay time (half-life of 5 seconds)
        if (orange.decayTime !== undefined) {
            orange.decayTime += deltaTime;
            
            // If decay completes (5 seconds), start fade-out
            if (orange.decayTime >= 5.0 && (orange.fadeOutTime === undefined || orange.fadeOutTime === -1)) {
                orange.fadeOutTime = 1.0; // Fade out over 1 second
            }
        }
        
        // Update fade-out time if fading
        if (orange.fadeOutTime !== undefined && orange.fadeOutTime >= 0) {
            orange.fadeOutTime -= deltaTime;
            
            // If fade-out completes, mark for removal
            if (orange.fadeOutTime <= 0) {
                orangeCrescentsToRemove.push(i);
            }
        }
    }
    
    // Update comet fade-in times
    for (let i = 0; i < comets.length; i++) {
        if (comets[i].fadeInTime !== undefined) {
            comets[i].fadeInTime += deltaTime;
            if (comets[i].fadeInTime > fadeInDuration) {
                comets[i].fadeInTime = fadeInDuration; // Clamp at max
            }
        }
    }
    
    // Remove orange crescents that have completely faded out
    for (let i = 0; i < orangeCrescentsToRemove.length; i++) {
        const index = orangeCrescentsToRemove[i];
        if (index >= 0 && index < orangeCrescents.length) {
            orangeCrescents.splice(index, 1);
        }
    }
    
    // Update cloud fade-in and decay times
    const cloudsToRemoveDecay = [];
    for (let i = 0; i < clouds.length; i++) {
        if (clouds[i].fadeInTime !== undefined) {
            clouds[i].fadeInTime += deltaTime;
            if (clouds[i].fadeInTime > fadeInDuration) {
                clouds[i].fadeInTime = fadeInDuration; // Clamp at max
            }
        }
        
        // Update decay time and check for half-life (30 seconds)
        if (clouds[i].decayTime !== undefined) {
            clouds[i].decayTime += deltaTime;
            if (clouds[i].decayTime >= clouds[i].decayTimeThreshold) {
                // Cloud has reached its half-life - mark for removal
                cloudsToRemoveDecay.push(i);
            }
        }
    }
    
    // Remove clouds that have decayed (process in reverse order to avoid index issues)
    for (let i = cloudsToRemoveDecay.length - 1; i >= 0; i--) {
        const index = cloudsToRemoveDecay[i];
        if (index >= 0 && index < clouds.length) {
            clouds.splice(index, 1);
        }
    }
    
    // Add current positions to trails (skip mini-reds)
    for (let i = 0; i < redDots.length; i++) {
        const miniRadius = CONFIG.dotRadius / 4;
        // Skip mini-reds - they don't leave trails
        if (redDots[i].radius === miniRadius) {
            continue;
        }
        redDots[i].trail.push({ x: redDots[i].x, y: redDots[i].y });
        if (redDots[i].trail.length > trailLength) {
            redDots[i].trail.shift();
        }
    }
    
    blueTrail.push({ x: blueDotState.x, y: blueDotState.y });
    
    // Add current position to earth trail
    if (earth) {
        earthTrail.push({ x: earth.x, y: earth.y });
        if (earthTrail.length > trailLength) {
            earthTrail.shift();
        }
    }
    
    // Add current positions to green dot trails
    for (let i = 0; i < greenDots.length; i++) {
        greenDots[i].trail.push({ x: greenDots[i].x, y: greenDots[i].y });
        if (greenDots[i].trail.length > trailLength) {
            greenDots[i].trail.shift();
        }
    }
    
    // Limit trail lengths
    if (blueTrail.length > trailLength) {
        blueTrail.shift();
    }
    
    // Automatic title cycling
    const elapsedTime = (Date.now() - startTime) / 1000;
    if (!autoTitleCyclingStarted && elapsedTime >= 15.0) {
        autoTitleCyclingStarted = true;
        lastAutoTitleChangeTime = currentTime;
        updateTitle(true); // Start automatic cycling
    }
    if (autoTitleCyclingStarted && (currentTime - lastAutoTitleChangeTime) >= 10.0) {
        lastAutoTitleChangeTime = currentTime;
        updateTitle(true); // Continue automatic cycling
    }
    
    // Update background choral and pink noise
    if (typeof updateBackgroundChoral === 'function') {
        updateBackgroundChoral(deltaTime);
    }
    
    // Draw
    try {
        drawSquare(); // Draws black background and border
        drawStars(); // Draw stars on black background
    } catch (e) {
        console.error('Error drawing:', e);
    }
    
    // Draw all clouds (draw before objects so they appear behind)
    for (let i = 0; i < clouds.length; i++) {
        const cloudOpacity = clouds[i].fadeInTime !== undefined ? Math.min(clouds[i].fadeInTime / fadeInDuration, 1.0) : 1.0;
        drawCloud(clouds[i].x, clouds[i].y, clouds[i].radius, clouds[i].puffs, cloudOpacity);
    }
    
    // Draw all red dot trails (skip mini-reds)
    for (let i = 0; i < redDots.length; i++) {
        const miniRadius = CONFIG.dotRadius / 4;
        // Skip mini-reds - they don't leave trails
        if (redDots[i].radius === miniRadius) {
            continue;
        }
        drawTrail(redDots[i].trail, 'rgba(150, 150, 150, 0.4)');
    }
    
    drawTrail(blueTrail, 'rgba(52, 152, 219, 0.4)'); // blue dot trail (light blue, translucent)
    
    // Draw earth trail
    if (earth) {
        drawTrail(earthTrail, 'rgba(255, 255, 255, 0.6)'); // earth trail (milky white, translucent)
    }
    
    // Draw all green dot trails
    for (let i = 0; i < greenDots.length; i++) {
        drawTrail(greenDots[i].trail, 'rgba(46, 204, 113, 0.4)');
    }
    
    // Draw all red dots (using individual radii for mini-reds)
    for (let i = 0; i < redDots.length; i++) {
        const redOpacity = redDots[i].fadeInTime !== undefined ? Math.min(redDots[i].fadeInTime / fadeInDuration, 1.0) : 1.0;
        drawDot(redDots[i].x, redDots[i].y, redDots[i].radius, redOpacity);
    }
    
    const blueOpacity = blueDotFadeInTime !== undefined ? Math.min(blueDotFadeInTime / fadeInDuration, 1.0) : 1.0;
    // blueDotState is defined in physics section, but recreate here for drawing scope
    const blueDotStateForDrawing = { x: blueDotX, y: blueDotY, vx: blueVx, vy: blueVy };
    drawBlueDot(blueDotStateForDrawing.x, blueDotStateForDrawing.y, blueAntigravityActive, blueAntigravityTimeRemaining, blueOpacity);
    
    // Draw all green dots
    for (let i = 0; i < greenDots.length; i++) {
        const greenOpacity = greenDots[i].fadeInTime !== undefined ? Math.min(greenDots[i].fadeInTime / fadeInDuration, 1.0) : 1.0;
        drawGreenDot(greenDots[i].x, greenDots[i].y, greenDots[i].antigravityActive, greenDots[i].antigravityTimeRemaining, greenOpacity);
    }
    
    // Draw all yellow crescents (with dissolve transition if decaying)
    for (let i = 0; i < yellowCrescents.length; i++) {
        const yellow = yellowCrescents[i];
        const fadeInOpacity = yellow.fadeInTime !== undefined ? Math.min(yellow.fadeInTime / fadeInDuration, 1.0) : 1.0;
        
        // Check if dissolving
        if (yellow.dissolveTime !== undefined && yellow.dissolveTime >= 0 && yellow.dissolveTime < 0.5) {
            const dissolveProgress = yellow.dissolveTime / 0.5; // 0 to 1
            const yellowOpacity = fadeInOpacity * (1.0 - dissolveProgress); // Fade out
            const newObjectOpacity = fadeInOpacity * dissolveProgress; // Fade in
            
            // Draw yellow crescent fading out
            drawYellowCrescent(yellow.x, yellow.y, yellowOpacity);
            
            // Draw new object fading in
            if (yellow.transformType === 'blue') {
                drawBlueDot(yellow.x, yellow.y, false, 0, newObjectOpacity);
            } else if (yellow.transformType === 'red') {
                drawDot(yellow.x, yellow.y, CONFIG.dotRadius / 2, newObjectOpacity);
            }
        } else {
            // Normal drawing (not dissolving)
            drawYellowCrescent(yellow.x, yellow.y, fadeInOpacity);
        }
    }
    
    // Draw all orange crescents (with fade-out if decaying)
    for (let i = 0; i < orangeCrescents.length; i++) {
        const orange = orangeCrescents[i];
        const fadeInOpacity = orange.fadeInTime !== undefined ? Math.min(orange.fadeInTime / fadeInDuration, 1.0) : 1.0;
        
        // Calculate fade-out opacity if fading
        let fadeOutOpacity = 1.0;
        if (orange.fadeOutTime !== undefined && orange.fadeOutTime >= 0) {
            fadeOutOpacity = Math.max(0, orange.fadeOutTime / 1.0); // Fade from 1.0 to 0 over 1 second
        }
        
        // Combine fade-in and fade-out opacities
        const finalOpacity = fadeInOpacity * fadeOutOpacity;
        drawOrangeCrescent(orange.x, orange.y, finalOpacity);
    }
    
    // Draw earth (if it exists)
    if (earth) {
        const earthFadeInOpacity = earth.fadeInTime !== undefined ? Math.min(earth.fadeInTime / fadeInDuration, 1.0) : 1.0;
        drawEarth(earth.x, earth.y, earthFadeInOpacity);
    }
    
    // Draw all comets (head points toward nearest green star)
    for (let i = 0; i < comets.length; i++) {
        const cometOpacity = comets[i].fadeInTime !== undefined ? Math.min(comets[i].fadeInTime / fadeInDuration, 1.0) : 1.0;
        
        // Find nearest green star
        let nearestGreen = null;
        let minDistance = Infinity;
        for (let j = 0; j < greenDots.length; j++) {
            const dx = greenDots[j].x - comets[i].x;
            const dy = greenDots[j].y - comets[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestGreen = greenDots[j];
            }
        }
        
        // Calculate angle to nearest green star (or use velocity direction if no green stars)
        let angle;
        if (nearestGreen) {
            angle = Math.atan2(nearestGreen.y - comets[i].y, nearestGreen.x - comets[i].x);
        } else {
            // Fallback to velocity direction if no green stars exist
            angle = Math.atan2(comets[i].vy, comets[i].vx);
        }
        
        drawComet(comets[i].x, comets[i].y, angle, cometOpacity);
    }
    
    // Update and draw "ANTIGRAVITY" text if showing
    if (antigravityTextTime > 0) {
        antigravityTextTime -= deltaTime;
        
        // Calculate opacity: full opacity for first 1 second, then fade over 0.5 seconds
        let textOpacity = 1.0;
        if (antigravityTextTime < 0.5) {
            // Fade out over last 0.5 seconds
            textOpacity = antigravityTextTime / 0.5;
        }
        
        // Draw "ANTIGRAVITY" text in orange at center of canvas
        ctx.save();
        ctx.globalAlpha = textOpacity;
        ctx.fillStyle = '#ff8c00'; // Orange color
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ANTIGRAVITY', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    } else if (antigravityTextTime <= 0 && antigravityTextTime > -1) {
        // Text display finished, mark as done
        antigravityTextTime = -1;
    }
    
    requestAnimationFrame(animate);
}