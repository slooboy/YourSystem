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

// Audio volume (0-10, where 0 is off and 10 is full volume)
let audioVolume = 1;

// Red dots array - each red dot is an object with position, velocity, mass, radius, collision counts, and trail
const redDots = []; // Array of { x, y, vx, vy, mass, radius, blueCollisionCount, greenCollisionCount, trail }

// Green dots array - each green dot is an object with position, velocity, trail, antigravity state, and cloud time
const greenDots = []; // Array of { x, y, vx, vy, trail, blueCollisionCount, antigravityActive, antigravityTimeRemaining, cloudTime }

// Clouds array - each cloud is an object with position, radius, and shape data (clouds don't move)
const clouds = []; // Array of { x, y, radius, puffs }

// Trail arrays for other objects
const blueTrail = []; // blue dot

// Background stars
const stars = []; // array to store star positions and opacities

// Physics state for blue dot
let blueDotX, blueDotY; // current position
let blueVx, blueVy; // velocity

// Blue-green collision counter (for generating clouds)
let blueGreenCollisionCount = 0;

// Blue-green collision counter for antigravity (separate from cloud counter)
let blueGreenAntigravityCount = 0;

// Antigravity state for blue dot
let blueAntigravityActive = false;
let blueAntigravityTimeRemaining = 0; // in seconds (3 seconds total, flashes in last 0.5 seconds)

// Track time blue dot has spent in clouds (for antigravity activation)
let blueCloudTime = 0; // in seconds

// Track last windchime play time for antigravity sounds
let lastBlueWindchimeTime = 0; // in seconds
const windchimeInterval = 0.4; // Play windchime every 0.4 seconds while antigravity is active

// Track last organ chord play time for rate limiting
let lastOrganChordTime = 0; // in seconds

// Reset counter (for title language changes)
let resetCount = 0;

// Track last two languages shown (for ensuring English appears at least every 3 resets)
let lastTwoLanguages = ['english', 'english']; // Initialize with English
let currentLanguageIndex = 0; // Track position in language order for cycling

let lastUpdateTime = 0;
let startTime = Date.now();
