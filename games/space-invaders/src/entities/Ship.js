import { W } from '../utils/constants.js';

export class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 22;
    this.h = 14;
    this.speed = 135;
    this.dead = false;
    this.invincible = false;
    this.invTimer = 0;
  }

  update(dt, keys) {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) this.x -= this.speed * dt;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) this.x += this.speed * dt;
    this.x = Math.max(this.w / 2 + 2, Math.min(W - this.w / 2 - 2, this.x));

    if (this.invincible) {
      this.invTimer -= dt;
      if (this.invTimer <= 0) this.invincible = false;
    }
  }

  // Returns true if damage was taken
  hit() {
    if (this.invincible) return false;
    this.invincible = true;
    this.invTimer = 2;
    return true;
  }

  render(ctx, time) {
    if (this.invincible && Math.floor(time * 8) % 2 === 0) return;
    const x = Math.round(this.x);
    const y = Math.round(this.y);

    // Thruster glow
    ctx.fillStyle = 'rgba(0,200,255,0.4)';
    ctx.fillRect(x - 4, y + 7, 8, 4 + Math.round(Math.sin(time * 20) * 2));

    // Wings
    ctx.fillStyle = '#00aa55';
    ctx.fillRect(x - 16, y + 2, 7, 6);
    ctx.fillRect(x + 9, y + 2, 7, 6);
    // Wing tips
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(x - 17, y + 3, 3, 3);
    ctx.fillRect(x + 14, y + 3, 3, 3);

    // Body
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(x - 10, y - 2, 20, 10);
    // Cockpit
    ctx.fillStyle = '#aaffdd';
    ctx.fillRect(x - 4, y - 4, 8, 6);
    // Cannon
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(x - 2, y - 10, 4, 8);
  }
}
