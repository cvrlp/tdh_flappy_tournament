// ============================================
// TDH FLAPPY TOURNAMENT — PIPE SYSTEM
// Pipe spawning, movement, collision, drawing
// ============================================

const Pipes = (() => {
    const ctx = Renderer.ctx;
    let pipes = [];
    let preset = CONFIG.DIFFICULTY_PRESETS.HARD;
    let speed = preset.pipeSpeed;
    let gap = preset.pipeGap;
    let spawnTimer = 0;
    let oscTime = 0; // shared phase for moving pipes

    function reset() {
        preset = CONFIG.DIFFICULTY_PRESETS[Game.getDifficulty()] || CONFIG.DIFFICULTY_PRESETS.HARD;
        pipes = [];
        speed = preset.pipeSpeed;
        gap = preset.pipeGap;
        spawnTimer = preset.pipeSpawnDist;
        oscTime = 0;
    }

    // How much vertical wobble a pipe gets at the current difficulty level.
    // Returns 0 if the active difficulty doesn't allow moving pipes yet.
    function computeAmplitude(level) {
        if (!preset.movingPipes || level < preset.oscStartLevel) return 0;
        const stepsOver = level - preset.oscStartLevel + 1;
        return Math.min(preset.oscAmpMax, stepsOver * preset.oscAmpStep);
    }

    function addPipe(amplitude) {
        const playableH = CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT;
        // Reserve room so oscillation stays inside the playable area
        const minTop = CONFIG.PIPE_MIN_HEIGHT + amplitude;
        const maxTop = playableH - gap - CONFIG.PIPE_MIN_HEIGHT - amplitude;
        const safeRange = Math.max(0, maxTop - minTop);
        const baseTopH = minTop + Math.random() * safeRange;

        pipes.push({
            x: CONFIG.WIDTH + 10,
            baseTopH: baseTopH,
            baseBottomY: baseTopH + gap,
            topH: baseTopH,
            bottomY: baseTopH + gap,
            oscPhase: Math.random() * Math.PI * 2,
            oscAmplitude: amplitude,
            scored: [false, false], // per-player scoring
            width: CONFIG.PIPE_WIDTH
        });
    }

    function update(dt, score) {
        // Difficulty scaling
        const level = Math.floor(score / CONFIG.DIFFICULTY_INTERVAL);
        speed = Math.min(preset.pipeSpeed + level * preset.speedIncrease, preset.pipeSpeedMax);
        gap = Math.max(preset.pipeGap - level * preset.gapShrink, preset.pipeGapMin);
        const amplitude = computeAmplitude(level);
        oscTime += dt;

        // Move pipes (horizontal scroll + vertical wobble for moving pipes)
        for (let i = pipes.length - 1; i >= 0; i--) {
            const p = pipes[i];
            p.x -= speed;
            if (p.oscAmplitude > 0) {
                const offset = Math.sin(oscTime * preset.oscFreq + p.oscPhase) * p.oscAmplitude;
                p.topH = p.baseTopH + offset;
                p.bottomY = p.baseBottomY + offset;
            }
            if (p.x + p.width < -10) {
                pipes.splice(i, 1);
            }
        }

        // Spawn new pipes — amplitude snapshotted at spawn so each pipe ramps with difficulty
        spawnTimer += speed;
        if (spawnTimer >= preset.pipeSpawnDist) {
            addPipe(amplitude);
            spawnTimer = 0;
        }
    }

    // Check collision with a bird hitbox
    function checkCollision(hitbox) {
        for (const pipe of pipes) {
            // Horizontal overlap
            if (hitbox.x + hitbox.w > pipe.x && hitbox.x < pipe.x + pipe.width) {
                // Top pipe collision
                if (hitbox.y < pipe.topH) return true;
                // Bottom pipe collision
                if (hitbox.y + hitbox.h > pipe.bottomY) return true;
            }
        }
        return false;
    }

    // Check scoring for a specific bird/player
    function checkScore(birdX, playerIndex) {
        let scored = false;
        for (const pipe of pipes) {
            if (!pipe.scored[playerIndex] && birdX > pipe.x + pipe.width) {
                pipe.scored[playerIndex] = true;
                scored = true;
            }
        }
        return scored;
    }

    function draw() {
        for (const pipe of pipes) {
            drawPipe(pipe);
        }
    }

    function drawPipe(pipe) {
        const playableH = CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT;

        // Top pipe
        drawPipeSection(pipe.x, 0, pipe.width, pipe.topH, true);
        // Bottom pipe
        drawPipeSection(pipe.x, pipe.bottomY, pipe.width, playableH - pipe.bottomY, false);
    }

    function drawPipeSection(x, y, w, h, isTop) {
        x = Math.round(x);
        y = Math.round(y);
        w = Math.round(w);
        h = Math.round(h);

        // Main body
        ctx.fillStyle = CONFIG.COLORS.PIPE_GREEN;
        ctx.fillRect(x, y, w, h);

        // Light side (left)
        ctx.fillStyle = CONFIG.COLORS.PIPE_GREEN_LIGHT;
        ctx.fillRect(x, y, 6, h);

        // Dark side (right)
        ctx.fillStyle = CONFIG.COLORS.PIPE_GREEN_DARK;
        ctx.fillRect(x + w - 6, y, 6, h);

        // Border
        ctx.fillStyle = CONFIG.COLORS.PIPE_BORDER;
        ctx.fillRect(x, y, w, 2);
        ctx.fillRect(x, y + h - 2, w, 2);
        ctx.fillRect(x, y, 2, h);
        ctx.fillRect(x + w - 2, y, 2, h);

        // Cap (wider lip at opening)
        const capH = 10;
        const capX = x - 4;
        const capW = w + 8;
        const capY = isTop ? y + h - capH : y;

        ctx.fillStyle = CONFIG.COLORS.PIPE_GREEN;
        ctx.fillRect(capX, capY, capW, capH);
        ctx.fillStyle = CONFIG.COLORS.PIPE_GREEN_LIGHT;
        ctx.fillRect(capX, capY, 6, capH);
        ctx.fillStyle = CONFIG.COLORS.PIPE_GREEN_DARK;
        ctx.fillRect(capX + capW - 6, capY, 6, capH);
        // Cap border
        ctx.fillStyle = CONFIG.COLORS.PIPE_BORDER;
        ctx.fillRect(capX, capY, capW, 2);
        ctx.fillRect(capX, capY + capH - 2, capW, 2);
        ctx.fillRect(capX, capY, 2, capH);
        ctx.fillRect(capX + capW - 2, capY, 2, capH);
    }

    return {
        reset,
        update,
        checkCollision,
        checkScore,
        draw,
        getSpeed() { return speed; },
        getGap() { return gap; }
    };
})();
