// UI Controls setup

const gravityControl = document.getElementById('gravityControl');
const gravityValue = document.getElementById('gravityValue');
const audioVolumeControl = document.getElementById('audioVolumeControl');
const audioVolumeValue = document.getElementById('audioVolumeValue');
const resetButton = document.getElementById('Button');

// Klingon translations for control labels
const klingonLabels = {
    gravity: "qamDu' mej (G):",
    audioVolume: "Qogh chuq:",
    reset: "choH"
};

// English labels (default)
const englishLabels = {
    gravity: "Gravitational Constant (G):",
    audioVolume: "Audio Volume:",
    reset: "Reset"
};

// Function to set control labels in Klingon or English
function setControlLabels(useKlingon) {
    const labels = useKlingon ? klingonLabels : englishLabels;
    
    const gravityLabel = document.querySelector('label[for="gravityControl"]');
    const audioVolumeLabel = document.querySelector('label[for="audioVolumeControl"]');
    
    if (gravityLabel) gravityLabel.textContent = labels.gravity;
    if (audioVolumeLabel) audioVolumeLabel.textContent = labels.audioVolume;
    if (resetButton) resetButton.textContent = labels.reset;
}

// 1 in 10 chance to use Klingon labels
if (Math.random() < 0.1) {
    setControlLabels(true);
}

// Set initial G value display
gravityValue.textContent = (G / 10000).toFixed(2);

// Set up gravitational constant control
gravityControl.addEventListener('input', function() {
    G = parseFloat(this.value);
    gravityValue.textContent = (G / 10000).toFixed(2);
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
