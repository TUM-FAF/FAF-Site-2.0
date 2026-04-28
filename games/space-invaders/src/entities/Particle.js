export class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 110;
    this.vy = (Math.random() - 0.5) * 110 - 15;
    this.color = color;
    this.life = 0.35 + Math.random() * 0.3;
    this.maxLife = this.life;
    this.size = 1 + Math.random() * 2;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 60 * dt; // gravity pull
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  render(ctx) {
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.x), Math.round(this.y), Math.ceil(this.size), Math.ceil(this.size));
    ctx.globalAlpha = 1;
  }
}
