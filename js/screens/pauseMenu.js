// ============================================
// TDH FLAPPY TOURNAMENT — PAUSE MENU
// ============================================

const PauseMenu = (() => {
    let selectedIndex = 0;
    const options = ['RESUME', 'RESTART', 'QUIT'];

    function enter() {
        selectedIndex = 0;
        Audio.stopMusic();
    }

    function update(dt) {
        if (Input.isPause()) {
            Audio.menuSelect();
            return { next: 'RESUME' };
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
            switch (selectedIndex) {
                case 0: return { next: 'RESUME' };
                case 1: return { next: 'RESTART' };
                case 2: return { next: CONFIG.STATES.MAIN_MENU };
            }
        }

        return null;
    }

    function draw() {
        // Game is still visible underneath
        Renderer.drawOverlay(0.7);

        const cx = CONFIG.WIDTH / 2;

        Renderer.drawTextOutlined('PAUSED', cx, 180, 18, '#FFD700', '#000');

        for (let i = 0; i < options.length; i++) {
            const y = 260 + i * 40;
            const selected = i === selectedIndex;

            if (selected) {
                Renderer.ctx.fillStyle = 'rgba(255,215,0,0.1)';
                Renderer.ctx.fillRect(cx - 80, y - 12, 160, 24);
                Renderer.ctx.strokeStyle = '#FFD700';
                Renderer.ctx.lineWidth = 1;
                Renderer.ctx.strokeRect(cx - 80, y - 12, 160, 24);
                Renderer.drawText('▶', cx - 90, y, 8, '#FFD700', 'center');
            }

            Renderer.drawText(options[i], cx, y, 9, selected ? '#FFD700' : '#888', 'center');
        }

        Renderer.drawText('ESC TO RESUME', cx, 410, 5, '#555', 'center', false);
        Renderer.drawCRT();
    }

    return { enter, update, draw };
})();
