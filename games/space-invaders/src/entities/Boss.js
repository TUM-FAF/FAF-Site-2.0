import { W, H } from '../utils/constants.js';

const HP          = 20;
const RAY_WARN    = 1.8;  // seconds of dashed-line telegraph
const RAY_ACTIVE  = 0.55; // seconds the beam stays live
const RAY_CD      = 5.0;
const MINION_CD   = 4.5;
const RAY_HIT_W   = 14;   // half-width that counts as a hit on the ship

export class Boss {
  constructor() {
    this.x = W / 2;
    this.y = 38;
    this.w = 80;
    this.h = 36;
    this.hp = HP;
    this.maxHp = HP;
    this.dead = false;

    this.dir = 1;
    this.speed = 24;

    this.rayTimer   = RAY_CD + 2.5;
    this.minionTimer = MINION_CD + 1;

    // Ray phases: idle → warning → active → idle
    this.rayWarning  = false;
    this.rayWarnTime = 0;
    this.rayActive   = false;
    this.rayDuration = 0;
    this.rayX        = W / 2;

    this.hitFlash  = 0;
    this.animTimer = 0;
    this.animFrame = 0;
  }

  hit() {
    if (this.dead) return;
    this.hp--;
    this.hitFlash = 0.12;
    if (this.hp <= 0) this.dead = true;
  }

  // Returns true if shipX is in the beam while it is active
  rayHitsX(shipX) {
    return this.rayActive && Math.abs(shipX - this.rayX) < RAY_HIT_W;
  }

  update(dt, playerX, onSpawnMinion) {
    if (this.dead) return;

    // Side drift
    this.x += this.dir * this.speed * dt;
    if (this.x > W - this.w / 2 - 4) { this.x = W - this.w / 2 - 4; this.dir = -1; }
    if (this.x < this.w / 2 + 4)     { this.x = this.w / 2 + 4;     this.dir =  1; }

    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.animTimer += dt;
    if (this.animTimer > 0.4) { this.animFrame ^= 1; this.animTimer = 0; }

    // Ray: warning phase counts down → fires → active phase counts down
    if (this.rayWarning) {
      this.rayWarnTime -= dt;
      if (this.rayWarnTime <= 0) {
        this.rayWarning = false;
        this.rayActive  = true;
        this.rayDuration = RAY_ACTIVE;
      }
      return; // freeze other attack scheduling during telegraph
    }
    if (this.rayActive) {
      this.rayDuration -= dt;
      if (this.rayDuration <= 0) this.rayActive = false;
      return;
    }

    // Schedule ray
    this.rayTimer -= dt;
    if (this.rayTimer <= 0) {
      this.rayTimer = RAY_CD + Math.random() * 2;
      this.rayWarning  = true;
      this.rayWarnTime = RAY_WARN;
      this.rayX = Math.max(20, Math.min(W - 20, playerX + (Math.random() - 0.5) * 20));
    }

    // Minion spawn
    this.minionTimer -= dt;
    if (this.minionTimer <= 0) {
      this.minionTimer = MINION_CD + Math.random() * 2;
      onSpawnMinion(this.x - this.w / 2 - 6, this.y + this.h / 2);
      onSpawnMinion(this.x + this.w / 2 + 6, this.y + this.h / 2);
    }
  }

  render(ctx, time) {
    if (this.dead) return;
    const bx = Math.round(this.x - this.w / 2);
    const by = Math.round(this.y - this.h / 2);
    const flash = this.hitFlash > 0;

    // HP bar
    ctx.fillStyle = '#222';
    ctx.fillRect(bx, by - 10, this.w, 5);
    const hpFrac = this.hp / this.maxHp;
    ctx.fillStyle = hpFrac > 0.5 ? '#ff0066' : hpFrac > 0.25 ? '#ff6600' : '#ff2200';
    ctx.fillRect(bx, by - 10, Math.round(this.w * hpFrac), 5);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by - 10, this.w, 5);

    // Body — PLACEHOLDER: replace with sprite via ctx.drawImage (see ASSETS.md)
    ctx.fillStyle = flash ? '#ffffff' : '#8800cc';
    ctx.fillRect(bx, by, this.w, this.h);
    if (!flash) {
      ctx.fillStyle = '#6600aa';
      ctx.fillRect(bx + 4, by + 4, this.w - 8, this.h - 8);
      // Eyes
      ctx.fillStyle = this.animFrame === 0 ? '#ff00ff' : '#ff88ff';
      ctx.fillRect(bx + 12, by + 8, 10, 8);
      ctx.fillRect(bx + this.w - 22, by + 8, 10, 8);
      // Mouth
      ctx.fillStyle = '#ff0066';
      ctx.fillRect(bx + 18, by + 22, this.w - 36, 5);
      // Side cannons
      ctx.fillStyle = '#aa00ff';
      ctx.fillRect(bx - 8, by + 12, 10, 6);
      ctx.fillRect(bx + this.w - 2, by + 12, 10, 6);
    }

    // HP label
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.hp}/${this.maxHp}`, this.x, by - 13);
    ctx.textAlign = 'left';

    // Ray telegraph (dashed line + flashing !)
    if (this.rayWarning) {
      const blink = Math.sin(time * 18) > 0;
      ctx.strokeStyle = blink ? 'rgba(255,50,50,0.9)' : 'rgba(255,50,50,0.28)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(Math.round(this.rayX), by + this.h);
      ctx.lineTo(Math.round(this.rayX), H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = blink ? 'rgba(255,50,50,0.9)' : 'rgba(255,50,50,0.3)';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', Math.round(this.rayX), by + this.h + 8);
      ctx.textAlign = 'left';
    }

    // Ray beam (active)
    if (this.rayActive) {
      const alpha = 0.5 + 0.5 * (this.rayDuration / RAY_ACTIVE);
      ctx.fillStyle = `rgba(255,30,30,${alpha * 0.6})`;
      ctx.fillRect(Math.round(this.rayX - RAY_HIT_W), by + this.h, RAY_HIT_W * 2, H);
      ctx.fillStyle = `rgba(255,200,200,${alpha})`;
      ctx.fillRect(Math.round(this.rayX - 3), by + this.h, 6, H);
    }
  }
}
