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

    // High score key
    HIGH_SCORE_KEY: 'tdh_flappy_highscore',

    // Toggle for CRT effect
    RETRO_MODE: true
};
