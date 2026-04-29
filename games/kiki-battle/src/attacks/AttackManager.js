import { Rain }         from './Rain.js';
import { ClosingWalls } from './ClosingWalls.js';
import { Crushers }     from './Crushers.js';
import { BulletRow }    from './BulletRow.js';
import { Ladder }       from './Ladder.js';
import { BeamAttack }   from './BeamAttack.js';
import { BurstAttack }  from './BurstAttack.js';
import { CurvedStream } from './CurvedStream.js';
import { SpikeDrop }    from './SpikeDrop.js';
import { Mouth }        from './Mouth.js';
import { CrossBeam }    from './CrossBeam.js';
import { ATTACK_DURATION, PAUSE_DURATION } from '../utils/constants.js';

const ALL_PATTERNS = [Rain, ClosingWalls, Crushers, BulletRow, Ladder,
                      BeamAttack, BurstAttack, CurvedStream, SpikeDrop, Mouth, CrossBeam];
const LABELS = ['BULLET RAIN', 'CLOSING WALLS', 'CRUSHERS', 'BULLET WALL', 'LADDER',
                'BEAM ATTACK', 'BULLET BURST', 'CURVED STREAM', 'SPIKE DROP', 'MOUTH', 'CROSS BEAM'];

export class AttackManager {
  constructor(box) {
    this.box          = box;   // mutable — caller updates each frame for arena expand
    this._current     = null;
    this._timer       = PAUSE_DURATION;
    this._phase       = 'pause';
    this.label        = 'GET READY';
    this.justStarted  = false;
    this._gameTime    = 0;     // updated by caller
    this.speedBoost   = 1;     // set by Game.jsx from BoostSystem.speedUpMult
  }

  get bullets()     { return this._current ? this._current.bullets : []; }
  get isAttacking() { return this._phase === 'attack'; }

  // Returns damage if player is inside a beam-type attack, 0 otherwise
  beamDamage(px, py) {
    if (!this._current || !this._current.hitsPlayer) return 0;
    return this._current.hitsPlayer(px, py);
  }

  update(dt, gameTime) {
    this.justStarted = false;
    this._gameTime   = gameTime;
    this._timer -= dt;
    if (this._timer <= 0) {
      if (this._phase === 'pause') this._startAttack();
      else                         this._startPause();
    }
    if (this._phase === 'attack' && this._current) this._current.update(dt);
  }

  get _difficulty() { return Math.min(5, 1 + Math.floor(this._gameTime / 25)); }

  get _speedMult() { return 1 + (this._difficulty - 1) * 0.22; }

  get _pauseDur() { return Math.max(0.5, PAUSE_DURATION - (this._difficulty - 1) * 0.1); }

  _startAttack() {
    this._phase = 'attack';
    this._timer = Math.max(3.5, ATTACK_DURATION - (this._difficulty - 1) * 0.25);
    const idx   = Math.floor(Math.random() * ALL_PATTERNS.length);
    this._current = new ALL_PATTERNS[idx](this.box, this._speedMult * this.speedBoost);
    this.label    = LABELS[idx];
    this.justStarted = true;
  }

  _startPause() {
    this._phase   = 'pause';
    this._timer   = this._pauseDur;
    this._current = null;
    this.label    = 'INCOMING...';
  }

  render(ctx, time) {
    if (!this._current) return;
    // Attacks that need the time param for pulsing warnings
    if (this._current.render.length >= 2) this._current.render(ctx, time);
    else                                   this._current.render(ctx);
  }
}
