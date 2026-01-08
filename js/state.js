// Global state variables

// Canvas and UI elements
const canvas = document.getElementById('canvas');
let ctx = null; // Will be initialized when canvas is ready
const timerElement = document.getElementById('timer');
const container = document.querySelector('.container');

// Function to ensure ctx is initialized
function ensureContext() {
    if (!ctx && canvas) {
        ctx = canvas.getContext('2d');
    }
    return ctx !== null;
}

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

// Audio volume (0-11, where 0 is off and 11 is full volume)
let audioVolume = 5;

// Red dots array - each red dot is an object with position, velocity, mass, radius, collision counts, and trail
// Mini-reds also have decayTime and decayTimeThreshold for half-life decay
const redDots = []; // Array of { x, y, vx, vy, mass, radius, blueCollisionCount, greenCollisionCount, trail, fadeInTime, cloudFadeAmount, decayTime, decayTimeThreshold }

// Green dots array - each green dot is an object with position, velocity, trail, antigravity state, and cloud time
const greenDots = []; // Array of { x, y, vx, vy, trail, blueCollisionCount, greenCollisionCount, antigravityActive, antigravityTimeRemaining, cloudTime, wasInCloud }

// Clouds array - each cloud is an object with position, radius, shape data, and mass (clouds don't move)
const clouds = []; // Array of { x, y, radius, puffs, mass, fadeInTime, decayTime, decayTimeThreshold }

// Spontaneous cloud generation timer
let lastSpontaneousCloudTime = 0; // Time since last spontaneous cloud generation
let spontaneousCloudInterval = -20 * Math.log(Math.random()); // Exponential distribution, average 20 seconds

// Spontaneous comet generation timer
let lastSpontaneousCometTime = 0; // Time since last spontaneous comet generation
let spontaneousCometInterval = -24 * Math.log(Math.random()); // Exponential distribution, average 24 seconds

// Yellow crescents array - each crescent is an object with position, velocity, mass, and radius
const yellowCrescents = []; // Array of { x, y, vx, vy, mass, radius, fadeInTime, decayTime, dissolveTime, transformType }

// Orange crescents array - each crescent is an object with position, velocity, mass, and radius
const orangeCrescents = []; // Array of { x, y, vx, vy, mass, radius, fadeInTime, decayTime, fadeOutTime }

// Comets array - each comet is an object with position, velocity, mass, and radius
const comets = []; // Array of { x, y, vx, vy, mass, radius, fadeInTime }

// Earth object - single object that appears at the beginning
let earth = null; // Object with { x, y, vx, vy, mass, radius, fadeInTime }

// Trail arrays for other objects
const blueTrail = []; // blue dot
const earthTrail = []; // earth

// Background stars
const stars = []; // array to store star positions and opacities

// Physics state for blue dot
let blueDotX, blueDotY; // current position
let blueVx, blueVy; // velocity
let blueDotFadeInTime = 0; // Time since creation (for fade-in effect, 0 to 1.0 seconds)

// Blue-green collision counter (for generating clouds)
let blueGreenCollisionCount = 0;

// Blue-green collision counter for antigravity (separate from cloud counter)
let blueGreenAntigravityCount = 0;

// Antigravity state for blue dot
let blueAntigravityActive = false;
let blueAntigravityTimeRemaining = 0; // in seconds (3 seconds total, flashes in last 0.5 seconds)
let blueAntigravityTextTime = -1; // Time remaining for antigravity text display (-1 = not showing, 1.5 = showing, counts down to 0)

// Track time blue dot has spent in clouds (for antigravity activation)
let blueCloudTime = 0; // in seconds

// Track last windchime play time for antigravity sounds
let lastBlueWindchimeTime = 0; // in seconds
const windchimeInterval = 0.4; // Play windchime every 0.4 seconds while antigravity is active

// Track last organ chord play time for rate limiting
let lastOrganChordTime = 0; // in seconds

// Antigravity text display (show up to 2 times, next to objects experiencing antigravity)
let antigravityTextCount = 0; // Count of times antigravity text has been shown (max 2)

// Reset counter (for title language changes)
let resetCount = 0;

// Track last nine languages shown (for ensuring English appears at least every 10 resets)
let lastNineLanguages = ['english', 'english', 'english', 'english', 'english', 'english', 'english', 'english', 'english']; // Initialize with English
let currentLanguageIndex = 0; // Track position in language order for cycling

// Automatic title cycling (independent of resets)
let autoTitleCycleCount = 0; // Counter for automatic title cycles
let lastAutoTitleChangeTime = 0; // Time of last automatic title change
let autoTitleCyclingStarted = false; // Whether automatic cycling has started
let titleUpdateInProgress = false; // Flag to prevent multiple simultaneous title updates

let lastUpdateTime = 0;
let startTime = Date.now();
