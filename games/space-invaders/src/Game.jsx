import { useEffect, useRef, useState, useCallback } from 'react';
import { Ship }      from './entities/Ship.js';
import { EnemyGrid } from './entities/EnemyGrid.js';
import { Boss }      from './entities/Boss.js';
import { Enemy }     from './entities/Enemy.js';
import { Bullet }    from './entities/Bullet.js';
import { Shield }    from './entities/Shield.js';
import { Particle }  from './entities/Particle.js';
import {
  W, H, SHIELD_XS, SHIELD_Y,
  SHOOT_CD, INITIAL_LIVES, INITIAL_SPECIALS,
  TOTAL_LEVELS, LEVELS,
} from './utils/constants.js';
import './styles/game.css';

const BG_CHARS = ['{', '}', ';', '//', '(', ')', '=>', '[]'];

function makeStars() {
  return Array.from({ length: 32 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    char: BG_CHARS[Math.floor(Math.random() * BG_CHARS.length)],
    alpha: 0.06 + Math.random() * 0.1,
    speed: 1 + Math.random() * 2,
  }));
}

function drawHeart(ctx, cx, cy, color) {
  ctx.fillStyle = color;
  ctx.fillRect(cx + 1, cy, 2, 1); ctx.fillRect(cx + 4, cy, 2, 1);
  ctx.fillRect(cx, cy + 1, 7, 2);
  ctx.fillRect(cx + 1, cy + 3, 5, 1);
  ctx.fillRect(cx + 2, cy + 4, 3, 1);
  ctx.fillRect(cx + 3, cy + 5, 1, 1);
}
function drawBolt(ctx, cx, cy) {
  ctx.fillStyle = '#ffcc44';
  ctx.fillRect(cx + 2, cy, 4, 4);
  ctx.fillRect(cx + 1, cy + 3, 5, 3);
  ctx.fillRect(cx, cy + 5, 4, 5);
}

export default function Game({ onExit }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const lastTRef  = useRef(null);
  const timerRef  = useRef(null);

  const keysRef      = useRef({});
  const shiftEdgeRef = useRef(false);

  const gRef = useRef(null);

  const phaseRef = useRef('title');
  const [phase, setPhase] = useState('title');

  const scoreRef   = useRef(0);
  const livesRef   = useRef(INITIAL_LIVES);
  const levelRef   = useRef(1);
  const specialRef = useRef(INITIAL_SPECIALS);
  const bestRef    = useRef(+(localStorage.getItem('faf_invaders_best') || 0));
  const flashRef   = useRef(0);
  const devSeqRef  = useRef(0);

  const changePhase = useCallback((p) => { phaseRef.current = p; setPhase(p); }, []);

  // Sends exitGame message to parent Astro page (iframe postMessage).
  // If run standalone (no parent), falls back to the onExit prop or title screen.
  const handleExit = useCallback(() => {
    if (typeof onExit === 'function') { onExit(); return; }
    try {
      window.parent.postMessage({ type: 'exitGame' }, '*');
    } catch {
      changePhase('title');
    }
  }, [onExit, changePhase]);

  const initGame = useCallback((startLevel = 1) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    scoreRef.current   = 0;
    livesRef.current   = INITIAL_LIVES;
    levelRef.current   = startLevel;
    specialRef.current = INITIAL_SPECIALS;
    const isBoss = startLevel === TOTAL_LEVELS;
    gRef.current = {
      ship:    new Ship(W / 2, H - 22),
      grid:    new EnemyGrid(startLevel),
      boss:    isBoss ? new Boss() : null,
      minions: [],
      bullets: [],
      shields: SHIELD_XS.map(x => new Shield(x, SHIELD_Y)),
      particles: [],
      shootCd:   0,
      specialCd: 0,
      dyingTimer: 0,
      stars: makeStars(),
    };
  }, []);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e) => {
      if (e.repeat) return;
      keysRef.current[e.key] = true;
      if (e.key === ' ') e.preventDefault();
      if (e.key === 'Shift') shiftEdgeRef.current = true;

      const p = phaseRef.current;
      if (e.key === ' ') {
        if (p === 'title' || p === 'gameover' || p === 'win') {
          initGame(1);
          keysRef.current[' '] = false;
          changePhase('playing');
        } else if (p === 'paused') {
          changePhase('playing');
        }
      }
      if (e.key === 'Escape') {
        if (p === 'playing')       changePhase('paused');
        else if (p === 'paused')   handleExit();
      }

      // DEV: P→O→U skips the current level
      if (p === 'playing') {
        const DEV_SEQ = ['p', 'o', 'u'];
        const k = e.key.toLowerCase();
        if (k === DEV_SEQ[devSeqRef.current]) {
          devSeqRef.current++;
          if (devSeqRef.current === DEV_SEQ.length) {
            devSeqRef.current = 0;
            const g = gRef.current;
            if (g) {
              if (levelRef.current === TOTAL_LEVELS) {
                if (g.boss) g.boss.dead = true;
                changePhase('win');
              } else {
                const next = levelRef.current + 1;
                levelRef.current = next;
                specialRef.current = Math.min(INITIAL_SPECIALS, specialRef.current + 1);
                changePhase('nextlevel');
                timerRef.current = setTimeout(() => {
                  if (phaseRef.current !== 'nextlevel') return;
                  const nextIsBoss = next === TOTAL_LEVELS;
                  g.grid    = new EnemyGrid(next);
                  g.boss    = nextIsBoss ? new Boss() : null;
                  g.minions = [];
                  g.shields = SHIELD_XS.map(x => new Shield(x, SHIELD_Y));
                  g.bullets = [];
                  changePhase('playing');
                }, 2400);
              }
            }
          }
        } else {
          devSeqRef.current = (k === 'p') ? 1 : 0;
        }
      } else {
        devSeqRef.current = 0;
      }
    };
    const onUp = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, [initGame, changePhase, handleExit]);

  function spawnFx(x, y, color, n = 9) {
    const g = gRef.current;
    if (!g) return;
    for (let i = 0; i < n; i++) g.particles.push(new Particle(x, y, color));
  }

  // ── Update ────────────────────────────────────────────────────────────────
  function update(dt) {
    const g = gRef.current;
    if (!g) return;

    if (phaseRef.current === 'dying') {
      g.dyingTimer -= dt;
      g.particles.forEach(p => p.update(dt));
      g.particles = g.particles.filter(p => !p.dead);
      if (g.dyingTimer <= 0) {
        if (livesRef.current <= 0) changePhase('gameover');
        else {
          g.ship    = new Ship(W / 2, H - 22);
          g.bullets = g.bullets.filter(b => b.isEnemy);
          changePhase('playing');
        }
      }
      return;
    }

    for (const s of g.stars) {
      s.y += s.speed * dt;
      if (s.y > H + 8) { s.y = -8; s.x = Math.random() * W; }
    }
    if (flashRef.current > 0) flashRef.current -= dt;

    g.ship.update(dt, keysRef.current);

    g.shootCd -= dt;
    if (keysRef.current[' '] && g.shootCd <= 0) {
      g.bullets.push(new Bullet(g.ship.x, g.ship.y - g.ship.h / 2 - 2, false, false));
      g.shootCd = SHOOT_CD;
    }

    g.specialCd -= dt;
    if (shiftEdgeRef.current && specialRef.current > 0 && g.specialCd <= 0) {
      specialRef.current--;
      g.specialCd  = 0.2;
      flashRef.current = 0.1;
      g.bullets.push(new Bullet(g.ship.x, g.ship.y - g.ship.h / 2 - 2, false, true));
    }
    shiftEdgeRef.current = false;

    for (const b of g.bullets) b.update(dt);
    g.bullets = g.bullets.filter(b => !b.dead);

    g.grid.update(dt, g.ship.x, (ex, ey) => g.bullets.push(new Bullet(ex, ey, true)));

    if (g.boss && !g.boss.dead) {
      g.boss.update(dt, g.ship.x, (mx, my) => {
        const m = new Enemy(99, 99, 2, mx, my);
        m.startDive(g.ship.x);
        g.minions.push(m);
      });
      if (g.boss.rayActive && g.boss.rayHitsX(g.ship.x) && g.ship.hit()) {
        livesRef.current--;
        spawnFx(g.ship.x, g.ship.y, '#00ff88', 18);
        g.dyingTimer = livesRef.current <= 0 ? 1.5 : 0.9;
        changePhase('dying');
        return;
      }
    }

    for (const m of g.minions) { if (!m.dead) m.updateDiving(dt); }
    g.minions = g.minions.filter(m => !m.dead);

    g.particles.forEach(p => p.update(dt));
    g.particles = g.particles.filter(p => !p.dead);

    function bulletHitsRect(b, ex, ey, ew, eh) {
      return b.x - b.w / 2 <= ex + ew / 2 && b.x + b.w / 2 >= ex - ew / 2 &&
             b.y - b.h / 2 <= ey + eh / 2 && b.y + b.h / 2 >= ey - eh / 2;
    }

    for (const b of g.bullets) {
      if (b.dead || b.isEnemy) continue;
      for (const e of g.grid.alive) {
        if (bulletHitsRect(b, e.x, e.y, e.w, e.h)) {
          if (!b.isSpecial) b.dead = true;
          e.dead = true;
          scoreRef.current += e.points;
          spawnFx(e.x, e.y, e.color, 10);
          if (scoreRef.current > bestRef.current) {
            bestRef.current = scoreRef.current;
            localStorage.setItem('faf_invaders_best', scoreRef.current);
          }
          if (!b.isSpecial) break;
        }
      }
      if (b.dead) continue;
      for (const m of g.minions) {
        if (m.dead) continue;
        if (bulletHitsRect(b, m.x, m.y, m.w, m.h)) {
          if (!b.isSpecial) b.dead = true;
          m.dead = true;
          scoreRef.current += m.points;
          spawnFx(m.x, m.y, m.color, 8);
          if (!b.isSpecial) break;
        }
      }
      if (b.dead) continue;
      if (g.boss && !g.boss.dead) {
        const bos = g.boss;
        if (bulletHitsRect(b, bos.x, bos.y, bos.w, bos.h)) {
          if (!b.isSpecial) b.dead = true;
          bos.hit();
          spawnFx(b.x, b.y, '#cc00ff', 6);
          if (bos.dead) {
            scoreRef.current += 500;
            if (scoreRef.current > bestRef.current) {
              bestRef.current = scoreRef.current;
              localStorage.setItem('faf_invaders_best', scoreRef.current);
            }
          }
        }
      }
    }

    for (const b of g.bullets) {
      if (b.dead) continue;
      for (const sh of g.shields) {
        if (!sh.alive) continue;
        if (sh.overlaps(b.x, b.y) && sh.hit(b.x, b.y)) {
          b.dead = true;
          spawnFx(b.x, b.y, '#0077cc', 4);
          break;
        }
      }
    }

    const s = g.ship;
    for (const b of g.bullets) {
      if (b.dead || !b.isEnemy) continue;
      if (b.x >= s.x - s.w / 2 && b.x <= s.x + s.w / 2 &&
          b.y >= s.y - s.h / 2 && b.y <= s.y + s.h / 2) {
        if (s.hit()) {
          b.dead = true;
          livesRef.current--;
          spawnFx(s.x, s.y, '#00ff88', 18);
          g.dyingTimer = livesRef.current <= 0 ? 1.5 : 0.9;
          changePhase('dying');
          break;
        }
      }
    }

    for (const e of [...g.grid.alive.filter(e => e.diving), ...g.minions]) {
      if (e.dead) continue;
      if (Math.abs(e.x - s.x) < s.w / 2 + 4 && Math.abs(e.y - s.y) < s.h / 2 + 4) {
        e.dead = true;
        if (s.hit()) {
          livesRef.current--;
          spawnFx(s.x, s.y, '#00ff88', 18);
          g.dyingTimer = livesRef.current <= 0 ? 1.5 : 0.9;
          changePhase('dying');
          return;
        }
      }
    }

    g.bullets = g.bullets.filter(b => !b.dead);

    if (g.grid.lowestY() >= SHIELD_Y - 12) {
      livesRef.current = 0;
      g.dyingTimer = 1.5;
      changePhase('dying');
      return;
    }

    const isBossLevel = levelRef.current === TOTAL_LEVELS;
    if (isBossLevel) {
      if (g.boss && g.boss.dead) changePhase('win');
    } else {
      if (g.grid.inFormation.length === 0 && g.grid.alive.length === 0) {
        const next = levelRef.current + 1;
        levelRef.current = next;
        specialRef.current = Math.min(INITIAL_SPECIALS, specialRef.current + 1);
        changePhase('nextlevel');
        timerRef.current = setTimeout(() => {
          if (phaseRef.current !== 'nextlevel') return;
          const nextIsBoss = next === TOTAL_LEVELS;
          g.grid    = new EnemyGrid(next);
          g.boss    = nextIsBoss ? new Boss() : null;
          g.minions = [];
          g.shields = SHIELD_XS.map(x => new Shield(x, SHIELD_Y));
          g.bullets = [];
          changePhase('playing');
        }, 2400);
      }
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function drawBg(ctx) {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(ctx, g) {
    ctx.font = '5px monospace';
    ctx.textBaseline = 'top';
    for (const s of g.stars) {
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#5a5a8a';
      ctx.fillText(s.char, Math.round(s.x), Math.round(s.y));
    }
    ctx.globalAlpha = 1;
  }

  function drawField(ctx, time) {
    const g = gRef.current;
    if (!g) return;
    drawStars(ctx, g);
    ctx.strokeStyle = 'rgba(0,255,136,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H - 9); ctx.lineTo(W, H - 9); ctx.stroke();
    if (flashRef.current > 0) {
      ctx.fillStyle = `rgba(0,220,255,${flashRef.current * 2})`;
      ctx.fillRect(0, 0, W, H);
    }
    for (const sh of g.shields) sh.render(ctx);
    g.grid.render(ctx);
    if (g.boss) g.boss.render(ctx, time);
    for (const m of g.minions) { if (!m.dead) m.render(ctx); }
    for (const b of g.bullets) b.render(ctx);
    g.particles.forEach(p => p.render(ctx));
    g.ship.render(ctx, time);
  }

  function drawHUD(ctx) {
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${scoreRef.current}`, 4, 3);
    const cfg = LEVELS[levelRef.current - 1];
    const label = cfg ? cfg.label : `LVL ${levelRef.current}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, W / 2, 3);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#666688';
    const bStr = `B:${bestRef.current}`;
    ctx.fillText(bStr, W - ctx.measureText(bStr).width - 4, 3);
    for (let i = 0; i < livesRef.current;   i++) drawHeart(ctx, 4 + i * 12,      H - 10, '#00ff88');
    for (let i = 0; i < specialRef.current; i++) drawBolt (ctx, W - 10 - i * 12, H - 12);
  }

  function drawBackHint(ctx, y) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#33334a';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillText('[ESC] BACK TO SITE', W / 2, y);
    ctx.textAlign = 'left';
  }

  function drawTitle(ctx, time) {
    const g = gRef.current;
    if (g) drawStars(ctx, g);
    const pulse = (Math.sin(time * 1.8) + 1) / 2;
    ctx.fillStyle = `rgba(0,255,136,${0.04 + pulse * 0.04})`;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 13px "Press Start 2P", monospace';
    ctx.fillText('FAF INVADERS', W / 2, 70);
    ctx.fillStyle = '#444466';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillText('THE WEBSITE HAS BECOME SELF-AWARE.', W / 2, 92);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(`BEST: ${bestRef.current}`, W / 2, 116);
    if (Math.floor(time * 2) % 2 === 0) {
      ctx.fillStyle = '#00ff88';
      ctx.fillText('PRESS SPACE TO START', W / 2, 144);
    }
    ctx.fillStyle = '#333350';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillText('ARROWS/AD: MOVE   SPACE: SHOOT', W / 2, 178);
    ctx.fillText('SHIFT: SPECIAL BEAM (x3, pierces)', W / 2, 190);
    drawBackHint(ctx, 218);
    ctx.textAlign = 'left';
  }

  function drawNextLevel(ctx) {
    ctx.fillStyle = 'rgba(10,10,20,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const isFinal = levelRef.current === TOTAL_LEVELS;
    ctx.fillStyle = isFinal ? '#ff3333' : '#00ff88';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(isFinal ? 'FINAL LEVEL' : `LEVEL ${levelRef.current}`, W / 2, H / 2 - 18);
    ctx.fillStyle = '#888888';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText(isFinal ? 'BOSS INCOMING...' : 'GET READY...', W / 2, H / 2 + 6);
    drawBackHint(ctx, H / 2 + 28);
    ctx.textAlign = 'left';
  }

  function drawPause(ctx) {
    ctx.fillStyle = 'rgba(10,10,20,0.75)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('PAUSED', W / 2, H / 2 - 28);
    ctx.fillStyle = '#00ff88';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('[SPACE] RESUME', W / 2, H / 2);
    ctx.fillStyle = '#888';
    ctx.fillText('[ESC] BACK TO SITE', W / 2, H / 2 + 20);
    ctx.textAlign = 'left';
  }

  function drawGameOver(ctx) {
    ctx.fillStyle = 'rgba(10,10,20,0.75)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff3333';
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('SITE CRASHED.', W / 2, 82);
    ctx.fillStyle = '#555577';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillText('404: Player Not Found', W / 2, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(`SCORE: ${scoreRef.current}`, W / 2, 126);
    ctx.fillText(`BEST:  ${bestRef.current}`,  W / 2, 141);
    ctx.fillText(`LEVEL: ${levelRef.current}`, W / 2, 156);
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = '#00ff88';
      ctx.fillText('SPACE TO RETRY', W / 2, 186);
    }
    drawBackHint(ctx, 208);
    ctx.textAlign = 'left';
  }

  function drawWin(ctx, time) {
    ctx.fillStyle = 'rgba(10,10,20,0.82)';
    ctx.fillRect(0, 0, W, H);
    const pulse = (Math.sin(time * 3) + 1) / 2;
    ctx.fillStyle = `rgba(0,255,136,${0.18 + pulse * 0.2})`;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillText('INVASION AVOIDED.', W / 2, 76);
    ctx.fillStyle = '#00ff88';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('The site is safe. For now.', W / 2, 96);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(`FINAL SCORE: ${scoreRef.current}`, W / 2, 122);
    ctx.fillText(`BEST:        ${bestRef.current}`,  W / 2, 138);
    if (Math.floor(time * 2) % 2 === 0) {
      ctx.fillStyle = '#00ff88';
      ctx.fillText('SPACE TO PLAY AGAIN', W / 2, 168);
    }
    drawBackHint(ctx, 192);
    ctx.textAlign = 'left';
  }

  // ── rAF loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    gRef.current = { stars: makeStars() };

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min(0.05, lastTRef.current ? (ts - lastTRef.current) / 1000 : 0.016);
      lastTRef.current = ts;
      const p = phaseRef.current;
      const t = ts / 1000;

      if (p === 'playing' || p === 'dying') update(dt);

      drawBg(ctx);
      if      (p === 'title')     drawTitle(ctx, t);
      else if (p === 'gameover')  { drawField(ctx, t); drawHUD(ctx); drawGameOver(ctx); }
      else if (p === 'nextlevel') { drawField(ctx, t); drawHUD(ctx); drawNextLevel(ctx); }
      else if (p === 'win')       { drawField(ctx, t); drawHUD(ctx); drawWin(ctx, t); }
      else if (p === 'paused')    { drawField(ctx, t); drawHUD(ctx); drawPause(ctx); }
      else                        { drawField(ctx, t); drawHUD(ctx); }
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="game-root">
      <canvas ref={canvasRef} width={W} height={H} className="game-canvas" />
    </div>
  );
}
