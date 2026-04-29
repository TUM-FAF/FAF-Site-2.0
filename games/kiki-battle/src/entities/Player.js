import { PLAYER_SPEED, MAX_HP, INV_DURATION } from '../utils/constants.js';

// Classic space-invader alien shape, 11 cols × 8 rows
const ALIEN = [
  [0,0,1,0,0,0,0,0,1,0,0],
  [0,0,0,1,0,0,0,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,1],
  [0,0,0,1,0,0,0,1,0,0,0],
];
const PX = 1.5;
const COLS = 11, ROWS = 8;

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

  hit(dmg) {
    if (this.invTime > 0) return false;
    this.hp = Math.max(0, this.hp - dmg);
    this.invTime = INV_DURATION;
    if (this.hp <= 0) this.dead = true;
    return true;
  }

  hitsCircle(cx, cy, r) {
    const dx = this.x - cx, dy = this.y - cy;
    return Math.sqrt(dx * dx + dy * dy) < r + 2;
  }

  render(ctx) {
    if (this.invTime > 0 && Math.floor(this.invTime * 12) % 2 === 0) return;
    const ox = Math.round(this.x) - Math.floor(COLS * PX / 2);
    const oy = Math.round(this.y) - Math.floor(ROWS * PX / 2);
    ctx.fillStyle = '#00ee66';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (ALIEN[r][c]) ctx.fillRect(ox + c * PX, oy + r * PX, PX, PX);
      }
    }
  }
}
