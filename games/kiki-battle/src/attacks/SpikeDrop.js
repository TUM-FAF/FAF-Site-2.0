import { Bullet } from '../entities/Bullet.js';

// Warning indicator above column(s), then spike falls fast
export class SpikeDrop {
  constructor(box, speedMult = 1) {
    this.box = box;
    this.bullets  = [];
    this._dropSpeed = 700 * speedMult;
    const count = 2 + (speedMult >= 1.5 ? 1 : 0) + (Math.random() < 0.4 ? 1 : 0); // 2-4 spikes
    this._spikes = Array.from({ length: count }, (_, i) => ({
      x:     box.x + 20 + Math.random() * (box.w - 40),
      phase: 'warn',
      timer: 0.9 + i * 0.05, // slight stagger
      // SOUND: play attack_spike_warn.wav and attack_spike_drop.wav
    }));
  }

  update(dt) {
    for (const s of this._spikes) {
      s.timer -= dt;
      if (s.phase === 'warn' && s.timer <= 0) {
        s.phase = 'drop';
        this.bullets.push(new Bullet(s.x, this.box.y - 8, 0, this._dropSpeed, 10, 3, '#ffffff'));
      }
    }
    for (const b of this.bullets) {
      b.y += b.vy * dt;
      if (b.y > this.box.y + this.box.h + 14) b.dead = true;
    }
    this.bullets = this.bullets.filter(b => !b.dead);
  }

  // Draw warning indicators for spikes still in warn phase
  render(ctx, time) {
    for (const b of this.bullets) b.render(ctx);
    for (const s of this._spikes) {
      if (s.phase !== 'warn') continue;
      const pulse = Math.abs(Math.sin(time * 10)) * 0.6 + 0.4;
      ctx.strokeStyle = `rgba(255, 221, 0, ${pulse})`;
      ctx.lineWidth   = 2;
      ctx.setLineDash([6, 4]);
      // Dashed vertical indicator line
      ctx.beginPath();
      ctx.moveTo(s.x, this.box.y);
      ctx.lineTo(s.x, this.box.y - 20);
      ctx.stroke();
      ctx.setLineDash([]);
      // Down-pointing chevron
      ctx.beginPath();
      ctx.moveTo(s.x - 10, this.box.y - 24);
      ctx.lineTo(s.x,      this.box.y - 14);
      ctx.lineTo(s.x + 10, this.box.y - 24);
      ctx.stroke();
    }
  }
}
