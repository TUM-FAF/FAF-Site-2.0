import { Bullet } from '../entities/Bullet.js';

export class ClosingWalls {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets  = [];
    this._speed   = 100 * speedMult;
    this._spacing = 26;
    // SOUND: play attack_walls_spawn.wav here
    this._spawn();
  }

  _spawn() {
    this.bullets = [];
    const rows = Math.floor(this.box.h / this._spacing);
    const gap  = Math.floor(Math.random() * rows);
    for (let i = 0; i < rows; i++) {
      const y = this.box.y + i * this._spacing + this._spacing / 2;
      if (i === gap) continue;
      this.bullets.push(new Bullet(this.box.x - 10,            y,  this._speed, 0, 8, 1, '#ffffff'));
      this.bullets.push(new Bullet(this.box.x + this.box.w + 10, y, -this._speed, 0, 8, 1, '#ffffff'));
    }
  }

  update(dt) {
    for (const b of this.bullets) b.x += b.vx * dt;
    const lead = this.bullets.find(b => b.vx > 0);
    if (lead && lead.x > this.box.x + this.box.w + 14) this._spawn();
  }

  render(ctx) { for (const b of this.bullets) b.render(ctx); }
}
