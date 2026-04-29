import { Bullet } from '../entities/Bullet.js';

// Two "chomper" rows closing from top and bottom — like a mouth trying to bite
export class Mouth {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets  = [];
    this._speed   = 90 * speedMult;
    this._spacing = 26;
    // SOUND: play attack_mouth_chomp.wav on _spawn
    this._spawn();
  }

  _spawn() {
    this.bullets = [];
    const cols = Math.floor(this.box.w / this._spacing);
    const gapTop = Math.floor(Math.random() * cols);
    const gapBot = Math.floor(Math.random() * cols);
    for (let i = 0; i < cols; i++) {
      const x = this.box.x + i * this._spacing + this._spacing / 2;
      if (i !== gapTop)
        this.bullets.push(new Bullet(x, this.box.y - 10,            0,  this._speed, 8, 1, '#ffffff'));
      if (i !== gapBot)
        this.bullets.push(new Bullet(x, this.box.y + this.box.h + 10, 0, -this._speed, 8, 1, '#ffffff'));
    }
  }

  update(dt) {
    for (const b of this.bullets) b.y += b.vy * dt;
    const top = this.bullets.find(b => b.vy > 0);
    // Respawn when top jaw has crossed through
    if (top && top.y > this.box.y + this.box.h + 14) this._spawn();
  }

  render(ctx) { for (const b of this.bullets) b.render(ctx); }
}
