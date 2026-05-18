// ============================================
// TDH FLAPPY TOURNAMENT — SCREEN TRANSITIONS
// Smooth fade-to-black between game states
// ============================================

const Transitions = (() => {
    const ctx = Renderer.ctx;

    let active = false;
    let phase = 'none'; // 'fadeOut', 'hold', 'fadeIn', 'none'
    let alpha = 0;
    let timer = 0;

    const FADE_OUT_TIME = 0.35;
    const HOLD_TIME = 0.1;
    const FADE_IN_TIME = 0.35;

    let onMidpoint = null; // callback when fully black
    let flashActive = false;
    let flashAlpha = 0;
    let flashColor = '#FFFFFF';

    function start(midpointCallback) {
        active = true;
        phase = 'fadeOut';
        alpha = 0;
        timer = 0;
        onMidpoint = midpointCallback;
    }

    function flash(color = '#FFFFFF', duration = 0.3) {
        flashActive = true;
        flashAlpha = 1;
        flashColor = color;
    }

    function update(dt) {
        // Flash effect
        if (flashActive) {
            flashAlpha -= dt * 4;
            if (flashAlpha <= 0) {
                flashAlpha = 0;
                flashActive = false;
            }
        }

        if (!active) return false;

        timer += dt;

        switch (phase) {
            case 'fadeOut':
                alpha = Math.min(1, timer / FADE_OUT_TIME);
                if (timer >= FADE_OUT_TIME) {
                    phase = 'hold';
                    timer = 0;
                    if (onMidpoint) {
                        onMidpoint();
                        onMidpoint = null;
                    }
                }
                break;

            case 'hold':
                alpha = 1;
                if (timer >= HOLD_TIME) {
                    phase = 'fadeIn';
                    timer = 0;
                }
                break;

            case 'fadeIn':
                alpha = 1 - Math.min(1, timer / FADE_IN_TIME);
                if (timer >= FADE_IN_TIME) {
                    phase = 'none';
                    alpha = 0;
                    active = false;
                }
                break;
        }

        return active; // true = still transitioning
    }

    function draw() {
        // Flash overlay
        if (flashActive && flashAlpha > 0) {
            ctx.globalAlpha = flashAlpha * 0.6;
            ctx.fillStyle = flashColor;
            ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
            ctx.globalAlpha = 1;
        }

        // Fade overlay
        if (active && alpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
        }
    }

    function isActive() {
        return active;
    }

    return { start, flash, update, draw, isActive };
})();
