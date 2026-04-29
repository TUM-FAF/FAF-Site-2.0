import { Bullet } from '../entities/Bullet.js';

export class BulletRow {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets  = [];
    this._speed   = 130 * speedMult;
    this._spacing = 18;
    this._dir     = Math.random() < 0.5 ? 1 : -1;
    // SOUND: play attack_row_spawn.wav in _spawn
    this._spawn();
  }

  _spawn() {
    const count  = Math.floor(this.box.w / this._spacing);
    const gap    = Math.floor(Math.random() * (count - 2));
    const startY = this._dir > 0 ? this.box.y - 10 : this.box.y + this.box.h + 10;
    const vy     = this._speed * this._dir;
    for (let i = 0; i < count; i++) {
      if (i === gap || i === gap + 1) continue;
      const x = this.box.x + i * this._spacing + this._spacing / 2;
      this.bullets.push(new Bullet(x, startY, 0, vy, 6, 1, '#ffffff'));
    }
  }

  update(dt) {
    for (const b of this.bullets) {
      b.y += b.vy * dt;
      if (this._dir > 0 && b.y > this.box.y + this.box.h + 12) b.dead = true;
      if (this._dir < 0 && b.y < this.box.y - 12) b.dead = true;
    }
    this.bullets = this.bullets.filter(b => !b.dead);
    if (this.bullets.length === 0) { this._dir = -this._dir; this._spawn(); }
  }

  render(ctx) { for (const b of this.bullets) b.render(ctx); }
}
