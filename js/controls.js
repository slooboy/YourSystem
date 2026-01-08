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
    if (typeof updateMasterVolume === 'function') {
        updateMasterVolume();
    }
    // Start/stop pink noise based on volume
    if (audioVolume > 0) {
        if (typeof startPinkNoise === 'function') {
            startPinkNoise();
        }
    } else {
        if (typeof stopPinkNoise === 'function') {
            stopPinkNoise();
        }
    }
});

// Set up reset button
resetButton.addEventListener('click', resetSimulation);
