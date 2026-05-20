// ============================================
// TDH FLAPPY TOURNAMENT — GAME CONFIGURATION
// ============================================

const CONFIG = {
    // Canvas internal resolution — widescreen for PC
    WIDTH: 800,
    HEIGHT: 450,

    // Game states
    STATES: {
        MAIN_MENU: 'MAIN_MENU',
        DIFFICULTY_SELECT: 'DIFFICULTY_SELECT',
        SCOREBOARD: 'SCOREBOARD',
        CHAR_SELECT: 'CHAR_SELECT',
        GAMEPLAY: 'GAMEPLAY',
        PAUSE: 'PAUSE',
        ROUND_END: 'ROUND_END',
        MATCH_WINNER: 'MATCH_WINNER',
        GAME_OVER_SP: 'GAME_OVER_SP'
    },

    // Game modes
    MODES: {
        SINGLE_PLAYER: 'SINGLE_PLAYER',
        MULTIPLAYER: 'MULTIPLAYER'
    },

    // Difficulty IDs
    DIFFICULTIES: {
        NORMAL:   'NORMAL',
        HARD:     'HARD',
        CALAMITY: 'CALAMITY'
    },

    // Physics
    GRAVITY: 0.38,
    JUMP_VELOCITY: -6.5,
    TERMINAL_VELOCITY: 9,
    BIRD_SIZE: 30,
    BIRD_HITBOX_SHRINK: 4, // pixels smaller than visual for fairness

    // Bird positions (x-axis) for PvP — staggered to prevent overlap
    BIRD_X_P1: 180,
    BIRD_X_P2: 260,
    BIRD_X_SP: 200, // single player

    // Pipes
    PIPE_WIDTH: 56,
    PIPE_GAP: 130,         // starting gap (shorter height = smaller gap)
    PIPE_GAP_MIN: 75,      // minimum gap (max difficulty)
    PIPE_SPEED: 2.8,       // starting speed
    PIPE_SPEED_MAX: 5.5,   // maximum speed
    PIPE_SPAWN_DIST: 240,  // distance between pipes
    PIPE_MIN_HEIGHT: 45,   // minimum pipe height from edge

    // Difficulty scaling
    DIFFICULTY_INTERVAL: 5,  // scale every N points
    GAP_SHRINK_AMOUNT: 4,    // pixels per interval
    SPEED_INCREASE: 0.2,     // speed per interval

    // Moving pipes (oscillate vertically once difficulty ramps)
    PIPE_OSC_START_LEVEL: 4,      // first difficulty level that produces moving pipes (score >= START_LEVEL * DIFFICULTY_INTERVAL)
    PIPE_OSC_AMPLITUDE_STEP: 8,   // px added to amplitude per level beyond start
    PIPE_OSC_AMPLITUDE_MAX: 40,   // hard cap on px amplitude
    PIPE_OSC_FREQ: 1.5,           // radians/sec — how fast pipes wobble

    // Day/night cycle
    DAY_NIGHT_PERIOD_SEC: 120,    // full cycle length (day → dusk → night → dawn → day)
    PALETTE_DAY:   { skyTop: '#4ec5f1', skyBottom: '#87CEEB', ground: '#8B7355', groundDark: '#6B5335' },
    PALETTE_DUSK:  { skyTop: '#ff7e5f', skyBottom: '#feb47b', ground: '#5d4037', groundDark: '#3e2723' },
    PALETTE_NIGHT: { skyTop: '#0d1421', skyBottom: '#1a1a2e', ground: '#1f1f2e', groundDark: '#0f0f1c' },
    PALETTE_DAWN:  { skyTop: '#7e57c2', skyBottom: '#ffab91', ground: '#6d4c41', groundDark: '#4e342e' },
    PALETTE_STORM:      { skyTop: '#1e2024', skyBottom: '#0b0c0f', ground: '#2a1b15', groundDark: '#100806' },
    PALETTE_BLOOD_MOON: { skyTop: '#2a0e10', skyBottom: '#150506', ground: '#3a1410', groundDark: '#1d0808' },
    PALETTE_ASHFALL:    { skyTop: '#2a1812', skyBottom: '#13080a', ground: '#221208', groundDark: '#0d0604' },
    PALETTE_ECLIPSE:    { skyTop: '#08080f', skyBottom: '#020207', ground: '#181822', groundDark: '#08080e' },

    // Rounds
    ROUNDS_TO_WIN: 2,

    // Countdown
    COUNTDOWN_DURATION: 3, // seconds

    // Colors
    COLORS: {
        SKY_TOP: '#4ec5f1',
        SKY_BOTTOM: '#87CEEB',
        GROUND: '#8B7355',
        GROUND_DARK: '#6B5335',
        GROUND_STRIPE: '#9B8365',
        PIPE_GREEN: '#4CAF50',
        PIPE_GREEN_LIGHT: '#66BB6A',
        PIPE_GREEN_DARK: '#388E3C',
        PIPE_BORDER: '#2E7D32',
        TEXT_WHITE: '#FFFFFF',
        TEXT_SHADOW: '#000000',
        TEXT_GOLD: '#FFD700',
        TEXT_CYAN: '#00FFFF',
        P1_COLOR: '#4FC3F7',
        P2_COLOR: '#EF5350',
        OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',
        OVERLAY_MEDIUM: 'rgba(0, 0, 0, 0.5)',
    },

    // Ground
    GROUND_HEIGHT: 50,

    // UI
    MENU_BLINK_SPEED: 500, // ms

    // Scoreboard storage — JSON arrays of { score, charId, name } per difficulty.
    SCORES_KEY_PREFIX: 'tdh_flappy_scores_',
    SCOREBOARD_SIZE: 5,
    // Legacy storage keys cleared on startup so old shapes can't bleed into
    // the new {score, charId, name} scoreboard.
    LEGACY_HIGH_SCORE_KEY: 'tdh_flappy_highscore',
    LEGACY_HIGHSCORE_PREFIX: 'tdh_flappy_highscore_',

    // Toggle for CRT effect
    RETRO_MODE: true,

    // Per-difficulty presets. Game.activeDifficulty selects which is in use.
    // NORMAL = pre-day/night, no moving pipes (classic).
    // HARD   = current default (moving pipes after lvl 4, day/night cycle).
    // CALAMITY = faster + earlier moving pipes + faster day/night, still beatable.
    DIFFICULTY_PRESETS: {
        NORMAL: {
            label: 'NORMAL',
            color: '#4CAF50',
            tagline: 'CLASSIC FLAPPY',
            pipeSpeed: 2.8,
            pipeSpeedMax: 5.5,
            pipeGap: 130,
            pipeGapMin: 75,
            pipeSpawnDist: 240,
            speedIncrease: 0.2,
            gapShrink: 4,
            movingPipes: false,
            oscStartLevel: 999,
            oscAmpStep: 0,
            oscAmpMax: 0,
            oscFreq: 0,
            dayNight: false,
            dayNightPeriod: 0
        },
        HARD: {
            label: 'HARD',
            color: '#FFD700',
            tagline: 'MOVING PIPES + DAY/NIGHT',
            pipeSpeed: 3.2,
            pipeSpeedMax: 6.2,
            pipeGap: 130,
            pipeGapMin: 75,
            pipeSpawnDist: 240,
            speedIncrease: 0.22,
            gapShrink: 4,
            movingPipes: true,
            oscStartLevel: 4,
            oscAmpStep: 8,
            oscAmpMax: 40,
            oscFreq: 1.5,
            dayNight: true,
            dayNightPeriod: 120
        },
        CALAMITY: {
            label: 'CALAMITY',
            color: '#FF3D3D',
            tagline: 'ABANDON ALL HOPE',
            pipeSpeed: 3.8,
            pipeSpeedMax: 7.2,
            pipeGap: 120,
            pipeGapMin: 70,
            pipeSpawnDist: 215,
            speedIncrease: 0.28,
            gapShrink: 5,
            movingPipes: true,
            oscStartLevel: 2,
            oscAmpStep: 10,
            oscAmpMax: 55,
            oscFreq: 2.0,
            dayNight: false,            // weather rotation replaces day/night
            dayNightPeriod: 0,
            weather: 'calamity',         // rotates 4 conditions (storm, blood moon, ashfall, eclipse)
            weatherDuration: 28,         // seconds per condition
            weatherTransition: 4,        // crossfade window into the next condition
            lightningChancePerSec: 0.45  // only fires during STORM phase
        }
    }
};
