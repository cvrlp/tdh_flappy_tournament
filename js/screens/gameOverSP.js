// ============================================
// TDH FLAPPY TOURNAMENT — SINGLE PLAYER GAME OVER
// Score display with high score tracking
// ============================================

const GameOverSP = (() => {
    const ctx = Renderer.ctx;
    let data = null;
    let timer = 0;
    let canContinue = false;
    let highScore = 0;
    let isNewHighScore = false;
    let selectedOption = 0;
    const options = ['RETRY', 'MAIN MENU'];

    function enter(goData) {
        data = goData;
        timer = 0;
        canContinue = false;
        selectedOption = 0;
        Audio.stopMusic();

        // High score
        highScore = parseInt(localStorage.getItem(CONFIG.HIGH_SCORE_KEY) || '0', 10);
        isNewHighScore = data.score > highScore;
        if (isNewHighScore) {
            highScore = data.score;
            localStorage.setItem(CONFIG.HIGH_SCORE_KEY, highScore.toString());
        }
    }

    function update(dt) {
        timer += dt;
        if (timer > 1.5) canContinue = true;

        if (canContinue) {
            if (Input.isMenuDown()) {
                selectedOption = (selectedOption + 1) % options.length;
                Audio.menuSelect();
            }
            if (Input.isMenuUp()) {
                selectedOption = (selectedOption - 1 + options.length) % options.length;
                Audio.menuSelect();
            }

            if (Input.isConfirm()) {
                Audio.menuConfirm();
                if (selectedOption === 0) {
                    return {
                        next: CONFIG.STATES.GAMEPLAY,
                        p1: { charId: data.charId, name: data.name },
                        p2: { charId: 0, name: 'CPU' },
                        mode: CONFIG.MODES.SINGLE_PLAYER
                    };
                } else {
                    return { next: CONFIG.STATES.MAIN_MENU };
                }
            }
        }

        Particles.update(dt);
        return null;
    }

    function draw() {
        Background.drawAll();
        Renderer.drawOverlay(0.65);

        const cx = CONFIG.WIDTH / 2;

        Renderer.drawTextOutlined('GAME OVER', cx, 120, 18, '#EF5350', '#000');

        // Bird
        if (data) {
            const char = Characters.getCharacter(data.charId);
            const flapAnim = Math.floor(timer * 3) % 3;
            Characters.drawBird(ctx, char, cx - 25, 160, 50, flapAnim, true);

            Renderer.drawText(data.name, cx, 230, 8, '#FFF', 'center');
        }

        // Score
        Renderer.drawText('SCORE', cx, 265, 7, '#AAA', 'center', false);
        Renderer.drawTextOutlined(data ? data.score.toString() : '0', cx, 295, 24, '#FFD700', '#000');

        // High score
        Renderer.drawText('BEST', cx, 330, 7, '#AAA', 'center', false);
        Renderer.drawText(highScore.toString(), cx, 355, 12, '#4FC3F7', 'center');

        if (isNewHighScore) {
            const glow = Math.sin(timer * 6) * 0.3 + 0.7;
            ctx.globalAlpha = glow;
            Renderer.drawTextOutlined('★ NEW HIGH SCORE! ★', cx, 385, 7, '#FFD700', '#000');
            ctx.globalAlpha = 1;
        }

        Particles.draw();

        // Menu options
        if (canContinue) {
            const menuY = isNewHighScore ? 410 : 395;
            for (let i = 0; i < options.length; i++) {
                const y = menuY + i * 24;
                const selected = i === selectedOption;

                if (selected) {
                    Renderer.drawText('▶', cx - 70, y, 6, '#FFD700', 'center');
                }

                Renderer.drawText(options[i], cx, y, 7, selected ? '#FFD700' : '#888', 'center');
            }
        }

        Renderer.drawCRT();
        Transitions.draw();
    }

    return { enter, update, draw };
})();
