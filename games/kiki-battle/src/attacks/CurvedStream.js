import { Bullet } from '../entities/Bullet.js';

// Stream of bullets that arc through the box
export class CurvedStream {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets   = [];
    this._speed    = 190 * speedMult;
    this._curveRate = 1.6; // radians/sec
    this._timer    = 0;
    this._interval = 0.06;
    this._duration = 1.6;
    this._elapsed  = 0;
    const side = Math.floor(Math.random() * 4);
    const b    = box;
    const sign = Math.random() < 0.5 ? 1 : -1;
    // Pick launch edge and base angle toward center, with curve
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    switch (side) {
      case 0: this._ox = b.x + Math.random() * b.w; this._oy = b.y - 8;        break;
      case 1: this._ox = b.x + Math.random() * b.w; this._oy = b.y + b.h + 8;  break;
      case 2: this._ox = b.x - 8;        this._oy = b.y + Math.random() * b.h; break;
      default: this._ox = b.x + b.w + 8; this._oy = b.y + Math.random() * b.h; break;
    }
    this._baseAngle = Math.atan2(cy - this._oy, cx - this._ox);
    this._sign = sign;
    // SOUND: play attack_curve_spawn.wav here
  }

  update(dt) {
    this._elapsed += dt;
    if (this._elapsed <= this._duration) {
      this._timer += dt;
      while (this._timer >= this._interval) {
        this._timer -= this._interval;
        const a  = this._baseAngle + (Math.random() - 0.5) * 0.25;
        const vx = Math.cos(a) * this._speed;
        const vy = Math.sin(a) * this._speed;
        const b  = new Bullet(this._ox, this._oy, vx, vy, 6, 1, '#ffffff');
        b._curveSign = this._sign;
        b._curveRate = this._curveRate;
        this.bullets.push(b);
      }
    }
    for (const b of this.bullets) {
      // Rotate velocity (arc trajectory)
      const angle = Math.atan2(b.vy, b.vx);
      const spd   = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      const na    = angle + b._curveSign * b._curveRate * dt;
      b.vx = Math.cos(na) * spd;
      b.vy = Math.sin(na) * spd;
      b.moveBy(dt);
      b.killIfOutside(this.box, 20);
    }
    this.bullets = this.bullets.filter(b => !b.dead);
  }

  render(ctx) { for (const b of this.bullets) b.render(ctx); }
}
