// ============================================
// TDH FLAPPY TOURNAMENT — MATCH WINNER SCREEN
// Grand winner celebration with effects + rematch
// ============================================

const MatchWinner = (() => {
    const ctx = Renderer.ctx;
    let data = null;
    let timer = 0;
    let canContinue = false;
    let celebrationSpawned = false;
    let selectedOption = 0;
    const options = ['REMATCH', 'NEW GAME', 'MAIN MENU'];

    // Firework particles
    let fireworks = [];

    function enter(matchData) {
        data = matchData;
        timer = 0;
        canContinue = false;
        celebrationSpawned = false;
        selectedOption = 0;
        fireworks = [];
        Audio.stopMusic();
    }

    function update(dt) {
        timer += dt;

        // Spawn celebration particles
        if (!celebrationSpawned && timer > 0.5) {
            celebrationSpawned = true;
            const cx = CONFIG.WIDTH / 2;
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    Particles.spawnExplosion(
                        cx - 100 + Math.random() * 200,
                        150 + Math.random() * 100,
                        ['#FFD700', '#FF4444', '#4FC3F7', '#4CAF50', '#FF9800']
                    );
                }, i * 300);
            }
        }

        // Fireworks rising from bottom
        if (timer > 1 && Math.random() < 0.08) {
            fireworks.push({
                x: 50 + Math.random() * (CONFIG.WIDTH - 100),
                y: CONFIG.HEIGHT,
                vy: -3 - Math.random() * 3,
                life: 1 + Math.random() * 0.5,
                color: ['#FFD700', '#FF4444', '#4FC3F7', '#FF9800', '#4CAF50'][Math.floor(Math.random() * 5)],
                exploded: false
            });
        }

        // Update fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            fw.y += fw.vy;
            fw.life -= dt;

            // Trail
            if (!fw.exploded) {
                Particles.spawn(fw.x, fw.y, 1, fw.color, 0.3);
            }

            // Explode at top
            if (fw.y < 60 + Math.random() * 100 && !fw.exploded) {
                fw.exploded = true;
                Particles.spawnExplosion(fw.x, fw.y, [fw.color, '#FFF', '#FFD700']);
            }

            if (fw.life <= 0) {
                fireworks.splice(i, 1);
            }
        }

        if (timer > 2.5) canContinue = true;

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
                switch (selectedOption) {
                    case 0: // REMATCH — same characters, new match
                        return {
                            next: CONFIG.STATES.GAMEPLAY,
                            p1: data.p1,
                            p2: data.p2,
                            mode: CONFIG.MODES.MULTIPLAYER
                        };
                    case 1: // NEW GAME — back to char select
                        return { next: CONFIG.STATES.CHAR_SELECT, mode: CONFIG.MODES.MULTIPLAYER };
                    case 2: // MAIN MENU
                        return { next: CONFIG.STATES.MAIN_MENU };
                }
            }
        }

        Particles.update(dt);
        Background.update(0);

        return null;
    }

    function draw() {
        Background.drawAll();
        Renderer.drawOverlay(0.6);

        const cx = CONFIG.WIDTH / 2;

        if (!data) return;

        const winner = data.winner === 0 ? data.p1 : data.p2;
        const winnerColor = data.winner === 0 ? CONFIG.COLORS.P1_COLOR : CONFIG.COLORS.P2_COLOR;
        const winnerChar = Characters.getCharacter(winner.charId);

        // Trophy / crown with glow
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15 + Math.sin(timer * 3) * 5;
        Renderer.drawTextOutlined('★ CHAMPION ★', cx, 55, 10, '#FFD700', '#000');
        ctx.shadowBlur = 0;

        // Team name
        Renderer.drawText(winnerChar.team.toUpperCase(), cx, 85, 6, winnerColor, 'center');

        // Giant winner bird with victory flying animation
        const birdSize = 70;
        const flapAnim = Math.floor(timer * 4) % 3;
        const floatY = Math.sin(timer * 2) * 8;
        const floatX = Math.sin(timer * 1.3) * 15;
        Characters.drawBird(ctx, winnerChar, cx - birdSize / 2 + floatX, 105 + floatY, birdSize, flapAnim, true);

        // Winner name
        const winnerNameText = winner.name.toUpperCase();
        const winnerNameSize = winnerNameText.length > 15 ? 8 : (winnerNameText.length > 10 ? 10 : 16);
        Renderer.drawTextOutlined(winnerNameText, cx, 205, winnerNameSize, winnerColor, '#000');
        Renderer.drawText('WINS THE MATCH!', cx, 230, 8, '#FFD700', 'center');

        // Final score box
        const sy = 255;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(cx - 140, sy - 10, 280, 65);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 140, sy - 10, 280, 65);

        Renderer.drawText('FINAL SCORE', cx, sy + 2, 6, '#AAA', 'center', false);
        const p1NSize = data.p1.name.length > 12 ? 4 : 6;
        Renderer.drawText(data.p1.name.toUpperCase(), cx - 60, sy + 22, p1NSize, CONFIG.COLORS.P1_COLOR, 'center');
        Renderer.drawText(data.p1Wins.toString(), cx - 60, sy + 40, 14, '#FFF', 'center');
        Renderer.drawText('—', cx, sy + 40, 10, '#555', 'center', false);
        const p2NSize = data.p2.name.length > 12 ? 4 : 6;
        Renderer.drawText(data.p2.name.toUpperCase(), cx + 60, sy + 22, p2NSize, CONFIG.COLORS.P2_COLOR, 'center');
        Renderer.drawText(data.p2Wins.toString(), cx + 60, sy + 40, 14, '#FFF', 'center');

        // Particles
        Particles.draw();

        // Menu options
        if (canContinue) {
            const menuY = 340;
            for (let i = 0; i < options.length; i++) {
                const y = menuY + i * 28;
                const selected = i === selectedOption;

                if (selected) {
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
                    ctx.fillRect(cx - 90, y - 10, 180, 22);
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(cx - 90, y - 10, 180, 22);
                    Renderer.drawText('▶', cx - 100, y, 7, '#FFD700', 'center');
                }

                Renderer.drawText(options[i], cx, y, 7, selected ? '#FFD700' : '#888', 'center');
            }
        }

        Renderer.drawCRT();
        Transitions.draw();
    }

    return { enter, update, draw };
})();
