// Physics functions

function updateDotPosition(dotState, dotGravity, deltaTime) {
    const minX = rectangleX + CONFIG.margin;
    const maxX = rectangleX + rectangleWidth - CONFIG.margin;
    const minY = rectangleY + CONFIG.margin;
    const maxY = rectangleY + rectangleHeight - CONFIG.margin;
    
    // Apply gravity to velocity (always pulls down)
    dotState.vy += dotGravity * deltaTime;
    
    // Update position based on velocity
    dotState.x += dotState.vx * deltaTime;
    dotState.y += dotState.vy * deltaTime;
    
    // Check for wall collisions and bounce
    let leftRightWallHit = false;
    let topBottomWallHit = false;
    
    if (dotState.x <= minX) {
        dotState.x = minX;
        dotState.vx = -dotState.vx; // bounce off left wall
        leftRightWallHit = true;
    } else if (dotState.x >= maxX) {
        dotState.x = maxX;
        dotState.vx = -dotState.vx; // bounce off right wall
        leftRightWallHit = true;
    }
    
    if (dotState.y <= minY) {
        dotState.y = minY;
        dotState.vy = -dotState.vy; // bounce off top wall
        topBottomWallHit = true;
    } else if (dotState.y >= maxY) {
        dotState.y = maxY;
        dotState.vy = -dotState.vy; // bounce off bottom wall
        topBottomWallHit = true;
    }
    
    // Play snare tap for left/right walls, bass thump for top/bottom walls
    if (leftRightWallHit) {
        playSnareTap();
    }
    if (topBottomWallHit) {
        playBassThump();
    }
    
    // Return position and wall hit information
    return { 
        x: dotState.x, 
        y: dotState.y,
        wallHit: leftRightWallHit || topBottomWallHit
    };
}

function applyGravitationalForce(dot1State, dot2State, mass1, mass2, deltaTime, dot1Antigravity = false, dot2Antigravity = false) {
    // Calculate distance and direction between objects
    const dx = dot2State.x - dot1State.x;
    const dy = dot2State.y - dot1State.y;
    const distanceSquared = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSquared);
    
    // Avoid division by zero and very close objects
    if (distance < 1) return;
    
    // Calculate gravitational force magnitude: F = G * m1 * m2 / r^2
    const forceMagnitude = G * mass1 * mass2 / distanceSquared;
    
    // Calculate unit vector from dot1 to dot2
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Convert force to acceleration: a = F / m
    // Apply acceleration to velocity: v += a * dt
    const accel1 = forceMagnitude / mass1;
    const accel2 = forceMagnitude / mass2;
    
    // Determine force direction based on antigravity state
    // If antigravity is active, reverse the force direction (repel instead of attract)
    const dir1 = dot1Antigravity ? -1 : 1;
    const dir2 = dot2Antigravity ? -1 : 1;
    
    // dot1 is pulled toward dot2 (or repelled if antigravity)
    dot1State.vx += accel1 * nx * deltaTime * dir1;
    dot1State.vy += accel1 * ny * deltaTime * dir1;
    
    // dot2 is pulled toward dot1 (or repelled if antigravity) (opposite direction)
    dot2State.vx -= accel2 * nx * deltaTime * dir2;
    dot2State.vy -= accel2 * ny * deltaTime * dir2;
}

function checkDotCollision(dot1State, dot2State, mass1, mass2, radius1, radius2) {
    // Calculate distance between dots
    const dx = dot2State.x - dot1State.x;
    const dy = dot2State.y - dot1State.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = radius1 + radius2;
    
    // Check if dots are colliding
    if (distance < minDistance && distance > 0) {
        // Calculate collision normal (unit vector from dot1 to dot2)
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Calculate relative velocity (dot2 - dot1)
        const relativeVx = dot2State.vx - dot1State.vx;
        const relativeVy = dot2State.vy - dot1State.vy;
        
        // Calculate relative velocity along collision normal
        const relativeSpeed = relativeVx * nx + relativeVy * ny;
        
        // Only resolve collision if dots are moving towards each other
        if (relativeSpeed < 0) {
            // Elastic collision response for different masses
            // Impulse: J = 2 * m1 * m2 * v_rel_n / (m1 + m2)
            const impulse = 2 * mass1 * mass2 * relativeSpeed / (mass1 + mass2);
            
            // Apply impulse to dot1: v1' = v1 + J/m1 * n
            dot1State.vx += (impulse / mass1) * nx;
            dot1State.vy += (impulse / mass1) * ny;
            
            // Apply impulse to dot2: v2' = v2 - J/m2 * n
            dot2State.vx -= (impulse / mass2) * nx;
            dot2State.vy -= (impulse / mass2) * ny;
            
            // Separate dots to prevent overlap
            const overlap = minDistance - distance;
            const separationX = nx * overlap * 0.5;
            const separationY = ny * overlap * 0.5;
            
            dot1State.x -= separationX;
            dot1State.y -= separationY;
            dot2State.x += separationX;
            dot2State.y += separationY;
            
            return true; // Collision detected and resolved
        }
    }
    return false; // No collision
}

// Function to reduce velocity if object is moving too fast
// If speed > 200px/s, reduce by 20px/s per collision until speed <= 100px/s
function reduceVelocityIfTooFast(dotState) {
    const speed = Math.sqrt(dotState.vx * dotState.vx + dotState.vy * dotState.vy);
    if (speed > 200) {
        // Reduce speed by 20px/s, but not below 100px/s
        const targetSpeed = Math.max(100, speed - 20);
        if (speed > 0) {
            const scale = targetSpeed / speed;
            dotState.vx *= scale;
            dotState.vy *= scale;
        }
    }
}
