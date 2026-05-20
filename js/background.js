// ============================================
// TDH FLAPPY TOURNAMENT — ANIMATED BACKGROUND
// Scrolling sky, clouds, distant birds, ground
// ============================================

const Background = (() => {
    const ctx = Renderer.ctx;

    // Clouds
    const clouds = [];
    for (let i = 0; i < 6; i++) {
        clouds.push({
            x: Math.random() * CONFIG.WIDTH * 1.5,
            y: 30 + Math.random() * 180,
            w: 40 + Math.random() * 60,
            h: 16 + Math.random() * 14,
            speed: 0.15 + Math.random() * 0.3,
            opacity: 0.3 + Math.random() * 0.4
        });
    }

    // Background birds (tiny V-shapes)
    const bgBirds = [];
    for (let i = 0; i < 4; i++) {
        bgBirds.push({
            x: Math.random() * CONFIG.WIDTH,
            y: 40 + Math.random() * 120,
            speed: 0.5 + Math.random() * 0.8,
            flapTimer: Math.random() * Math.PI * 2,
            size: 3 + Math.random() * 3
        });
    }

    // Ground pattern offset
    let groundScroll = 0;

    // Day/night cycle accumulator (real seconds)
    let cycleTime = 0;

    function lerpColor(c1, c2, t) {
        const r1 = parseInt(c1.slice(1, 3), 16);
        const g1 = parseInt(c1.slice(3, 5), 16);
        const b1 = parseInt(c1.slice(5, 7), 16);
        const r2 = parseInt(c2.slice(1, 3), 16);
        const g2 = parseInt(c2.slice(3, 5), 16);
        const b2 = parseInt(c2.slice(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function lerpPalette(p1, p2, t) {
        return {
            skyTop:     lerpColor(p1.skyTop,     p2.skyTop,     t),
            skyBottom:  lerpColor(p1.skyBottom,  p2.skyBottom,  t),
            ground:     lerpColor(p1.ground,     p2.ground,     t),
            groundDark: lerpColor(p1.groundDark, p2.groundDark, t),
        };
    }

    // Returns the current sky/ground palette by interpolating four stops
    // around the cycle: day (0.0) -> dusk (0.25) -> night (0.5) -> dawn (0.75) -> day (1.0)
    function getPalette() {
        const t = (cycleTime % CONFIG.DAY_NIGHT_PERIOD_SEC) / CONFIG.DAY_NIGHT_PERIOD_SEC;
        const stops = [
            { t: 0.00, p: CONFIG.PALETTE_DAY   },
            { t: 0.25, p: CONFIG.PALETTE_DUSK  },
            { t: 0.50, p: CONFIG.PALETTE_NIGHT },
            { t: 0.75, p: CONFIG.PALETTE_DAWN  },
            { t: 1.00, p: CONFIG.PALETTE_DAY   },
        ];
        for (let i = 0; i < stops.length - 1; i++) {
            if (t >= stops[i].t && t < stops[i + 1].t) {
                const segT = (t - stops[i].t) / (stops[i + 1].t - stops[i].t);
                return lerpPalette(stops[i].p, stops[i + 1].p, segT);
            }
        }
        return CONFIG.PALETTE_DAY;
    }

    function update(pipeSpeed, dt) {
        // Clouds drift
        for (const c of clouds) {
            c.x -= c.speed;
            if (c.x + c.w < -20) {
                c.x = CONFIG.WIDTH + 20 + Math.random() * 60;
                c.y = 30 + Math.random() * 180;
                c.w = 40 + Math.random() * 60;
            }
        }

        // Background birds move
        for (const b of bgBirds) {
            b.x -= b.speed;
            b.flapTimer += 0.08;
            if (b.x < -20) {
                b.x = CONFIG.WIDTH + 20 + Math.random() * 100;
                b.y = 40 + Math.random() * 120;
            }
        }

        // Ground scroll matches pipe speed
        groundScroll = (groundScroll + (pipeSpeed || CONFIG.PIPE_SPEED)) % 24;

        // Day/night cycle advances by real seconds
        cycleTime += (dt || 0);
    }

    function drawSky() {
        // Gradient sky — pulls top/bottom from the current day/night palette
        const palette = getPalette();
        const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT);
        grad.addColorStop(0, palette.skyTop);
        grad.addColorStop(1, palette.skyBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT);
    }

    function drawClouds() {
        for (const c of clouds) {
            ctx.globalAlpha = c.opacity;
            ctx.fillStyle = '#FFFFFF';
            // Pixel cloud: rectangles
            const s = c.h / 3;
            ctx.fillRect(Math.round(c.x), Math.round(c.y), Math.round(c.w), Math.round(s * 2));
            ctx.fillRect(Math.round(c.x + s), Math.round(c.y - s), Math.round(c.w - s * 2), Math.round(s));
            ctx.fillRect(Math.round(c.x + c.w * 0.2), Math.round(c.y + s * 2), Math.round(c.w * 0.6), Math.round(s));
            ctx.globalAlpha = 1;
        }
    }

    function drawBgBirds() {
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        for (const b of bgBirds) {
            const flapY = Math.sin(b.flapTimer) * b.size * 0.6;
            ctx.beginPath();
            ctx.moveTo(b.x - b.size, b.y + flapY);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(b.x + b.size, b.y + flapY);
            ctx.stroke();
        }
    }

    function drawGround() {
        const gy = CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT;

        // Grass top strip
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, gy, CONFIG.WIDTH, 6);
        ctx.fillStyle = '#66BB6A';
        ctx.fillRect(0, gy, CONFIG.WIDTH, 3);

        // Ground body — tinted by day/night palette
        const palette = getPalette();
        ctx.fillStyle = palette.ground;
        ctx.fillRect(0, gy + 6, CONFIG.WIDTH, CONFIG.GROUND_HEIGHT - 6);

        // Stripe pattern
        ctx.fillStyle = CONFIG.COLORS.GROUND_STRIPE;
        for (let x = -groundScroll; x < CONFIG.WIDTH + 24; x += 24) {
            ctx.fillRect(Math.round(x), gy + 8, 12, CONFIG.GROUND_HEIGHT - 10);
        }

        // Dark bottom
        ctx.fillStyle = palette.groundDark;
        ctx.fillRect(0, CONFIG.HEIGHT - 4, CONFIG.WIDTH, 4);
    }

    function drawAll(pipeSpeed) {
        drawSky();
        drawClouds();
        drawBgBirds();
        drawGround();
    }

    return {
        update,
        drawAll,
        drawSky,
        drawGround,
        drawClouds,
        drawBgBirds,
        resetScroll() { groundScroll = 0; }
    };
})();
