// ============================================
// TDH FLAPPY TOURNAMENT — MAIN GAME LOOP
// State machine, screen transitions, game loop
// ============================================

const Game = (() => {
    let currentState = CONFIG.STATES.MAIN_MENU;
    let gameMode = CONFIG.MODES.MULTIPLAYER;
    let lastTime = 0;

    // Match data persisted between screens
    let matchData = {
        p1: { charId: 0, name: 'P1' },
        p2: { charId: 1, name: 'P2' },
        p1Wins: 0,
        p2Wins: 0,
        currentRound: 1,
        mode: CONFIG.MODES.MULTIPLAYER
    };

    function init() {
        Audio.init();
        Input.init();
        MainMenu.enter();
        requestAnimationFrame(loop);
    }

    function setState(newState, data) {
        currentState = newState;

        switch (newState) {
            case CONFIG.STATES.MAIN_MENU:
                MainMenu.enter();
                break;

            case CONFIG.STATES.CHAR_SELECT:
                if (data && data.mode) gameMode = data.mode;
                Audio.stopMusic();
                CharSelect.enter(gameMode);
                break;

            case CONFIG.STATES.GAMEPLAY:
                if (data && data.continueMatch) {
                    // Continue existing match — next round
                    matchData.p1Wins = data.p1Wins;
                    matchData.p2Wins = data.p2Wins;
                    matchData.currentRound = data.currentRound;
                } else if (data && data.p1) {
                    // New match from char select or rematch
                    matchData.p1 = data.p1;
                    matchData.p2 = data.p2;
                    matchData.mode = data.mode;
                    matchData.p1Wins = 0;
                    matchData.p2Wins = 0;
                    matchData.currentRound = 1;
                    gameMode = data.mode;
                }
                Audio.startGameMusic();
                Gameplay.enter({
                    ...matchData,
                    mode: gameMode
                });
                break;

            case CONFIG.STATES.PAUSE:
                PauseMenu.enter();
                break;

            case CONFIG.STATES.ROUND_END:
                if (data) {
                    matchData.p1Wins = data.p1Wins;
                    matchData.p2Wins = data.p2Wins;
                    matchData.currentRound = data.currentRound;
                }
                RoundEnd.enter(data);
                break;

            case CONFIG.STATES.MATCH_WINNER:
                MatchWinner.enter(data);
                break;

            case CONFIG.STATES.GAME_OVER_SP:
                GameOverSP.enter(data);
                break;
        }
    }

    function transitionTo(newState, data) {
        // Use fade transition for major state changes
        const noTransitionStates = ['RESUME', 'RESTART'];
        if (noTransitionStates.includes(newState)) {
            // Direct state change — no fade
            return false;
        }

        Transitions.start(() => {
            setState(newState, data);
        });
        return true;
    }

    function loop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap delta
        lastTime = timestamp;

        // Update transitions
        Transitions.update(dt);

        // Update current screen (even during transitions for visual continuity)
        let result = null;

        switch (currentState) {
            case CONFIG.STATES.MAIN_MENU:
                Background.update(0.5);
                result = MainMenu.update(dt);
                break;
            case CONFIG.STATES.CHAR_SELECT:
                Background.update(0.5);
                result = CharSelect.update(dt);
                break;
            case CONFIG.STATES.GAMEPLAY:
                result = Gameplay.update(dt);
                break;
            case CONFIG.STATES.PAUSE:
                result = PauseMenu.update(dt);
                break;
            case CONFIG.STATES.ROUND_END:
                result = RoundEnd.update(dt);
                break;
            case CONFIG.STATES.MATCH_WINNER:
                result = MatchWinner.update(dt);
                break;
            case CONFIG.STATES.GAME_OVER_SP:
                result = GameOverSP.update(dt);
                break;
        }

        // Handle state transitions (only if no active transition)
        if (result && !Transitions.isActive()) {
            if (result.next === 'RESUME') {
                // Resume gameplay from pause
                currentState = CONFIG.STATES.GAMEPLAY;
                Audio.startGameMusic();
            } else if (result.next === 'RESTART') {
                // Restart current match
                matchData.p1Wins = 0;
                matchData.p2Wins = 0;
                matchData.currentRound = 1;
                setState(CONFIG.STATES.GAMEPLAY, { continueMatch: false });
            } else {
                // Use transition for other state changes
                transitionTo(result.next, result);
            }
        }

        // Draw current screen
        Renderer.clear();

        switch (currentState) {
            case CONFIG.STATES.MAIN_MENU:
                MainMenu.draw();
                break;
            case CONFIG.STATES.CHAR_SELECT:
                CharSelect.draw();
                break;
            case CONFIG.STATES.GAMEPLAY:
                Gameplay.draw();
                break;
            case CONFIG.STATES.PAUSE:
                Gameplay.draw(); // Draw game underneath
                PauseMenu.draw();
                break;
            case CONFIG.STATES.ROUND_END:
                RoundEnd.draw();
                break;
            case CONFIG.STATES.MATCH_WINNER:
                MatchWinner.draw();
                break;
            case CONFIG.STATES.GAME_OVER_SP:
                GameOverSP.draw();
                break;
        }

        // Draw transition overlay on top of everything
        if (Transitions.isActive()) {
            Transitions.draw();
        }

        // End-of-frame input reset
        Input.endFrame();

        requestAnimationFrame(loop);
    }

    function getState() { return currentState; }

    return { init, getState };
})();

// Global mute toggle (M key) and Retro Mode toggle (V key)
window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        Audio.toggleMute();
    }
    if (e.key === 'v' || e.key === 'V') {
        CONFIG.RETRO_MODE = !CONFIG.RETRO_MODE;
    }
});

// Start the game
Game.init();
