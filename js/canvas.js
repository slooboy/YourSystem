// Canvas setup and resizing functions

// Set canvas size to fill browser window width
function resizeCanvas() {
    // Use full window width, accounting for container padding (20px each side = 40px total)
    const containerPadding = 40;
    canvas.width = window.innerWidth - containerPadding;
    
    // Calculate available height for canvas (window height minus title, controls, and padding)
    const title = document.querySelector('h1');
    const info = document.querySelector('.info');
    
    // Get actual heights, with fallback estimates
    const titleHeight = title && title.offsetHeight > 0 ? title.offsetHeight : 60;
    let infoHeight = 200; // Conservative estimate for controls
    if (info && info.offsetHeight > 0) {
        infoHeight = info.offsetHeight + 20; // Add extra margin
    }
    
    const containerPaddingVertical = 40; // 20px top + 20px bottom
    const margins = 40; // spacing between elements (conservative)
    
    const availableHeight = window.innerHeight - titleHeight - infoHeight - containerPaddingVertical - margins;
    
    // Set canvas height to available space, with minimum height
    // Use Math.min to ensure we don't exceed available space
    canvas.height = Math.max(300, Math.min(availableHeight, window.innerHeight * 0.7));
    
    // Make rectangle fill entire canvas
    rectangleX = 0;
    rectangleY = 0;
    rectangleWidth = canvas.width;
    rectangleHeight = canvas.height;
}

// Initial resize - wait for DOM to be ready
function initializeCanvas() {
    resizeCanvas();
    // Resize again after a short delay to ensure accurate measurements
    setTimeout(() => {
        resizeCanvas();
        if (typeof generateStars === 'function') {
            generateStars();
        }
    }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCanvas);
} else {
    initializeCanvas();
}

// Resize on window resize
window.addEventListener('resize', function() {
    resizeCanvas();
    if (typeof generateStars === 'function') {
        generateStars();
    }
});
