import { Enemy } from './Enemy.js';
import { W, LEVELS } from '../utils/constants.js';

const COL_GAP = 32;
const ROW_GAP = 22;
const DROP   = 10;

export class EnemyGrid {
  constructor(level) {
    const cfg = LEVELS[level - 1];
    this.level = level;
    this.dir = 1;
    this.baseSpeed = 16 + level * 6;
    this.speed = this.baseSpeed;
    this.shootInterval = Math.max(0.5, 2.8 - level * 0.2);
    this.shootTimer = 1.0 + Math.random() * 0.5;
    this.enemies = [];

    // Dive
    this.diveEnabled = cfg.diveEnabled;
    this.diveInterval = Math.max(1.8, 6.0 - level * 0.8);
    this.diveTimer = 2.0 + Math.random() * 2.0;
    this.maxDivers = Math.min(level, 3);

    this._spawn(cfg);
  }

  _spawn(cfg) {
    switch (cfg.formation) {
      case 'wedge': this._spawnWedge(cfg.rows, cfg.cols); break;
      case 'split': this._spawnSplit(cfg.rows, cfg.cols); break;
      default:      this._spawnGrid(cfg.rows, cfg.cols, 34); break;
    }
  }

  _spawnGrid(rows, cols, startY) {
    const startX = Math.round((W - (cols - 1) * COL_GAP) / 2);
    for (let r = 0; r < rows; r++) {
      const type = r === 0 ? 0 : r <= 2 ? 1 : 2;
      for (let c = 0; c < cols; c++) {
        this.enemies.push(new Enemy(c, r, type, startX + c * COL_GAP, startY + r * ROW_GAP));
      }
    }
  }

  // V-wedge: center columns sit lower (closer to player)
  _spawnWedge(rows, cols) {
    const startX = Math.round((W - (cols - 1) * COL_GAP) / 2);
    const center = (cols - 1) / 2;
    for (let r = 0; r < rows; r++) {
      const type = r === 0 ? 0 : r <= 2 ? 1 : 2;
      for (let c = 0; c < cols; c++) {
        const fromEdge = center - Math.abs(c - center); // 0=edge → 5=center
        const yDrop = fromEdge * 4;
        this.enemies.push(new Enemy(c, r, type, startX + c * COL_GAP, 28 + r * ROW_GAP + yDrop));
      }
    }
  }

  // Split: two flanking groups with a gap in the middle
  _spawnSplit(rows, colsPerGroup) {
    const gapW = 60;
    const groupW = (colsPerGroup - 1) * COL_GAP;
    const leftStart = Math.round((W - groupW * 2 - gapW) / 2);
    const rightStart = leftStart + groupW + gapW;
    for (let r = 0; r < rows; r++) {
      const type = r === 0 ? 0 : r <= 2 ? 1 : 2;
      for (let c = 0; c < colsPerGroup; c++) {
        this.enemies.push(new Enemy(c,              r, type, leftStart  + c * COL_GAP, 30 + r * ROW_GAP));
        this.enemies.push(new Enemy(colsPerGroup + c, r, type, rightStart + c * COL_GAP, 30 + r * ROW_GAP));
      }
    }
  }

  get alive()       { return this.enemies.filter(e => !e.dead); }
  get inFormation() { return this.enemies.filter(e => !e.dead && !e.diving); }

  lowestY() {
    const a = this.inFormation;
    return a.length ? Math.max(...a.map(e => e.y + e.h / 2)) : 0;
  }

  update(dt, playerX, onShoot) {
    const formation = this.inFormation;

    if (formation.length > 0) {
      // Speed up as count drops (Reacteroids pattern)
      const frac = formation.length / this.enemies.length;
      this.speed = this.baseSpeed / Math.max(0.15, frac);

      for (const e of formation) { e.x += this.dir * this.speed * dt; e.tick(dt); }

      const minX = Math.min(...formation.map(e => e.x - e.w / 2));
      const maxX = Math.max(...formation.map(e => e.x + e.w / 2));
      if ((this.dir === 1 && maxX >= W - 4) || (this.dir === -1 && minX <= 4)) {
        this.dir *= -1;
        for (const e of formation) e.y += DROP;
      }
    }

    // Update divers
    for (const e of this.alive.filter(e => e.diving)) e.updateDiving(dt);

    // Shooting from bottom of each column
    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && formation.length > 0) {
      this.shootTimer = this.shootInterval + Math.random() * 0.4;
      const shooters = this._bottomEnemies();
      if (shooters.length) {
        const e = shooters[Math.floor(Math.random() * shooters.length)];
        onShoot(e.x, e.y + e.h / 2 + 1);
      }
    }

    // Dive trigger
    if (this.diveEnabled && formation.length > 0) {
      this.diveTimer -= dt;
      if (this.diveTimer <= 0) {
        this.diveTimer = this.diveInterval + Math.random() * 2.0;
        const currentDivers = this.alive.filter(e => e.diving).length;
        if (currentDivers < this.maxDivers) {
          const candidates = this.inFormation;
          if (candidates.length > 0) {
            candidates[Math.floor(Math.random() * candidates.length)].startDive(playerX);
          }
        }
      }
    }
  }

  _bottomEnemies() {
    const byCol = {};
    for (const e of this.inFormation) {
      if (!byCol[e.col] || e.y > byCol[e.col].y) byCol[e.col] = e;
    }
    return Object.values(byCol);
  }

  render(ctx) {
    for (const e of this.enemies) { if (!e.dead) e.render(ctx); }
  }
}
