const TYPES = [
  { points: 30, color: '#ff5588', color2: '#ff2255' },
  { points: 20, color: '#ffcc33', color2: '#ff9900' },
  { points: 10, color: '#ff8833', color2: '#cc5500' },
];

function bezier2(t, p0, p1, p2) {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

export class Enemy {
  constructor(col, row, type, x, y) {
    this.x = x;
    this.y = y;
    this.col = col;
    this.row = row;
    this.type = Math.max(0, Math.min(2, type));
    this.w = 16;
    this.h = 12;
    this.points = TYPES[this.type].points;
    this.color  = TYPES[this.type].color;
    this.color2 = TYPES[this.type].color2;
    this.dead = false;
    this.frame = 0;
    this.frameTimer = 0;

    // Dive state
    this.diving = false;
    this.diveT = 0;
    this.diveSpeed = 0;
    this.diveP0 = null;
    this.diveP1 = null;
    this.diveP2 = null;
  }

  tick(dt) {
    this.frameTimer += dt;
    if (this.frameTimer > 0.55) { this.frame ^= 1; this.frameTimer = 0; }
  }

  startDive(playerX) {
    const { H } = { H: 270 }; // avoid circular import
    this.diving = true;
    this.diveT = 0;
    this.diveSpeed = 0.55 + Math.random() * 0.3;
    this.diveP0 = { x: this.x, y: this.y };
    const side = Math.random() < 0.5 ? 1 : -1;
    this.diveP1 = { x: this.x + side * 70, y: this.y + 55 };
    this.diveP2 = { x: playerX + (Math.random() - 0.5) * 50, y: 290 };
  }

  updateDiving(dt) {
    this.diveT += this.diveSpeed * dt;
    if (this.diveT >= 1) { this.dead = true; return; }
    const t = this.diveT;
    this.x = bezier2(t, this.diveP0.x, this.diveP1.x, this.diveP2.x);
    this.y = bezier2(t, this.diveP0.y, this.diveP1.y, this.diveP2.y);
    this.tick(dt);
  }

  render(ctx) {
    const x = Math.round(this.x - this.w / 2);
    const y = Math.round(this.y - this.h / 2);
    const c = this.color, c2 = this.color2, f = this.frame;

    if (this.type === 0) {
      ctx.fillStyle = c;
      ctx.fillRect(x + 1, y + 1, 14, 8);
      ctx.fillRect(x, y + 4, 16, 4);
      ctx.fillStyle = c2;
      ctx.fillRect(x + 2, y - 2, 2, 3);
      ctx.fillRect(x + 12, y - 2, 2, 3);
      ctx.fillRect(f === 0 ? x - 2 : x - 1, y + 8, 3, 3);
      ctx.fillRect(f === 0 ? x + 15 : x + 14, y + 8, 3, 3);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(x + 3, y + 2, 3, 3);
      ctx.fillRect(x + 10, y + 2, 3, 3);
    } else if (this.type === 1) {
      ctx.fillStyle = c;
      ctx.fillRect(x + 2, y, 12, 10);
      ctx.fillRect(x, y + 3, 16, 5);
      ctx.fillStyle = c2;
      ctx.fillRect(x + 1, y - 3, 2, 3);
      ctx.fillRect(x + 13, y - 3, 2, 3);
      ctx.fillRect(f === 0 ? x - 3 : x - 1, y + 8, f === 0 ? 4 : 3, 3);
      ctx.fillRect(f === 0 ? x + 15 : x + 14, y + 8, f === 0 ? 4 : 3, 3);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(x + 4, y + 2, 3, 3);
      ctx.fillRect(x + 9, y + 2, 3, 3);
    } else {
      ctx.fillStyle = c;
      ctx.fillRect(x + 3, y, 10, 10);
      ctx.fillRect(x + 1, y + 3, 14, 6);
      ctx.fillStyle = c2;
      if (f === 0) {
        ctx.fillRect(x + 1, y + 9, 3, 3);
        ctx.fillRect(x + 6, y + 9, 4, 3);
        ctx.fillRect(x + 12, y + 9, 3, 3);
      } else {
        ctx.fillRect(x, y + 8, 3, 4);
        ctx.fillRect(x + 6, y + 9, 4, 4);
        ctx.fillRect(x + 13, y + 8, 3, 4);
      }
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(x + 4, y + 2, 3, 3);
      ctx.fillRect(x + 9, y + 2, 3, 3);
    }
  }
}
