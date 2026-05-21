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
        { text: 'Sige na, ako na', by: 'Jemuel Jason O.' },
        { text: 'Ang umaayaw ay hindi nag wawagi', by: 'Allan A.' },
        { text: 'With great power, comes great responsibility', by: 'Spider Man' },
        { text: 'HAHAHAHAHA', by: 'Marvin Jhay T.' },
        { text: 'Pogi ako', by: 'Oswald Lester A.' },
        { text: 'Hindi nyo dapat ginagawang joke ang trauma', by: 'A\u00b2ron P.' },
        { text: 'Bakal ako', by: 'Dev_Kyle12' },
        { text: 'Di pre medyo nakakabastos din kasi yung gif tas wala pa consent niya', by: 'Christiann Marc D.' },
        { text: 'Ngayon lang ako napikon', by: 'Oshy ko' },
        { text: 'Minsan mga sir kasi sumusobra pabibo natin eh. Minsan isip muna tayo bago magsend. yun lang po salamat.', by: 'Oshuwaru Ambatsu' },
        { text: 'Sikuhin kita sa mata!', by: 'John Christopher S. tagapagligtas' },
        { text: 'Baka po may nakalimot po sa sa bayad po hopia', by: 'Crystel Dianne B. / Jasmine T.' },
        { text: 'Be the change to say the word', by: 'Miguellito P.' },
        { text: 'Buntis ka lang, hindi ka baldado', by: 'Marc Jerdyzxc M.' },
        { text: 'Napupuno pero di nabubusog', by: 'Boss Cha' },
        { text: 'Sino tumae sa 3rd floor?', by: 'Jann Eliezar F.' },

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
