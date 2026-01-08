// Main entry point - initializes everything and starts the animation

// Wait for canvas to be initialized before starting
function startSimulation() {
    console.log('startSimulation called, canvas:', canvas, 'width:', canvas?.width, 'height:', canvas?.height);
    // Check if canvas is ready (has valid dimensions)
    if (canvas && canvas.width > 0 && canvas.height > 0) {
        console.log('Canvas ready, generating stars and starting animation');
        // Initialize all objects
        resetSimulation();
        
        // Generate background stars
        generateStars();
        console.log('Generated', stars.length, 'stars');
        
        // Start animation
        animate();
    } else {
        // Canvas not ready yet, try again in a moment
        console.log('Canvas not ready, retrying in 50ms');
        setTimeout(startSimulation, 50);
    }
}

// Start after a short delay to ensure canvas is initialized
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(startSimulation, 150); // Wait for canvas.js to initialize
    });
} else {
    setTimeout(startSimulation, 150); // Wait for canvas.js to initialize
}
