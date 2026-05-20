// ============================================
// TDH FLAPPY TOURNAMENT — SCOREBOARD SCREEN
// Top entries per difficulty: rank, character, name, score
// ============================================

const Scoreboard = (() => {
    const ctx = Renderer.ctx;
    const DIFFICULTIES = ['NORMAL', 'HARD', 'CALAMITY'];
    let animTimer = 0;
    let inputCooldown = 0;

    function enter() {
        animTimer = 0;
        inputCooldown = 0.4;
    }

    function update(dt) {
        animTimer += dt;
        if (inputCooldown > 0) {
            inputCooldown -= dt;
            return null;
        }
        if (Input.isBack() || Input.isConfirm()) {
            Audio.menuBack();
            return { next: CONFIG.STATES.MAIN_MENU };
        }
        return null;
    }

    function draw() {
        Background.drawAll();
        Renderer.drawOverlay(0.6);

        const cx = CONFIG.WIDTH / 2;

        // Title
        Renderer.drawTextOutlined('HIGH SCORES', cx, 40, 18, '#FFD700', '#000');

        // Three columns
        const colW = 230;
        const colGap = 20;
        const totalW = colW * DIFFICULTIES.length + colGap * (DIFFICULTIES.length - 1);
        const startX = (CONFIG.WIDTH - totalW) / 2;
        const colY = 80;
        const colH = 310;

        for (let c = 0; c < DIFFICULTIES.length; c++) {
            const diffId = DIFFICULTIES[c];
            const x = startX + c * (colW + colGap);
            drawColumn(x, colY, colW, colH, diffId);
        }

        // Footer
        Renderer.drawBlinkText('PRESS SPACE/ESC TO RETURN', cx, CONFIG.HEIGHT - 22, 8, '#EEE', 'center', 600);

        Renderer.drawCRT();
        Transitions.draw();
    }

    function drawColumn(x, y, w, h, diffId) {
        const preset = CONFIG.DIFFICULTY_PRESETS[diffId];

        // Column panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = preset.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

        // Header band
        ctx.fillStyle = preset.color;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(x + 2, y + 2, w - 4, 32);
        ctx.globalAlpha = 1;
        Renderer.drawTextOutlined(preset.label, x + w / 2, y + 18, 12, preset.color, '#000');

        // Entries
        const scores = Game.getScores(diffId);
        const ENTRIES = CONFIG.SCOREBOARD_SIZE;
        const rowH = (h - 50) / ENTRIES;
        const firstRowY = y + 50;

        for (let i = 0; i < ENTRIES; i++) {
            const rowY = firstRowY + i * rowH + rowH / 2;
            const entry = scores[i];
            if (entry) {
                drawEntry(x, rowY, w, i + 1, entry, preset.color);
            } else {
                drawEmptyEntry(x, rowY, w, i + 1);
            }
        }
    }

    function drawEntry(colX, y, w, rank, entry, accentColor) {
        const char = Characters.getCharacter(entry.charId) || Characters.getCharacter(0);

        // Rank
        Renderer.drawText(`${rank}.`, colX + 12, y, 8, '#FFD700', 'left');

        // Character portrait (bird sprite, small)
        const birdSize = 24;
        const birdX = colX + 30;
        const birdY = y - birdSize / 2;
        Characters.drawBird(ctx, char, birdX, birdY, birdSize, 1, true, false);

        // Name (uppercased, truncated)
        const name = (entry.name || '?').toString().toUpperCase().slice(0, 10);
        Renderer.drawText(name, colX + 62, y, 8, '#FFF', 'left');

        // Score (right-aligned)
        Renderer.drawText(entry.score.toString(), colX + w - 12, y, 10, accentColor, 'right');
    }

    function drawEmptyEntry(colX, y, w, rank) {
        Renderer.drawText(`${rank}.`, colX + 12, y, 8, '#555', 'left');
        Renderer.drawText('---', colX + 62, y, 8, '#444', 'left', false);
        Renderer.drawText('0', colX + w - 12, y, 10, '#444', 'right', false);
    }

    return { enter, update, draw };
})();
