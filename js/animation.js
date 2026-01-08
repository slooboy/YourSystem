// Animation loop

function animate() {
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
    
    // Get current time for windchime timing
    const currentTime = Date.now() / 1000;
    
    // Update background choral
    updateBackgroundChoral(deltaTime);
    
    // Update antigravity timers and play windchime sounds
    if (blueAntigravityActive) {
        blueAntigravityTimeRemaining -= deltaTime;
        if (blueAntigravityTimeRemaining <= 0) {
            blueAntigravityActive = false;
            blueAntigravityTimeRemaining = 0;
            lastBlueWindchimeTime = 0; // Reset windchime timer
        } else {
            // Play windchime sound periodically while antigravity is active
            if (currentTime - lastBlueWindchimeTime >= windchimeInterval) {
                playWindchime();
                lastBlueWindchimeTime = currentTime;
            }
        }
    } else {
        lastBlueWindchimeTime = 0; // Reset when not active
    }
    
    // Update green dot antigravity timers and play windchime sounds
    for (let i = 0; i < greenDots.length; i++) {
        if (greenDots[i].antigravityActive) {
            greenDots[i].antigravityTimeRemaining -= deltaTime;
            if (greenDots[i].antigravityTimeRemaining <= 0) {
                greenDots[i].antigravityActive = false;
                greenDots[i].antigravityTimeRemaining = 0;
                if (greenDots[i].lastWindchimeTime !== undefined) {
                    greenDots[i].lastWindchimeTime = 0; // Reset windchime timer
                }
            } else {
                // Play windchime sound periodically while antigravity is active
                if (!greenDots[i].lastWindchimeTime) {
                    greenDots[i].lastWindchimeTime = 0;
                }
                if (currentTime - greenDots[i].lastWindchimeTime >= windchimeInterval) {
                    playWindchime();
                    greenDots[i].lastWindchimeTime = currentTime;
                }
            }
        } else {
            if (greenDots[i].lastWindchimeTime !== undefined) {
                greenDots[i].lastWindchimeTime = 0; // Reset when not active
            }
        }
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create state objects for all dots (work with these throughout the frame)
    const redDotStates = redDots.map(dot => ({ x: dot.x, y: dot.y, vx: dot.vx, vy: dot.vy }));
    const blueDotState = { x: blueDotX, y: blueDotY, vx: blueVx, vy: blueVy };
    const greenDotStates = greenDots.map(dot => ({ x: dot.x, y: dot.y, vx: dot.vx, vy: dot.vy }));
    
    // Apply gravitational forces between all pairs of objects
    // Red dots with each other (using individual masses)
    for (let i = 0; i < redDotStates.length; i++) {
        for (let j = i + 1; j < redDotStates.length; j++) {
            applyGravitationalForce(redDotStates[i], redDotStates[j], redDots[i].mass, redDots[j].mass, deltaTime);
        }
    }
    
    // Red dots with blue dot (using individual masses)
    for (let i = 0; i < redDotStates.length; i++) {
        applyGravitationalForce(redDotStates[i], blueDotState, redDots[i].mass, CONFIG.blueMass, deltaTime, false, blueAntigravityActive);
    }
    
    // Red dots with green dots (using individual masses)
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
    
    // Clouds with all other objects (clouds have 0.1x red mass)
    const cloudMass = CONFIG.redMass * 0.1;
    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        const cloudState = { x: cloud.x, y: cloud.y, vx: 0, vy: 0 }; // Clouds don't move
        
        // Clouds with red dots (using individual masses)
        for (let j = 0; j < redDotStates.length; j++) {
            applyGravitationalForce(cloudState, redDotStates[j], cloudMass, redDots[j].mass, deltaTime);
        }
        // Clouds with blue dot
        applyGravitationalForce(cloudState, blueDotState, cloudMass, CONFIG.blueMass, deltaTime, false, blueAntigravityActive);
        // Clouds with green dots
        for (let j = 0; j < greenDotStates.length; j++) {
            applyGravitationalForce(cloudState, greenDotStates[j], cloudMass, greenMass, deltaTime, false, greenDots[j].antigravityActive);
        }
    }
    
    // Update all red dots positions (using the state objects that have accumulated gravitational forces)
    for (let i = 0; i < redDotStates.length; i++) {
        updateDotPosition(redDotStates[i], CONFIG.gravity, deltaTime);
    }
    
    // Update blue dot position using physics (same gravity for all)
    updateDotPosition(blueDotState, CONFIG.gravity, deltaTime);
    
    // Update all green dots positions (using the state objects that have accumulated gravitational forces)
    for (let i = 0; i < greenDotStates.length; i++) {
        updateDotPosition(greenDotStates[i], CONFIG.gravity, deltaTime);
    }
    
    // Apply cloud drag effect - objects passing through clouds lose half their momentum
    // Also track red dots that pass through clouds (they disappear)
    // Track time blue and green dots spend in clouds for antigravity activation
    const redDotsToRemove = []; // Track indices of red dots that pass through clouds
    const redDotsPlayedSound = new Set(); // Track which red dots have already played the sound this frame
    
    // First pass: check if blue and green dots are in any cloud
    let blueInCloud = false;
    const greenInCloud = new Array(greenDotStates.length).fill(false);
    
    for (let i = 0; i < clouds.length; i++) {
        const cloud = clouds[i];
        const cloudRadius = cloud.radius; // Use individual cloud radius
        
        // Check red dots - if they pass through cloud, they disappear
        for (let j = 0; j < redDotStates.length; j++) {
            const dx = redDotStates[j].x - cloud.x;
            const dy = redDotStates[j].y - cloud.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < cloudRadius) {
                // Red dot is inside cloud - mark for removal (store index)
                redDotsToRemove.push(j);
                
                // Play breathy vocal "waaah" sound for red-grey collision (once per red dot)
                if (!redDotsPlayedSound.has(j)) {
                    playBreathyVocalWaaah();
                    redDotsPlayedSound.add(j);
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
            
            // Ensure minimum velocity of 20px/s
            const blueSpeed = Math.sqrt(blueDotState.vx * blueDotState.vx + blueDotState.vy * blueDotState.vy);
            if (blueSpeed > 0 && blueSpeed < 20) {
                const scale = 20 / blueSpeed;
                blueDotState.vx *= scale;
                blueDotState.vy *= scale;
            }
        }
        
        // Check green dots
        for (let j = 0; j < greenDotStates.length; j++) {
            const greenDx = greenDotStates[j].x - cloud.x;
            const greenDy = greenDotStates[j].y - cloud.y;
            const greenDistance = Math.sqrt(greenDx * greenDx + greenDy * greenDy);
            if (greenDistance < cloudRadius) {
                greenInCloud[j] = true; // Green dot is in a cloud
                
                // 1 in 10 chance to double momentum, otherwise halve it
                if (Math.random() < 0.1) {
                    greenDotStates[j].vx *= 2.0;
                    greenDotStates[j].vy *= 2.0;
                } else {
                    greenDotStates[j].vx *= 0.5;
                    greenDotStates[j].vy *= 0.5;
                }
                
                // Ensure minimum velocity of 20px/s
                const greenSpeed = Math.sqrt(greenDotStates[j].vx * greenDotStates[j].vx + greenDotStates[j].vy * greenDotStates[j].vy);
                if (greenSpeed > 0 && greenSpeed < 20) {
                    const scale = 20 / greenSpeed;
                    greenDotStates[j].vx *= scale;
                    greenDotStates[j].vy *= scale;
                }
            }
        }
    }
    
    // Update blue dot cloud time and activate antigravity if needed
    if (blueInCloud) {
        blueCloudTime += deltaTime;
        // Activate antigravity if blue has been in cloud for 10 seconds
        if (blueCloudTime >= 10.0 && !blueAntigravityActive) {
            blueAntigravityActive = true;
            blueAntigravityTimeRemaining = 3.0; // 3 seconds of antigravity
            blueCloudTime = 0; // Reset cloud time
            
            // Give blue dot a random velocity when entering antigravity from cloud
            const randomSpeed = Math.random() * 200 + 50; // Random between 50 and 250 pixels/second
            const randomAngle = Math.random() * Math.PI * 2; // Random direction
            blueVx = Math.cos(randomAngle) * randomSpeed;
            blueVy = Math.sin(randomAngle) * randomSpeed;
            blueDotState.vx = blueVx;
            blueDotState.vy = blueVy;
            
            // Remove the cloud that blue dot is in (find which cloud it's in)
            for (let i = clouds.length - 1; i >= 0; i--) {
                const cloud = clouds[i];
                const dx = blueDotState.x - cloud.x;
                const dy = blueDotState.y - cloud.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < cloud.radius) {
                    clouds.splice(i, 1);
                    playWoodblockClap(); // Play woodblock clap when cloud disappears
                    break; // Only remove one cloud
                }
            }
        }
    } else {
        // Blue dot is not in any cloud - reset cloud time
        blueCloudTime = 0;
    }
    
    // Update green dots cloud time and activate antigravity if needed
    for (let j = 0; j < greenDotStates.length; j++) {
        if (greenInCloud[j]) {
            // Green dot is in a cloud - increment cloud time
            greenDots[j].cloudTime += deltaTime;
            
            // Activate antigravity if green has been in cloud for 10 seconds
            if (greenDots[j].cloudTime >= 10.0 && !greenDots[j].antigravityActive) {
                greenDots[j].antigravityActive = true;
                greenDots[j].antigravityTimeRemaining = 3.0; // 3 seconds of antigravity
                greenDots[j].cloudTime = 0; // Reset cloud time
                
                // Give green dot a random velocity when entering antigravity from cloud
                const randomSpeed = Math.random() * 200 + 50; // Random between 50 and 250 pixels/second
                const randomAngle = Math.random() * Math.PI * 2; // Random direction
                greenDots[j].vx = Math.cos(randomAngle) * randomSpeed;
                greenDots[j].vy = Math.sin(randomAngle) * randomSpeed;
                greenDotStates[j].vx = greenDots[j].vx;
                greenDotStates[j].vy = greenDots[j].vy;
                
                // Remove the cloud that green dot is in (find which cloud it's in)
                for (let i = clouds.length - 1; i >= 0; i--) {
                    const cloud = clouds[i];
                    const dx = greenDotStates[j].x - cloud.x;
                    const dy = greenDotStates[j].y - cloud.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < cloud.radius) {
                        clouds.splice(i, 1);
                        playWoodblockClap(); // Play woodblock clap when cloud disappears
                        break; // Only remove one cloud
                    }
                }
            }
        } else {
            // Green dot is not in any cloud - reset cloud time
            greenDots[j].cloudTime = 0;
        }
    }
    
    // Check for collisions between all pairs of dots (with mass-based physics)
    // Track red dots that need to be split
    const redDotsToSplit = [];
    // Track mini-red pairs that should merge into a regular red (0.25 chance)
    const miniRedPairsToMerge = [];
    
    // Red dots with each other (using individual masses and radii)
    // Note: Red-red collisions do NOT count toward splitting
    for (let i = 0; i < redDotStates.length; i++) {
        for (let j = i + 1; j < redDotStates.length; j++) {
            if (checkDotCollision(redDotStates[i], redDotStates[j], redDots[i].mass, redDots[j].mass, redDots[i].radius, redDots[j].radius)) {
                // Play guitar D pluck sound for red-red collision
                playGuitarDPluck();
                
                // Check if both are mini-reds (mini-reds have radius = CONFIG.dotRadius / 4)
                const miniRadius = CONFIG.dotRadius / 4;
                if (redDots[i].radius === miniRadius && redDots[j].radius === miniRadius) {
                    // 0.25 chance to merge into a regular red
                    if (Math.random() < 0.25) {
                        miniRedPairsToMerge.push({ i: i, j: j });
                    }
                }
            }
        }
    }
    
    // Red dots with blue dot (using individual masses and radii)
    // These collisions count toward splitting
    for (let i = 0; i < redDotStates.length; i++) {
        if (checkDotCollision(redDotStates[i], blueDotState, redDots[i].mass, CONFIG.blueMass, redDots[i].radius, CONFIG.dotRadius)) {
            // Play piano C# sound for blue-red collision
            playPianoCSharp();
            
            redDots[i].blueCollisionCount++;
            // Check if should split (50 total collisions with blue OR green)
            if (redDots[i].blueCollisionCount + redDots[i].greenCollisionCount >= 50) {
                redDotsToSplit.push(i);
            }
        }
    }
    
    // Red dots with green dots (using individual masses and radii)
    // These collisions count toward splitting
    for (let i = 0; i < redDotStates.length; i++) {
        for (let j = 0; j < greenDotStates.length; j++) {
            if (checkDotCollision(redDotStates[i], greenDotStates[j], redDots[i].mass, greenMass, redDots[i].radius, CONFIG.dotRadius * 2)) {
                // Play violin pizzicato high E sound for red-green collision
                playViolinPizzicatoHighE();
                
                redDots[i].greenCollisionCount++;
                // Check if should split (50 total collisions with blue OR green)
                if (redDots[i].blueCollisionCount + redDots[i].greenCollisionCount >= 50) {
                    redDotsToSplit.push(i);
                }
            }
        }
    }
    
    // Blue with green dots
    for (let i = 0; i < greenDotStates.length; i++) {
        if (checkDotCollision(blueDotState, greenDotStates[i], CONFIG.blueMass, greenMass, CONFIG.dotRadius, CONFIG.dotRadius * 2)) {
            // Play organ F2 sound for blue-green collision
            playOrganF2();
            
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
            if (checkDotCollision(greenDotStates[i], greenDotStates[j], greenMass, greenMass, CONFIG.dotRadius * 2, CONFIG.dotRadius * 2)) {
                // Play harmonica Eb3 sound for green-green collision
                playHarmonicaEb3();
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
            playWoodblockClap(); // Play woodblock clap when cloud disappears
        }
    }
    
    // Split red dots that have reached 50 collisions with blue or green (process in reverse order to avoid index issues)
    const uniqueRedDotsToSplit = [...new Set(redDotsToSplit)].sort((a, b) => b - a);
    for (let i = 0; i < uniqueRedDotsToSplit.length; i++) {
        const index = uniqueRedDotsToSplit[i];
        if (index >= 0 && index < redDots.length) {
            const totalCollisions = redDots[index].blueCollisionCount + redDots[index].greenCollisionCount;
            if (totalCollisions >= 50) {
                splitRedDot(index);
                // After splitting, indices may have shifted, so we need to recalculate removal indices
                // For now, we'll handle removals by checking positions directly after splitting
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
                    trail: []
                };
                redDots.push(newRedDot);
            }
        }
    }
    
    // Remove red dots that passed through clouds
    // Check positions directly since indices may have changed after splitting
    const uniqueRedDotsToRemove = [...new Set(redDotsToRemove)];
    for (let i = redDots.length - 1; i >= 0; i--) {
        // Check if this red dot is inside any cloud
        for (let j = 0; j < clouds.length; j++) {
            const cloud = clouds[j];
            const dx = redDots[i].x - cloud.x;
            const dy = redDots[i].y - cloud.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < cloud.radius) {
                redDots.splice(i, 1);
                break; // Remove once, then check next dot
            }
        }
    }
    
    // If there's only one red dot left, convert a grey cloud into two red dots
    if (redDots.length === 1 && clouds.length > 0) {
        // Remove one cloud
        clouds.splice(0, 1); // Remove the first cloud
        playWoodblockClap(); // Play woodblock clap when cloud disappears
        
        // Create two new red dots at random positions
        redDots.push(initializeRedDot());
        redDots.push(initializeRedDot());
    }
    
    // Auto-reset if there are 1000 or more red dots (including mini-reds)
    if (redDots.length >= 1000) {
        resetSimulation();
        return; // Exit early since we reset
    }
    
    // Add current positions to trails
    for (let i = 0; i < redDots.length; i++) {
        redDots[i].trail.push({ x: redDots[i].x, y: redDots[i].y });
        if (redDots[i].trail.length > trailLength) {
            redDots[i].trail.shift();
        }
    }
    
    blueTrail.push({ x: blueDotState.x, y: blueDotState.y });
    
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
    
    // Draw
    drawSquare(); // Draws black background and border
    drawStars(); // Draw stars on black background
    
    // Draw all clouds (draw before objects so they appear behind)
    for (let i = 0; i < clouds.length; i++) {
        drawCloud(clouds[i].x, clouds[i].y, clouds[i].radius, clouds[i].puffs);
    }
    
    // Draw all red dot trails
    for (let i = 0; i < redDots.length; i++) {
        drawTrail(redDots[i].trail, 'rgba(150, 150, 150, 0.4)');
    }
    
    drawTrail(blueTrail, 'rgba(52, 152, 219, 0.4)'); // blue dot trail (light blue, translucent)
    
    // Draw all green dot trails
    for (let i = 0; i < greenDots.length; i++) {
        drawTrail(greenDots[i].trail, 'rgba(46, 204, 113, 0.4)');
    }
    
    // Draw all red dots (using individual radii for mini-reds)
    for (let i = 0; i < redDots.length; i++) {
        drawDot(redDots[i].x, redDots[i].y, redDots[i].radius);
    }
    
    drawBlueDot(blueDotState.x, blueDotState.y, blueAntigravityActive, blueAntigravityTimeRemaining);
    
    // Draw all green dots
    for (let i = 0; i < greenDots.length; i++) {
        drawGreenDot(greenDots[i].x, greenDots[i].y, greenDots[i].antigravityActive, greenDots[i].antigravityTimeRemaining);
    }
    
    requestAnimationFrame(animate);
}
