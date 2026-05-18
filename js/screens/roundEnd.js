// ============================================
// TDH FLAPPY TOURNAMENT — ROUND END SCREEN
// Shows round winner, score, and continues
// ============================================

const RoundEnd = (() => {
    const ctx = Renderer.ctx;
    let data = null;
    let timer = 0;
    let canContinue = false;

    function enter(roundData) {
        data = roundData;
        timer = 0;
        canContinue = false;
        Audio.stopMusic();
    }

    function update(dt) {
        timer += dt;
        if (timer > 1.5) canContinue = true;

        if (canContinue && Input.isConfirm()) {
            Audio.menuConfirm();
            return {
                next: CONFIG.STATES.GAMEPLAY,
                continueMatch: true,
                p1Wins: data.p1Wins,
                p2Wins: data.p2Wins,
                currentRound: data.currentRound + 1
            };
        }

        Particles.update(dt);
        return null;
    }

    function draw() {
        Background.drawAll();
        Renderer.drawOverlay(0.65);

        const cx = CONFIG.WIDTH / 2;
        const cy = CONFIG.HEIGHT / 2;

        if (!data) return;

        Renderer.drawText(`ROUND ${data.currentRound}`, cx, cy - 120, 12, '#AAA', 'center');

        if (data.roundWinner === -1) {
            Renderer.drawTextOutlined('DRAW!', cx, cy - 70, 26, '#FFEB3B', '#000');
        } else {
            const winner = data.roundWinner === 0 ? data.p1 : data.p2;
            const winnerColor = data.roundWinner === 0 ? CONFIG.COLORS.P1_COLOR : CONFIG.COLORS.P2_COLOR;
            const winnerChar = Characters.getCharacter(winner.charId);

            const winnerNameText = winner.name.toUpperCase();
            const winnerNameSize = winnerNameText.length > 15 ? 8 : (winnerNameText.length > 10 ? 10 : 16);
            Renderer.drawTextOutlined(winnerNameText, cx, cy - 80, winnerNameSize, winnerColor, '#000');
            Renderer.drawText('WINS THE ROUND!', cx, cy - 55, 10, '#FFD700', 'center');

            // Winner bird with bounce
            const flapAnim = Math.floor(timer * 5) % 3;
            const bounce = Math.sin(timer * 3) * 4;
            Characters.drawBird(ctx, winnerChar, cx - 30, cy - 40 + bounce, 60, flapAnim, true);
        }

        // Score summary
        const scoreY = cy + 40;
        const p1NSize = data.p1.name.length > 12 ? 5 : 8;
        Renderer.drawText(data.p1.name.toUpperCase(), cx - 100, scoreY, p1NSize, CONFIG.COLORS.P1_COLOR, 'center');
        Renderer.drawText(`${data.p1.score} PTS`, cx - 100, scoreY + 18, 6, '#FFF', 'center', false);

        const p2NSize = data.p2.name.length > 12 ? 5 : 8;
        Renderer.drawText(data.p2.name.toUpperCase(), cx + 100, scoreY, p2NSize, CONFIG.COLORS.P2_COLOR, 'center');
        Renderer.drawText(`${data.p2.score} PTS`, cx + 100, scoreY + 18, 6, '#FFF', 'center', false);

        // Win counters with dots
        const wcY = scoreY + 50;
        Renderer.drawText('MATCH:', cx, wcY - 10, 6, '#888', 'center', false);

        // P1 win dots
        for (let i = 0; i < CONFIG.ROUNDS_TO_WIN; i++) {
            ctx.fillStyle = i < data.p1Wins ? CONFIG.COLORS.P1_COLOR : 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.arc(cx - 40 - i * 16, wcY + 10, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        // P2 win dots
        for (let i = 0; i < CONFIG.ROUNDS_TO_WIN; i++) {
            ctx.fillStyle = i < data.p2Wins ? CONFIG.COLORS.P2_COLOR : 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.arc(cx + 40 + i * 16, wcY + 10, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        if (canContinue) {
            Renderer.drawBlinkText('PRESS ANY BUTTON FOR NEXT ROUND', cx, cy + 140, 6, '#FFD700', 'center', 500);
        }

        Renderer.drawCRT();
        Transitions.draw();
    }

    return { enter, update, draw };
})();
