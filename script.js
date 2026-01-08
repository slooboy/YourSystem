const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const gravityControl = document.getElementById('gravityControl');
const gravityValue = document.getElementById('gravityValue');
const greenMassControl = document.getElementById('greenMassControl');
const greenMassValue = document.getElementById('greenMassValue');
const container = document.querySelector('.container');

// Set up gravitational constant control
gravityControl.addEventListener('input', function() {
    G = parseFloat(this.value);
    gravityValue.textContent = G;
});

// Set up green mass control
greenMassControl.addEventListener('input', function() {
    greenMass = parseFloat(this.value);
    greenMassValue.textContent = greenMass;
});

// Rectangle dimensions - will be set to fill canvas
let rectangleHeight = 300;
let rectangleWidth = 600;
let rectangleX = 0;
let rectangleY = 0;
const wallThickness = 3;

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

// Dot properties
const dotRadius = 8;
const margin = dotRadius; // Keep dot away from exact edge

// Animation parameters
// To hit each wall once every 5 seconds:
// - Hits top wall at t=0, 20, 40...
// - Hits right wall at t=5, 25, 45...
// - Hits bottom wall at t=10, 30, 50...
// - Hits left wall at t=15, 35, 55...
const wallTime = 1; // seconds per wall
const totalCycleTime = wallTime * 4;

// Gravity: same for all objects (like real world)
const gravity = 0; // pixels per second squared (disabled - no downward gravity)

// Gravitational constant for inter-object attraction
let G = 10000; // gravitational constant (pixels^3 / (mass * second^2))

// Mass properties (affects collisions and gravitational attraction)
const redMass = 1; // base mass
const blueMass = 4; // 4x red dot's mass (doubled)
let greenMass = 8; // 8x red dot's mass (doubled) - adjustable via slider

// Trail properties
const trailLength = 100; // number of positions to store in trail
const trail = []; // array to store trail positions (red dot 1)
const redDot2Trail = []; // array to store red dot 2 trail positions
const redDot3Trail = []; // array to store red dot 3 trail positions
const blueTrail = []; // array to store blue dot trail positions
const greenTrail = []; // array to store green dot trail positions

// Background stars
const stars = []; // array to store star positions and opacities

// Generate random stars
function generateStars() {
    stars.length = 0; // Clear existing stars
    const minX = rectangleX;
    const maxX = rectangleX + rectangleWidth;
    const minY = rectangleY;
    const maxY = rectangleY + rectangleHeight;
    
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: minX + Math.random() * (maxX - minX),
            y: minY + Math.random() * (maxY - minY),
            opacity: 0.3 + Math.random() * 0.7 // opacity between 0.3 and 1.0
        });
    }
}

// Physics state for red dot 1
let dotX, dotY; // current position
let vx, vy; // velocity

// Physics state for red dot 2
let redDot2X, redDot2Y; // current position
let redDot2Vx, redDot2Vy; // velocity

// Physics state for red dot 3
let redDot3X, redDot3Y; // current position
let redDot3Vx, redDot3Vy; // velocity

// Physics state for blue dot
let blueDotX, blueDotY; // current position
let blueVx, blueVy; // velocity

// Physics state for green dot
let greenDotX, greenDotY; // current position
let greenVx, greenVy; // velocity

let lastUpdateTime = 0;

// Initialize red dot position and velocity
function initializeDot() {
    const minX = rectangleX + margin;
    const maxX = rectangleX + rectangleWidth - margin;
    const minY = rectangleY + margin;
    const maxY = rectangleY + rectangleHeight - margin;
    
    // Random position within rectangle bounds
    dotX = minX + Math.random() * (maxX - minX);
    dotY = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    vx = 0;
    vy = 0;
}

// Initialize blue dot position and velocity
function initializeBlueDot() {
    const minX = rectangleX + margin;
    const maxX = rectangleX + rectangleWidth - margin;
    const minY = rectangleY + margin;
    const maxY = rectangleY + rectangleHeight - margin;
    
    // Random position within rectangle bounds
    blueDotX = minX + Math.random() * (maxX - minX);
    blueDotY = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    blueVx = 0;
    blueVy = 0;
}

// Initialize green dot position and velocity
function initializeGreenDot() {
    const minX = rectangleX + margin;
    const maxX = rectangleX + rectangleWidth - margin;
    const minY = rectangleY + margin;
    const maxY = rectangleY + rectangleHeight - margin;
    
    // Random position within rectangle bounds
    greenDotX = minX + Math.random() * (maxX - minX);
    greenDotY = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    greenVx = 0;
    greenVy = 0;
}

// Initialize red dot 2 position and velocity
function initializeRedDot2() {
    const minX = rectangleX + margin;
    const maxX = rectangleX + rectangleWidth - margin;
    const minY = rectangleY + margin;
    const maxY = rectangleY + rectangleHeight - margin;
    
    // Random position within rectangle bounds
    redDot2X = minX + Math.random() * (maxX - minX);
    redDot2Y = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    redDot2Vx = 0;
    redDot2Vy = 0;
}

// Initialize red dot 3 position and velocity
function initializeRedDot3() {
    const minX = rectangleX + margin;
    const maxX = rectangleX + rectangleWidth - margin;
    const minY = rectangleY + margin;
    const maxY = rectangleY + rectangleHeight - margin;
    
    // Random position within rectangle bounds
    redDot3X = minX + Math.random() * (maxX - minX);
    redDot3Y = minY + Math.random() * (maxY - minY);
    
    // Initial velocity: set to 0
    redDot3Vx = 0;
    redDot3Vy = 0;
}

// Reset function to reinitialize all objects
function resetSimulation() {
    // Clear trails
    trail.length = 0;
    redDot2Trail.length = 0;
    redDot3Trail.length = 0;
    blueTrail.length = 0;
    greenTrail.length = 0;
    
    // Reinitialize all objects with random positions
    initializeDot();
    initializeRedDot2();
    initializeRedDot3();
    initializeBlueDot();
    initializeGreenDot();
    
    // Reset timer
    startTime = Date.now();
}

// Set up reset button
const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetSimulation);

initializeDot();
initializeRedDot2();
initializeRedDot3();
initializeBlueDot();
initializeGreenDot();

// Generate background stars
generateStars();

let startTime = Date.now();

function drawSquare() {
    // Fill rectangle with black background (extended to include border area)
    // Since strokeRect draws border centered on edges, extend by wallThickness/2 on each side
    ctx.fillStyle = '#000';
    ctx.fillRect(
        rectangleX - wallThickness / 2, 
        rectangleY - wallThickness / 2, 
        rectangleWidth + wallThickness, 
        rectangleHeight + wallThickness
    );
    
    // Draw rectangle border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = wallThickness;
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
    const radius = dotRadius / 2; // Half size
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
    // Draw moon crescent shape (proper crescent, not eclipse)
    ctx.save();
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    
    // Draw crescent using two arcs
    // Outer arc (left side of crescent)
    ctx.arc(x - dotRadius * 0.3, y, dotRadius, Math.PI * 0.3, Math.PI * 1.7, false);
    // Inner arc (right side of crescent) - connects to form the crescent
    ctx.arc(x + dotRadius * 0.3, y, dotRadius * 0.6, Math.PI * 1.7, Math.PI * 0.3, true);
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawGreenDot(x, y) {
    // Draw 5-pointed star (twice as large)
    ctx.save();
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    
    const outerRadius = dotRadius * 2; // Twice as large
    const innerRadius = dotRadius * 0.8; // Scaled proportionally
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

function updateDotPosition(dotState, dotGravity, deltaTime) {
    const minX = rectangleX + margin;
    const maxX = rectangleX + rectangleWidth - margin;
    const minY = rectangleY + margin;
    const maxY = rectangleY + rectangleHeight - margin;
    
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

function animate() {
    const currentTime = (Date.now() - startTime) / 1000;
    
    // Calculate delta time
    let deltaTime;
    if (lastUpdateTime === 0) {
        deltaTime = 0.016; // ~60fps for first frame
    } else {
        deltaTime = (Date.now() / 1000) - lastUpdateTime;
    }
    lastUpdateTime = Date.now() / 1000;
    
    // Limit deltaTime to prevent large jumps
    deltaTime = Math.min(deltaTime, 0.1);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create state objects for all dots
    const redDotState = { x: dotX, y: dotY, vx: vx, vy: vy };
    const redDot2State = { x: redDot2X, y: redDot2Y, vx: redDot2Vx, vy: redDot2Vy };
    const redDot3State = { x: redDot3X, y: redDot3Y, vx: redDot3Vx, vy: redDot3Vy };
    const blueDotState = { x: blueDotX, y: blueDotY, vx: blueVx, vy: blueVy };
    const greenDotState = { x: greenDotX, y: greenDotY, vx: greenVx, vy: greenVy };
    
    // Apply gravitational forces between all pairs of objects
    applyGravitationalForce(redDotState, redDot2State, redMass, redMass, deltaTime);
    applyGravitationalForce(redDotState, redDot3State, redMass, redMass, deltaTime);
    applyGravitationalForce(redDot2State, redDot3State, redMass, redMass, deltaTime);
    applyGravitationalForce(redDotState, blueDotState, redMass, blueMass, deltaTime);
    applyGravitationalForce(redDot2State, blueDotState, redMass, blueMass, deltaTime);
    applyGravitationalForce(redDot3State, blueDotState, redMass, blueMass, deltaTime);
    applyGravitationalForce(redDotState, greenDotState, redMass, greenMass, deltaTime);
    applyGravitationalForce(redDot2State, greenDotState, redMass, greenMass, deltaTime);
    applyGravitationalForce(redDot3State, greenDotState, redMass, greenMass, deltaTime);
    applyGravitationalForce(blueDotState, greenDotState, blueMass, greenMass, deltaTime);
    
    // Update red dot 1 position using physics
    const redPos = updateDotPosition(redDotState, gravity, deltaTime);
    dotX = redDotState.x;
    dotY = redDotState.y;
    vx = redDotState.vx;
    vy = redDotState.vy;
    
    // Update red dot 2 position using physics
    const redDot2Pos = updateDotPosition(redDot2State, gravity, deltaTime);
    redDot2X = redDot2State.x;
    redDot2Y = redDot2State.y;
    redDot2Vx = redDot2State.vx;
    redDot2Vy = redDot2State.vy;
    
    // Update red dot 3 position using physics
    const redDot3Pos = updateDotPosition(redDot3State, gravity, deltaTime);
    redDot3X = redDot3State.x;
    redDot3Y = redDot3State.y;
    redDot3Vx = redDot3State.vx;
    redDot3Vy = redDot3State.vy;
    
    // Update blue dot position using physics (same gravity for all)
    const bluePos = updateDotPosition(blueDotState, gravity, deltaTime);
    blueDotX = blueDotState.x;
    blueDotY = blueDotState.y;
    blueVx = blueDotState.vx;
    blueVy = blueDotState.vy;
    
    // Update green dot position using physics (same gravity for all)
    const greenPos = updateDotPosition(greenDotState, gravity, deltaTime);
    greenDotX = greenDotState.x;
    greenDotY = greenDotState.y;
    greenVx = greenDotState.vx;
    greenVy = greenDotState.vy;
    
    // Check for collisions between all pairs of dots (with mass-based physics)
    // Radii: red = dotRadius/2, blue = dotRadius, green = dotRadius*2
    const redRadius = dotRadius / 2;
    checkDotCollision(redDotState, redDot2State, redMass, redMass, redRadius, redRadius);
    checkDotCollision(redDotState, redDot3State, redMass, redMass, redRadius, redRadius);
    checkDotCollision(redDot2State, redDot3State, redMass, redMass, redRadius, redRadius);
    checkDotCollision(redDotState, blueDotState, redMass, blueMass, redRadius, dotRadius);
    checkDotCollision(redDot2State, blueDotState, redMass, blueMass, redRadius, dotRadius);
    checkDotCollision(redDot3State, blueDotState, redMass, blueMass, redRadius, dotRadius);
    checkDotCollision(redDotState, greenDotState, redMass, greenMass, redRadius, dotRadius * 2);
    checkDotCollision(redDot2State, greenDotState, redMass, greenMass, redRadius, dotRadius * 2);
    checkDotCollision(redDot3State, greenDotState, redMass, greenMass, redRadius, dotRadius * 2);
    checkDotCollision(blueDotState, greenDotState, blueMass, greenMass, dotRadius, dotRadius * 2);
    
    // Update positions after collision resolution
    dotX = redDotState.x;
    dotY = redDotState.y;
    vx = redDotState.vx;
    vy = redDotState.vy;
    redDot2X = redDot2State.x;
    redDot2Y = redDot2State.y;
    redDot2Vx = redDot2State.vx;
    redDot2Vy = redDot2State.vy;
    redDot3X = redDot3State.x;
    redDot3Y = redDot3State.y;
    redDot3Vx = redDot3State.vx;
    redDot3Vy = redDot3State.vy;
    blueDotX = blueDotState.x;
    blueDotY = blueDotState.y;
    blueVx = blueDotState.vx;
    blueVy = blueDotState.vy;
    greenDotX = greenDotState.x;
    greenDotY = greenDotState.y;
    greenVx = greenDotState.vx;
    greenVy = greenDotState.vy;
    
    // Add current positions to trails (use state values after collision)
    trail.push({ x: redDotState.x, y: redDotState.y });
    redDot2Trail.push({ x: redDot2State.x, y: redDot2State.y });
    redDot3Trail.push({ x: redDot3State.x, y: redDot3State.y });
    blueTrail.push({ x: blueDotState.x, y: blueDotState.y });
    greenTrail.push({ x: greenDotState.x, y: greenDotState.y });
    
    // Limit trail lengths
    if (trail.length > trailLength) {
        trail.shift(); // remove oldest position
    }
    if (redDot2Trail.length > trailLength) {
        redDot2Trail.shift(); // remove oldest position
    }
    if (redDot3Trail.length > trailLength) {
        redDot3Trail.shift(); // remove oldest position
    }
    if (blueTrail.length > trailLength) {
        blueTrail.shift(); // remove oldest position
    }
    if (greenTrail.length > trailLength) {
        greenTrail.shift(); // remove oldest position
    }
    
    // Update timer display
    timerElement.textContent = `Time: ${currentTime.toFixed(1)}s | Red: (${vx.toFixed(1)}, ${vy.toFixed(1)}) | Blue: (${blueVx.toFixed(1)}, ${blueVy.toFixed(1)}) | Green: (${greenVx.toFixed(1)}, ${greenVy.toFixed(1)})`;
    
    // Draw
    drawSquare(); // Draws black background and border
    drawStars(); // Draw stars on black background
    drawTrail(trail, 'rgba(150, 150, 150, 0.4)'); // red dot 1 trail (light grey)
    drawTrail(redDot2Trail, 'rgba(150, 150, 150, 0.4)'); // red dot 2 trail (light grey)
    drawTrail(redDot3Trail, 'rgba(150, 150, 150, 0.4)'); // red dot 3 trail (light grey)
    drawTrail(blueTrail, 'rgba(52, 152, 219, 0.4)'); // blue dot trail (light blue, translucent)
    drawTrail(greenTrail, 'rgba(46, 204, 113, 0.4)'); // green dot trail (light green, translucent)
    drawDot(redDotState.x, redDotState.y);
    drawDot(redDot2State.x, redDot2State.y);
    drawDot(redDot3State.x, redDot3State.y);
    drawBlueDot(blueDotState.x, blueDotState.y);
    drawGreenDot(greenDotState.x, greenDotState.y);
    
    requestAnimationFrame(animate);
}

// Start animation
animate();
