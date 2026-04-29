import { Bullet } from '../entities/Bullet.js';

export class Rain {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets = [];
    this._timer    = 0;
    this._interval = Math.max(0.08, 0.18 / speedMult);
    this._speed    = 150 * speedMult;
    // SOUND: play attack_rain_spawn.wav in _spawnBullet
  }

  update(dt) {
    this._timer += dt;
    while (this._timer >= this._interval) {
      this._timer -= this._interval;
      const x  = this.box.x + 8 + Math.random() * (this.box.w - 16);
      const vy = this._speed + (Math.random() - 0.5) * 40;
      this.bullets.push(new Bullet(x, this.box.y - 8, 0, vy, 6, 1, '#ffffff'));
    }
    for (const b of this.bullets) { b.moveBy(dt); b.killIfOutside(this.box); }
    this.bullets = this.bullets.filter(b => !b.dead);
  }

  render(ctx) { for (const b of this.bullets) b.render(ctx); }
}
