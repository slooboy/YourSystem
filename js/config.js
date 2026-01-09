// Configuration constants
const CONFIG = {
    // Dot properties
    dotRadius: 8,
    margin: 8, // Keep dot away from exact edge
    
    // Animation parameters
    wallTime: 1, // seconds per wall
    totalCycleTime: 4, // wallTime * 4
    
    // Gravity: same for all objects (like real world)
    gravity: 0, // pixels per second squared (disabled - no downward gravity)
    
    // Gravitational constant for inter-object attraction
    initialG: 500, // gravitational constant (pixels^3 / (mass * second^2)) - multiplied by 5 from 100
    
    // Mass properties (affects collisions and gravitational attraction)
    redMass: 1, // base mass
    blueMass: 40, // 40x red dot's mass (increased by factor of 10)
    initialGreenMass: 80, // 80x red dot's mass (increased by factor of 10) - adjustable via slider
    yellowCrescentMass: 2, // 2x red dot's mass
    
    // Trail properties
    initialTrailLength: 900, // number of positions to store in trail (multiplied by 3 from 300)
    
    // Rectangle properties
    wallThickness: 3,
    
    // Star properties
    numStars: 100,
    
    // Collision detection
    collisionRadius: 3 // Fixed collision radius for all objects regardless of visual size
};
