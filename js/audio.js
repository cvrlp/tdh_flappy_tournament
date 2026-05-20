// ============================================
// TDH FLAPPY TOURNAMENT — CHIPTUNE AUDIO
// Web Audio API procedural sound effects + music
// ============================================

const Audio = (() => {
    let ctx = null;
    let masterGain = null;
    let muted = false;
    let musicGain = null;
    let currentMusic = null;

    function init() {
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.3;
            masterGain.connect(ctx.destination);

            musicGain = ctx.createGain();
            musicGain.gain.value = 0.12;
            musicGain.connect(masterGain);
        } catch (e) {
            console.warn('Web Audio API not available');
        }
    }

    function ensureContext() {
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    function playNote(freq, duration, type = 'square', volume = 0.3, delay = 0) {
        if (!ctx || muted) return;
        ensureContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
    }

    function playNoise(duration, volume = 0.1, delay = 0) {
        if (!ctx || muted) return;
        ensureContext();

        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

        noise.connect(gain);
        gain.connect(masterGain);
        noise.start(ctx.currentTime + delay);
    }

    // Simple chiptune melody player
    function playMelody(notes, bpm, type = 'square', volume = 0.1, loop = false) {
        if (!ctx || muted) return null;
        ensureContext();

        const beatDuration = 60 / bpm;
        let totalDuration = 0;

        for (const note of notes) {
            totalDuration += note.beats * beatDuration;
        }

        function scheduleNotes(startTime) {
            let t = startTime;
            for (const note of notes) {
                const dur = note.beats * beatDuration;
                if (note.freq > 0) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(note.freq, t);
                    gain.gain.setValueAtTime(volume, t);
                    gain.gain.setValueAtTime(volume * 0.8, t + dur * 0.8);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
                    osc.connect(gain);
                    gain.connect(musicGain);
                    osc.start(t);
                    osc.stop(t + dur);
                }
                t += dur;
            }
            return t;
        }

        let handle = null;
        if (loop) {
            let nextStart = ctx.currentTime;
            function scheduleLoop() {
                nextStart = scheduleNotes(nextStart);
                handle = setTimeout(scheduleLoop, (nextStart - ctx.currentTime - 0.1) * 1000);
            }
            scheduleLoop();
            return { stop: () => clearTimeout(handle) };
        } else {
            scheduleNotes(ctx.currentTime);
            return null;
        }
    }

    // Menu music — chill chiptune loop
    const MENU_MELODY = [
        { freq: 330, beats: 1 }, { freq: 392, beats: 1 }, { freq: 523, beats: 2 },
        { freq: 494, beats: 1 }, { freq: 440, beats: 1 }, { freq: 392, beats: 2 },
        { freq: 330, beats: 1 }, { freq: 349, beats: 1 }, { freq: 392, beats: 1 }, { freq: 440, beats: 1 },
        { freq: 523, beats: 2 }, { freq: 494, beats: 1 }, { freq: 440, beats: 1 },
        { freq: 392, beats: 2 }, { freq: 0, beats: 2 },
    ];

    // Gameplay music — faster, more intense
    const GAME_MELODY = [
        { freq: 523, beats: 0.5 }, { freq: 0, beats: 0.5 }, { freq: 523, beats: 0.5 }, { freq: 659, beats: 0.5 },
        { freq: 784, beats: 1 }, { freq: 659, beats: 1 },
        { freq: 523, beats: 0.5 }, { freq: 0, beats: 0.5 }, { freq: 494, beats: 0.5 }, { freq: 523, beats: 0.5 },
        { freq: 440, beats: 1 }, { freq: 0, beats: 1 },
        { freq: 440, beats: 0.5 }, { freq: 0, beats: 0.5 }, { freq: 440, beats: 0.5 }, { freq: 523, beats: 0.5 },
        { freq: 659, beats: 1 }, { freq: 523, beats: 1 },
        { freq: 494, beats: 0.5 }, { freq: 440, beats: 0.5 }, { freq: 392, beats: 0.5 }, { freq: 440, beats: 0.5 },
        { freq: 523, beats: 1 }, { freq: 0, beats: 1 },
    ];

    function stopMusic() {
        if (currentMusic) {
            currentMusic.stop();
            currentMusic = null;
        }
    }

    return {
        init,

        toggleMute() {
            muted = !muted;
            if (muted) stopMusic();
            return muted;
        },

        isMuted() { return muted; },

        startMenuMusic() {
            stopMusic();
            currentMusic = playMelody(MENU_MELODY, 140, 'square', 0.08, true);
        },

        startGameMusic() {
            stopMusic();
            currentMusic = playMelody(GAME_MELODY, 160, 'square', 0.06, true);
        },

        stopMusic,

        // Bird flap — short chirpy blip
        flap() {
            playNote(600, 0.08, 'square', 0.2);
            playNote(800, 0.06, 'square', 0.15, 0.03);
        },

        // Score point — ascending double beep
        score() {
            playNote(523, 0.1, 'square', 0.2);
            playNote(784, 0.15, 'square', 0.25, 0.1);
        },

        // Death crash — descending noise burst
        death() {
            playNote(400, 0.15, 'sawtooth', 0.3);
            playNote(200, 0.2, 'sawtooth', 0.25, 0.1);
            playNote(100, 0.3, 'sawtooth', 0.2, 0.2);
            playNoise(0.3, 0.15, 0.05);
        },

        // Round win — victory fanfare
        roundWin() {
            playNote(523, 0.15, 'square', 0.25);
            playNote(659, 0.15, 'square', 0.25, 0.15);
            playNote(784, 0.15, 'square', 0.25, 0.3);
            playNote(1047, 0.3, 'square', 0.3, 0.45);
        },

        // Match win — extended fanfare
        matchWin() {
            const notes = [523, 523, 659, 784, 784, 659, 784, 1047];
            const durations = [0.1, 0.1, 0.1, 0.15, 0.15, 0.1, 0.15, 0.4];
            let t = 0;
            for (let i = 0; i < notes.length; i++) {
                playNote(notes[i], durations[i], 'square', 0.25, t);
                t += durations[i] + 0.02;
            }
        },

        // Menu select — click
        menuSelect() {
            playNote(440, 0.05, 'square', 0.15);
        },

        // Menu confirm — double blip
        menuConfirm() {
            playNote(880, 0.08, 'square', 0.2);
            playNote(1100, 0.1, 'square', 0.2, 0.08);
        },

        // Countdown beep
        countdownBeep() {
            playNote(440, 0.15, 'square', 0.2);
        },

        // Countdown GO
        countdownGo() {
            playNote(880, 0.2, 'square', 0.3);
            playNote(880, 0.2, 'triangle', 0.2);
        },

        // Menu back
        menuBack() {
            playNote(330, 0.08, 'square', 0.15);
            playNote(220, 0.1, 'square', 0.12, 0.06);
        },

        // Thunder rumble — low-frequency noise + tail
        thunder() {
            playNoise(0.15, 0.4);              // initial crack
            playNote(70, 1.4, 'sawtooth', 0.22, 0.05);  // deep rumble
            playNote(45, 1.6, 'triangle', 0.18, 0.18);  // sub-rumble
            playNoise(1.2, 0.15, 0.25);        // rolling tail
        }
    };
})();
