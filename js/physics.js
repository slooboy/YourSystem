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
    if (dotState.x <= minX) {
        dotState.x = minX;
        dotState.vx = -dotState.vx; // bounce off left wall
    } else if (dotState.x >= maxX) {
        dotState.x = maxX;
        dotState.vx = -dotState.vx; // bounce off right wall
    }
    
    if (dotState.y <= minY) {
        dotState.y = minY;
        dotState.vy = -dotState.vy; // bounce off top wall
    } else if (dotState.y >= maxY) {
        dotState.y = maxY;
        dotState.vy = -dotState.vy; // bounce off bottom wall
    }
    
    return { x: dotState.x, y: dotState.y };
}

function applyGravitationalForce(dot1State, dot2State, mass1, mass2, deltaTime) {
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
    
    // dot1 is pulled toward dot2
    dot1State.vx += accel1 * nx * deltaTime;
    dot1State.vy += accel1 * ny * deltaTime;
    
    // dot2 is pulled toward dot1 (opposite direction)
    dot2State.vx -= accel2 * nx * deltaTime;
    dot2State.vy -= accel2 * ny * deltaTime;
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
        }
    }
}
