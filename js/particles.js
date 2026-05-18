// ============================================
// TDH FLAPPY TOURNAMENT — PARTICLE SYSTEM
// Pixel-style square particles for effects
// ============================================

const Particles = (() => {
    const ctx = Renderer.ctx;
    const particles = [];

    function spawn(x, y, count, color, speedMult = 1) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 5 * speedMult,
                vy: (Math.random() - 0.8) * 5 * speedMult,
                size: 2 + Math.random() * 4,
                color,
                life: 0.6 + Math.random() * 0.5,
                maxLife: 0.6 + Math.random() * 0.5,
                gravity: 0.15
            });
        }
    }

    function spawnExplosion(x, y, colors) {
        for (const color of colors) {
            spawn(x, y, 8, color, 1.5);
        }
    }

    function spawnTrail(x, y, color) {
        particles.push({
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: -0.5 - Math.random() * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: 1 + Math.random() * 2,
            color,
            life: 0.2 + Math.random() * 0.2,
            maxLife: 0.3,
            gravity: 0
        });
    }

    function update(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.life -= dt;

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    function draw() {
        for (const p of particles) {
            const alpha = Math.max(0, p.life / p.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.fillRect(
                Math.round(p.x - p.size / 2),
                Math.round(p.y - p.size / 2),
                Math.round(p.size),
                Math.round(p.size)
            );
        }
        ctx.globalAlpha = 1;
    }

    function clear() {
        particles.length = 0;
    }

    return { spawn, spawnExplosion, spawnTrail, update, draw, clear };
})();
