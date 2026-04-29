import { PLAYER_SPEED, MAX_HP, INV_DURATION } from '../utils/constants.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hp = MAX_HP;
    this.maxHp = MAX_HP;
    this.invTime = 0;
    this.dead = false;
  }

  update(dt, keys, box) {
    if (this.invTime > 0) this.invTime -= dt;

    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['a']) dx -= 1;
    if (keys['ArrowRight'] || keys['d']) dx += 1;
    if (keys['ArrowUp']    || keys['w']) dy -= 1;
    if (keys['ArrowDown']  || keys['s']) dy += 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    const spd = PLAYER_SPEED * dt;
    const m = 4;
    this.x = Math.max(box.x + m, Math.min(box.x + box.w - m, this.x + dx * spd));
    this.y = Math.max(box.y + m, Math.min(box.y + box.h - m, this.y + dy * spd));
  }

  // Returns true if damage was applied (not invincible)
  hit(dmg) {
    if (this.invTime > 0) return false;
    this.hp = Math.max(0, this.hp - dmg);
    this.invTime = INV_DURATION;
    if (this.hp <= 0) this.dead = true;
    return true;
  }

  // Circle collision: bullet at (cx,cy) with radius r vs player center with effective radius 2
  hitsCircle(cx, cy, r) {
    const dx = this.x - cx, dy = this.y - cy;
    return Math.sqrt(dx * dx + dy * dy) < r + 2;
  }

  render(ctx) {
    // Flash every other frame during invincibility
    if (this.invTime > 0 && Math.floor(this.invTime * 12) % 2 === 0) return;

    // 7×6 pixel heart centered on (this.x, this.y)
    const ox = Math.round(this.x) - 3;
    const oy = Math.round(this.y) - 3;
    ctx.fillStyle = '#ff0033';
    ctx.fillRect(ox + 1, oy,     2, 1); // .XX.
    ctx.fillRect(ox + 4, oy,     2, 1); //    .XX.
    ctx.fillRect(ox,     oy + 1, 7, 1); // XXXXXXX
    ctx.fillRect(ox,     oy + 2, 7, 1); // XXXXXXX
    ctx.fillRect(ox + 1, oy + 3, 5, 1); // .XXXXX.
    ctx.fillRect(ox + 2, oy + 4, 3, 1); // ..XXX..
    ctx.fillRect(ox + 3, oy + 5, 1, 1); // ...X...
  }
}
