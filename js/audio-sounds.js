// Sound generation functions for collision sounds

// Generate guitar pluck sound - random note from C minor chord
function playGuitarDPluck() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        
        // C minor chord notes (C, Eb, G) - can be in different octaves
        const cMinorNotes = [
            130.81,  // C3
            155.56,  // Eb3
            196.00,  // G3
            261.63,  // C4 (middle C)
            311.13,  // Eb4
            392.00,  // G4
            523.25,  // C5
            622.25,  // Eb5
            783.99   // G5
        ];
        
        // Randomly select one note from the chord
        const baseFreq = cMinorNotes[Math.floor(Math.random() * cMinorNotes.length)];
        
        // Create multiple oscillators for richer guitar sound
        // Limit harmonics to stay within C3-C6 range (130.81 - 1046.50 Hz)
        for (let harmonic = 1; harmonic <= 3; harmonic++) {
            const freq = baseFreq * harmonic;
            if (freq > 1046.50) break; // Skip harmonics that exceed C6
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
            
            // Use triangle wave for softer guitar sound
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, now);
            
            // Envelope: very quick attack, fast decay (pluck sound)
            // Higher harmonics decay faster
            // Reduced amplitude by 50% (multiply by 0.5)
            const harmonicVolume = 1 / harmonic;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.15 * harmonicVolume, now + 0.005); // 50% of original (0.3 * 0.5)
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + (harmonic * 0.05)); // Fast decay
            
            oscillator.start(now);
            oscillator.stop(now + 0.2);
        }
    } catch (error) {
        console.error('Error playing guitar pluck:', error);
    }
}

// Piano middle C sharp (C#4 = 277.18 Hz)
function playPianoCSharp() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const freq = 277.18; // C#4 (middle C sharp)
        
        // Create multiple oscillators for richer piano sound
        for (let harmonic = 1; harmonic <= 3; harmonic++) {
            const harmonicFreq = freq * harmonic;
            if (harmonicFreq > 1046.50) break; // C6 limit
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(harmonicFreq, now);
            
            // Piano envelope: quick attack, medium decay
            const harmonicVolume = 1 / harmonic;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2 * harmonicVolume, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        }
    } catch (error) {
        console.error('Error playing piano C#:', error);
    }
}

// Violin pizzicato high E (E5 = 659.25 Hz)
function playViolinPizzicatoHighE() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const freq = 659.25; // E5 (high E)
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) gainNode.connect(destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Pizzicato envelope: very quick attack, very fast decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    } catch (error) {
        console.error('Error playing violin pizzicato:', error);
    }
}

// Organ F 2 octaves below middle C (F2 = 87.31 Hz, but we need C3-C6, so use F3 = 174.61 Hz)
function playOrganF2() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const freq = 174.61; // F3 (within C3-C6 range)
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) gainNode.connect(destination);
        
        oscillator.type = 'square'; // Organ-like sound
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Organ envelope: quick attack, slow release
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        oscillator.start(now);
        oscillator.stop(now + 0.5);
    } catch (error) {
        console.error('Error playing organ F2:', error);
    }
}

// Flute D two octaves above middle C (D6 = 1174.66 Hz, but that's above C6, so use D5 = 587.33 Hz)
function playFluteD6() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const freq = 587.33; // D5 (within C3-C6 range)
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) gainNode.connect(destination);
        
        oscillator.type = 'sine'; // Flute-like sound
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Flute envelope: gentle attack, medium decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        oscillator.start(now);
        oscillator.stop(now + 0.4);
    } catch (error) {
        console.error('Error playing flute D6:', error);
    }
}

// Harmonica E flat below middle C (Eb3 = 155.56 Hz)
function playHarmonicaEb3() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const freq = 155.56; // Eb3
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) gainNode.connect(destination);
        
        oscillator.type = 'triangle'; // Harmonica-like sound
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Harmonica envelope: quick attack, medium decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    } catch (error) {
        console.error('Error playing harmonica Eb3:', error);
    }
}

// Snare tap for left/right wall collisions
function playSnareTap() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const baseFreq = 200.00; // G3 (mid-range for snare, within C3-C6 range)
        
        // Create snare-like sound with multiple oscillators and noise
        // Main snare tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (!destination) return;
        gainNode.connect(destination);
        
        // Use triangle wave for snare-like character
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(baseFreq, now);
        
        // Add noise for snare rattle/ring
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.15; // White noise
        }
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = audioContext.createGain();
        noiseSource.connect(noiseGain);
        noiseGain.connect(destination);
        
        // Envelope: very quick attack, fast decay (snare tap)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.001); // Very quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08); // Fast decay
        
        // Noise envelope - even faster decay
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1); // Short duration
        noiseSource.start(now);
        noiseSource.stop(now + 0.1);
    } catch (e) {
        console.warn('Error playing snare tap sound:', e);
    }
}

// Bass thump for top/bottom wall collisions
function playBassThump() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const freq = 130.81; // C3 (lowest note in range)
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) gainNode.connect(destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Bass thump envelope: quick attack, fast decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    } catch (error) {
        console.error('Error playing bass thump:', error);
    }
}

// Woodblock clap when cloud disappears
function playWoodblockClap() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        
        // Woodblock sound: sharp attack, quick decay, percussive
        // Use a combination of frequencies for a percussive "clap" sound
        // All within C3-C6 range (130.81 - 1046.50 Hz)
        const frequencies = [
            440.00,  // A4 (fundamental)
            880.00,  // A5 (octave)
            1046.50  // C6 (highest note in range, replacing E6)
        ];
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
            
            oscillator.type = 'square'; // Percussive
            oscillator.frequency.setValueAtTime(freq, now);
            
            // Very sharp attack, very quick decay
            const volume = 0.2 / (index + 1); // Lower volume for higher frequencies
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.001);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        });
    } catch (error) {
        console.error('Error playing woodblock clap:', error);
    }
}

// Breathy vocal "waaah" for red-grey collision
function playBreathyVocalWaaah() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const baseFreq = 220.00; // A3 (vocal range)
        
        // Create breathy vocal sound with noise and tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (!destination) return;
        gainNode.connect(destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(baseFreq, now);
        
        // Add breathy noise
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.1; // White noise
        }
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = audioContext.createGain();
        noiseSource.connect(noiseGain);
        noiseGain.connect(destination);
        
        // Vocal envelope: medium attack, medium decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        noiseGain.gain.setValueAtTime(0.1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        noiseSource.start(now);
        noiseSource.stop(now + 0.2);
    } catch (error) {
        console.error('Error playing breathy vocal:', error);
    }
}

// Windchime for antigravity active
function playWindchime() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        
        // Windchime: multiple high frequencies with quick decay
        const frequencies = [
            523.25,  // C5
            587.33,  // D5
            659.25,  // E5
            783.99   // G5
        ];
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now);
            
            // Windchime envelope: quick attack, slow decay
            const delay = index * 0.02; // Slight delay for each chime
            const volume = 0.15 / (index + 1);
            gainNode.gain.setValueAtTime(0, now + delay);
            gainNode.gain.linearRampToValueAtTime(volume, now + delay + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);
            
            oscillator.start(now + delay);
            oscillator.stop(now + delay + 0.5);
        });
    } catch (error) {
        console.error('Error playing windchime:', error);
    }
}

// Tomtom bump for yellow crescent collisions
function playTomtomBump() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        // Tomtom sound: lower frequency, rounder attack, longer decay than snare
        // Use a frequency in the lower-mid range for tomtom character
        const baseFreq = 120.00; // Below C3, but we'll use harmonics within range
        
        // Create tomtom-like sound with multiple oscillators
        // Main tomtom tone (fundamental)
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (!destination) return;
        gainNode.connect(destination);
        
        // Use triangle wave for rounder tomtom character
        oscillator.type = 'triangle';
        // Use a harmonic within range (2nd harmonic of 120Hz = 240Hz, which is within C3-C6)
        oscillator.frequency.setValueAtTime(240.00, now); // C3# (within range)
        
        // Envelope: quick attack, medium decay (tomtom has more sustain than snare)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Medium decay
        
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        
        // Add a second oscillator for depth (lower harmonic)
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(destination);
        
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(180.00, now); // F#3 (within range)
        
        gainNode2.gain.setValueAtTime(0, now);
        gainNode2.gain.linearRampToValueAtTime(0.15, now + 0.01); // Lower volume
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        oscillator2.start(now);
        oscillator2.stop(now + 0.25);
        
    } catch (error) {
        console.error('Error playing tomtom bump:', error);
    }
}

// Background choral system state
let backgroundChoralState = 'resting'; // 'playing', 'fading', 'resting'
let backgroundChoralNextNoteTime = 0;
let backgroundChoralActiveOscillators = [];
let backgroundChoralCurrentKey = 'a'; // 'a' for A minor, 'c' for C major, etc.
let backgroundChoralCycleStartTime = 0;

// Choral chord notes (triads)
const choralChords = {
    'a': { root: 220.00, third: 261.63, fifth: 329.63 }, // A minor: A3, C4, E4
    'c': { root: 261.63, third: 329.63, fifth: 392.00 }, // C major: C4, E4, G4
    'd': { root: 293.66, third: 369.99, fifth: 440.00 }, // D minor: D4, F4, A4
    'e': { root: 329.63, third: 415.30, fifth: 493.88 }, // E minor: E4, G#4, B4
    'f': { root: 349.23, third: 440.00, fifth: 523.25 }, // F major: F4, A4, C5
    'g': { root: 392.00, third: 493.88, fifth: 587.33 }  // G major: G4, B4, D5
};

// Play a choral chord with breathy character
function playChoralChord(chord, duration, volume, variation = 'root') {
    if (!ensureAudioReady()) return;
    
    const now = audioContext.currentTime;
    const notes = [chord.root, chord.third, chord.fifth];
    
    // Apply variation (inversion or augmentation)
    let finalNotes = notes;
    if (variation === 'firstInversion') {
        // First inversion: move root up an octave
        finalNotes = [chord.third, chord.fifth, chord.root * 2];
    } else if (variation === 'secondInversion') {
        // Second inversion: move root and third up an octave
        finalNotes = [chord.fifth, chord.root * 2, chord.third * 2];
    } else if (variation === 'augmented') {
        // Augmented: raise fifth by semitone
        finalNotes = [chord.root, chord.third, chord.fifth * Math.pow(2, 1/12)];
    }
    
    // Ensure all notes are within C3-C6 range
    finalNotes = finalNotes.map(note => {
        while (note > 1046.50) note /= 2;
        while (note < 130.81) note *= 2;
        return note;
    });
    
    const oscillators = [];
    
    finalNotes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) gainNode.connect(destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Add vibrato for choral character
        const vibrato = audioContext.createOscillator();
        const vibratoGain = audioContext.createGain();
        vibrato.type = 'sine';
        vibrato.frequency.setValueAtTime(5, now); // 5 Hz vibrato
        vibratoGain.gain.setValueAtTime(2, now); // 2 Hz modulation depth
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        
        // Add breathy noise
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.05; // Subtle noise
        }
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = audioContext.createGain();
        noiseSource.connect(noiseGain);
        noiseGain.connect(destination);
        
        // Choral envelope: gentle attack, sustain, gentle release
        const noteVolume = volume / (index + 1); // Lower volume for higher notes
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(noteVolume, now + 0.1);
        gainNode.gain.setValueAtTime(noteVolume, now + duration - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        noiseGain.gain.setValueAtTime(0.02, now);
        noiseGain.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        vibrato.start(now);
        vibrato.stop(now + duration);
        noiseSource.start(now);
        noiseSource.stop(now + duration);
        
        oscillators.push({ oscillator, gainNode, vibrato, noiseSource, noiseGain });
    });
    
    backgroundChoralActiveOscillators = oscillators;
}

// Update background choral system
function updateBackgroundChoral(deltaTime) {
    if (!audioContext || audioVolume === 0) {
        if (backgroundChoralState !== 'resting') {
            // Stop all active oscillators
            backgroundChoralActiveOscillators.forEach(osc => {
                try {
                    if (osc.oscillator) osc.oscillator.stop();
                    if (osc.vibrato) osc.vibrato.stop();
                    if (osc.noiseSource) osc.noiseSource.stop();
                } catch (e) {}
            });
            backgroundChoralActiveOscillators = [];
            backgroundChoralState = 'resting';
            backgroundChoralNextNoteTime = 0;
        }
        return;
    }
    
    const currentTime = (Date.now() - startTime) / 1000;
    
    // Initialize cycle start time
    if (backgroundChoralCycleStartTime === 0) {
        backgroundChoralCycleStartTime = currentTime;
    }
    
    const cycleElapsed = currentTime - backgroundChoralCycleStartTime;
    
    if (backgroundChoralState === 'resting') {
        // After 4 second rest, start playing
        if (cycleElapsed >= 4.0) {
            backgroundChoralState = 'playing';
            backgroundChoralNextNoteTime = currentTime;
            backgroundChoralCycleStartTime = currentTime; // Reset cycle
        }
    } else if (backgroundChoralState === 'playing') {
        // Play chords for 30 seconds, then fade out
        if (cycleElapsed >= 30.0) {
            backgroundChoralState = 'fading';
            // Fade out over 1 second
            const fadeStartTime = audioContext.currentTime;
            backgroundChoralActiveOscillators.forEach(osc => {
                if (osc.gainNode) {
                    osc.gainNode.gain.linearRampToValueAtTime(0, fadeStartTime + 1.0);
                }
            });
        } else if (currentTime >= backgroundChoralNextNoteTime) {
            // Time for a new chord
            const chord = choralChords[backgroundChoralCurrentKey];
            const duration = 4 + Math.random() * 3; // 4 to 7 seconds
            const volume = 0.1; // Quiet background
            const variations = ['root', 'firstInversion', 'secondInversion', 'augmented'];
            const variation = variations[Math.floor(Math.random() * variations.length)];
            
            playChoralChord(chord, duration, volume, variation);
            
            // Schedule next chord
            backgroundChoralNextNoteTime = currentTime + duration;
            
            // Occasionally change key
            if (Math.random() < 0.3) {
                const keys = Object.keys(choralChords);
                backgroundChoralCurrentKey = keys[Math.floor(Math.random() * keys.length)];
            }
        }
    } else if (backgroundChoralState === 'fading') {
        // After fade completes, enter rest
        if (cycleElapsed >= 31.0) {
            backgroundChoralState = 'resting';
            backgroundChoralActiveOscillators = [];
            backgroundChoralCycleStartTime = currentTime; // Reset cycle
        }
    }
}

// Pink noise state
let pinkNoiseNode = null;
let pinkNoiseGainNode = null;
let pinkNoiseFilterNode = null;

// Start pink noise background
function startPinkNoise() {
    if (!audioContext || audioVolume === 0) return;
    if (pinkNoiseNode) return; // Already started
    
    try {
        // Create buffer for pink noise
        const bufferSize = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate pink noise (approximation using filtering)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            b6 = white * 0.115926;
            data[i] = pink * 0.11; // Scale down
        }
        
        // Create looped buffer source
        pinkNoiseNode = audioContext.createBufferSource();
        pinkNoiseNode.buffer = buffer;
        pinkNoiseNode.loop = true;
        
        // Create gain node
        pinkNoiseGainNode = audioContext.createGain();
        
        // Create bandpass filter centered at 180 Hz
        pinkNoiseFilterNode = audioContext.createBiquadFilter();
        pinkNoiseFilterNode.type = 'bandpass';
        pinkNoiseFilterNode.frequency.setValueAtTime(180, audioContext.currentTime);
        pinkNoiseFilterNode.Q.setValueAtTime(1, audioContext.currentTime);
        
        // Connect: source -> filter -> gain -> destination
        pinkNoiseNode.connect(pinkNoiseFilterNode);
        pinkNoiseFilterNode.connect(pinkNoiseGainNode);
        pinkNoiseGainNode.connect(getAudioDestination());
        
        // Set volume
        updatePinkNoiseVolume();
        
        // Start playing
        pinkNoiseNode.start(0);
    } catch (error) {
        console.error('Error starting pink noise:', error);
    }
}

// Stop pink noise
function stopPinkNoise() {
    if (pinkNoiseNode) {
        try {
            pinkNoiseNode.stop();
        } catch (e) {}
        pinkNoiseNode = null;
        pinkNoiseGainNode = null;
        pinkNoiseFilterNode = null;
    }
}

// Update pink noise volume
function updatePinkNoiseVolume() {
    if (pinkNoiseGainNode && audioContext) {
        // Pink noise should be very quiet, scaled by master volume
        const baseVolume = 0.02; // Base volume for pink noise
        const volume = audioVolume === 0 ? 0 : (baseVolume * audioVolume / 11);
        pinkNoiseGainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    }
}
