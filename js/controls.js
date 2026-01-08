// UI Controls setup

const gravityControl = document.getElementById('gravityControl');
const gravityValue = document.getElementById('gravityValue');
const greenMassControl = document.getElementById('greenMassControl');
const greenMassValue = document.getElementById('greenMassValue');
const trailLengthControl = document.getElementById('trailLengthControl');
const trailLengthValue = document.getElementById('trailLengthValue');
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

// Set up reset button
resetButton.addEventListener('click', resetSimulation);
