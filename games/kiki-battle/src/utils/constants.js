export const W = 800;
export const H = 600;

// Battle box — 1.3× smaller than previous (400×340 → 308×262), centered
export const BOX = Object.freeze({ x: 246, y: 90, w: 308, h: 262 });

// Arena expand/shrink boost offsets (per side)
export const BOX_EXPAND  = Object.freeze({ dx: 60, dy: 40 });
export const BOX_SHRINK  = Object.freeze({ dx: 50, dy: 35 });

export const PLAYER_SPEED  = 230;  // px/s scaled for 800×600 canvas
export const MAX_HP        = 20;
export const INV_DURATION  = 0.5;

export const ATTACK_DURATION  = 5.5;
export const PAUSE_DURATION   = 1.0;

export const SCORE_PER_SEC = 10;   // base points per second survived
