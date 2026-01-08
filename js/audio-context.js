// Audio context initialization and management

let audioContext = null;
let audioInitialized = false;
let masterGainNode = null;

// Make audioContext accessible globally for debugging
window.audioContext = () => audioContext;

// Initialize audio context (must be called after user interaction)
function initAudio() {
    if (audioInitialized && audioContext && audioContext.state === 'running') return;
    
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node for volume control
            masterGainNode = audioContext.createGain();
            masterGainNode.connect(audioContext.destination);
            updateMasterVolume(); // Set initial volume
        }
        
        // Resume audio context if it's suspended (browsers often suspend on page load)
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('Audio context resumed');
                audioInitialized = true;
            }).catch(err => {
                console.warn('Failed to resume audio context:', err);
            });
        } else {
            audioInitialized = true;
        }
    } catch (e) {
        console.warn('Web Audio API not supported:', e);
    }
}

// Update master volume based on audioVolume setting (0-10)
function updateMasterVolume() {
    if (masterGainNode) {
        // Convert 0-10 scale to 0.0-1.0 gain (0 = off, 1-10 = 0.1 to 1.0)
        const gainValue = audioVolume === 0 ? 0 : audioVolume / 10;
        masterGainNode.gain.setValueAtTime(gainValue, audioContext ? audioContext.currentTime : 0);
    }
}

// Get the audio destination (master gain node if available, otherwise direct destination)
function getAudioDestination() {
    if (masterGainNode) {
        return masterGainNode;
    }
    // Fallback to direct destination if master gain not initialized yet
    return audioContext ? audioContext.destination : null;
}

// Helper function to ensure audio context is ready before playing sounds
function ensureAudioReady() {
    if (audioVolume === 0) return false; // Audio is off
    
    if (!audioContext) {
        initAudio();
        return false; // Try to initialize, but skip this sound
    }
    
    // Ensure audio context is running
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    return audioContext.state === 'running';
}
