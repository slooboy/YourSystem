// Global state variables

// Canvas and UI elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const container = document.querySelector('.container');

// Rectangle dimensions - will be set to fill canvas
let rectangleHeight = 300;
let rectangleWidth = 600;
let rectangleX = 0;
let rectangleY = 0;

// Gravitational constant (adjustable)
let G = CONFIG.initialG;

// Mass properties (green mass is adjustable)
let greenMass = CONFIG.initialGreenMass;

// Trail length (adjustable)
let trailLength = CONFIG.initialTrailLength;

// Trail arrays
const trail = []; // red dot 1
const redDot2Trail = []; // red dot 2
const redDot3Trail = []; // red dot 3
const blueTrail = []; // blue dot
const greenTrail = []; // green dot

// Background stars
const stars = []; // array to store star positions and opacities

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
let startTime = Date.now();
