import { Bullet } from '../entities/Bullet.js';

export class Ladder {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets      = [];
    this._rowSpeed    = 120 * speedMult;
    this._spacing     = 18;
    this._gapWidth    = 50;
    this._gapStep     = 36;
    this._gapX        = box.x + Math.random() * (box.w - 50);
    this._rowTimer    = 0;
    this._rowInterval = Math.max(0.45, 0.8 / speedMult);
    // SOUND: play attack_ladder_spawn.wav in _spawnRow
    this._spawnRow();
  }

  _spawnRow() {
    const count = Math.ceil(this.box.w / this._spacing);
    for (let i = 0; i < count; i++) {
      const x = this.box.x + i * this._spacing + this._spacing / 2;
      if (x >= this._gapX && x < this._gapX + this._gapWidth) continue;
      this.bullets.push(new Bullet(x, this.box.y - 8, 0, this._rowSpeed, 6, 1, '#ffffff'));
    }
    this._gapX += this._gapStep;
    if (this._gapX + this._gapWidth > this.box.x + this.box.w - 6) {
      this._gapStep = -Math.abs(this._gapStep);
      this._gapX    = this.box.x + this.box.w - this._gapWidth - 6;
    } else if (this._gapX < this.box.x + 6) {
      this._gapStep = Math.abs(this._gapStep);
      this._gapX    = this.box.x + 6;
    }
  }

  update(dt) {
    this._rowTimer += dt;
    if (this._rowTimer >= this._rowInterval) { this._rowTimer -= this._rowInterval; this._spawnRow(); }
    for (const b of this.bullets) {
      b.y += b.vy * dt;
      if (b.y > this.box.y + this.box.h + 10) b.dead = true;
    }
    this.bullets = this.bullets.filter(b => !b.dead);
  }

  render(ctx) { for (const b of this.bullets) b.render(ctx); }
}
