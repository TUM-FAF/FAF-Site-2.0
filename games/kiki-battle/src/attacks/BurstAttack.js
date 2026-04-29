import { Bullet } from '../entities/Bullet.js';

// AK-style rapid burst from a random border point
export class BurstAttack {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets  = [];
    this._speed   = 280 * speedMult;
    this._timer   = 0;
    this._interval = Math.max(0.04, 0.07 / speedMult);
    this._duration = 2.2;
    this._elapsed  = 0;
    this._spread   = 0.22; // radians spread per shot
    // SOUND: play attack_burst_start.wav here
    this._origin   = this._pickOrigin();
    this._angle    = Math.atan2(
      box.y + box.h / 2 - this._origin.y,
      box.x + box.w / 2 - this._origin.x
    );
  }

  _pickOrigin() {
    const side = Math.floor(Math.random() * 4);
    const b = this.box;
    switch (side) {
      case 0: return { x: b.x + Math.random() * b.w, y: b.y - 10 };
      case 1: return { x: b.x + Math.random() * b.w, y: b.y + b.h + 10 };
      case 2: return { x: b.x - 10,        y: b.y + Math.random() * b.h };
      default: return { x: b.x + b.w + 10, y: b.y + Math.random() * b.h };
    }
  }

  update(dt) {
    this._elapsed += dt;
    if (this._elapsed > this._duration) {
      for (const b of this.bullets) { b.moveBy(dt); b.killIfOutside(this.box, 20); }
      this.bullets = this.bullets.filter(b => !b.dead);
      return;
    }
    this._timer += dt;
    while (this._timer >= this._interval) {
      this._timer -= this._interval;
      const a = this._angle + (Math.random() - 0.5) * this._spread;
      this.bullets.push(new Bullet(
        this._origin.x, this._origin.y,
        Math.cos(a) * this._speed, Math.sin(a) * this._speed,
        5, 1, '#ffffff'
      ));
    }
    for (const b of this.bullets) { b.moveBy(dt); b.killIfOutside(this.box, 20); }
    this.bullets = this.bullets.filter(b => !b.dead);
  }

  render(ctx) { for (const b of this.bullets) b.render(ctx); }
}
