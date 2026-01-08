// Main entry point - initializes everything and starts the animation

// Initialize red dots (start with random number from 2 to 8)
const numRedDots = Math.floor(Math.random() * 7) + 2; // Random number from 2 to 8
for (let i = 0; i < numRedDots; i++) {
    redDots.push(initializeRedDot());
}

// Initialize blue dot
initializeBlueDot();

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

// Generate background stars
generateStars();

// Start animation
animate();
