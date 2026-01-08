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
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create state objects for all dots
    const redDotState = { x: dotX, y: dotY, vx: vx, vy: vy };
    const redDot2State = { x: redDot2X, y: redDot2Y, vx: redDot2Vx, vy: redDot2Vy };
    const redDot3State = { x: redDot3X, y: redDot3Y, vx: redDot3Vx, vy: redDot3Vy };
    const blueDotState = { x: blueDotX, y: blueDotY, vx: blueVx, vy: blueVy };
    const greenDotState = { x: greenDotX, y: greenDotY, vx: greenVx, vy: greenVy };
    
    // Apply gravitational forces between all pairs of objects
    applyGravitationalForce(redDotState, redDot2State, CONFIG.redMass, CONFIG.redMass, deltaTime);
    applyGravitationalForce(redDotState, redDot3State, CONFIG.redMass, CONFIG.redMass, deltaTime);
    applyGravitationalForce(redDot2State, redDot3State, CONFIG.redMass, CONFIG.redMass, deltaTime);
    applyGravitationalForce(redDotState, blueDotState, CONFIG.redMass, CONFIG.blueMass, deltaTime);
    applyGravitationalForce(redDot2State, blueDotState, CONFIG.redMass, CONFIG.blueMass, deltaTime);
    applyGravitationalForce(redDot3State, blueDotState, CONFIG.redMass, CONFIG.blueMass, deltaTime);
    applyGravitationalForce(redDotState, greenDotState, CONFIG.redMass, greenMass, deltaTime);
    applyGravitationalForce(redDot2State, greenDotState, CONFIG.redMass, greenMass, deltaTime);
    applyGravitationalForce(redDot3State, greenDotState, CONFIG.redMass, greenMass, deltaTime);
    applyGravitationalForce(blueDotState, greenDotState, CONFIG.blueMass, greenMass, deltaTime);
    
    // Update red dot 1 position using physics
    const redPos = updateDotPosition(redDotState, CONFIG.gravity, deltaTime);
    dotX = redDotState.x;
    dotY = redDotState.y;
    vx = redDotState.vx;
    vy = redDotState.vy;
    
    // Update red dot 2 position using physics
    const redDot2Pos = updateDotPosition(redDot2State, CONFIG.gravity, deltaTime);
    redDot2X = redDot2State.x;
    redDot2Y = redDot2State.y;
    redDot2Vx = redDot2State.vx;
    redDot2Vy = redDot2State.vy;
    
    // Update red dot 3 position using physics
    const redDot3Pos = updateDotPosition(redDot3State, CONFIG.gravity, deltaTime);
    redDot3X = redDot3State.x;
    redDot3Y = redDot3State.y;
    redDot3Vx = redDot3State.vx;
    redDot3Vy = redDot3State.vy;
    
    // Update blue dot position using physics (same gravity for all)
    const bluePos = updateDotPosition(blueDotState, CONFIG.gravity, deltaTime);
    blueDotX = blueDotState.x;
    blueDotY = blueDotState.y;
    blueVx = blueDotState.vx;
    blueVy = blueDotState.vy;
    
    // Update green dot position using physics (same gravity for all)
    const greenPos = updateDotPosition(greenDotState, CONFIG.gravity, deltaTime);
    greenDotX = greenDotState.x;
    greenDotY = greenDotState.y;
    greenVx = greenDotState.vx;
    greenVy = greenDotState.vy;
    
    // Check for collisions between all pairs of dots (with mass-based physics)
    // Radii: red = dotRadius/2, blue = dotRadius, green = dotRadius*2
    const redRadius = CONFIG.dotRadius / 2;
    checkDotCollision(redDotState, redDot2State, CONFIG.redMass, CONFIG.redMass, redRadius, redRadius);
    checkDotCollision(redDotState, redDot3State, CONFIG.redMass, CONFIG.redMass, redRadius, redRadius);
    checkDotCollision(redDot2State, redDot3State, CONFIG.redMass, CONFIG.redMass, redRadius, redRadius);
    checkDotCollision(redDotState, blueDotState, CONFIG.redMass, CONFIG.blueMass, redRadius, CONFIG.dotRadius);
    checkDotCollision(redDot2State, blueDotState, CONFIG.redMass, CONFIG.blueMass, redRadius, CONFIG.dotRadius);
    checkDotCollision(redDot3State, blueDotState, CONFIG.redMass, CONFIG.blueMass, redRadius, CONFIG.dotRadius);
    checkDotCollision(redDotState, greenDotState, CONFIG.redMass, greenMass, redRadius, CONFIG.dotRadius * 2);
    checkDotCollision(redDot2State, greenDotState, CONFIG.redMass, greenMass, redRadius, CONFIG.dotRadius * 2);
    checkDotCollision(redDot3State, greenDotState, CONFIG.redMass, greenMass, redRadius, CONFIG.dotRadius * 2);
    checkDotCollision(blueDotState, greenDotState, CONFIG.blueMass, greenMass, CONFIG.dotRadius, CONFIG.dotRadius * 2);
    
    // Update positions after collision resolution
    dotX = redDotState.x;
    dotY = redDotState.y;
    vx = redDotState.vx;
    vy = redDotState.vy;
    redDot2X = redDot2State.x;
    redDot2Y = redDot2State.y;
    redDot2Vx = redDot2State.vx;
    redDot2Vy = redDot2State.vy;
    redDot3X = redDot3State.x;
    redDot3Y = redDot3State.y;
    redDot3Vx = redDot3State.vx;
    redDot3Vy = redDot3State.vy;
    blueDotX = blueDotState.x;
    blueDotY = blueDotState.y;
    blueVx = blueDotState.vx;
    blueVy = blueDotState.vy;
    greenDotX = greenDotState.x;
    greenDotY = greenDotState.y;
    greenVx = greenDotState.vx;
    greenVy = greenDotState.vy;
    
    // Add current positions to trails (use state values after collision)
    trail.push({ x: redDotState.x, y: redDotState.y });
    redDot2Trail.push({ x: redDot2State.x, y: redDot2State.y });
    redDot3Trail.push({ x: redDot3State.x, y: redDot3State.y });
    blueTrail.push({ x: blueDotState.x, y: blueDotState.y });
    greenTrail.push({ x: greenDotState.x, y: greenDotState.y });
    
    // Limit trail lengths
    if (trail.length > trailLength) {
        trail.shift(); // remove oldest position
    }
    if (redDot2Trail.length > trailLength) {
        redDot2Trail.shift(); // remove oldest position
    }
    if (redDot3Trail.length > trailLength) {
        redDot3Trail.shift(); // remove oldest position
    }
    if (blueTrail.length > trailLength) {
        blueTrail.shift(); // remove oldest position
    }
    if (greenTrail.length > trailLength) {
        greenTrail.shift(); // remove oldest position
    }
    
    // Draw
    drawSquare(); // Draws black background and border
    drawStars(); // Draw stars on black background
    drawTrail(trail, 'rgba(150, 150, 150, 0.4)'); // red dot 1 trail (light grey)
    drawTrail(redDot2Trail, 'rgba(150, 150, 150, 0.4)'); // red dot 2 trail (light grey)
    drawTrail(redDot3Trail, 'rgba(150, 150, 150, 0.4)'); // red dot 3 trail (light grey)
    drawTrail(blueTrail, 'rgba(52, 152, 219, 0.4)'); // blue dot trail (light blue, translucent)
    drawTrail(greenTrail, 'rgba(46, 204, 113, 0.4)'); // green dot trail (light green, translucent)
    drawDot(redDotState.x, redDotState.y);
    drawDot(redDot2State.x, redDot2State.y);
    drawDot(redDot3State.x, redDot3State.y);
    drawBlueDot(blueDotState.x, blueDotState.y);
    drawGreenDot(greenDotState.x, greenDotState.y);
    
    requestAnimationFrame(animate);
}
