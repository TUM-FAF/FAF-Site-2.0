import { W, H, BOX, BOX_EXPAND, BOX_SHRINK } from '../utils/constants.js';

const POS_KEYS   = ['z', 'x', 'c', 'v'];
const POS_TYPES  = ['heal', 'shield', 'score2x', 'expandArena'];
const POS_LABELS = ['Z', 'X', 'C', 'V'];
const POS_COLORS = ['#00ff88', '#4488ff', '#ffdd00', '#aa44ff'];
const POS_DESCS  = ['HEAL', 'SHIELD', '2× SCORE', 'EXPAND'];

const NEG_KEYS   = ['b', 'n'];
const NEG_TYPES  = ['shrinkArena', 'speedUp'];
const NEG_LABELS = ['B', 'N'];
const NEG_COLORS = ['#ff4444', '#ff8800'];
const NEG_DESCS  = ['SHRINK', 'SPEED UP'];

const ALL_KEYS   = [...POS_KEYS,   ...NEG_KEYS];
const ALL_TYPES  = [...POS_TYPES,  ...NEG_TYPES];
const ALL_LABELS = [...POS_LABELS, ...NEG_LABELS];
const ALL_COLORS = [...POS_COLORS, ...NEG_COLORS];
const ALL_DESCS  = [...POS_DESCS,  ...NEG_DESCS];

const KEY_SIZE      = 52;
const VISIBLE       = 4.0;
const FADE_AT       = 3.0;
const COOLDOWN      = 2.5;   // seconds before same key can be used again
const FLASH_DUR     = 0.55;  // penalty flash duration

export class BoostSystem {
  constructor() {
    this._active      = [];
    this._spawnTimer  = 0;
    this._spawnInterval = 3.5;
    this._cooldowns   = {};   // key → remaining cooldown seconds
    this._penaltyFlashes = []; // { key, x, y, age }

    this.hasShield      = false;
    this.scoreX2        = false;
    this.scoreX2Timer   = 0;
    this.arenaExpanded  = false;
    this.arenaTimer     = 0;
    this.shrinkActive   = false;
    this.shrinkTimer    = 0;
    this.speedUpActive  = false;
    this.speedUpTimer   = 0;
  }

  get speedUpMult() { return this.speedUpActive ? 1.5 : 1.0; }

  get currentBox() {
    if (this.shrinkActive) {
      return {
        x: BOX.x + BOX_SHRINK.dx,
        y: BOX.y + BOX_SHRINK.dy,
        w: BOX.w - BOX_SHRINK.dx * 2,
        h: BOX.h - BOX_SHRINK.dy * 2,
      };
    }
    if (this.arenaExpanded) {
      return {
        x: BOX.x - BOX_EXPAND.dx,
        y: BOX.y - BOX_EXPAND.dy,
        w: BOX.w + BOX_EXPAND.dx * 2,
        h: BOX.h + BOX_EXPAND.dy * 2,
      };
    }
    return BOX;
  }

  update(dt) {
    if (this.scoreX2Timer  > 0) { this.scoreX2Timer  -= dt; if (this.scoreX2Timer  <= 0) this.scoreX2 = false; }
    if (this.arenaTimer    > 0) { this.arenaTimer    -= dt; if (this.arenaTimer    <= 0) this.arenaExpanded = false; }
    if (this.shrinkTimer   > 0) { this.shrinkTimer   -= dt; if (this.shrinkTimer   <= 0) this.shrinkActive = false; }
    if (this.speedUpTimer  > 0) { this.speedUpTimer  -= dt; if (this.speedUpTimer  <= 0) this.speedUpActive = false; }

    // Tick cooldowns
    for (const k of ALL_KEYS) {
      if (this._cooldowns[k] > 0) this._cooldowns[k] -= dt;
    }

    this._spawnTimer += dt;
    if (this._spawnTimer >= this._spawnInterval && this._active.length < 2) {
      this._spawnTimer = 0;
      this._trySpawn();
    }

    for (const k of this._active) {
      k.age += dt;
      k.alpha = k.age >= FADE_AT ? Math.max(0, 1 - (k.age - FADE_AT) / (VISIBLE - FADE_AT)) : 1;
    }
    this._active = this._active.filter(k => k.age < VISIBLE);

    // Tick penalty flashes
    for (const f of this._penaltyFlashes) {
      f.age += dt;
      f.alpha = Math.max(0, 1 - f.age / FLASH_DUR);
    }
    this._penaltyFlashes = this._penaltyFlashes.filter(f => f.age < FLASH_DUR);
  }

  _trySpawn() {
    const existing = new Set(this._active.map(k => k.key));
    const pool = ALL_KEYS.filter(k => !existing.has(k));
    if (!pool.length) return;

    const key = pool[Math.floor(Math.random() * pool.length)];
    const box = this.currentBox;

    let x, y, tries = 0;
    do {
      x = 50 + Math.random() * (W - 100);
      y = 50 + Math.random() * (H - 100);
      tries++;
    } while (
      tries < 25 &&
      x > box.x - 40 && x < box.x + box.w + 40 &&
      y > box.y - 40 && y < box.y + box.h + 40
    );

    this._active.push({ key, age: 0, alpha: 1, x, y });
  }

  _spawnPenaltyFlash(key) {
    const box = this.currentBox;
    let x, y, tries = 0;
    do {
      x = 60 + Math.random() * (W - 120);
      y = 60 + Math.random() * (H - 120);
      tries++;
    } while (
      tries < 15 &&
      x > box.x - 40 && x < box.x + box.w + 40 &&
      y > box.y - 40 && y < box.y + box.h + 40
    );
    this._penaltyFlashes.push({ key, x, y, age: 0, alpha: 1 });
  }

  // Returns { action: 'boost', type } | { action: 'penalty' } | null
  pressKey(key, player) {
    const idx = ALL_KEYS.indexOf(key.toLowerCase());
    if (idx === -1) return null;

    const k = ALL_KEYS[idx];

    // On cooldown — spam penalty
    if ((this._cooldowns[k] ?? 0) > 0) {
      this._spawnPenaltyFlash(k);
      return { action: 'penalty' };
    }

    const tile = this._active.find(t => t.key === k);
    if (!tile) {
      // No matching tile visible — wrong-key penalty
      this._spawnPenaltyFlash(k);
      this._cooldowns[k] = COOLDOWN;
      return { action: 'penalty' };
    }

    // Valid press — consume tile, apply boost, set cooldown
    tile.age = VISIBLE;
    this._cooldowns[k] = COOLDOWN;
    // SOUND: play boost_{ALL_TYPES[idx]}.wav here
    this._apply(ALL_TYPES[idx], player);
    return { action: 'boost', type: ALL_TYPES[idx] };
  }

  _apply(type, player) {
    switch (type) {
      case 'heal':         player.hp = Math.min(player.maxHp, player.hp + 5); break;
      case 'shield':       this.hasShield = true; break;
      case 'score2x':      this.scoreX2 = true; this.scoreX2Timer = 5.0; break;
      case 'expandArena':  this.arenaExpanded = true; this.arenaTimer = 8.0; break;
      case 'shrinkArena':  this.shrinkActive = true; this.shrinkTimer = 5.0; break;
      case 'speedUp':      this.speedUpActive = true; this.speedUpTimer = 4.0; break;
    }
  }

  render(ctx) {
    for (const k of this._active) {
      if (k.alpha <= 0) continue;
      const idx = ALL_KEYS.indexOf(k.key);
      ctx.globalAlpha = k.alpha;
      this._drawTile(ctx, k.x, k.y, ALL_LABELS[idx], ALL_COLORS[idx], ALL_DESCS[idx]);
      ctx.globalAlpha = 1;
    }
    // Penalty flashes — red tile with "−100" that fades fast
    for (const f of this._penaltyFlashes) {
      if (f.alpha <= 0) continue;
      const idx = ALL_KEYS.indexOf(f.key);
      ctx.globalAlpha = f.alpha;
      this._drawTile(ctx, f.x, f.y, ALL_LABELS[idx], '#ff2222', '−100');
      ctx.globalAlpha = 1;
    }
  }

  _drawTile(ctx, cx, cy, label, color, desc) {
    const s = KEY_SIZE;
    const x = cx - s / 2, y = cy - s / 2;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, s, s);
    ctx.fillStyle = color;
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy - 7);
    ctx.fillStyle = '#888';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillText(desc, cx, cy + 17);
  }
}
