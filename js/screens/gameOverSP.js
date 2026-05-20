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
    let currentQuote = null;
    const options = ['RETRY', 'MAIN MENU'];

    // Real quotes about death and falling
    const QUOTES = [
        { text: 'Our greatest glory is not in never falling, but in rising every time we fall.', by: 'Confucius' },
        { text: 'Fall seven times, stand up eight.', by: 'Japanese Proverb' },
        { text: 'Cowards die many times before their deaths; the valiant never taste of death but once.', by: 'Shakespeare' },
        { text: 'To die will be an awfully big adventure.', by: 'J.M. Barrie' },
        { text: 'Death is but the next great adventure.', by: 'J.K. Rowling' },
        { text: 'It is not death that a man should fear, but never beginning to live.', by: 'Marcus Aurelius' },
        { text: 'Do not go gentle into that good night.', by: 'Dylan Thomas' },
        { text: 'Every man dies. Not every man really lives.', by: 'Braveheart' },
        { text: 'Ask not for whom the bell tolls; it tolls for thee.', by: 'John Donne' },
        { text: 'The reports of my death have been greatly exaggerated.', by: 'Mark Twain' },
        { text: 'Death is not the greatest loss in life. The greatest loss is what dies inside us while we live.', by: 'Norman Cousins' },
        { text: 'When you were born you cried and the world rejoiced. Live so that when you die the world cries and you rejoice.', by: 'Cherokee Proverb' },
    ];

    function enter(goData) {
        data = goData;
        timer = 0;
        canContinue = false;
        selectedOption = 0;
        currentQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        Audio.stopMusic();

        // High score (per current difficulty). Capture the best BEFORE recording
        // this run so we can tell whether the run just set a new top score.
        const previousBest = Game.getHighScore();
        Game.recordScore(data.score, data.charId, data.name);
        highScore = Game.getHighScore();
        isNewHighScore = data.score > 0 && data.score > previousBest;
    }

    function update(dt) {
        timer += dt;
        // Tiny debounce so the flap key held at moment of death doesn't auto-confirm.
        if (timer > 0.25) canContinue = true;

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
        Renderer.drawOverlay(0.78);

        const cx = CONFIG.WIDTH / 2;

        // Quote — large, central, immediately visible (no fade-in so retry is instant).
        if (currentQuote) {
            const lines = wrapText(currentQuote.text, 48);
            const lineH = 18;
            const firstLineY = 55;
            lines.forEach((line, i) => {
                Renderer.drawTextOutlined(line, cx, firstLineY + i * lineH, 10, '#FFFFFF', '#000');
            });
            const authorY = firstLineY + lines.length * lineH + 8;
            Renderer.drawText(`— ${currentQuote.by}`, cx, authorY, 8, '#FFD700', 'center', true);
        }

        Renderer.drawTextOutlined('GAME OVER', cx, 175, 14, '#EF5350', '#000');

        // Bird
        if (data) {
            const char = Characters.getCharacter(data.charId);
            const flapAnim = Math.floor(timer * 3) % 3;
            Characters.drawBird(ctx, char, cx - 20, 200, 40, flapAnim, true);

            Renderer.drawText(data.name, cx, 258, 8, '#FFF', 'center');
        }

        // Score
        Renderer.drawText('SCORE', cx, 285, 7, '#AAA', 'center', false);
        Renderer.drawTextOutlined(data ? data.score.toString() : '0', cx, 310, 20, '#FFD700', '#000');

        // High score (label includes difficulty so per-tier bests are clear)
        const diff = CONFIG.DIFFICULTY_PRESETS[Game.getDifficulty()];
        const diffLabel = diff ? diff.label : '';
        Renderer.drawText(`BEST (${diffLabel})`, cx, 340, 7, '#AAA', 'center', false);
        Renderer.drawText(highScore.toString(), cx, 360, 11, diff ? diff.color : '#4FC3F7', 'center');

        if (isNewHighScore) {
            const glow = Math.sin(timer * 6) * 0.3 + 0.7;
            ctx.save();
            ctx.globalAlpha = glow;
            Renderer.drawTextOutlined('★ NEW HIGH SCORE! ★', cx, 385, 7, '#FFD700', '#000');
            ctx.restore();
        }

        Particles.draw();

        // Menu options
        if (canContinue) {
            const menuY = isNewHighScore ? 408 : 400;
            for (let i = 0; i < options.length; i++) {
                const y = menuY + i * 20;
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

    // Word-wrap to keep lines roughly within maxLineChars without breaking words.
    function wrapText(text, maxLineChars) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        for (const w of words) {
            const candidate = line ? line + ' ' + w : w;
            if (candidate.length > maxLineChars && line) {
                lines.push(line);
                line = w;
            } else {
                line = candidate;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    return { enter, update, draw };
})();
