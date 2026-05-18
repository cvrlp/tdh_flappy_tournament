// ============================================
// TDH FLAPPY TOURNAMENT — RENDERER
// Canvas setup, scaling, and drawing utilities
// ============================================

const Renderer = (() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = CONFIG.WIDTH;
    canvas.height = CONFIG.HEIGHT;
    ctx.imageSmoothingEnabled = false;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    function resize() {
        const container = document.getElementById('game-container');
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const aspect = CONFIG.WIDTH / CONFIG.HEIGHT;
        let w, h;

        if (cw / ch > aspect) {
            h = ch;
            w = h * aspect;
        } else {
            w = cw;
            h = w / aspect;
        }

        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        scale = w / CONFIG.WIDTH;
        offsetX = (cw - w) / 2;
        offsetY = (ch - h) / 2;
    }

    window.addEventListener('resize', resize);
    resize();

    // Pixel text helper (uses Press Start 2P)
    function drawText(text, x, y, size, color = '#FFF', align = 'center', shadow = true) {
        ctx.font = `${size}px 'Press Start 2P', monospace`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        const rx = Math.round(x);
        const ry = Math.round(y);

        if (shadow) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillText(text, rx + 2, ry + 2);
        }

        ctx.fillStyle = color;
        ctx.fillText(text, rx, ry);
    }

    // Outlined text for extra visibility
    function drawTextOutlined(text, x, y, size, color = '#FFF', outlineColor = '#000', align = 'center') {
        ctx.font = `${size}px 'Press Start 2P', monospace`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        const rx = Math.round(x);
        const ry = Math.round(y);

        // Outline (draw text in 8 directions)
        ctx.fillStyle = outlineColor;
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                if (ox === 0 && oy === 0) continue;
                ctx.fillText(text, rx + ox * 2, ry + oy * 2);
            }
        }

        ctx.fillStyle = color;
        ctx.fillText(text, rx, ry);
    }

    // Blinking text
    function drawBlinkText(text, x, y, size, color, align, speed) {
        const show = Math.floor(Date.now() / (speed || CONFIG.MENU_BLINK_SPEED)) % 2 === 0;
        if (show) {
            drawText(text, x, y, size, color, align);
        }
    }

    // Draw rounded rectangle
    function drawRoundedRect(x, y, w, h, r, fillColor, strokeColor, lineWidth) {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth || 1;
            ctx.stroke();
        }
    }

    // Dark overlay
    function drawOverlay(alpha = 0.7) {
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    }

    // CRT scanline effect
    function drawScanlines() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let i = 0; i < CONFIG.HEIGHT; i += 3) {
            ctx.fillRect(0, i, CONFIG.WIDTH, 1);
        }
    }

    // CRT vignette (darkened corners for retro monitor look)
    function drawVignette() {
        const w = CONFIG.WIDTH;
        const h = CONFIG.HEIGHT;
        const gradient = ctx.createRadialGradient(
            w / 2, h / 2, Math.min(w, h) * 0.35,
            w / 2, h / 2, Math.max(w, h) * 0.75
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    // Combined CRT post-processing
    function drawCRT() {
        if (CONFIG.RETRO_MODE) {
            drawScanlines();
            drawVignette();
        }
    }

    return {
        canvas,
        ctx,
        resize,
        drawText,
        drawTextOutlined,
        drawBlinkText,
        drawRoundedRect,
        drawOverlay,
        drawScanlines,
        drawVignette,
        drawCRT,
        clear() {
            ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
        },
        getScale() { return scale; }
    };
})();
