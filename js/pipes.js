// ============================================
// TDH FLAPPY TOURNAMENT — PIPE SYSTEM
// Pipe spawning, movement, collision, drawing
// ============================================

const Pipes = (() => {
    const ctx = Renderer.ctx;
    let pipes = [];
    let speed = CONFIG.PIPE_SPEED;
    let gap = CONFIG.PIPE_GAP;
    let spawnTimer = 0;

    function reset() {
        pipes = [];
        speed = CONFIG.PIPE_SPEED;
        gap = CONFIG.PIPE_GAP;
        spawnTimer = CONFIG.PIPE_SPAWN_DIST;
    }

    function addPipe() {
        const playableH = CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT;
        const minTop = CONFIG.PIPE_MIN_HEIGHT;
        const maxTop = playableH - gap - CONFIG.PIPE_MIN_HEIGHT;
        const topH = minTop + Math.random() * (maxTop - minTop);

        pipes.push({
            x: CONFIG.WIDTH + 10,
            topH: topH,
            bottomY: topH + gap,
            scored: [false, false], // per-player scoring
            width: CONFIG.PIPE_WIDTH
        });
    }

    function update(dt, score) {
        // Difficulty scaling
        const level = Math.floor(score / CONFIG.DIFFICULTY_INTERVAL);
        speed = Math.min(CONFIG.PIPE_SPEED + level * CONFIG.SPEED_INCREASE, CONFIG.PIPE_SPEED_MAX);
        gap = Math.max(CONFIG.PIPE_GAP - level * CONFIG.GAP_SHRINK_AMOUNT, CONFIG.PIPE_GAP_MIN);

        // Move pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= speed;
            if (pipes[i].x + pipes[i].width < -10) {
                pipes.splice(i, 1);
            }
        }

        // Spawn new pipes
        spawnTimer += speed;
        if (spawnTimer >= CONFIG.PIPE_SPAWN_DIST) {
            addPipe();
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
