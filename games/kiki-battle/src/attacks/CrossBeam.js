// Two crossing beams (H + V) at one intersection point
// Collision via hitsPlayer() — not bullet-based
export class CrossBeam {
  constructor(box, speedMult = 1) {
    this.box     = box;
    this.bullets = [];
    this.damage  = 3;

    const cx = box.x + 40 + Math.random() * (box.w - 80);
    const cy = box.y + 40 + Math.random() * (box.h - 80);
    // SOUND: play attack_beam_warn.wav at construction, attack_beam_fire.wav when active
    this.beams = [
      { dir: 'h', pos: cy, phase: 'warn', timer: 0.9, width: 30 },
      { dir: 'v', pos: cx, phase: 'warn', timer: 0.9, width: 30 },
    ];
  }

  update(dt) {
    for (const b of this.beams) {
      b.timer -= dt;
      if (b.phase === 'warn'   && b.timer <= 0) { b.phase = 'active'; b.timer = 0.45; }
      if (b.phase === 'active' && b.timer <= 0)   b.phase = 'done';
    }
  }

  hitsPlayer(px, py) {
    for (const b of this.beams) {
      if (b.phase !== 'active') continue;
      const hw = b.width / 2;
      if (b.dir === 'h') {
        if (py >= b.pos - hw && py <= b.pos + hw &&
            px >= this.box.x && px <= this.box.x + this.box.w) return this.damage;
      } else {
        if (px >= b.pos - hw && px <= b.pos + hw &&
            py >= this.box.y && py <= this.box.y + this.box.h) return this.damage;
      }
    }
    return 0;
  }

  render(ctx, time) {
    for (const b of this.beams) {
      if (b.phase === 'done') continue;
      if (b.phase === 'warn') {
        const pulse = Math.abs(Math.sin(time * 10)) * 0.7 + 0.3;
        ctx.strokeStyle = `rgba(255, 221, 0, ${pulse})`;
        ctx.lineWidth   = 2;
        ctx.setLineDash([8, 6]);
        if (b.dir === 'h') {
          ctx.strokeRect(this.box.x, b.pos - b.width / 2, this.box.w, b.width);
        } else {
          ctx.strokeRect(b.pos - b.width / 2, this.box.y, b.width, this.box.h);
        }
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = '#ffffff';
        if (b.dir === 'h') {
          ctx.fillRect(this.box.x, b.pos - b.width / 2, this.box.w, b.width);
        } else {
          ctx.fillRect(b.pos - b.width / 2, this.box.y, b.width, this.box.h);
        }
      }
    }
  }
}
