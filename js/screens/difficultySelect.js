// ============================================
// TDH FLAPPY TOURNAMENT — DIFFICULTY SELECT
// Pick NORMAL / HARD / CALAMITY between mode and char select
// ============================================

const DifficultySelect = (() => {
    const ctx = Renderer.ctx;
    const ORDER = ['NORMAL', 'HARD', 'CALAMITY'];

    let mode = CONFIG.MODES.MULTIPLAYER;
    let selectedIndex = 1; // default to HARD
    let animTimer = 0;
    let inputCooldown = 0;

    function enter(gameMode) {
        mode = gameMode || CONFIG.MODES.MULTIPLAYER;
        selectedIndex = 1; // HARD by default
        animTimer = 0;
        inputCooldown = 0.5;
    }

    function update(dt) {
        animTimer += dt;

        if (inputCooldown > 0) {
            inputCooldown -= dt;
            return null;
        }

        if (Input.isBack()) {
            Audio.menuBack();
            return { next: CONFIG.STATES.MAIN_MENU };
        }

        if (Input.isMenuDown() || Input.isMenuRight(0) || Input.isMenuRight(1)) {
            selectedIndex = (selectedIndex + 1) % ORDER.length;
            Audio.menuSelect();
        }
        if (Input.isMenuUp() || Input.isMenuLeft(0) || Input.isMenuLeft(1)) {
            selectedIndex = (selectedIndex - 1 + ORDER.length) % ORDER.length;
            Audio.menuSelect();
        }

        if (Input.isConfirm()) {
            Audio.menuConfirm();
            return {
                next: CONFIG.STATES.CHAR_SELECT,
                mode: mode,
                difficulty: ORDER[selectedIndex]
            };
        }

        return null;
    }

    function draw() {
        Background.drawAll();
        Renderer.drawOverlay(0.55);

        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        // Title
        Renderer.drawTextOutlined('SELECT DIFFICULTY', cx, 60, 14, '#FFD700', '#000');
        Renderer.drawText(mode === CONFIG.MODES.MULTIPLAYER ? 'VS MODE' : 'SOLO MODE',
            cx, 88, 8, '#AAA', 'center', false);

        // Three difficulty cards
        const cardW = 200;
        const cardH = 200;
        const cardGap = 24;
        const totalW = cardW * 3 + cardGap * 2;
        const startX = (CONFIG.WIDTH - totalW) / 2;
        const cardY = cy - cardH / 2 + 10;

        for (let i = 0; i < ORDER.length; i++) {
            const key = ORDER[i];
            const preset = CONFIG.DIFFICULTY_PRESETS[key];
            const x = startX + i * (cardW + cardGap);
            const selected = i === selectedIndex;
            drawCard(x, cardY, cardW, cardH, preset, selected, key);
        }

        // Controls hint
        Renderer.drawText('A/D or ◀/▶ TO SELECT', cx, CONFIG.HEIGHT - 48, 8, '#FFF', 'center', false);
        Renderer.drawBlinkText('PRESS SPACE/ENTER TO CONFIRM', cx, CONFIG.HEIGHT - 30, 8, '#EEE', 'center', 600);
        Renderer.drawText('ESC/BACKSPACE=BACK', cx, CONFIG.HEIGHT - 14, 7, '#AAA', 'center', false);

        Renderer.drawCRT();
        Transitions.draw();
    }

    function drawCard(x, y, w, h, preset, selected, difficultyKey) {
        // Card background
        ctx.fillStyle = selected ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)';
        ctx.fillRect(x, y, w, h);

        // Pulsing border when selected
        if (selected) {
            const pulse = Math.sin(animTimer * 4) * 0.3 + 0.7;
            ctx.save();
            ctx.shadowColor = preset.color;
            ctx.shadowBlur = 16 * pulse;
            ctx.strokeStyle = preset.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
        } else {
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
        }

        const ccx = x + w / 2;

        // Label
        Renderer.drawTextOutlined(preset.label, ccx, y + 26, 16, preset.color, '#000');

        // Tagline
        Renderer.drawText(preset.tagline, ccx, y + 50, 6, '#CCC', 'center', false);

        // Stats
        const statY = y + 76;
        const statSize = 6;
        Renderer.drawText(`SPEED ${preset.pipeSpeed.toFixed(1)} → ${preset.pipeSpeedMax.toFixed(1)}`,
            ccx, statY, statSize, '#FFF', 'center', false);
        Renderer.drawText(`GAP   ${preset.pipeGap} → ${preset.pipeGapMin}`,
            ccx, statY + 14, statSize, '#FFF', 'center', false);
        Renderer.drawText(preset.movingPipes ? 'MOVING PIPES: YES' : 'MOVING PIPES: NO',
            ccx, statY + 28, statSize, preset.movingPipes ? preset.color : '#888', 'center', false);
        let weatherLabel = 'WEATHER: CLEAR';
        let weatherActive = false;
        if (preset.weather === 'calamity') { weatherLabel = 'WEATHER: ROTATING'; weatherActive = true; }
        else if (preset.dayNight) { weatherLabel = 'WEATHER: DAY/NIGHT'; weatherActive = true; }
        Renderer.drawText(weatherLabel,
            ccx, statY + 42, statSize, weatherActive ? preset.color : '#888', 'center', false);

        // Best score (per-difficulty, single-player only)
        const best = Game.getHighScore(difficultyKey);
        Renderer.drawText(`BEST: ${best}`,
            ccx, statY + 60, statSize, best > 0 ? preset.color : '#888', 'center', false);

        // Threat dots (1-3)
        const dotCount = preset.label === 'NORMAL' ? 1 : preset.label === 'HARD' ? 2 : 3;
        const dotY = y + h - 22;
        const dotSpacing = 14;
        const dotStart = ccx - ((dotCount - 1) * dotSpacing) / 2;
        for (let d = 0; d < 3; d++) {
            const dx = ccx - dotSpacing + d * dotSpacing;
            if (d < dotCount) {
                ctx.fillStyle = preset.color;
                ctx.beginPath();
                ctx.arc(dx, dotY, 4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(dx, dotY, 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Selection arrow
        if (selected) {
            const bounce = Math.sin(animTimer * 5) * 2;
            Renderer.drawText('▼', ccx, y - 10 + bounce, 10, preset.color, 'center');
        }
    }

    return { enter, update, draw };
})();
