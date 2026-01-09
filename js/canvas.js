// Canvas setup and resizing functions

// Set canvas size to fill browser window width
function resizeCanvas() {
    // Use full window width, accounting for container padding (20px each side = 40px total)
    const containerPadding = 40;
    canvas.width = window.innerWidth - containerPadding;
    
    // Calculate available height for canvas (window height minus title, controls, and padding)
    const titleContainer = document.querySelector('.title-container');
    const info = document.querySelector('.info');
    
    // Use fixed title height (100px for two lines) plus margin-bottom (20px) = 120px total
    const titleHeight = 120; // Fixed height: 100px container + 20px margin-bottom
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
    // Ensure context is initialized after canvas is resized
    if (typeof ensureContext === 'function') {
        ensureContext();
    }
    // Resize again after a short delay to ensure accurate measurements
    setTimeout(() => {
        resizeCanvas();
        if (typeof ensureContext === 'function') {
            ensureContext();
        }
        if (typeof generateStars === 'function') {
            generateStars();
        }
        // Adjust title font size after layout
        const titleElement = document.querySelector('h1');
        if (titleElement && typeof adjustTitleFontSize === 'function') {
            adjustTitleFontSize(titleElement);
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
    // Adjust title font size after resize
    const titleElement = document.querySelector('h1');
    if (titleElement && typeof adjustTitleFontSize === 'function') {
        adjustTitleFontSize(titleElement);
    }
});
