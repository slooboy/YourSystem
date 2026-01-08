// Drawing functions

function drawSquare() {
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
}

function drawStars() {
    ctx.save();
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
    }
    ctx.restore();
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

function drawDot(x, y) {
    const radius = CONFIG.dotRadius / 2; // Half size
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a highlight
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - radius * 0.4, y - radius * 0.4, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
}

function drawBlueDot(x, y) {
    // Draw Saturn-like planet with rings seen at an angle
    ctx.save();
    
    const planetRadius = CONFIG.dotRadius;
    const ringWidth = planetRadius * 0.15; // Thickness of the rings
    const ringOuterRadius = planetRadius * 1.8; // Outer edge of rings
    const ringInnerRadius = planetRadius * 1.2; // Inner edge of rings
    const ringTilt = Math.PI / 6; // 30 degree tilt angle
    
    // Draw rings first (so planet appears in front)
    ctx.strokeStyle = '#3498db';
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
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(x, y, planetRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a highlight to the planet
    ctx.fillStyle = '#5dade2';
    ctx.beginPath();
    ctx.arc(x - planetRadius * 0.3, y - planetRadius * 0.3, planetRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawGreenDot(x, y) {
    // Draw 5-pointed star (twice as large)
    ctx.save();
    ctx.fillStyle = '#2ecc71';
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

// Generate random stars
function generateStars() {
    stars.length = 0; // Clear existing stars
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
