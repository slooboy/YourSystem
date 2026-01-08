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
    } catch (e) {
        console.warn('Error playing guitar sound:', e);
    }
}

// Generate piano sound - random note from C minor chord
function playPianoCSharp() {
    if (!ensureAudioReady()) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
        
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
        const freq = cMinorNotes[Math.floor(Math.random() * cMinorNotes.length)];
        
        // Piano-like sound: use a more complex waveform
        oscillator.type = 'sine';
        const now = audioContext.currentTime;
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Envelope: quick attack, medium decay (piano sound)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02); // Increased volume, quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Medium decay
        
        oscillator.start(now);
        oscillator.stop(now + 0.35); // Medium duration
    } catch (e) {
        console.warn('Error playing piano sound:', e);
    }
}

// Generate violin pizzicato sound - random note from C minor chord, 1 octave below middle C
function playViolinPizzicatoHighE() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        
        // C minor chord notes 1 octave below middle C (C3, Eb3, G3)
        const cMinorNotes = [
            130.81,  // C3
            155.56,  // Eb3
            196.00   // G3
        ];
        
        // Randomly select one note from the chord
        const baseFreq = cMinorNotes[Math.floor(Math.random() * cMinorNotes.length)];
        
        // Create multiple oscillators for richer violin sound
        for (let harmonic = 1; harmonic <= 2; harmonic++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
            
            // Use sine wave for cleaner violin sound, with slight sawtooth for brightness
            oscillator.type = harmonic === 1 ? 'sine' : 'sawtooth';
            oscillator.frequency.setValueAtTime(baseFreq * harmonic, now);
            
            // Envelope: very quick attack, very fast decay (pizzicato pluck)
            const harmonicVolume = 1 / harmonic;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.25 * harmonicVolume, now + 0.003); // Very quick attack
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08); // Very fast decay (pizzicato)
            
            oscillator.start(now);
            oscillator.stop(now + 0.12); // Short duration
        }
    } catch (e) {
        console.warn('Error playing violin sound:', e);
    }
}

// Generate soft organ A minor chord, 2 octaves below middle C, sustained for 1 second
// Rate limited to play no more than once every 10 seconds
function playOrganF2() {
    if (!ensureAudioReady()) return;
    
    // Check rate limiting (must be at least 10 seconds since last play)
    const currentTime = Date.now() / 1000;
    if (lastOrganChordTime && (currentTime - lastOrganChordTime) < 10.0) {
        return; // Skip if less than 10 seconds have passed
    }
    lastOrganChordTime = currentTime;
    
    try {
        const now = audioContext.currentTime;
        
        // A minor chord notes within C3-C6 range (1 octave below to 2 octaves above middle C)
        // A3, C4, E4 (transposed up one octave from original A2, C3, E3)
        const aMinorChord = [
            220.00,  // A3
            261.63,  // C4 (middle C)
            329.63   // E4
        ];
        
        // Play all three notes of the chord simultaneously
        aMinorChord.forEach((freq) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
            
            // Use sine wave for softer organ sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now);
            
            // Envelope: quick attack, sustained for 1 second, gentle decay
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05); // Quick attack, soft volume
            gainNode.gain.setValueAtTime(0.15, now + 0.1); // Sustain
            gainNode.gain.setValueAtTime(0.15, now + 1.0); // Continue sustain for 1 second
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2); // Gentle decay
            
            oscillator.start(now);
            oscillator.stop(now + 1.3); // Total duration ~1.3 seconds
        });
    } catch (e) {
        console.warn('Error playing organ sound:', e);
    }
}

// Generate flute D two octaves above middle C sound (D6 = 1174.66 Hz)
function playFluteD6() {
    if (!ensureAudioReady()) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) gainNode.connect(destination);
        
        // Flute-like sound: use sine wave with slight vibrato
        oscillator.type = 'sine';
        const now = audioContext.currentTime;
        const baseFreq = 1046.50; // C6 (2 octaves above middle C, highest note in range)
        
        // Add subtle vibrato for flute-like character
        const vibratoDepth = 5; // Hz
        const vibratoRate = 5; // Hz (vibrato frequency)
        oscillator.frequency.setValueAtTime(baseFreq, now);
        
        // Create vibrato effect
        for (let t = 0; t < 0.3; t += 0.01) {
            const vibrato = Math.sin(t * vibratoRate * Math.PI * 2) * vibratoDepth;
            oscillator.frequency.setValueAtTime(baseFreq + vibrato, now + t);
        }
        
        // Envelope: gentle attack, sustained, gentle decay (flute sound)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05); // Gentle attack
        gainNode.gain.setValueAtTime(0.4, now + 0.15); // Sustain
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Gentle decay
        
        oscillator.start(now);
        oscillator.stop(now + 0.35); // Medium duration
    } catch (e) {
        console.warn('Error playing flute sound:', e);
    }
}

// Generate breathy fading vocal "waaah" sound at E flat in alto range (Eb4 = 311.13 Hz)
function playBreathyVocalWaaah() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const baseFreq = 311.13; // Eb4 (E flat in alto range)
        
        // Create main oscillator for vocal tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Add a noise source for breathy quality
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.1; // Low amplitude noise
        }
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = audioContext.createGain();
        noiseSource.connect(noiseGain);
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) {
            noiseGain.connect(destination);
            gainNode.connect(destination);
        }
        
        // Use sine wave for vocal-like tone
        oscillator.type = 'sine';
        
        // Add vibrato/wobble for "waaah" effect - frequency modulation
        const vibratoDepth = 8; // Hz
        const vibratoRate = 3; // Hz (vibrato frequency)
        oscillator.frequency.setValueAtTime(baseFreq, now);
        
        // Create vibrato effect for the "waaah" character
        for (let t = 0; t < 0.8; t += 0.01) {
            const vibrato = Math.sin(t * vibratoRate * Math.PI * 2) * vibratoDepth;
            oscillator.frequency.setValueAtTime(baseFreq + vibrato, now + t);
        }
        
        // Envelope: quick attack, sustained, then fading out (breathy vocal)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Quick attack
        gainNode.gain.setValueAtTime(0.3, now + 0.2); // Sustain
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8); // Fading out
        
        // Noise envelope - fades out quickly for breathy quality
        noiseGain.gain.setValueAtTime(0.05, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        oscillator.start(now);
        oscillator.stop(now + 0.85);
        noiseSource.start(now);
        noiseSource.stop(now + 0.5);
    } catch (e) {
        console.warn('Error playing breathy vocal sound:', e);
    }
}

// Generate woodblock clap sound
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
            
            // Use square wave for percussive, sharp attack
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(freq, now);
            
            // Envelope: very quick attack, very fast decay (woodblock clap)
            const volume = 0.3 / (index + 1); // Lower volume for higher frequencies
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.001); // Very quick attack
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Very fast decay
            
            oscillator.start(now);
            oscillator.stop(now + 0.15); // Short duration
        });
    } catch (e) {
        console.warn('Error playing woodblock clap sound:', e);
    }
}

// Generate harmonica E flat below middle C sound (Eb3 = 155.56 Hz)
function playHarmonicaEb3() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const baseFreq = 155.56; // Eb3 (E flat below middle C)
        
        // Create harmonica-like sound with multiple oscillators for richness
        // Harmonica has a characteristic reedy, breathy quality
        for (let harmonic = 1; harmonic <= 3; harmonic++) {
            const freq = baseFreq * harmonic;
            if (freq > 1046.50) break; // Stay within C3-C6 range
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
            
            // Use triangle wave for reedy harmonica sound
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, now);
            
            // Add slight vibrato for harmonica character
            const vibratoDepth = 3; // Hz
            const vibratoRate = 6; // Hz (vibrato frequency)
            for (let t = 0; t < 0.2; t += 0.01) {
                const vibrato = Math.sin(t * vibratoRate * Math.PI * 2) * vibratoDepth;
                oscillator.frequency.setValueAtTime(freq + vibrato, now + t);
            }
            
            // Envelope: quick attack, sustained, medium decay (harmonica)
            const harmonicVolume = 1 / (harmonic * 1.2); // Lower volume for higher harmonics
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.25 * harmonicVolume, now + 0.01); // Quick attack
            gainNode.gain.setValueAtTime(0.25 * harmonicVolume, now + 0.1); // Sustain
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25); // Medium decay
            
            oscillator.start(now);
            oscillator.stop(now + 0.3); // Short to medium duration
        }
    } catch (e) {
        console.warn('Error playing harmonica sound:', e);
    }
}

// Generate low bass thump sound for wall collisions
function playBassThump() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        const baseFreq = 130.81; // C3 (lowest note in range, 1 octave below middle C)
        
        // Create a deep, percussive bass thump
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) gainNode.connect(destination);
        
        // Use sine wave for clean bass tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(baseFreq, now);
        
        // Envelope: very quick attack, fast decay (thump sound)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.001); // Very quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Fast decay
        
        oscillator.start(now);
        oscillator.stop(now + 0.2); // Short duration
    } catch (e) {
        console.warn('Error playing bass thump sound:', e);
    }
}

// Generate breathy "ah" vowel sound for background choral
function playBreathyAh(frequency, duration, volume = 0.05) {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        
        // Create main oscillator for vocal "ah" tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Add noise for breathy quality
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.03; // Low amplitude noise for breathiness
        }
        const noiseSource = audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = audioContext.createGain();
        noiseSource.connect(noiseGain);
        
        oscillator.connect(gainNode);
        const destination = getAudioDestination();
        if (destination) {
            gainNode.connect(destination);
            noiseGain.connect(destination);
        }
        
        // Use sine wave for vocal-like tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, now);
        
        // Add subtle vibrato for natural vocal quality
        const vibratoDepth = 2; // Hz
        const vibratoRate = 4; // Hz
        for (let t = 0; t < duration; t += 0.01) {
            const vibrato = Math.sin(t * vibratoRate * Math.PI * 2) * vibratoDepth;
            oscillator.frequency.setValueAtTime(frequency + vibrato, now + t);
        }
        
        // Envelope: gentle attack, sustained, gentle decay
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.1); // Gentle attack
        gainNode.gain.setValueAtTime(volume, now + duration * 0.7); // Sustain
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Gentle decay
        
        // Noise envelope
        noiseGain.gain.setValueAtTime(volume * 0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        noiseSource.start(now);
        noiseSource.stop(now + duration);
    } catch (e) {
        console.warn('Error playing breathy ah sound:', e);
    }
}

// Background choral system - plays 1-5-3-5-1 chord pattern
let backgroundChoralNextNoteTime = 0;
let backgroundChoralCurrentKey = 'aMinor'; // Start in A minor
let backgroundChoralNoteIndex = 0; // Track which note in the pattern (0-4)
let backgroundChoralPatternStartTime = 0;

// Key definitions: 1-5-3-5-1 pattern (root, fifth, third, fifth, root)
const choralKeys = {
    aMinor: {
        name: 'A Minor',
        notes: [220.00, 329.63, 261.63, 329.63, 220.00] // A3, E4, C4, E4, A3
    },
    cMinor: {
        name: 'C Minor',
        notes: [261.63, 392.00, 311.13, 392.00, 261.63] // C4, G4, Eb4, G4, C4
    },
    dMinor: {
        name: 'D Minor',
        notes: [293.66, 440.00, 349.23, 440.00, 293.66] // D4, A4, F4, A4, D4
    },
    eMinor: {
        name: 'E Minor',
        notes: [329.63, 493.88, 392.00, 493.88, 329.63] // E4, B4, G4, B4, E4
    },
    fMajor: {
        name: 'F Major',
        notes: [349.23, 523.25, 440.00, 523.25, 349.23] // F4, C5, A4, C5, F4
    },
    gMajor: {
        name: 'G Major',
        notes: [392.00, 587.33, 493.88, 587.33, 392.00] // G4, D5, B4, D5, G4
    }
};

const choralKeyNames = Object.keys(choralKeys);

// Update background choral (called from animation loop)
function updateBackgroundChoral(deltaTime) {
    if (audioVolume === 0) {
        backgroundChoralNextNoteTime = 0;
        return;
    }
    
    const currentTime = Date.now() / 1000;
    
    // Initialize timing on first call
    if (backgroundChoralNextNoteTime === 0) {
        backgroundChoralNextNoteTime = currentTime + 0.1; // Start playing shortly after initialization
        backgroundChoralPatternStartTime = currentTime;
    }
    
    // Play continuous choral notes
    if (currentTime >= backgroundChoralNextNoteTime) {
        const key = choralKeys[backgroundChoralCurrentKey];
        const freq = key.notes[backgroundChoralNoteIndex];
        const noteDuration = 1.0; // Duration of each note (longer for continuity)
        
        // Play the current note
        playBreathyAh(freq, noteDuration, 0.03); // Very quiet background volume
        
        // Move to next note in pattern
        backgroundChoralNoteIndex++;
        
        // If pattern is complete (played all 5 notes), immediately start new pattern in new key
        if (backgroundChoralNoteIndex >= 5) {
            backgroundChoralNoteIndex = 0;
            
            // Change to a new random key (avoid repeating the same key)
            let newKeyIndex;
            do {
                newKeyIndex = Math.floor(Math.random() * choralKeyNames.length);
            } while (choralKeyNames[newKeyIndex] === backgroundChoralCurrentKey && choralKeyNames.length > 1);
            backgroundChoralCurrentKey = choralKeyNames[newKeyIndex];
            
            // Start next pattern immediately (no pause for continuity)
            backgroundChoralNextNoteTime = currentTime + 0.1; // Small gap, but pattern starts immediately
        } else {
            // Continue with next note in pattern (overlap notes significantly for continuous sound)
            backgroundChoralNextNoteTime = currentTime + 0.5; // Notes overlap by 0.5 seconds for true continuity
        }
    }
}

// Generate windchime sound (pentatonic scale, ethereal)
function playWindchime() {
    if (!ensureAudioReady()) return;
    
    try {
        const now = audioContext.currentTime;
        
        // Pentatonic scale frequencies (C major pentatonic: C, D, E, G, A)
        // All within C3-C6 range (130.81 - 1046.50 Hz)
        const frequencies = [
            261.63,  // C4 (middle C)
            293.66,  // D4
            329.63,  // E4
            392.00,  // G4
            440.00,  // A4
            523.25,  // C5
            587.33,  // D5
            659.25,  // E5
            783.99,  // G5
            880.00,  // A5
            1046.50  // C6 (highest note in range)
        ];
        
        // Play 3-5 random notes from the scale with slight timing offsets
        const numNotes = Math.floor(Math.random() * 3) + 3; // 3 to 5 notes
        const selectedFreqs = [];
        
        // Randomly select frequencies
        for (let i = 0; i < numNotes; i++) {
            const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
            selectedFreqs.push(randomFreq);
        }
        
        // Play each note with slight delay and different characteristics
        selectedFreqs.forEach((freq, index) => {
            const delay = index * 0.05; // Stagger the notes slightly
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            const destination = getAudioDestination();
            if (destination) gainNode.connect(destination);
            
            // Use sine wave for pure, bell-like tone
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, now + delay);
            
            // Add slight random detuning for more natural windchime effect
            const detune = (Math.random() - 0.5) * 2; // -1 to +1 Hz
            oscillator.frequency.setValueAtTime(freq + detune, now + delay);
            
            // Envelope: quick attack, long sustain, very slow decay (windchime)
            const volume = 0.15 + Math.random() * 0.1; // Slight volume variation
            gainNode.gain.setValueAtTime(0, now + delay);
            gainNode.gain.linearRampToValueAtTime(volume, now + delay + 0.01); // Quick attack
            gainNode.gain.setValueAtTime(volume, now + delay + 0.1); // Sustain
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.0); // Very slow decay
            
            oscillator.start(now + delay);
            oscillator.stop(now + delay + 2.5); // Long duration for windchime
        });
    } catch (e) {
        console.warn('Error playing windchime sound:', e);
    }
}
