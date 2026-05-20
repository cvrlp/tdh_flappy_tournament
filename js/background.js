// ============================================
// TDH FLAPPY TOURNAMENT — ANIMATED BACKGROUND
// Scrolling sky, clouds, distant birds, ground, weather
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

    // --- Calamity weather rotation ---
    const CALAMITY_WEATHERS = ['STORM', 'BLOOD_MOON', 'ASHFALL', 'ECLIPSE'];
    let weatherIndex = 0;
    let weatherTime = 0;

    // Precipitation pools
    const RAIN_COUNT = 220;
    const RAIN_WIND_X = 2.2;
    const rainDrops = [];

    const ASH_COUNT = 140;
    const ashEmbers = [];

    // Lightning (visible bolt, no full-screen flash)
    let lightningTimer = 0;
    let lightningLife = 0;          // current bolt remaining time
    let lightningBolt = null;       // {segments: [{x,y}], branches: [[{x,y}]]}

    function ensureParticles() {
        if (!rainDrops.length) {
            for (let i = 0; i < RAIN_COUNT; i++) {
                rainDrops.push({
                    x: Math.random() * CONFIG.WIDTH * 1.3,
                    y: Math.random() * CONFIG.HEIGHT,
                    len: 8 + Math.random() * 8,
                    vy: 9 + Math.random() * 7,
                    alpha: 0.25 + Math.random() * 0.4
                });
            }
        }
        if (!ashEmbers.length) {
            for (let i = 0; i < ASH_COUNT; i++) {
                ashEmbers.push({
                    x: Math.random() * CONFIG.WIDTH,
                    y: Math.random() * CONFIG.HEIGHT,
                    size: 1 + Math.random() * 2,
                    vy: 0.6 + Math.random() * 1.2,
                    drift: (Math.random() - 0.5) * 0.6,
                    flicker: Math.random() * Math.PI * 2,
                    alpha: 0.4 + Math.random() * 0.4
                });
            }
        }
    }

    function getActivePreset() {
        return (typeof Game !== 'undefined' && CONFIG.DIFFICULTY_PRESETS[Game.getDifficulty()])
            || CONFIG.DIFFICULTY_PRESETS.HARD;
    }

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

    // --- Calamity helpers ---

    function getCurrentWeather() { return CALAMITY_WEATHERS[weatherIndex]; }
    function getNextWeather() {
        return CALAMITY_WEATHERS[(weatherIndex + 1) % CALAMITY_WEATHERS.length];
    }

    function getWeatherPalette(id) {
        switch (id) {
            case 'STORM':      return CONFIG.PALETTE_STORM;
            case 'BLOOD_MOON': return CONFIG.PALETTE_BLOOD_MOON;
            case 'ASHFALL':    return CONFIG.PALETTE_ASHFALL;
            case 'ECLIPSE':    return CONFIG.PALETTE_ECLIPSE;
            default:           return CONFIG.PALETTE_STORM;
        }
    }

    // 0..1 — how far into the crossfade window we are (0 outside it)
    function getTransitionT() {
        const preset = getActivePreset();
        const dur = preset.weatherDuration || 28;
        const tr  = preset.weatherTransition || 4;
        if (weatherTime < dur - tr) return 0;
        return Math.min(1, (weatherTime - (dur - tr)) / tr);
    }

    // Soft fade for precipitation so phase boundaries aren't a hard pop.
    function getPrecipitationAlpha() {
        const preset = getActivePreset();
        if (preset.weather !== 'calamity') return 0;
        const dur = preset.weatherDuration || 28;
        const tr  = preset.weatherTransition || 4;
        const half = tr / 2;
        if (weatherTime < half) return weatherTime / half;
        if (weatherTime > dur - half) return Math.max(0, (dur - weatherTime) / half);
        return 1;
    }

    // Returns the current sky/ground palette by interpolating four stops
    // around the cycle: day (0.0) -> dusk (0.25) -> night (0.5) -> dawn (0.75) -> day (1.0)
    function getPalette() {
        const preset = getActivePreset();

        if (preset.weather === 'calamity') {
            const cur  = getWeatherPalette(getCurrentWeather());
            const next = getWeatherPalette(getNextWeather());
            return lerpPalette(cur, next, getTransitionT());
        }

        if (!preset.dayNight) return CONFIG.PALETTE_DAY;
        const period = preset.dayNightPeriod || CONFIG.DAY_NIGHT_PERIOD_SEC;
        const t = (cycleTime % period) / period;
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

    // Build a jagged lightning bolt: vertical zigzag with horizontal jitter,
    // plus 1-2 short branches off the main trunk.
    function spawnLightningBolt() {
        const startX = 60 + Math.random() * (CONFIG.WIDTH - 120);
        const startY = 6;
        const endY = 90 + Math.random() * 60;
        const segments = [];
        const segCount = 7 + Math.floor(Math.random() * 4);
        for (let i = 0; i <= segCount; i++) {
            const t = i / segCount;
            const y = startY + (endY - startY) * t;
            const jitter = (Math.random() - 0.5) * 30 * (1 - Math.abs(t - 0.5));
            const x = startX + jitter + (Math.random() - 0.5) * 6;
            segments.push({ x, y });
        }
        const branches = [];
        const branchCount = 1 + Math.floor(Math.random() * 2);
        for (let b = 0; b < branchCount; b++) {
            const startIdx = 2 + Math.floor(Math.random() * (segments.length - 3));
            const origin = segments[startIdx];
            const branch = [origin];
            const len = 2 + Math.floor(Math.random() * 3);
            const dir = Math.random() < 0.5 ? -1 : 1;
            for (let s = 1; s <= len; s++) {
                branch.push({
                    x: origin.x + dir * (s * 8 + Math.random() * 6),
                    y: origin.y + s * 10 + Math.random() * 6
                });
            }
            branches.push(branch);
        }
        lightningBolt = { segments, branches };
        lightningLife = 0.18; // ~3 frames of bright bolt, then fades
        Audio.thunder();
    }

    function update(pipeSpeed, dt) {
        const realDt = dt || 0;

        // Clouds drift
        for (const c of clouds) {
            c.x -= c.speed;
            if (c.x + c.w < -20) {
                c.x = CONFIG.WIDTH + 20 + Math.random() * 60;
                c.y = 30 + Math.random() * 180;
                c.w = 40 + Math.random() * 60;
            }
        }

        // Background birds
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

        const preset = getActivePreset();
        if (preset.dayNight) cycleTime += realDt;

        if (preset.weather === 'calamity') {
            ensureParticles();
            const dur = preset.weatherDuration || 28;
            weatherTime += realDt;
            if (weatherTime >= dur) {
                weatherTime = 0;
                weatherIndex = (weatherIndex + 1) % CALAMITY_WEATHERS.length;
            }

            const current = getCurrentWeather();

            // Rain (storm + blood moon)
            if (current === 'STORM' || current === 'BLOOD_MOON') {
                for (const d of rainDrops) {
                    d.y += d.vy;
                    d.x -= RAIN_WIND_X;
                    if (d.y > CONFIG.HEIGHT) {
                        d.y = -10 - Math.random() * 20;
                        d.x = Math.random() * CONFIG.WIDTH * 1.3;
                    } else if (d.x < -20) {
                        d.x = CONFIG.WIDTH + 10;
                        d.y = Math.random() * CONFIG.HEIGHT;
                    }
                }
            }

            // Ash (ashfall)
            if (current === 'ASHFALL') {
                for (const e of ashEmbers) {
                    e.y += e.vy;
                    e.x += e.drift;
                    e.flicker += realDt * 4;
                    if (e.y > CONFIG.HEIGHT) {
                        e.y = -5;
                        e.x = Math.random() * CONFIG.WIDTH;
                    }
                    if (e.x < -5) e.x = CONFIG.WIDTH + 5;
                    else if (e.x > CONFIG.WIDTH + 5) e.x = -5;
                }
            }

            // Lightning only during STORM phase
            if (current === 'STORM') {
                if (lightningLife > 0) lightningLife = Math.max(0, lightningLife - realDt);
                lightningTimer -= realDt;
                if (lightningTimer <= 0) {
                    spawnLightningBolt();
                    const expected = 1 / (preset.lightningChancePerSec || 0.4);
                    lightningTimer = expected * (0.5 + Math.random());
                }
            } else {
                lightningLife = 0;
                lightningBolt = null;
                lightningTimer = 3 + Math.random() * 3; // arm for next storm phase
            }

            cycleTime += realDt; // keep ambient motion going
        } else {
            // Clean up if leaving a calamity preset mid-session
            lightningLife = 0;
            lightningBolt = null;
        }
    }

    function drawSky() {
        const palette = getPalette();
        const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT);
        grad.addColorStop(0, palette.skyTop);
        grad.addColorStop(1, palette.skyBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT);
    }

    function drawClouds() {
        const preset = getActivePreset();
        const inCalamity = preset.weather === 'calamity';
        const current = inCalamity ? getCurrentWeather() : null;

        // Pick cloud color/opacity for the current Calamity phase
        let cloudColor = '#FFFFFF';
        let opacityBoost = 0;
        if (inCalamity) {
            switch (current) {
                case 'STORM':      cloudColor = '#2a2d33'; opacityBoost = 0.35; break;
                case 'BLOOD_MOON': cloudColor = '#3a141a'; opacityBoost = 0.30; break;
                case 'ASHFALL':    cloudColor = '#3a2a1a'; opacityBoost = 0.30; break;
                case 'ECLIPSE':    cloudColor = '#15151c'; opacityBoost = 0.40; break;
            }
        }

        for (const c of clouds) {
            ctx.globalAlpha = inCalamity ? Math.min(1, c.opacity + opacityBoost) : c.opacity;
            ctx.fillStyle = cloudColor;
            const s = c.h / 3;
            ctx.fillRect(Math.round(c.x), Math.round(c.y), Math.round(c.w), Math.round(s * 2));
            ctx.fillRect(Math.round(c.x + s), Math.round(c.y - s), Math.round(c.w - s * 2), Math.round(s));
            ctx.fillRect(Math.round(c.x + c.w * 0.2), Math.round(c.y + s * 2), Math.round(c.w * 0.6), Math.round(s));
            ctx.globalAlpha = 1;
        }
    }

    function drawBloodMoon() {
        const cx = CONFIG.WIDTH * 0.78;
        const cy = 80;
        const r = 42;
        // Soft outer halo
        const halo = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2.2);
        halo.addColorStop(0, 'rgba(180, 30, 30, 0.45)');
        halo.addColorStop(1, 'rgba(180, 30, 30, 0)');
        ctx.fillStyle = halo;
        ctx.fillRect(cx - r * 2.5, cy - r * 2.5, r * 5, r * 5);
        // Moon body
        ctx.fillStyle = '#8b1818';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#a82424';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 6, r - 4, 0, Math.PI * 2);
        ctx.fill();
        // Craters
        ctx.fillStyle = '#641111';
        ctx.beginPath(); ctx.arc(cx - 12, cy - 4, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 8, cy + 10, 7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 14, cy - 12, 3, 0, Math.PI * 2); ctx.fill();
    }

    function drawEclipse() {
        const cx = CONFIG.WIDTH * 0.5;
        const cy = 100;
        const r = 38;
        // Bright corona
        const corona = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 2.0);
        corona.addColorStop(0, 'rgba(255, 90, 60, 0.85)');
        corona.addColorStop(0.4, 'rgba(255, 60, 30, 0.35)');
        corona.addColorStop(1, 'rgba(255, 60, 30, 0)');
        ctx.fillStyle = corona;
        ctx.fillRect(cx - r * 2.5, cy - r * 2.5, r * 5, r * 5);
        // Black disc
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawRain() {
        const preset = getActivePreset();
        if (preset.weather !== 'calamity') return;
        const current = getCurrentWeather();
        if (current !== 'STORM' && current !== 'BLOOD_MOON') return;
        const a = getPrecipitationAlpha();
        if (a <= 0) return;
        ctx.strokeStyle = current === 'BLOOD_MOON' ? '#c83838' : '#a8c8dc';
        ctx.lineWidth = 1;
        for (const d of rainDrops) {
            ctx.globalAlpha = d.alpha * a;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - d.len * 0.35, d.y + d.len);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    function drawAsh() {
        const preset = getActivePreset();
        if (preset.weather !== 'calamity') return;
        if (getCurrentWeather() !== 'ASHFALL') return;
        const a = getPrecipitationAlpha();
        if (a <= 0) return;
        for (const e of ashEmbers) {
            const flick = 0.6 + 0.4 * Math.sin(e.flicker);
            ctx.globalAlpha = e.alpha * a * flick;
            // Mix of warm embers and cold ash
            ctx.fillStyle = e.size > 2 ? '#ff7733' : '#888080';
            ctx.fillRect(Math.round(e.x), Math.round(e.y), Math.round(e.size), Math.round(e.size));
        }
        ctx.globalAlpha = 1;
    }

    function drawLightning() {
        const preset = getActivePreset();
        if (preset.weather !== 'calamity') return;
        if (getCurrentWeather() !== 'STORM') return;
        if (lightningLife <= 0 || !lightningBolt) return;

        // Fade the bolt over its life (0.18s)
        const fade = Math.min(1, lightningLife / 0.18);
        ctx.save();
        ctx.lineCap = 'round';
        // Outer glow (wider, dimmer)
        ctx.strokeStyle = `rgba(180, 200, 255, ${0.4 * fade})`;
        ctx.lineWidth = 6;
        drawBoltPath(lightningBolt);
        // Inner bright core
        ctx.strokeStyle = `rgba(245, 250, 255, ${0.95 * fade})`;
        ctx.lineWidth = 2;
        drawBoltPath(lightningBolt);
        ctx.restore();
    }

    function drawBoltPath(bolt) {
        ctx.beginPath();
        const segs = bolt.segments;
        ctx.moveTo(segs[0].x, segs[0].y);
        for (let i = 1; i < segs.length; i++) ctx.lineTo(segs[i].x, segs[i].y);
        ctx.stroke();
        for (const br of bolt.branches) {
            ctx.beginPath();
            ctx.moveTo(br[0].x, br[0].y);
            for (let i = 1; i < br.length; i++) ctx.lineTo(br[i].x, br[i].y);
            ctx.stroke();
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

        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, gy, CONFIG.WIDTH, 6);
        ctx.fillStyle = '#66BB6A';
        ctx.fillRect(0, gy, CONFIG.WIDTH, 3);

        const palette = getPalette();
        ctx.fillStyle = palette.ground;
        ctx.fillRect(0, gy + 6, CONFIG.WIDTH, CONFIG.GROUND_HEIGHT - 6);

        ctx.fillStyle = CONFIG.COLORS.GROUND_STRIPE;
        for (let x = -groundScroll; x < CONFIG.WIDTH + 24; x += 24) {
            ctx.fillRect(Math.round(x), gy + 8, 12, CONFIG.GROUND_HEIGHT - 10);
        }

        ctx.fillStyle = palette.groundDark;
        ctx.fillRect(0, CONFIG.HEIGHT - 4, CONFIG.WIDTH, 4);
    }

    function drawSkyDecorations() {
        const preset = getActivePreset();
        if (preset.weather !== 'calamity') return;
        const current = getCurrentWeather();
        if (current === 'BLOOD_MOON') drawBloodMoon();
        else if (current === 'ECLIPSE') drawEclipse();
    }

    function drawAll(pipeSpeed) {
        drawSky();
        drawSkyDecorations();
        drawClouds();
        // Background birds vanish during Calamity weather
        if (getActivePreset().weather !== 'calamity') drawBgBirds();
        drawRain();
        drawAsh();
        drawGround();
    }

    function resetWeather() {
        weatherIndex = 0;
        weatherTime = 0;
        lightningLife = 0;
        lightningBolt = null;
        lightningTimer = 3 + Math.random() * 3;
    }

    function getCalamityWeather() {
        return getActivePreset().weather === 'calamity' ? getCurrentWeather() : null;
    }

    return {
        update,
        drawAll,
        drawSky,
        drawGround,
        drawClouds,
        drawBgBirds,
        drawRain,
        drawAsh,
        drawLightning,
        drawSkyDecorations,
        resetScroll() { groundScroll = 0; },
        resetWeather,
        getCalamityWeather
    };
})();
