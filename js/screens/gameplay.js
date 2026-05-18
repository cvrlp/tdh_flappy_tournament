// ============================================
// TDH FLAPPY TOURNAMENT — GAMEPLAY SCREEN
// Core game loop: countdown → play → detect win
// ============================================

const Gameplay = (() => {
    const ctx = Renderer.ctx;

    let mode = CONFIG.MODES.MULTIPLAYER;
    let bird1 = null;
    let bird2 = null;
    let countdown = 0;
    let countdownTimer = 0;
    let countdownDisplay = 0; // for animation
    let playing = false;
    let roundOver = false;
    let maxScore = 0;

    // Screen shake
    let shakeTimer = 0;
    let shakeIntensity = 0;

    // Round tracking
    let p1Wins = 0;
    let p2Wins = 0;
    let currentRound = 1;

    // Score animation
    let p1ScorePop = 0;
    let p2ScorePop = 0;

    // GO flash
    let goFlashTimer = 0;

    // Speed lines
    let speedLines = [];

    function enter(data) {
        mode = data.mode;
        p1Wins = data.p1Wins || 0;
        p2Wins = data.p2Wins || 0;
        currentRound = data.currentRound || 1;

        const p1x = mode === CONFIG.MODES.SINGLE_PLAYER ? CONFIG.BIRD_X_SP : CONFIG.BIRD_X_P1;
        const p2x = CONFIG.BIRD_X_P2;

        bird1 = new Bird(0, data.p1.charId, data.p1.name, p1x);
        bird2 = mode === CONFIG.MODES.MULTIPLAYER ?
            new Bird(1, data.p2.charId, data.p2.name, p2x) : null;

        if (mode === CONFIG.MODES.SINGLE_PLAYER) {
            bird2 = null;
        }

        Pipes.reset();
        Particles.clear();
        Background.resetScroll();

        countdown = CONFIG.COUNTDOWN_DURATION;
        countdownTimer = 0;
        countdownDisplay = CONFIG.COUNTDOWN_DURATION;
        playing = false;
        roundOver = false;
        maxScore = 0;
        shakeTimer = 0;
        p1ScorePop = 0;
        p2ScorePop = 0;
        goFlashTimer = 0;
        speedLines = [];
    }

    function update(dt) {
        if (roundOver) return null;

        // Pause
        if (playing && Input.isPause()) {
            Audio.menuSelect();
            return { next: CONFIG.STATES.PAUSE };
        }

        // Countdown phase
        if (countdown > 0) {
            countdownTimer += dt;

            // Bob birds during countdown
            if (bird1) {
                bird1.y = CONFIG.HEIGHT / 2 + Math.sin(countdownTimer * 3) * 8;
            }
            if (bird2) {
                bird2.y = CONFIG.HEIGHT / 2 + Math.sin(countdownTimer * 3 + 1) * 8;
            }

            if (countdownTimer >= 1) {
                countdownTimer = 0;
                countdown--;
                countdownDisplay = countdown;
                if (countdown > 0) {
                    Audio.countdownBeep();
                } else {
                    Audio.countdownGo();
                    playing = true;
                    goFlashTimer = 0.8;
                    Transitions.flash('#FFFFFF');
                }
            }
            Background.update(0);
            Particles.update(dt);
            return null;
        }

        // GO flash timer
        if (goFlashTimer > 0) goFlashTimer -= dt;

        // Input
        if (bird1 && bird1.alive && Input.isFlap(0)) {
            bird1.flap();
        }
        if (mode === CONFIG.MODES.MULTIPLAYER && bird2 && bird2.alive && Input.isFlap(1)) {
            bird2.flap();
        }

        // Update birds
        if (bird1) bird1.update(dt);
        if (bird2) bird2.update(dt);

        // Pipes
        maxScore = bird1 ? bird1.score : 0;
        if (bird2) maxScore = Math.max(maxScore, bird2.score);
        Pipes.update(dt, maxScore);

        // Collision detection
        if (bird1 && bird1.alive) {
            if (Pipes.checkCollision(bird1.getHitbox())) {
                bird1.die();
                triggerShake(6);
            }
            if (bird1.alive && Pipes.checkScore(bird1.x, 0)) {
                bird1.score++;
                p1ScorePop = 0.3;
                Audio.score();
            }
        }

        if (bird2 && bird2.alive) {
            if (Pipes.checkCollision(bird2.getHitbox())) {
                bird2.die();
                triggerShake(6);
            }
            if (bird2.alive && Pipes.checkScore(bird2.x, 1)) {
                bird2.score++;
                p2ScorePop = 0.3;
                Audio.score();
            }
        }

        Background.update(Pipes.getSpeed());
        Particles.update(dt);

        // Score pop animation
        if (p1ScorePop > 0) p1ScorePop -= dt;
        if (p2ScorePop > 0) p2ScorePop -= dt;

        if (shakeTimer > 0) shakeTimer -= dt;

        // Speed lines at high difficulty
        const level = Math.floor(maxScore / CONFIG.DIFFICULTY_INTERVAL);
        if (level >= 2 && Math.random() < 0.15) {
            speedLines.push({
                x: CONFIG.WIDTH + 5,
                y: 20 + Math.random() * (CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT - 40),
                length: 20 + Math.random() * 40,
                speed: Pipes.getSpeed() * 3 + Math.random() * 2,
                alpha: 0.15 + Math.random() * 0.15
            });
        }
        for (let i = speedLines.length - 1; i >= 0; i--) {
            speedLines[i].x -= speedLines[i].speed;
            if (speedLines[i].x + speedLines[i].length < 0) {
                speedLines.splice(i, 1);
            }
        }

        // Round end conditions
        if (mode === CONFIG.MODES.MULTIPLAYER) {
            if (bird1 && !bird1.alive && bird2 && !bird2.alive) {
                return endRound(-1); // Both died on same frame -> draw
            } else if (bird1 && !bird1.alive) {
                return endRound(1); // P1 died -> P2 wins
            } else if (bird2 && !bird2.alive) {
                return endRound(0); // P2 died -> P1 wins
            }
        } else {
            if (bird1 && !bird1.alive) {
                return {
                    next: CONFIG.STATES.GAME_OVER_SP,
                    score: bird1.score,
                    charId: bird1.charId,
                    name: bird1.name
                };
            }
        }

        return null;
    }

    function endRound(winnerIndex) {
        roundOver = true;
        if (winnerIndex === 0) p1Wins++;
        else if (winnerIndex === 1) p2Wins++;

        if (p1Wins >= CONFIG.ROUNDS_TO_WIN) {
            Audio.matchWin();
            return {
                next: CONFIG.STATES.MATCH_WINNER,
                winner: 0,
                p1Wins, p2Wins,
                p1: { charId: bird1.charId, name: bird1.name, score: bird1.score },
                p2: bird2 ? { charId: bird2.charId, name: bird2.name, score: bird2.score } : null
            };
        }
        if (p2Wins >= CONFIG.ROUNDS_TO_WIN) {
            Audio.matchWin();
            return {
                next: CONFIG.STATES.MATCH_WINNER,
                winner: 1,
                p1Wins, p2Wins,
                p1: { charId: bird1.charId, name: bird1.name, score: bird1.score },
                p2: bird2 ? { charId: bird2.charId, name: bird2.name, score: bird2.score } : null
            };
        }

        Audio.roundWin();
        return {
            next: CONFIG.STATES.ROUND_END,
            roundWinner: winnerIndex,
            p1Wins, p2Wins,
            currentRound,
            p1: { charId: bird1.charId, name: bird1.name, score: bird1.score },
            p2: bird2 ? { charId: bird2.charId, name: bird2.name, score: bird2.score } : null
        };
    }

    function triggerShake(intensity) {
        shakeTimer = 0.3;
        shakeIntensity = intensity;
    }

    function draw() {
        ctx.save();

        if (shakeTimer > 0) {
            const sx = (Math.random() - 0.5) * shakeIntensity;
            const sy = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(sx, sy);
        }

        Background.drawAll();

        // Speed lines
        if (speedLines.length > 0) {
            for (const sl of speedLines) {
                ctx.globalAlpha = sl.alpha;
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sl.x, sl.y);
                ctx.lineTo(sl.x + sl.length, sl.y);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        Pipes.draw();
        Background.drawGround();

        if (bird2) bird2.draw();
        if (bird1) bird1.draw();
        Particles.draw();

        ctx.restore();

        drawHUD();

        // Countdown display
        if (countdown > 0) {
            Renderer.drawOverlay(0.3);

            // Animated countdown number
            const countNum = countdownDisplay;
            const animProgress = countdownTimer; // 0 to 1
            const scale = 1 + Math.max(0, 0.5 - animProgress) * 1.5; // Start big, shrink
            const alpha = Math.min(1, 1 - (animProgress - 0.7) * 3); // Fade at end

            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);
            const numSize = Math.round(52 * scale);
            Renderer.drawTextOutlined(
                countNum.toString(),
                CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 30,
                numSize, '#FFD700', '#000'
            );
            ctx.restore();

            // Round label
            if (mode === CONFIG.MODES.MULTIPLAYER) {
                const roundBounce = Math.sin(countdownTimer * 6) * 2;
                Renderer.drawText(`ROUND ${currentRound}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 40 + roundBounce, 12, '#FFF', 'center');
            }
        }

        // GO! flash
        if (goFlashTimer > 0) {
            const goAlpha = Math.min(1, goFlashTimer / 0.4);
            const goScale = 1 + (0.8 - goFlashTimer) * 0.5;
            ctx.save();
            ctx.globalAlpha = goAlpha;
            Renderer.drawTextOutlined(
                'GO!',
                CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 20,
                Math.round(36 * goScale), '#FF4444', '#000'
            );
            ctx.restore();
        }



        Renderer.drawCRT();
        Transitions.draw();
    }

    function drawHUD() {
        const W = CONFIG.WIDTH;

        if (mode === CONFIG.MODES.MULTIPLAYER) {
            // P1 score (left)
            const p1NameText = bird1.name.toUpperCase();
            const p1NameSize = p1NameText.length > 15 ? 4 : (p1NameText.length > 10 ? 5 : 7);
            Renderer.drawText(p1NameText, 80, 16, p1NameSize, CONFIG.COLORS.P1_COLOR, 'center');
            const p1Size = 16 + (p1ScorePop > 0 ? Math.sin(p1ScorePop * 20) * 4 : 0);
            Renderer.drawText(bird1.score.toString(), 80, 38, Math.round(p1Size), '#FFF', 'center');

            // Round win dots (P1)
            for (let i = 0; i < CONFIG.ROUNDS_TO_WIN; i++) {
                const dotX = 64 + i * 18;
                const dotY = 58;
                if (i < p1Wins) {
                    ctx.fillStyle = CONFIG.COLORS.P1_COLOR;
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // P2 score (right)
            const rx = W - 80;
            const p2NameText = bird2 ? bird2.name.toUpperCase() : 'P2';
            const p2NameSize = p2NameText.length > 15 ? 4 : (p2NameText.length > 10 ? 5 : 7);
            Renderer.drawText(p2NameText, rx, 16, p2NameSize, CONFIG.COLORS.P2_COLOR, 'center');
            const p2Size = 16 + (p2ScorePop > 0 ? Math.sin(p2ScorePop * 20) * 4 : 0);
            Renderer.drawText(bird2 ? bird2.score.toString() : '0', rx, 38, Math.round(p2Size), '#FFF', 'center');

            // Round win dots (P2)
            for (let i = 0; i < CONFIG.ROUNDS_TO_WIN; i++) {
                const dotX = rx - 16 + i * 18;
                const dotY = 58;
                if (i < p2Wins) {
                    ctx.fillStyle = CONFIG.COLORS.P2_COLOR;
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // VS
            Renderer.drawText('VS', W / 2, 30, 10, 'rgba(255,255,255,0.25)', 'center', false);

            // Round number
            Renderer.drawText(`R${currentRound}`, W / 2, 52, 6, 'rgba(255,255,255,0.2)', 'center', false);
        } else {
            Renderer.drawText(bird1.score.toString(), W / 2, 36, 22, '#FFF', 'center');
        }
    }

    function getBirds() { return { bird1, bird2 }; }
    function getState() { return { mode, p1Wins, p2Wins, currentRound, playing }; }

    return { enter, update, draw, getBirds, getState };
})();
