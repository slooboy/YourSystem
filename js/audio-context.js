// Audio context initialization and master volume control

let audioContext = null;
let masterGainNode = null;

// Initialize audio context (call on user interaction)
function initAudio() {
    if (audioContext) return; // Already initialized
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGainNode = audioContext.createGain();
        masterGainNode.connect(audioContext.destination);
        updateMasterVolume();
        
        // Resume audio context if suspended (required for some browsers)
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                if (typeof startPinkNoise === 'function') {
                    startPinkNoise();
                }
            });
        } else {
            if (typeof startPinkNoise === 'function') {
                startPinkNoise();
            }
        }
    } catch (error) {
        console.error('Error initializing audio context:', error);
    }
}

// Ensure audio is ready (call before playing sounds)
// Note: This will only resume existing audio context, not create one.
// Audio context creation requires user interaction and is handled by initAudio().
function ensureAudioReady() {
    // Don't try to create audio context here - it requires user interaction
    // Just resume if it already exists and is suspended
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(err => {
            // Silently fail - audio will work after user interaction
            console.log('Audio context resume failed (user interaction required):', err);
        });
    }
    return audioContext !== null && audioContext.state === 'running';
}

// Get audio destination (master gain node or direct destination)
function getAudioDestination() {
    if (masterGainNode) {
        return masterGainNode;
    }
    if (audioContext) {
        return audioContext.destination;
    }
    return null;
}

// Update master volume based on audioVolume setting
function updateMasterVolume() {
    if (masterGainNode) {
        // Convert 0-11 scale to 0.0-1.0 gain (0 = off, 1-11 = 0.09 to 1.0)
        const gainValue = audioVolume === 0 ? 0 : audioVolume / 11;
        masterGainNode.gain.setValueAtTime(gainValue, audioContext ? audioContext.currentTime : 0);
    }
    // Also update pink noise volume
    if (typeof updatePinkNoiseVolume === 'function') {
        updatePinkNoiseVolume();
    }
}

// Initialize audio on first user interaction
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });
