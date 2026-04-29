import { Bullet } from '../entities/Bullet.js';

export class Crushers {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets = [];
    this._speed    = 140 * speedMult;
    this._timer    = 0;
    this._interval = 0.65;
    // SOUND: play attack_crusher_spawn.wav in _spawnPair
    this._spawnPair();
  }

  _spawnPair() {
    if (this.bullets.length >= 12) return;
    if (Math.random() < 0.5) {
      const x = this.box.x + 20 + Math.random() * (this.box.w - 40);
      this.bullets.push(new Bullet(x, this.box.y - 14,            0,  this._speed, 14, 2, '#ffffff'));
      this.bullets.push(new Bullet(x, this.box.y + this.box.h + 14, 0, -this._speed, 14, 2, '#ffffff'));
    } else {
      const y = this.box.y + 20 + Math.random() * (this.box.h - 40);
      this.bullets.push(new Bullet(this.box.x - 14,            y,  this._speed, 0, 14, 2, '#ffffff'));
      this.bullets.push(new Bullet(this.box.x + this.box.w + 14, y, -this._speed, 0, 14, 2, '#ffffff'));
    }
  }

  update(dt) {
    for (const b of this.bullets) b.moveBy(dt);
    const pad = 30;
    this.bullets = this.bullets.filter(b =>
      b.x > this.box.x - pad && b.x < this.box.x + this.box.w + pad &&
      b.y > this.box.y - pad && b.y < this.box.y + this.box.h + pad
    );
    this._timer += dt;
    if (this._timer >= this._interval) { this._timer -= this._interval; this._spawnPair(); }
  }

  render(ctx) { for (const b of this.bullets) b.render(ctx); }
}
