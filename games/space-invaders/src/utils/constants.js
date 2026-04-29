export const W = 480;
export const H = 270;

export const COLORS = {
  bg: '#0a0a0f',
  player: '#00ff88',
  playerBullet: '#00ff00',
  enemyBullet: '#ff3333',
  shield: '#0099ff',
  text: '#ffffff',
  accent: '#00ff88',
  dim: '#444',
  starText: '#3a3a5a',
};

export const SHIELD_XS = [110, 240, 370];
export const SHIELD_Y = 213;
export const SHOOT_CD = 0.22;
export const INITIAL_LIVES = 3;
export const INITIAL_SPECIALS = 3;
export const TOTAL_LEVELS = 5;

// Per-level config
export const LEVELS = [
  { id: 1, label: 'LEVEL 1', formation: 'grid',   rows: 3, cols: 11, diveEnabled: false },
  { id: 2, label: 'LEVEL 2', formation: 'grid',   rows: 4, cols: 11, diveEnabled: true  },
  { id: 3, label: 'LEVEL 3', formation: 'wedge',  rows: 4, cols: 11, diveEnabled: true  },
  { id: 4, label: 'LEVEL 4', formation: 'split',  rows: 3, cols: 5,  diveEnabled: true  },
  { id: 5, label: 'FINAL',   formation: 'boss',   rows: 1, cols: 9,  diveEnabled: false },
];
