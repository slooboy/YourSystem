// UI Controls setup

const gravityControl = document.getElementById('gravityControl');
const gravityValue = document.getElementById('gravityValue');
const greenMassControl = document.getElementById('greenMassControl');
const greenMassValue = document.getElementById('greenMassValue');
const trailLengthControl = document.getElementById('trailLengthControl');
const trailLengthValue = document.getElementById('trailLengthValue');
const audioVolumeControl = document.getElementById('audioVolumeControl');
const audioVolumeValue = document.getElementById('audioVolumeValue');
const resetButton = document.getElementById('resetButton');

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

// Set up trail length control
trailLengthControl.addEventListener('input', function() {
    trailLength = parseFloat(this.value);
    trailLengthValue.textContent = trailLength;
});

// Set up audio volume control
audioVolumeControl.addEventListener('input', function() {
    audioVolume = parseInt(this.value);
    audioVolumeValue.textContent = audioVolume;
    updateMasterVolume(); // Update master gain node volume
    // Initialize audio if volume > 0 and not already initialized
    if (audioVolume > 0) {
        initAudio();
    }
});

// Set up reset button
resetButton.addEventListener('click', function() {
    initAudio(); // Initialize audio on first user interaction
    resetSimulation();
});

// Initialize audio on canvas click (user interaction required for Web Audio API)
canvas.addEventListener('click', function() {
    initAudio();
    // Test sound on first click to verify audio works
    if (audioContext && audioContext.state === 'running') {
        setTimeout(() => playGuitarDPluck(), 100);
    }
});
canvas.addEventListener('touchstart', initAudio);

// Also try to initialize on any user interaction
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });
