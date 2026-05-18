// ============================================
// TDH FLAPPY TOURNAMENT — CHARACTER SELECT
// Street Fighter Alpha 2 style character picker
// ============================================

const CharSelect = (() => {
    const ctx = Renderer.ctx;
    const GRID_COLS = 8;
    const PORTRAIT_SIZE = 50;
    const PORTRAIT_GAP = 8;

    let mode = CONFIG.MODES.MULTIPLAYER;
    let p1Cursor = 0;
    let p2Cursor = 1;
    let p1Confirmed = false;
    let p2Confirmed = false;
    let animTimer = 0;
    let readyTimer = 0;
    let inputCooldown = 0;

    // Cursor animation
    let p1CursorAnim = 0;
    let p2CursorAnim = 0;

    function enter(gameMode) {
        mode = gameMode || CONFIG.MODES.MULTIPLAYER;
        p1Cursor = 0;
        p2Cursor = mode === CONFIG.MODES.MULTIPLAYER ? 1 : -1;
        p1Confirmed = false;
        p2Confirmed = false;
        animTimer = 0;
        readyTimer = 0;
        p1CursorAnim = 0;
        p2CursorAnim = 0;
        inputCooldown = 0.5;
    }

    function exit() {
    }

    function update(dt) {
        animTimer += dt;
        p1CursorAnim += dt * 8;
        p2CursorAnim += dt * 8;

        // Input cooldown — prevent carryover from previous screen
        if (inputCooldown > 0) {
            inputCooldown -= dt;
            return null;
        }

        if (Input.isBack()) {
            Audio.menuBack();
            exit();
            return { next: CONFIG.STATES.MAIN_MENU };
        }

        // P1 controls (WASD) — single row so only left/right
        if (!p1Confirmed) {
            if (Input.isMenuLeft(0)) { moveCursor(0, -1); Audio.menuSelect(); p1CursorAnim = 0; }
            if (Input.isMenuRight(0)) { moveCursor(0, 1); Audio.menuSelect(); p1CursorAnim = 0; }

            if (Input.isConfirm(0)) {
                if (p1Cursor !== p2Cursor || mode === CONFIG.MODES.SINGLE_PLAYER) {
                    p1Confirmed = true;
                    Audio.menuConfirm();
                }
            }
        } else if (Input.isBack(0)) {
            p1Confirmed = false;
            Audio.menuBack();
        }

        // P2 controls (Arrow keys)
        if (mode === CONFIG.MODES.MULTIPLAYER) {
            if (!p2Confirmed) {
                if (Input.isMenuLeft(1)) { moveCursor(1, -1); Audio.menuSelect(); p2CursorAnim = 0; }
                if (Input.isMenuRight(1)) { moveCursor(1, 1); Audio.menuSelect(); p2CursorAnim = 0; }

                if (Input.isConfirm(1)) {
                    if (p2Cursor !== p1Cursor) {
                        p2Confirmed = true;
                        Audio.menuConfirm();
                    }
                }
            } else if (Input.isBack(1)) {
                p2Confirmed = false;
                Audio.menuBack();
            }
        } else {
            if (!p2Confirmed && p1Confirmed) {
                let choices = [];
                for (let i = 0; i < Characters.getCount(); i++) {
                    if (i !== p1Cursor) choices.push(i);
                }
                p2Cursor = choices[Math.floor(Math.random() * choices.length)];
                p2Confirmed = true;
            }
        }

        // Both confirmed — short delay then start
        if (p1Confirmed && p2Confirmed) {
            readyTimer += dt;
            if (readyTimer > 1.0) {
                exit();
                return {
                    next: CONFIG.STATES.GAMEPLAY,
                    p1: { charId: p1Cursor, name: Characters.getCharacter(p1Cursor).team },
                    p2: { charId: p2Cursor, name: Characters.getCharacter(p2Cursor).team },
                    mode: mode
                };
            }
        }

        return null;
    }

    function moveCursor(player, delta) {
        const count = Characters.getCount();
        if (player === 0) {
            p1Cursor = (p1Cursor + delta + count) % count; // wrap
        } else {
            p2Cursor = (p2Cursor + delta + count) % count; // wrap
        }
    }

    function draw() {
        const W = CONFIG.WIDTH;
        const H = CONFIG.HEIGHT;
        const cx = W / 2;

        // === Dark dramatic background ===
        Background.drawAll();
        // Heavy dark overlay for drama
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, W, H);

        // Subtle gradient accents on P1/P2 sides
        const p1Grad = ctx.createLinearGradient(0, 0, W * 0.35, 0);
        p1Grad.addColorStop(0, 'rgba(79, 195, 247, 0.08)');
        p1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = p1Grad;
        ctx.fillRect(0, 0, W * 0.4, H);

        const p2Grad = ctx.createLinearGradient(W, 0, W * 0.65, 0);
        p2Grad.addColorStop(0, 'rgba(239, 83, 80, 0.08)');
        p2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = p2Grad;
        ctx.fillRect(W * 0.6, 0, W * 0.4, H);

        // === Title bar ===
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, W, 36);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 36);
        ctx.lineTo(W, 36);
        ctx.stroke();

        // SFA2-style corner brackets
        const bracketSize = 8;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        // Top-left bracket
        drawBracket(10, 6, bracketSize, 'tl');
        // Top-right bracket
        drawBracket(W - 10, 6, bracketSize, 'tr');

        Renderer.drawTextOutlined('SELECT YOUR FIGHTER', cx, 18, 10, '#FFD700', '#000');

        // === Large portrait areas ===
        const portraitAreaW = 200;
        const portraitAreaH = 240;
        const portraitY = 48;

        // P1 large portrait (left)
        const p1AreaX = 20;
        drawLargePortrait(0, p1AreaX, portraitY, portraitAreaW, portraitAreaH, p1Cursor, p1Confirmed, CONFIG.COLORS.P1_COLOR);

        // P2 large portrait (right)
        const p2AreaX = W - portraitAreaW - 20;
        if (mode === CONFIG.MODES.MULTIPLAYER) {
            drawLargePortrait(1, p2AreaX, portraitY, portraitAreaW, portraitAreaH, p2Cursor, p2Confirmed, CONFIG.COLORS.P2_COLOR);
        } else {
            drawCPUPortrait(p2AreaX, portraitY, portraitAreaW, portraitAreaH);
        }

        // === VS in center ===
        const vsY = portraitY + portraitAreaH / 2 - 10;
        const vsPulse = Math.sin(animTimer * 4) * 3;
        const vsSize = Math.round(22 + vsPulse);

        // VS background glow
        ctx.save();
        ctx.shadowColor = '#FF4444';
        ctx.shadowBlur = 15 + Math.sin(animTimer * 3) * 8;
        Renderer.drawTextOutlined('VS', cx, vsY, vsSize, '#FF4444', '#000');
        ctx.restore();

        // Horizontal divider lines from VS
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1AreaX + portraitAreaW + 10, vsY);
        ctx.lineTo(cx - 30, vsY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 30, vsY);
        ctx.lineTo(p2AreaX - 10, vsY);
        ctx.stroke();

        // === Character roster grid (shared, SFA2 style) ===
        const gridTotalW = PORTRAIT_SIZE * GRID_COLS + PORTRAIT_GAP * (GRID_COLS - 1);
        const gridX = (W - gridTotalW) / 2;
        const gridY = portraitY + portraitAreaH + 18;

        // Grid background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(gridX - 12, gridY - 10, gridTotalW + 24, PORTRAIT_SIZE + 20);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(gridX - 12, gridY - 10, gridTotalW + 24, PORTRAIT_SIZE + 20);

        // Draw each character in the grid
        for (let i = 0; i < Characters.getCount(); i++) {
            const px = gridX + i * (PORTRAIT_SIZE + PORTRAIT_GAP);
            const py = gridY;

            const p1Selected = p1Cursor === i;
            const p2Selected = (mode === CONFIG.MODES.MULTIPLAYER) && p2Cursor === i;
            const p1Locked = p1Confirmed && p1Selected;
            const p2Locked = p2Confirmed && p2Selected;

            // Draw portrait cell
            Characters.drawPortrait(ctx, i, px, py, PORTRAIT_SIZE,
                p1Locked || p2Locked,
                false,
                (p1Selected && !p1Confirmed) || (p2Selected && !p2Confirmed)
            );

            // P1 cursor indicator
            if (p1Selected && !p1Confirmed) {
                const bounce = Math.sin(p1CursorAnim) * 2;
                ctx.save();
                ctx.shadowColor = CONFIG.COLORS.P1_COLOR;
                ctx.shadowBlur = 10 + Math.sin(p1CursorAnim * 2) * 4;
                ctx.strokeStyle = CONFIG.COLORS.P1_COLOR;
                ctx.lineWidth = 3;
                ctx.strokeRect(px - 2, py - 2 + bounce, PORTRAIT_SIZE + 4, PORTRAIT_SIZE + 4);
                ctx.shadowBlur = 0;
                ctx.restore();
                Renderer.drawText('P1', px + PORTRAIT_SIZE / 2, py - 10 + bounce, 8, CONFIG.COLORS.P1_COLOR, 'center', true);
            }

            // P2 cursor indicator
            if (p2Selected && !p2Confirmed) {
                const bounce = Math.sin(p2CursorAnim) * 2;
                ctx.save();
                ctx.shadowColor = CONFIG.COLORS.P2_COLOR;
                ctx.shadowBlur = 10 + Math.sin(p2CursorAnim * 2) * 4;
                ctx.strokeStyle = CONFIG.COLORS.P2_COLOR;
                ctx.lineWidth = 3;
                ctx.strokeRect(px - 2, py - 2 + bounce, PORTRAIT_SIZE + 4, PORTRAIT_SIZE + 4);
                ctx.shadowBlur = 0;
                ctx.restore();
                Renderer.drawText('P2', px + PORTRAIT_SIZE / 2, py + PORTRAIT_SIZE + 12 + bounce, 8, CONFIG.COLORS.P2_COLOR, 'center', true);
            }

            // Gold lock border for confirmed
            if (p1Locked) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.strokeRect(px - 1, py - 1, PORTRAIT_SIZE + 2, PORTRAIT_SIZE + 2);
            }
            if (p2Locked) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.strokeRect(px - 1, py - 1, PORTRAIT_SIZE + 2, PORTRAIT_SIZE + 2);
            }
        }

        // === Controls hint ===
        const ctrlY = gridY + PORTRAIT_SIZE + 28;
        Renderer.drawText('P1: A/D+SPACE', cx - 130, ctrlY, 8, CONFIG.COLORS.P1_COLOR, 'center', false);
        if (mode === CONFIG.MODES.MULTIPLAYER) {
            Renderer.drawText('P2: ARROWS+ENTER', cx + 130, ctrlY, 8, CONFIG.COLORS.P2_COLOR, 'center', false);
        }
        Renderer.drawText('ESC/BACKSPACE=QUIT', cx, ctrlY + 16, 8, '#AAA', 'center', false);

        // === FIGHT! overlay when both confirmed ===
        if (p1Confirmed && p2Confirmed) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, W, H);
            Renderer.drawBlinkText('FIGHT!', cx, H / 2, 32, '#FF4444', 'center', 200);
        }

        Renderer.drawCRT();
        Transitions.draw();
    }

    function drawLargePortrait(playerIndex, areaX, areaY, areaW, areaH, cursor, confirmed, color) {
        const char = Characters.getCharacter(cursor);
        const acx = areaX + areaW / 2;

        // Portrait frame background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(areaX, areaY, areaW, areaH);

        // Colored side accent bar
        ctx.fillStyle = color;
        if (playerIndex === 0) {
            ctx.fillRect(areaX, areaY, 3, areaH);
        } else {
            ctx.fillRect(areaX + areaW - 3, areaY, 3, areaH);
        }

        // Border
        ctx.strokeStyle = confirmed ? '#FFD700' : color;
        ctx.lineWidth = confirmed ? 2 : 1;
        ctx.strokeRect(areaX, areaY, areaW, areaH);

        // Player label at top
        const label = playerIndex === 0 ? '1P' : '2P';
        Renderer.drawTextOutlined(label, playerIndex === 0 ? areaX + 20 : areaX + areaW - 20, areaY + 14, 10, color, '#000');

        // Large profile art
        const profileSize = 140;
        const profileX = acx - profileSize / 2;
        const floatY = Math.sin(animTimer * 2.5 + playerIndex * Math.PI) * 3;
        const profileY = areaY + 28 + floatY;

        // Inner frame for portrait
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(profileX - 3, profileY - 3, profileSize + 6, profileSize + 6);
        ctx.strokeStyle = confirmed ? '#FFD700' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(profileX - 3, profileY - 3, profileSize + 6, profileSize + 6);

        Characters.drawProfileArt(ctx, char.id, profileX, profileY, profileSize);

        // Confirmed gold overlay
        if (confirmed) {
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(profileX, profileY, profileSize, profileSize);
            ctx.restore();
        }

        // Team name
        const nameY = profileY + profileSize + 16;
        const teamText = char.team.toUpperCase();
        Renderer.drawTextOutlined(teamText, acx, nameY, 8, color, '#000');

        // Tagline
        Renderer.drawText(char.tagline, acx, nameY + 18, 8, '#999', 'center', false);

        // READY indicator
        if (confirmed) {
            Renderer.drawTextOutlined('✓ READY', acx, nameY + 36, 7, '#4CAF50', '#000');
        }
    }

    function drawCPUPortrait(areaX, areaY, areaW, areaH) {
        const acx = areaX + areaW / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(areaX, areaY, areaW, areaH);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(areaX, areaY, areaW, areaH);

        // CPU label
        Renderer.drawTextOutlined('CPU', areaX + areaW - 28, areaY + 14, 10, '#AAA', '#000');

        // Animated question mark
        const qBounce = Math.sin(animTimer * 2) * 4;
        Renderer.drawText('?', acx, areaY + areaH / 2 - 10 + qBounce, 50, '#333', 'center');
        Renderer.drawText('RANDOM', acx, areaY + areaH / 2 + 40, 8, '#AAA', 'center', false);
    }

    function drawBracket(x, y, size, corner) {
        ctx.beginPath();
        if (corner === 'tl') {
            ctx.moveTo(x, y + size);
            ctx.lineTo(x, y);
            ctx.lineTo(x + size, y);
        } else if (corner === 'tr') {
            ctx.moveTo(x - size, y);
            ctx.lineTo(x, y);
            ctx.lineTo(x, y + size);
        }
        ctx.stroke();
    }

    return {
        enter,
        update,
        draw
    };
})();
