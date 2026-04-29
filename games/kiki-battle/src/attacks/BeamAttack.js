// Beam attack: warning line (0.8s) → active beam (0.4s) → done
// Collision handled by hitsPlayer() — not bullet-based

export class BeamAttack {
  constructor(box, speedMult = 1) {
    this.box     = box;
    this.bullets = []; // unused — collision via hitsPlayer()
    this.damage  = 3;
    this._time   = 0;
    const count  = 1 + (speedMult >= 1.5 ? 1 : 0) + (Math.random() < 0.4 ? 1 : 0); // 1-3 beams
    // SOUND: play attack_beam_warn.wav at construction, attack_beam_fire.wav when active
    this.beams = Array.from({ length: count }, () => {
      const dir = Math.random() < 0.5 ? 'h' : 'v';
      const pos = dir === 'h'
        ? box.y + 20 + Math.random() * (box.h - 40)
        : box.x + 20 + Math.random() * (box.w - 40);
      return { dir, pos, phase: 'warn', timer: 0.8, width: 20 };
    });
  }

  update(dt) {
    this._time += dt;
    for (const b of this.beams) {
      b.timer -= dt;
      if (b.phase === 'warn' && b.timer <= 0) { b.phase = 'active'; b.timer = 0.4; }
      if (b.phase === 'active' && b.timer <= 0) b.phase = 'done';
    }
  }

  // Returns damage value if player is inside an active beam, 0 otherwise
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
        // Pulsing outline warning (no fill)
        const pulse = Math.abs(Math.sin(time * 10)) * 0.7 + 0.3;
        ctx.strokeStyle = `rgba(255, 221, 0, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        if (b.dir === 'h') {
          ctx.strokeRect(this.box.x, b.pos - b.width / 2, this.box.w, b.width);
        } else {
          ctx.strokeRect(b.pos - b.width / 2, this.box.y, b.width, this.box.h);
        }
        ctx.setLineDash([]);
      } else {
        // Active — solid beam
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
