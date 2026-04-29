import { useEffect, useRef, useState, useCallback } from 'react';
import { Player }       from './entities/Player.js';
import { BoostSystem }  from './entities/BoostSystem.js';
import { AttackManager } from './attacks/AttackManager.js';
import { W, H, BOX, SCORE_PER_SEC } from './utils/constants.js';
import { playHit, playDead, playWin, playIncoming } from './utils/sound.js';
import './styles/game.css';

const f = (sz) => `${sz}px "Press Start 2P", monospace`;

export default function Game({ onExit }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const lastTRef  = useRef(null);
  const keysRef   = useRef({});
  const gRef      = useRef(null);
  const phaseRef  = useRef('title');
  const [phase, setPhase] = useState('title');
  const devSeqRef = useRef(0);

  const changePhase = useCallback((p) => { phaseRef.current = p; setPhase(p); }, []);

  const handleExit = useCallback(() => {
    if (typeof onExit === 'function') { onExit(); return; }
    try { window.parent.postMessage({ type: 'exitGame' }, '*'); } catch { changePhase('title'); }
  }, [onExit, changePhase]);

  const initGame = useCallback(() => {
    const best = +(localStorage.getItem('faf_battle_best') || 0);
    gRef.current = {
      player:        new Player(BOX.x + BOX.w / 2, BOX.y + BOX.h / 2),
      attackManager: new AttackManager(BOX),
      boostSystem:   new BoostSystem(),
      score:         0,
      highScore:     best,
      gameTime:      0,
      labelFlash:    0,
    };
  }, []);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const DEV_SEQ = ['p', 'o', 'u'];
    const BOOST_KEYS = new Set(['z', 'x', 'c', 'v', 'b', 'n']);

    const onDown = (e) => {
      if (e.repeat) return;
      keysRef.current[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        const p = phaseRef.current;
        if (p === 'title' || p === 'dead') { initGame(); changePhase('playing'); }
        else if (p === 'paused')           changePhase('playing');
      }
      if (e.key === 'Escape') {
        const p = phaseRef.current;
        if (p === 'playing')     changePhase('paused');
        else if (p === 'paused') handleExit();
      }
      // Boost key presses
      const k = e.key.toLowerCase();
      if (phaseRef.current === 'playing' && BOOST_KEYS.has(k) && gRef.current) {
        const result = gRef.current.boostSystem.pressKey(k, gRef.current.player);
        if (result?.action === 'penalty') {
          gRef.current.score = Math.max(0, gRef.current.score - 100);
        }
      }
      // DEV: P→O→U skip — adds 2000 score (simulates dodging for testing)
      if (phaseRef.current === 'playing') {
        if (k === DEV_SEQ[devSeqRef.current]) {
          devSeqRef.current++;
          if (devSeqRef.current === DEV_SEQ.length) {
            devSeqRef.current = 0;
            if (gRef.current) gRef.current.score += 2000;
          }
        } else { devSeqRef.current = k === 'p' ? 1 : 0; }
      } else { devSeqRef.current = 0; }
    };
    const onUp = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
    };
  }, [initGame, changePhase, handleExit]);

  // ── Game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((ts - (lastTRef.current ?? ts)) / 1000, 0.05);
      lastTRef.current = ts;
      if (phaseRef.current === 'playing') update(dt);
      draw(ctx, phaseRef.current, ts / 1000);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────
  function update(dt) {
    const g = gRef.current;
    if (!g) return;

    g.gameTime += dt;
    if (g.labelFlash > 0) g.labelFlash -= dt;

    // Score: base rate, doubled by C boost
    const scoreRate = SCORE_PER_SEC * (g.boostSystem.scoreX2 ? 2 : 1);
    g.score += scoreRate * dt;
    if (g.score > g.highScore) {
      g.highScore = g.score;
      localStorage.setItem('faf_battle_best', Math.floor(g.highScore));
    }

    g.boostSystem.update(dt);

    // Current box (may be expanded or shrunk by boosts)
    const currentBox = g.boostSystem.currentBox;
    g.attackManager.box        = currentBox;
    g.attackManager.speedBoost = g.boostSystem.speedUpMult;
    g.attackManager.update(dt, g.gameTime);

    if (g.attackManager.justStarted) { g.labelFlash = 1.6; playIncoming(); }

    g.player.update(dt, keysRef.current, currentBox);

    // Bullet collision
    for (const b of g.attackManager.bullets) {
      if (g.player.hitsCircle(b.x, b.y, b.r)) {
        const blocked = g.boostSystem.hasShield;
        if (blocked) { g.boostSystem.hasShield = false; continue; }
        if (g.player.hit(b.dmg)) {
          playHit();
          if (g.player.dead) { playDead(); changePhase('dead'); return; }
        }
      }
    }
    // Beam collision
    const beamDmg = g.attackManager.beamDamage(g.player.x, g.player.y);
    if (beamDmg > 0) {
      const blocked = g.boostSystem.hasShield;
      if (blocked) { g.boostSystem.hasShield = false; }
      else if (g.player.hit(beamDmg)) {
        playHit();
        if (g.player.dead) { playDead(); changePhase('dead'); return; }
      }
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function draw(ctx, p, time) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    if (p === 'title') { drawTitle(ctx); return; }
    if (gRef.current)  drawGame(ctx, p, time);
    if (p === 'paused') drawOverlay(ctx, '#fff', 'PAUSED', '#888', '[SPACE] RESUME      [ESC] EXIT');
    if (p === 'dead')   drawDeadScreen(ctx);
  }

  function drawGame(ctx, p, time) {
    const g = gRef.current;
    const box = g.boostSystem.currentBox;

    // Boost keys (drawn behind everything else)
    g.boostSystem.render(ctx);

    // Battle box border — colored when arena boost is active
    let borderColor = '#ffffff';
    if (g.boostSystem.arenaExpanded) borderColor = '#aa44ff';
    if (g.boostSystem.shrinkActive)  borderColor = '#ff4444';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x - 1, box.y - 1, box.w + 2, box.h + 2);

    g.attackManager.render(ctx, time);
    if (p !== 'dead') g.player.render(ctx);

    drawHpBar(ctx, g.player, g.boostSystem);
    drawScore(ctx, g, time);
    drawLabelFlash(ctx, g, time);
    drawHints(ctx);
  }

  function drawHpBar(ctx, player, bs) {
    const bx = BOX.x, by = BOX.y + BOX.h + 18, bw = BOX.w, bh = 16;
    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, bw, bh);
    const fillColor = bs.hasShield ? '#4488ff' : '#ffdd00';
    ctx.fillStyle = fillColor;
    ctx.fillRect(bx, by, bw * (player.hp / player.maxHp), bh);
    ctx.strokeStyle = bs.hasShield ? '#4488ff' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.textBaseline = 'middle';
    ctx.font         = f(9);
    ctx.fillStyle    = '#ffffff';
    ctx.textAlign    = 'right';
    ctx.fillText('HP', bx - 8, by + bh / 2);
    ctx.textAlign    = 'left';
    ctx.fillText(`${player.hp}/${player.maxHp}`, bx + bw + 8, by + bh / 2);
  }

  function drawScore(ctx, g, time) {
    const score = Math.floor(g.score);
    const best  = Math.floor(g.highScore);

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.font         = f(10);
    ctx.fillStyle    = g.boostSystem.scoreX2 ? '#ffdd00' : '#ffffff';
    ctx.fillText(`${score}`, BOX.x, 18);

    ctx.fillStyle = '#555';
    ctx.font      = f(7);
    ctx.fillText(`BEST ${best}`, BOX.x, 36);

    // Difficulty indicator (top right)
    const diff = Math.min(5, 1 + Math.floor(g.gameTime / 25));
    ctx.textAlign = 'right';
    ctx.font      = f(8);
    ctx.fillStyle = ['#44ff88', '#aaff44', '#ffdd44', '#ff8800', '#ff3333'][diff - 1];
    ctx.fillText(`LV ${diff}`, BOX.x + BOX.w, 18);

    // 2× score timer badge
    if (g.boostSystem.scoreX2) {
      ctx.fillStyle = '#ffdd00';
      ctx.font      = f(7);
      ctx.fillText(`2× ${Math.ceil(g.boostSystem.scoreX2Timer)}s`, BOX.x + BOX.w, 32);
    }
    // Arena boost timers (top center)
    ctx.textAlign = 'center';
    ctx.font      = f(7);
    if (g.boostSystem.arenaExpanded) {
      ctx.fillStyle = '#aa44ff';
      ctx.fillText(`EXPAND ${Math.ceil(g.boostSystem.arenaTimer)}s`, W / 2, BOX.y - 24);
    }
    if (g.boostSystem.shrinkActive) {
      ctx.fillStyle = '#ff4444';
      ctx.fillText(`SHRINK ${Math.ceil(g.boostSystem.shrinkTimer)}s`, W / 2, BOX.y - 24);
    }
    if (g.boostSystem.speedUpActive) {
      ctx.fillStyle = '#ff8800';
      ctx.fillText(`SPEED ${Math.ceil(g.boostSystem.speedUpTimer)}s`, W / 2, BOX.y - 12);
    }
  }

  function drawLabelFlash(ctx, g, time) {
    if (g.labelFlash <= 0) return;
    ctx.globalAlpha  = Math.min(1, g.labelFlash * 1.5);
    ctx.fillStyle    = g.attackManager.isAttacking ? '#ffdd44' : '#888888';
    ctx.font         = f(11);
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(g.attackManager.label, W / 2, BOX.y + BOX.h + 58);
    ctx.globalAlpha  = 1;
  }

  function drawHints(ctx) {
    ctx.fillStyle    = '#333';
    ctx.font         = f(6);
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Z HEAL  ·  X SHIELD  ·  C 2×SCORE  ·  V EXPAND  ·  B SHRINK  ·  N SPEED', W / 2, H - 18);
    ctx.fillText('[ESC] PAUSE', W / 2, H - 6);
  }

  function drawTitle(ctx) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff3333';
    ctx.font      = f(28);
    ctx.fillText('YOU HAVE', W / 2, 130);
    ctx.font      = f(22);
    ctx.fillText('ANGERED ME 😾', W / 2, 174);

    ctx.fillStyle = '#777';
    ctx.font      = f(9);
    ctx.fillText('DODGE EVERYTHING', W / 2, 250);
    ctx.fillText('SURVIVE AS LONG AS POSSIBLE', W / 2, 272);

    ctx.fillStyle = '#ffffff';
    ctx.font      = f(11);
    ctx.fillText('PRESS SPACE TO SURVIVE', W / 2, 330);

    // Control hints
    ctx.fillStyle = '#444';
    ctx.font      = f(6);
    ctx.fillText('ARROWS / WASD  ·  Z X C V for boosts', W / 2, H - 30);
    ctx.fillText('[ESC] BACK TO SITE', W / 2, H - 14);
  }

  function drawDeadScreen(ctx) {
    const g = gRef.current;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff3333';
    ctx.font      = f(22);
    ctx.fillText('* YOU DIED *', W / 2, H / 2 - 60);
    ctx.fillStyle = '#ffffff';
    ctx.font      = f(11);
    ctx.fillText(`SCORE  ${Math.floor(g.score)}`, W / 2, H / 2 - 10);
    ctx.fillStyle = '#888';
    ctx.font      = f(8);
    ctx.fillText(`BEST   ${Math.floor(g.highScore)}`, W / 2, H / 2 + 18);
    ctx.fillStyle = '#aaaaaa';
    ctx.font      = f(8);
    ctx.fillText('PRESS SPACE TO RETRY', W / 2, H / 2 + 55);
  }

  function drawOverlay(ctx, titleColor, title, subColor, sub) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = titleColor; ctx.font = f(22);
    ctx.fillText(title, W / 2, H / 2 - 30);
    ctx.fillStyle = subColor;   ctx.font = f(7);
    ctx.fillText(sub,   W / 2, H / 2 + 14);
  }

  return <canvas ref={canvasRef} width={W} height={H} />;
}
