// ============================================
// TDH FLAPPY TOURNAMENT — BIRD CLASS
// Player-controlled bird with physics
// ============================================

class Bird {
    constructor(playerIndex, charId, playerName, x) {
        this.playerIndex = playerIndex;
        this.charId = charId;
        this.char = Characters.getCharacter(charId);
        this.name = playerName || (playerIndex === 0 ? 'P1' : 'P2');

        this.x = x;
        this.y = CONFIG.HEIGHT / 2;
        this.vy = 0;
        this.alive = true;
        this.score = 0;

        // Animation
        this.flapFrame = 1;
        this.flapTimer = 0;
        this.rotation = 0;

        // Trail particle timer
        this.trailTimer = 0;
    }

    reset(y) {
        this.y = y || CONFIG.HEIGHT / 2;
        this.vy = 0;
        this.alive = true;
        this.score = 0;
        this.flapFrame = 1;
        this.rotation = 0;
    }

    flap() {
        if (!this.alive) return;
        this.vy = CONFIG.JUMP_VELOCITY;
        this.flapFrame = 0;
        this.flapTimer = 0;
        Audio.flap();
    }

    update(dt) {
        if (!this.alive) return;

        // Gravity
        this.vy += CONFIG.GRAVITY;
        if (this.vy > CONFIG.TERMINAL_VELOCITY) {
            this.vy = CONFIG.TERMINAL_VELOCITY;
        }
        this.y += this.vy;

        // Flap animation
        this.flapTimer += dt;
        if (this.flapTimer > 0.1) {
            this.flapFrame = (this.flapFrame + 1) % 3;
            this.flapTimer = 0;
        }

        // Rotation based on velocity
        this.rotation = Math.max(-0.5, Math.min(this.vy / 12, 1.2));

        // Trail particles
        this.trailTimer += dt;
        if (this.trailTimer > 0.05) {
            Particles.spawnTrail(this.x, this.y + CONFIG.BIRD_SIZE / 2, this.char.wing);
            this.trailTimer = 0;
        }

        // Ceiling
        if (this.y < 0) {
            this.y = 0;
            this.vy = 0;
        }

        // Ground collision
        if (this.y + CONFIG.BIRD_SIZE >= CONFIG.HEIGHT - CONFIG.GROUND_HEIGHT) {
            this.die();
        }
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        Audio.death();
        Particles.spawnExplosion(
            this.x + CONFIG.BIRD_SIZE / 2,
            this.y + CONFIG.BIRD_SIZE / 2,
            [this.char.body, this.char.wing, this.char.belly, '#FFF']
        );
    }

    draw() {
        const ctx = Renderer.ctx;
        ctx.save();

        // Apply rotation
        const cx = this.x + CONFIG.BIRD_SIZE / 2;
        const cy = this.y + CONFIG.BIRD_SIZE / 2;
        ctx.translate(cx, cy);
        ctx.rotate(this.rotation);
        ctx.translate(-cx, -cy);

        Characters.drawBird(
            ctx, this.char,
            this.x, this.y,
            CONFIG.BIRD_SIZE,
            this.flapFrame,
            true,
            !this.alive
        );

        ctx.restore();

        // Name tag above bird
        if (this.alive) {
            const tagColor = this.playerIndex === 0 ? CONFIG.COLORS.P1_COLOR : CONFIG.COLORS.P2_COLOR;
            Renderer.drawText(this.name, cx, this.y - 10, 5, tagColor, 'center', true);
        }
    }

    // Hitbox (smaller than visual for fairness)
    getHitbox() {
        const shrink = CONFIG.BIRD_HITBOX_SHRINK;
        return {
            x: this.x + shrink,
            y: this.y + shrink,
            w: CONFIG.BIRD_SIZE - shrink * 2,
            h: CONFIG.BIRD_SIZE - shrink * 2
        };
    }
}
