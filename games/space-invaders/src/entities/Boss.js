import { W, H } from '../utils/constants.js';

const HP           = 25;
const VULN_DUR     = 4.0;
const RECOVER_DUR  = 1.2;
const CYCLE_SIZE   = 4;
const ATTACK_GAP   = 1.1;
const RAY_WARN     = 1.7;
const RAY_ACTIVE   = 0.55;
const RAY_HIT_W    = 14;

class BossBullet {
  constructor(x, y, vx, vy) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.r = 2.5; this.w = 5; this.h = 5;
    this.isEnemy = true; this.isSpecial = false; this.dead = false;
  }
  update(dt) {
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.x < -15 || this.x > W + 15 || this.y < -15 || this.y > H + 15) this.dead = true;
  }
  render(ctx) {
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

class RingAlien {
  constructor(ox, oy, angle) {
    this.ox = ox; this.oy = oy; this.angle = angle;
    this.dist = 0; this.speed = 58;
    this.x = ox; this.y = oy; this.r = 5; this.dead = false;
  }
  update(dt) {
    this.dist += this.speed * dt;
    const zAmp = 11 * Math.sin(this.dist / 16);
    const px = -Math.sin(this.angle), py = Math.cos(this.angle);
    this.x = this.ox + Math.cos(this.angle) * this.dist + px * zAmp;
    this.y = this.oy + Math.sin(this.angle) * this.dist + py * zAmp;
    if (this.x < -15 || this.x > W + 15 || this.y < -15 || this.y > H + 15) this.dead = true;
  }
  render(ctx) {
    const x = Math.round(this.x), y = Math.round(this.y);
    ctx.fillStyle = '#ff8800';
    ctx.beginPath(); ctx.arc(x, y, this.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 3, y - 2, 2, 2); ctx.fillRect(x + 1, y - 2, 2, 2);
  }
}

export class Boss {
  constructor() {
    this.x = W / 2; this.y = 42;
    this.w = 76; this.h = 50;
    this.hp = HP; this.maxHp = HP; this.dead = false;

    this.dir = 1; this.speed = 26;

    this.state      = 'attack';
    this.vulnerable = false;
    this.attackIdx  = 0;
    this.stateTimer = 1.2;

    this.vulnerableTimer = 0;
    this.recoveryTimer   = 0;

    this.bullets    = [];
    this.ringAliens = [];

    this.rayWarning  = false;
    this.rayWarnTime = 0;
    this.rayActive   = false;
    this.rayDuration = 0;
    this.rayX        = W / 2;

    this.hitFlash  = 0;
    this.animTimer = 0;
    this.animFrame = 0;
    this._playerX  = W / 2;
  }

  hit() {
    if (this.dead || !this.vulnerable) return;
    this.hp--;
    this.hitFlash = 0.15;
    if (this.hp <= 0) this.dead = true;
  }

  rayHitsX(shipX) {
    return this.rayActive && Math.abs(shipX - this.rayX) < RAY_HIT_W;
  }

  drainBullets() {
    const out = this.bullets;
    this.bullets = [];
    return out;
  }

  update(dt, playerX) {
    if (this.dead) return;
    this._playerX = playerX;

    this.x += this.dir * this.speed * dt;
    if (this.x > W - this.w / 2 - 4) { this.x = W - this.w / 2 - 4; this.dir = -1; }
    if (this.x < this.w / 2 + 4)     { this.x = this.w / 2 + 4;     this.dir =  1; }

    if (this.hitFlash > 0) this.hitFlash -= dt;
    this.animTimer += dt;
    if (this.animTimer > 0.35) { this.animFrame ^= 1; this.animTimer = 0; }

    for (const ra of this.ringAliens) ra.update(dt);
    this.ringAliens = this.ringAliens.filter(ra => !ra.dead);

    switch (this.state) {
      case 'attack':     this._tickAttack(dt);     break;
      case 'beam':       this._tickBeam(dt);        break;
      case 'ringLaunch': this._tickRingLaunch();   break;
      case 'vulnerable': this._tickVulnerable(dt); break;
      case 'recovery':   this._tickRecovery(dt);   break;
    }
  }

  _tickAttack(dt) {
    this.stateTimer -= dt;
    if (this.stateTimer > 0) return;

    const atkType = this.attackIdx % CYCLE_SIZE;
    if (atkType === 3) {
      this.state = 'beam';
      this.rayWarning  = true;
      this.rayWarnTime = RAY_WARN;
      this.rayX = Math.max(24, Math.min(W - 24, this._playerX + (Math.random() - 0.5) * 24));
      this.attackIdx++;
      return;
    }
    if (atkType === 0) this._fireBulletRain();
    if (atkType === 1) this._fireSideSpray();
    if (atkType === 2) this._fireAimedShot();
    this.attackIdx++;
    this.stateTimer = ATTACK_GAP;

    if (this.attackIdx >= CYCLE_SIZE) {
      this.attackIdx = 0;
      this.state = 'ringLaunch';
    }
  }

  _tickBeam(dt) {
    if (this.rayWarning) {
      this.rayWarnTime -= dt;
      if (this.rayWarnTime <= 0) {
        this.rayWarning = false;
        this.rayActive  = true;
        this.rayDuration = RAY_ACTIVE;
      }
    } else if (this.rayActive) {
      this.rayDuration -= dt;
      if (this.rayDuration <= 0) {
        this.rayActive = false;
        if (this.attackIdx >= CYCLE_SIZE) {
          this.attackIdx = 0;
          this.state = 'ringLaunch';
        } else {
          this.state = 'attack';
          this.stateTimer = ATTACK_GAP;
        }
      }
    }
  }

  _tickRingLaunch() {
    this.state = 'vulnerable';
    this.vulnerable = true;
    this.vulnerableTimer = VULN_DUR;
    const N = 10;
    for (let i = 0; i < N; i++) {
      this.ringAliens.push(new RingAlien(this.x, this.y, (i / N) * Math.PI * 2));
    }
  }

  _tickVulnerable(dt) {
    this.vulnerableTimer -= dt;
    if (this.vulnerableTimer <= 0) {
      this.vulnerable = false;
      this.recoveryTimer = RECOVER_DUR;
      this.state = 'recovery';
    }
  }

  _tickRecovery(dt) {
    this.recoveryTimer -= dt;
    if (this.recoveryTimer <= 0) {
      this.state = 'attack';
      this.stateTimer = ATTACK_GAP * 0.7;
    }
  }

  _fireBulletRain() {
    const count = 10, spread = Math.PI * 0.7, speed = 68;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI / 2 - spread / 2 + (i / (count - 1)) * spread;
      this.bullets.push(new BossBullet(this.x, this.y + this.h / 2, Math.cos(angle) * speed, Math.sin(angle) * speed));
    }
  }

  _fireSideSpray() {
    const count = 5, speed = 62;
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 5 + (i / (count - 1)) * (Math.PI * 0.55);
      this.bullets.push(new BossBullet(this.x - this.w / 2 - 4, this.y, Math.cos(a) * speed, Math.sin(a) * speed));
      this.bullets.push(new BossBullet(this.x + this.w / 2 + 4, this.y, -Math.cos(a) * speed, Math.sin(a) * speed));
    }
  }

  _fireAimedShot() {
    const speed = 105;
    const dx = this._playerX - this.x;
    const dy = H - this.y;
    const baseAngle = Math.atan2(dy, dx);
    for (let i = -1; i <= 1; i++) {
      const angle = baseAngle + i * 0.13;
      this.bullets.push(new BossBullet(this.x, this.y + this.h / 2, Math.cos(angle) * speed, Math.sin(angle) * speed));
    }
  }

  render(ctx, time) {
    if (this.dead) return;
    const bx = Math.round(this.x - this.w / 2);
    const by = Math.round(this.y - this.h / 2);
    const cx = Math.round(this.x);
    const cy = Math.round(this.y);

    for (const ra of this.ringAliens) ra.render(ctx);

    // Vulnerable green border + label
    if (this.vulnerable) {
      const blink = Math.sin(time * 12) > 0;
      ctx.strokeStyle = blink ? '#00ff88' : '#007744';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx - 5, by - 5, this.w + 10, this.h + 10);
      ctx.fillStyle = blink ? '#00ff88' : '#007744';
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VULNERABLE!', cx, by - 16);
      ctx.textAlign = 'left';
    }

    // HP bar
    ctx.fillStyle = '#222';
    ctx.fillRect(bx, by - 10, this.w, 5);
    const hpFrac = this.hp / this.maxHp;
    ctx.fillStyle = this.vulnerable ? '#00ff88' : (hpFrac > 0.5 ? '#ff8800' : hpFrac > 0.25 ? '#ff4400' : '#ff2200');
    ctx.fillRect(bx, by - 10, Math.round(this.w * hpFrac), 5);
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
    ctx.strokeRect(bx, by - 10, this.w, 5);
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.hp}/${this.maxHp}`, cx, by - 13);
    ctx.textAlign = 'left';

    this._drawPumpkin(ctx, cx, cy, by, this.hitFlash > 0, time);

    // Ray telegraph
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

    if (this.rayActive) {
      const alpha = 0.5 + 0.5 * (this.rayDuration / RAY_ACTIVE);
      ctx.fillStyle = `rgba(255,30,30,${alpha * 0.6})`;
      ctx.fillRect(Math.round(this.rayX - RAY_HIT_W), by + this.h, RAY_HIT_W * 2, H);
      ctx.fillStyle = `rgba(255,200,200,${alpha})`;
      ctx.fillRect(Math.round(this.rayX - 3), by + this.h, 6, H);
    }
  }

  _drawPumpkin(ctx, cx, cy, by, flash, time) {
    const vuln = this.vulnerable;
    const bodyC = flash ? '#ffffff' : (vuln ? '#886644' : '#dd6600');
    const darkC = flash ? '#cccccc' : (vuln ? '#664433' : '#aa4400');
    const hh = 24, hw = 34;

    // 3-lobe body
    ctx.fillStyle = bodyC;
    ctx.fillRect(cx - hw,      cy - hh + 5, 14, hh * 2 - 10); // left lobe
    ctx.fillRect(cx - hw + 10, cy - hh,     hw * 2 - 20, hh * 2); // center
    ctx.fillRect(cx + hw - 14, cy - hh + 5, 14, hh * 2 - 10); // right lobe

    // Vertical ridges
    ctx.fillStyle = darkC;
    ctx.fillRect(cx - 1,      cy - hh,     2, hh * 2);
    ctx.fillRect(cx - hw + 18, cy - hh + 4, 2, hh * 2 - 8);
    ctx.fillRect(cx + hw - 20, cy - hh + 4, 2, hh * 2 - 8);

    // Stem
    ctx.fillStyle = '#338800';
    ctx.fillRect(cx - 3, cy - hh - 5, 6, 7);

    if (flash) return;

    if (vuln) {
      // Defeated face: dull yellow, drooping eyes, frown
      ctx.fillStyle = '#ccaa55';
      ctx.fillRect(cx - 13, cy - 8, 7, 5);
      ctx.fillRect(cx + 6,  cy - 8, 7, 5);
      // Drooping brows
      ctx.fillStyle = darkC;
      ctx.fillRect(cx - 14, cy - 13, 8, 2);
      ctx.fillRect(cx + 6,  cy - 13, 8, 2);
      // Frown
      ctx.fillStyle = '#110000';
      ctx.fillRect(cx - 10, cy + 8,  20, 3);
      ctx.fillRect(cx - 8,  cy + 10, 16, 2);
    } else {
      // Angry face
      ctx.fillStyle = this.animFrame ? '#ffdd00' : '#ffbb00';
      // Left V-eye (inner-top corner is high)
      ctx.beginPath();
      ctx.moveTo(cx - 6,  cy - 5);
      ctx.lineTo(cx - 14, cy - 13);
      ctx.lineTo(cx - 14, cy - 5);
      ctx.closePath(); ctx.fill();
      // Right V-eye (mirror)
      ctx.beginPath();
      ctx.moveTo(cx + 6,  cy - 5);
      ctx.lineTo(cx + 14, cy - 13);
      ctx.lineTo(cx + 14, cy - 5);
      ctx.closePath(); ctx.fill();

      // Jagged jack-o-lantern mouth
      ctx.fillStyle = '#000000';
      ctx.fillRect(cx - 14, cy + 3, 28, 12);
      ctx.fillStyle = bodyC;
      // Top teeth (triangle cutouts from top edge)
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 9 - 4, cy + 3);
        ctx.lineTo(cx + i * 9,     cy + 9);
        ctx.lineTo(cx + i * 9 + 4, cy + 3);
        ctx.closePath(); ctx.fill();
      }
      // Bottom teeth (triangle cutouts from bottom edge)
      for (let i = -1; i <= 1; i++) {
        const tx = cx + i * 9 + 4;
        ctx.beginPath();
        ctx.moveTo(tx - 4, cy + 15);
        ctx.lineTo(tx,     cy + 9);
        ctx.lineTo(tx + 4, cy + 15);
        ctx.closePath(); ctx.fill();
      }
    }
  }
}
