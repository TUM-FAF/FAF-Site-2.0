export class Bullet {
  constructor(x, y, isEnemy = false, isSpecial = false) {
    this.x = x;
    this.y = y;
    this.isEnemy   = isEnemy;
    this.isSpecial = isSpecial;
    this.dead = false;

    if (isSpecial) {
      this.w = 14; this.h = 10;
      this.speed = 420; this.dy = -1;
    } else if (isEnemy) {
      this.w = 2;  this.h = 8;
      this.speed = 95;  this.dy = 1;
    } else {
      this.w = 2;  this.h = 8;
      this.speed = 230; this.dy = -1;
    }
  }

  update(dt) {
    this.y += this.speed * this.dy * dt;
    if (this.y < -20 || this.y > 300) this.dead = true;
  }

  render(ctx) {
    const x = Math.round(this.x - this.w / 2);
    const y = Math.round(this.y - this.h / 2);

    if (this.isSpecial) {
      ctx.fillStyle = 'rgba(0,220,255,0.25)';
      ctx.fillRect(x - 4, y - 2, this.w + 8, this.h + 4);
      ctx.fillStyle = 'rgba(0,220,255,0.75)';
      ctx.fillRect(x, y, this.w, this.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, y + 2, 6, 6);
    } else if (this.isEnemy) {
      ctx.fillStyle = 'rgba(255,50,50,0.3)';
      ctx.fillRect(x - 1, y - 1, 4, this.h + 2);
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(x, y, 2, this.h);
    } else {
      ctx.fillStyle = 'rgba(0,255,0,0.3)';
      ctx.fillRect(x - 1, y - 1, 4, this.h + 2);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x, y, 2, this.h);
    }
  }
}
