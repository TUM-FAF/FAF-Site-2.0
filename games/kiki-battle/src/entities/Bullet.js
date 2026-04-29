export class Bullet {
  constructor(x, y, vx, vy, r = 4, dmg = 1, color = '#ffffff') {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.r = r;
    this.dmg = dmg;
    this.color = color;
    this.dead = false;
  }

  moveBy(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  killIfOutside(box, pad = 12) {
    if (this.x < box.x - pad || this.x > box.x + box.w + pad ||
        this.y < box.y - pad || this.y > box.y + box.h + pad) {
      this.dead = true;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}
