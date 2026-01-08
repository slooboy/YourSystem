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
    initialG: 20000, // gravitational constant (pixels^3 / (mass * second^2))
    
    // Mass properties (affects collisions and gravitational attraction)
    redMass: 1, // base mass
    blueMass: 4, // 4x red dot's mass
    initialGreenMass: 8, // 8x red dot's mass - adjustable via slider
    yellowCrescentMass: 2, // 2x red dot's mass
    
    // Trail properties
    initialTrailLength: 400, // number of positions to store in trail
    
    // Rectangle properties
    wallThickness: 3,
    
    // Star properties
    numStars: 100
};
