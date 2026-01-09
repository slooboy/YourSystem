// Drawing functions

function drawSquare() {
    // Check if context is ready
    if (!ctx) {
        console.log('drawSquare: ctx is null');
        return;
    }
    
    try {
        // Fill rectangle with black background (extended to include border area)
        // Since strokeRect draws border centered on edges, extend by wallThickness/2 on each side
        ctx.fillStyle = '#000';
        ctx.fillRect(
            rectangleX - CONFIG.wallThickness / 2, 
            rectangleY - CONFIG.wallThickness / 2, 
            rectangleWidth + CONFIG.wallThickness, 
            rectangleHeight + CONFIG.wallThickness
        );
        
        // Draw rectangle border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = CONFIG.wallThickness;
        ctx.strokeRect(rectangleX, rectangleY, rectangleWidth, rectangleHeight);
    } catch (e) {
        console.error('Error in drawSquare:', e);
    }
}

function drawStars() {
    if (!ctx) {
        console.log('drawStars: ctx is null');
        return;
    }
    try {
        ctx.save();
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
        }
        ctx.restore();
    } catch (e) {
        console.error('Error in drawStars:', e);
    }
}

function drawTrail(trailArray, color) {
    if (trailArray.length < 2) return;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 5]); // dotted pattern: 3px dash, 5px gap
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(trailArray[0].x, trailArray[0].y);
    
    // Draw curved trail using quadratic curves for smooth arcs
    for (let i = 1; i < trailArray.length; i++) {
        const prev = trailArray[i - 1];
        const curr = trailArray[i];
        
        if (i === 1) {
            // First segment: straight line
            ctx.lineTo(curr.x, curr.y);
        } else {
            // Use previous point as control point for smooth curve
            // This creates arcs that follow the path naturally
            ctx.quadraticCurveTo(prev.x, prev.y, curr.x, curr.y);
        }
    }
    ctx.stroke();
    ctx.restore();
}

function drawDot(x, y, radius, opacity = 1.0) {
    // radius parameter allows drawing mini-reds with different sizes
    if (radius === undefined) {
        radius = CONFIG.dotRadius / 2; // Default: half size for regular red dots
    }
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a highlight
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - radius * 0.4, y - radius * 0.4, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawBlueDot(x, y, antigravityActive = false, antigravityTimeRemaining = 0, opacity = 1.0) {
    // Draw Saturn-like planet with rings seen at an angle
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const planetRadius = CONFIG.dotRadius;
    const ringWidth = planetRadius * 0.15; // Thickness of the rings
    const ringOuterRadius = planetRadius * 1.8; // Outer edge of rings
    const ringInnerRadius = planetRadius * 1.2; // Inner edge of rings
    const ringTilt = Math.PI / 6; // 30 degree tilt angle
    
    // Determine color based on antigravity state
    // Flash between orange and blue in last 0.5 seconds (rapidly)
    let useOrange = false;
    if (antigravityActive) {
        if (antigravityTimeRemaining <= 0.5) {
            // Flash rapidly: change color every ~0.1 seconds (10 times per second)
            const flashRate = 10; // flashes per second
            const flashPhase = Math.floor(antigravityTimeRemaining * flashRate);
            useOrange = flashPhase % 2 === 0; // Alternate between orange and blue
        } else {
            useOrange = true; // Solid orange for first 2.5 seconds
        }
    }
    
    const ringColor = useOrange ? '#ff8c00' : '#3498db'; // Orange or blue
    const planetColor = useOrange ? '#ff8c00' : '#3498db';
    const highlightColor = useOrange ? '#ffa64d' : '#5dade2';
    
    // Draw rings first (so planet appears in front)
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = ringWidth;
    ctx.beginPath();
    
    // Draw outer ring as an ellipse (tilted)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ringTilt);
    ctx.scale(1, 0.3); // Flatten vertically to create perspective
    ctx.beginPath();
    ctx.arc(0, 0, ringOuterRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw inner ring
    ctx.beginPath();
    ctx.arc(0, 0, ringInnerRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // Draw the planet (circle) on top of the rings
    ctx.fillStyle = planetColor;
    ctx.beginPath();
    ctx.arc(x, y, planetRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a highlight to the planet
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.arc(x - planetRadius * 0.3, y - planetRadius * 0.3, planetRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawGreenDot(x, y, antigravityActive = false, antigravityTimeRemaining = 0, opacity = 1.0) {
    // Draw 5-pointed star (twice as large)
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Determine color based on antigravity state
    // Flash between orange and green in last 0.5 seconds (rapidly)
    let useOrange = false;
    if (antigravityActive) {
        if (antigravityTimeRemaining <= 0.5) {
            // Flash rapidly: change color every ~0.1 seconds (10 times per second)
            const flashRate = 10; // flashes per second
            const flashPhase = Math.floor(antigravityTimeRemaining * flashRate);
            useOrange = flashPhase % 2 === 0; // Alternate between orange and green
        } else {
            useOrange = true; // Solid orange for first 2.5 seconds
        }
    }
    
    const starColor = useOrange ? '#ff8c00' : '#2ecc71'; // Orange or green
    
    ctx.fillStyle = starColor;
    ctx.beginPath();
    
    const outerRadius = CONFIG.dotRadius * 2; // Twice as large
    const innerRadius = CONFIG.dotRadius * 0.8; // Scaled proportionally
    const numPoints = 5;
    
    for (let i = 0; i < numPoints * 2; i++) {
        const angle = (i * Math.PI) / numPoints - Math.PI / 2; // Start from top
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawStarName(x, y, name, opacity = 1.0, objectRadius = null) {
    // Draw star name in small italics to the bottom right of the object
    if (!ctx) return;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff'; // White text
    ctx.font = 'italic 10px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Position text just a couple pixels away from the object edge
    // If objectRadius is provided, use it; otherwise default to green star size
    const radius = objectRadius !== null ? objectRadius : (CONFIG.dotRadius * 2);
    const offsetX = radius - 3; // 5px closer to center (was radius + 2, now radius - 3)
    const offsetY = radius - 3; // 5px closer to center (was radius + 2, now radius - 3)
    ctx.fillText(name, x + offsetX, y + offsetY);
    
    ctx.restore();
}

function drawCloud(x, y, radius, puffs, opacity = 1.0) {
    // Draw an ethereal, cloud-like shape using multiple overlapping circles
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Use composite operation to blend overlapping shapes
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw each puff with a soft gradient
    for (let i = 0; i < puffs.length; i++) {
        const puff = puffs[i];
        const gradient = ctx.createRadialGradient(
            puff.x, puff.y, 0,
            puff.x, puff.y, puff.r
        );
        gradient.addColorStop(0, 'rgba(150, 150, 150, 0.5)');
        gradient.addColorStop(0.6, 'rgba(150, 150, 150, 0.3)');
        gradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Draw collision count text next to an object
function drawCollisionCount(x, y, count, opacity = 1.0) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    // Position text slightly above and to the right of the object
    ctx.fillText(count.toString(), x + 12, y - 12);
    ctx.restore();
}

// Draw velocity text next to an object
function drawVelocityText(x, y, vx, vy, opacity = 1.0) {
    if (!ctx) return;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 10px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Calculate speed
    const speed = Math.sqrt(vx * vx + vy * vy);
    
    // Position text slightly above and to the right of the object
    const text = `(${vx.toFixed(1)}, ${vy.toFixed(1)})`;
    ctx.fillText(text, x + 12, y - 12);
    ctx.restore();
}

// Generate random stars
function generateStars() {
    stars.length = 0; // Clear existing stars
    // Don't generate stars if canvas dimensions are invalid
    if (rectangleWidth <= 0 || rectangleHeight <= 0) {
        console.log('generateStars: Invalid dimensions', rectangleWidth, rectangleHeight);
        return;
    }
    console.log('generateStars: Generating stars with dimensions', rectangleWidth, rectangleHeight);
    const minX = rectangleX;
    const maxX = rectangleX + rectangleWidth;
    const minY = rectangleY;
    const maxY = rectangleY + rectangleHeight;
    
    for (let i = 0; i < CONFIG.numStars; i++) {
        stars.push({
            x: minX + Math.random() * (maxX - minX),
            y: minY + Math.random() * (maxY - minY),
            opacity: 0.3 + Math.random() * 0.7 // opacity between 0.3 and 1.0
        });
    }
}

function drawYellowCrescent(x, y, opacity = 1.0) {
    // Draw a yellow crescent moon shape
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const radius = CONFIG.dotRadius * 1.5;
    
    // Draw crescent by drawing a full circle and then a smaller circle to create the crescent shape
    ctx.fillStyle = '#FFD700'; // Gold/yellow color
    
    // Draw the main circle (full moon)
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw a smaller circle offset to create the crescent shape
    // This creates the "shadow" that makes it look like a crescent
    ctx.fillStyle = '#000'; // Black to create the cutout
    ctx.beginPath();
    ctx.arc(x + radius * 0.6, y, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Redraw the main circle outline to make it look cleaner
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
}

function drawEarth(x, y, opacity = 1.0) {
    // Draw Earth as a deep blue sphere with milky-white patches
    if (!ctx) return;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const radius = CONFIG.dotRadius * 1.0; // Same size as orange crescent
    
    // Draw base sphere in deep blue
    ctx.fillStyle = '#1a237e'; // Deep blue
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add milky-white patches (clouds/continents)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Milky white with transparency
    
    // Patch 1 - upper left
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.4, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Patch 2 - center right
    ctx.beginPath();
    ctx.arc(x + radius * 0.4, y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Patch 3 - lower left
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y + radius * 0.5, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Patch 4 - upper right
    ctx.beginPath();
    ctx.arc(x + radius * 0.3, y - radius * 0.3, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle outline
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
}

function drawOrangeCrescent(x, y, opacity = 1.0) {
    // Draw an orange crescent moon shape (similar to yellow crescent but orange)
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const radius = CONFIG.dotRadius * 1.0; // Reduced by 1/3 (was 1.5, now 1.0)
    
    // Draw crescent by drawing a full circle and then a smaller circle to create the crescent shape
    ctx.fillStyle = '#FF8C00'; // Orange color
    
    // Draw the main circle (full moon)
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw a smaller circle offset to create the crescent shape
    // This creates the "shadow" that makes it look like a crescent
    ctx.fillStyle = '#000'; // Black to create the cutout
    ctx.beginPath();
    ctx.arc(x + radius * 0.6, y, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Redraw the main circle outline to make it look cleaner
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
}

function drawComet(x, y, angle, opacity = 1.0) {
    // Draw a comet with a circle head and trailing frilly beard
    // angle: direction the head should point (in radians)
    if (!ctx) return;
    
    ctx.save();
    ctx.globalAlpha = opacity * 0.6; // Translucent (60% opacity)
    
    const headRadius = CONFIG.dotRadius * 0.75;
    const tailLength = headRadius * 3.5; // Length of the frilly beard
    const numFrills = 8; // Number of frilly strands
    
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // Draw frilly beard trailing behind the circle
    ctx.strokeStyle = 'rgba(200, 180, 200, 0.6)'; // Pinkish grey
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    // Draw multiple wavy/frilly strands
    for (let i = 0; i < numFrills; i++) {
        // Distribute frills evenly around the circle (centered on the back)
        const frillAngle = Math.PI + (i / (numFrills - 1) - 0.5) * Math.PI; // Spread across full back half (180 degrees)
        const startX = Math.cos(frillAngle) * headRadius;
        const startY = Math.sin(frillAngle) * headRadius;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Create a wavy/frilly path trailing backward
        const segments = 6;
        for (let j = 1; j <= segments; j++) {
            const t = j / segments;
            const distance = -tailLength * t; // Negative because trailing backward
            // Add waviness with sine wave
            const waveAmplitude = (headRadius * 0.3) * (1 - t * 0.5); // Decreasing amplitude
            const wavePhase = i * 0.5 + t * 3; // Different phase for each frill
            const offsetX = Math.sin(wavePhase) * waveAmplitude;
            const offsetY = Math.cos(wavePhase * 0.7) * waveAmplitude * 0.5;
            
            ctx.lineTo(startX + offsetX, startY + offsetY + distance);
        }
        ctx.stroke();
    }
    
    // Draw head (circle)
    ctx.fillStyle = 'rgba(220, 200, 220, 0.7)'; // Slightly lighter pinkish grey for head
    ctx.beginPath();
    ctx.arc(0, 0, headRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawSpeedText(x, y, vx, vy, opacity = 1.0) {
    // Draw speed (sqrt(vx^2 + vy^2)) next to an object
    if (!ctx) return;
    
    const speed = Math.sqrt(vx * vx + vy * vy);
    const speedText = speed.toFixed(1) + ' px/s';
    
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#ffffff'; // White text
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Position text slightly to the right and above the object
    const offsetX = 15;
    const offsetY = -15;
    ctx.fillText(speedText, x + offsetX, y + offsetY);
    
    ctx.restore();
}
