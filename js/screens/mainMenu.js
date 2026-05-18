// ============================================
// TDH FLAPPY TOURNAMENT — MAIN MENU SCREEN
// Title screen with mode selection (widescreen)
// ============================================

const MainMenu = (() => {
    const ctx = Renderer.ctx;
    let selectedIndex = 0;
    const options = ['VS MODE', 'SOLO MODE'];
    let animTimer = 0;
    let titleBounce = 0;
    let musicStarted = false;
    let inputCooldown = 0; // Prevents auto-selection from previous screen

    function enter() {
        selectedIndex = 0;
        animTimer = 0;
        musicStarted = false;
        inputCooldown = 0.5; // Ignore inputs for 0.5s after entering
    }

    function update(dt) {
        animTimer += dt;
        titleBounce = Math.sin(animTimer * 2) * 3;

        // Input cooldown — prevent carryover from previous screen
        if (inputCooldown > 0) {
            inputCooldown -= dt;
            return null;
        }

        // Start menu music after cooldown
        if (!musicStarted) {
            Audio.startMenuMusic();
            musicStarted = true;
        }

        if (Input.isMenuDown()) {
            selectedIndex = (selectedIndex + 1) % options.length;
            Audio.menuSelect();
        }
        if (Input.isMenuUp()) {
            selectedIndex = (selectedIndex - 1 + options.length) % options.length;
            Audio.menuSelect();
        }

        if (Input.isConfirm()) {
            Audio.menuConfirm();
            if (selectedIndex === 0) {
                return { next: CONFIG.STATES.CHAR_SELECT, mode: CONFIG.MODES.MULTIPLAYER };
            } else {
                return { next: CONFIG.STATES.CHAR_SELECT, mode: CONFIG.MODES.SINGLE_PLAYER };
            }
        }

        return null;
    }

    function draw() {
        Background.drawAll();
        Renderer.drawOverlay(0.3);

        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        // TDH text
        Renderer.drawTextOutlined('TDH', cx, cy - 110 + titleBounce, 16, '#FFFFFF', '#000');

        // FLAPPY with glow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10 + Math.sin(animTimer * 3) * 5;
        Renderer.drawTextOutlined('FLAPPY', cx, cy - 70 + titleBounce, 28, '#FFD700', '#000');
        ctx.shadowBlur = 0;

        // TOURNAMENT
        Renderer.drawTextOutlined('TOURNAMENT', cx, cy - 30 + titleBounce, 14, '#EF5350', '#000');

        // Decorative birds
        const char0 = Characters.getCharacter(0);
        const char1 = Characters.getCharacter(1);
        const flapAnim = Math.floor(animTimer * 6) % 3;
        const birdFloat = Math.sin(animTimer * 2.5) * 4;
        Characters.drawBird(ctx, char0, cx - 200, cy - 90 + titleBounce + birdFloat, 36, flapAnim, true);
        Characters.drawBird(ctx, char1, cx + 165, cy - 90 + titleBounce - birdFloat, 36, flapAnim, false);

        // Menu options
        const menuY = cy + 40;
        for (let i = 0; i < options.length; i++) {
            const y = menuY + i * 40;
            const selected = i === selectedIndex;

            if (selected) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
                ctx.fillRect(cx - 120, y - 14, 240, 28);
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx - 120, y - 14, 240, 28);
                Renderer.drawText('▶', cx - 132, y, 10, '#FFD700', 'center');
            }

            const color = selected ? '#FFD700' : '#AAAAAA';
            Renderer.drawText(options[i], cx, y, 12, color, 'center');
        }

        // Controls hint
        Renderer.drawText('W/S or ▲/▼ TO SELECT', cx, cy + 140, 8, '#FFF', 'center', false);
        Renderer.drawBlinkText('PRESS SPACE/ENTER TO START', cx, cy + 160, 8, '#EEE', 'center', 600);

        // Mute and Retro Mode indicators
        const muteText = Audio.isMuted() ? '🔇 MUTED' : '🔊 M=MUTE';
        Renderer.drawText(muteText, 70, CONFIG.HEIGHT - 16, 8, '#CCC', 'center', false);
        const retroText = CONFIG.RETRO_MODE ? '📺 V=RETRO(ON)' : '📺 V=RETRO(OFF)';
        Renderer.drawText(retroText, 190, CONFIG.HEIGHT - 16, 8, '#CCC', 'center', false);

        // Version
        Renderer.drawText('v2.0', CONFIG.WIDTH - 40, CONFIG.HEIGHT - 16, 8, '#CCC', 'center', false);

        Renderer.drawCRT();
        Transitions.draw();
    }

    return { enter, update, draw };
})();
