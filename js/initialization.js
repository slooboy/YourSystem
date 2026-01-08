// Initialization functions for all objects

function initializeDot() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    dotX = minX + Math.random() * (maxX - minX);
    dotY = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    vx = 0;
    vy = 0;
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
    greenDotX = minX + Math.random() * (maxX - minX);
    greenDotY = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    greenVx = 0;
    greenVy = 0;
}

function initializeRedDot2() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    redDot2X = minX + Math.random() * (maxX - minX);
    redDot2Y = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    redDot2Vx = 0;
    redDot2Vy = 0;
}

function initializeRedDot3() {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Random position within rectangle bounds
    redDot3X = minX + Math.random() * (maxX - minX);
    redDot3Y = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    redDot3Vx = 0;
    redDot3Vy = 0;
}

// Reset function to reinitialize all objects
function resetSimulation() {
    // Clear trails
    trail.length = 0;
    redDot2Trail.length = 0;
    redDot3Trail.length = 0;
    blueTrail.length = 0;
    greenTrail.length = 0;
    
    // Reinitialize all objects with random positions
    initializeDot();
    initializeRedDot2();
    initializeRedDot3();
    initializeBlueDot();
    initializeGreenDot();
    
    // Reset timer
    startTime = Date.now();
}
