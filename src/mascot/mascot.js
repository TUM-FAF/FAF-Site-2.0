/* =============================================================
   SPACE-CAT MASCOT  ·  src/mascot/mascot.js
   Constant-speed space drift: the body orients toward its direction
   of travel (with slow lag), limbs wiggle via CSS and naturally
   inherit the body rotation. Thought bubble appears randomly.
   No external libraries.

   HOW TO ADJUST:
   • Speed:          CONFIG.speed  (px per frame at 60 fps)
   • Turn rate:      CONFIG.steerRate  (rad/frame added to heading)
   • Orientation lag: CONFIG.orientLerp  (0.005–0.02, lower = more lag)
   • Body wobble:    CONFIG.wobbleMax  (max extra angle in radians)
   • Bubble timing:  CONFIG.bubbleIntervalMin/Max, bubbleDurationMin/Max
   • Viewport gap:   CONFIG.margin
   ============================================================= */
;(function () {
  "use strict";

  /* ── ① CONFIG ────────────────────────────────────────────────── */
  const CONFIG = {
    delayMs: 1000,      /* ms before mascot fades in                */

    /* SPEED: px moved per frame — constant, never changes.
       0.4 ≈ 24 px/s at 60 fps.  Raise for faster drift.           */
    speed: 0.4,

    /* STEER: max random heading change per frame (radians).
       0.018 ≈ ~1 deg/frame — gentle, spaceship-like wander.       */
    steerRate: 0.018,

    /* How fast the body rotates to face its heading (0–1 lerp).
       Lower = more lag / inertia feeling.                          */
    orientLerp: 0.012,

    /* Slow random wobble added on top of heading orientation.
       Max deviation in radians (~0.12 rad ≈ 7 deg).               */
    wobbleMax: 0.12,

    /* Keep mascot this many px inside viewport edges               */
    margin: 24,

    /* Thought bubble auto-show: every 8–15 s, for 2–4 s           */
    bubbleIntervalMin: 8000,
    bubbleIntervalMax: 15000,
    bubbleDurationMin: 2000,
    bubbleDurationMax: 4000,

    /* Asset path (trailing slash required)                         */
    assetPath: "assets/mascot/",

    /* Click / Enter — placeholder                                  */
    onActivate() {
      console.log("Mascot activated");
    },
  };

  /* ── ② STATE ─────────────────────────────────────────────────── */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* Rig size — keep in sync with CSS #mascot-skeleton width/height  */
  const RIG_W = 200;   /* sync with #mascot-skeleton width  in mascot.css */
  const RIG_H = 270;   /* sync with #mascot-skeleton height in mascot.css */

  let posX = 0, posY = 0;     /* current top-left of rig (px)      */
  let heading = 0;             /* direction of travel (radians)     */
  let bodyAngle = 0;           /* current visual rotation of rig    */
  let prevBodyAngle = 0;       /* previous frame — used for angular velocity */
  let wobble = 0;              /* extra wobble offset (radians)     */
  let wobbleVel = 0;           /* wobble velocity                   */

  /* Limb inertia — tracks follow-through when body spins          */
  /* Tune these three numbers to change the "wind" feel:           */
  const INERTIA_SENSITIVITY = 35;  /* how hard spin pushes limbs (higher = more sway) */
  const INERTIA_DAMPING     = 0.88; /* velocity damping per frame  (lower = snappier) */
  const INERTIA_SPRING      = 0.92; /* how fast limbs return to 0  (lower = faster)   */
  let limbInertia    = 0;           /* current offset in radians   */
  let limbInertiaVel = 0;           /* rate of change per frame    */

  let rootEl = null;
  let skeletonEl = null;
  let thoughtEl = null;        /* reference to the thought bubble text node  */
  let limbEls = {};            /* { 'arm-left': imgEl, ... }                  */

  /* Messages cycled on click — add/edit entries freely            */
  const CLICK_MESSAGES = ["mew..", "hmm..", "check out summer hackathon!!"];
  let clickMsgIndex = 0;
  let clickPinTimer = null;    /* timer that un-pins the bubble after a click */

  /* ── ③ HELPERS ───────────────────────────────────────────────── */
  const rand     = (lo, hi) => lo + Math.random() * (hi - lo);
  const clamp    = (v, lo, hi) => Math.max(lo, Math.min(v, hi));

  /* Shortest-path angle lerp — prevents spinning through 360      */
  function lerpAngle(a, b, t) {
    let d = b - a;
    while (d >  Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  }

  /* ── ④ rAF LOOP — constant-speed wander + body orientation ───── */
  function frameLoop() {
    /* Steer: nudge heading by a tiny random amount each frame.
       This is the only source of direction change — speed is fixed. */
    heading += (Math.random() - 0.5) * CONFIG.steerRate * 2;

    /* Move at constant speed in current heading direction          */
    posX += Math.cos(heading) * CONFIG.speed;
    posY += Math.sin(heading) * CONFIG.speed;

    /* Bounce off viewport edges — reflect heading component        */
    const m = CONFIG.margin;
    const maxX = window.innerWidth  - RIG_W - m;
    const maxY = window.innerHeight - RIG_H - m;

    if (posX < m)    { posX = m;    heading = Math.PI - heading; }
    if (posX > maxX) { posX = maxX; heading = Math.PI - heading; }
    if (posY < m)    { posY = m;    heading = -heading; }
    if (posY > maxY) { posY = maxY; heading = -heading; }

    /* Slow random wobble added to the body orientation             */
    wobbleVel += (Math.random() - 0.5) * 0.0006;
    wobbleVel *= 0.97;                              /* dampen       */
    wobble    += wobbleVel;
    wobble     = clamp(wobble, -CONFIG.wobbleMax, CONFIG.wobbleMax);

    /* Body angle lerps toward heading + wobble (inertia feeling)   */
    prevBodyAngle = bodyAngle;
    bodyAngle = lerpAngle(bodyAngle, heading + wobble, CONFIG.orientLerp);

    /* ── Limb angular inertia ("grass in wind") ───────────────── */
    /* angVel = how much the body rotated this frame.              */
    /* Limbs get pushed opposite to rotation, then spring to 0.   */
    /* TUNE: INERTIA_SENSITIVITY, INERTIA_DAMPING, INERTIA_SPRING  */
    const angVel = bodyAngle - prevBodyAngle;
    limbInertiaVel += -angVel * INERTIA_SENSITIVITY;
    limbInertiaVel *= INERTIA_DAMPING;
    limbInertia    += limbInertiaVel;
    limbInertia    *= INERTIA_SPRING;
    limbInertia     = clamp(limbInertia, -0.35, 0.35); /* cap ~20 deg */

    /* Apply via the individual CSS `rotate` property — it ADDS    */
    /* on top of the keyframe `transform`, so both effects stack.  */
    const inertiaStr = `${(limbInertia * 180 / Math.PI).toFixed(2)}deg`;
    for (const el of Object.values(limbEls)) {
      el.style.rotate = inertiaStr;
    }

    /* Write transforms — root translates, skeleton rotates         */
    rootEl.style.transform =
      `translate(${posX.toFixed(1)}px, ${posY.toFixed(1)}px)`;
    skeletonEl.style.transform =
      `rotate(${bodyAngle.toFixed(4)}rad)`;

    requestAnimationFrame(frameLoop);
  }

  /* ── ⑤ RANDOM THOUGHT BUBBLE ─────────────────────────────────── */
  /* Schedules the next auto-show; show and hide cycle repeats.    */
  function scheduleThought() {
    setTimeout(() => {
      rootEl.classList.add("mascot--thought-auto");
      setTimeout(() => {
        rootEl.classList.remove("mascot--thought-auto");
        scheduleThought();                 /* chain next appearance */
      }, rand(CONFIG.bubbleDurationMin, CONFIG.bubbleDurationMax));
    }, rand(CONFIG.bubbleIntervalMin, CONFIG.bubbleIntervalMax));
  }

  /* ── ⑥ DOM BUILDER ────────────────────────────────────────────── */
  function buildMascot() {
    rootEl = document.createElement("div");
    rootEl.id = "mascot-root";
    rootEl.setAttribute("tabindex", "0");
    rootEl.setAttribute("role", "button");
    rootEl.setAttribute("aria-label", "Space cat mascot");

    if (prefersReducedMotion) rootEl.classList.add("mascot--no-motion");

    const inner = document.createElement("div");
    inner.id = "mascot-inner";

    /* Skeleton — JS rotates this element to orient the body        */
    skeletonEl = document.createElement("div");
    skeletonEl.id = "mascot-skeleton";

    /* Layers in paint order: back → front                          */
    const parts = [
      ["arm-right", "arm_right.png"],   /* behind body             */
      ["leg-left",  "leg_left.png"],
      ["leg-right", "leg_right.png"],
      ["body",      "body.png"],
      ["arm-left",  "arm_left.png"],    /* in front of body        */
      ["head",      "head.png"],        /* topmost                 */
    ];

    parts.forEach(([cls, file]) => {
      const img = document.createElement("img");
      img.className = `mascot-part mascot-${cls}`;
      img.src = CONFIG.assetPath + file;
      img.alt = "";
      img.draggable = false;
      skeletonEl.appendChild(img);

      /* Store limb references so JS can apply inertia each frame   */
      if (["arm-left", "arm-right", "leg-left", "leg-right"].includes(cls)) {
        limbEls[cls] = img;
      }
    });

    /* Thought bubble inside skeleton so it rotates with the body   */
    thoughtEl = document.createElement("div");
    thoughtEl.id = "mascot-thought";
    thoughtEl.setAttribute("role", "tooltip");
    thoughtEl.textContent = CLICK_MESSAGES[0];
    skeletonEl.appendChild(thoughtEl);

    inner.appendChild(skeletonEl);
    rootEl.appendChild(inner);
    document.body.appendChild(rootEl);
  }

  /* ── ⑦ EVENTS ─────────────────────────────────────────────────── */
  function handleClick() {
    /* Advance to next message in the cycle                         */
    clickMsgIndex = (clickMsgIndex + 1) % CLICK_MESSAGES.length;
    thoughtEl.textContent = CLICK_MESSAGES[clickMsgIndex];

    /* Pin the bubble visible for 3 s, then hide and reset text     */
    clearTimeout(clickPinTimer);
    rootEl.classList.add("mascot--thought-auto");
    clickPinTimer = setTimeout(() => {
      rootEl.classList.remove("mascot--thought-auto");
      /* reset back to first message after hide                     */
      clickMsgIndex = 0;
      thoughtEl.textContent = CLICK_MESSAGES[0];
    }, 3000);
  }

  function bindEvents() {
    rootEl.addEventListener("click", handleClick);
    rootEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    });
    /* Keyboard focus shows bubble; blur hides it (unless click-pinned) */
    rootEl.addEventListener("focus", () =>
      rootEl.classList.add("mascot--thought-auto"));
    rootEl.addEventListener("blur", () => {
      /* Don't hide if a click-pin timer is active                  */
      if (!clickPinTimer) rootEl.classList.remove("mascot--thought-auto");
    });
  }

  /* ── ⑧ BOOT ──────────────────────────────────────────────────── */
  function init() {
    buildMascot();
    bindEvents();

    if (prefersReducedMotion) {
      /* Static: park near bottom-right, no movement                */
      const m = CONFIG.margin;
      posX = window.innerWidth  - RIG_W - m;
      posY = window.innerHeight - RIG_H - m;
      rootEl.style.transform = `translate(${posX}px, ${posY}px)`;
    } else {
      /* Start near viewport centre, random initial heading         */
      posX    = (window.innerWidth  - RIG_W) / 2;
      posY    = (window.innerHeight - RIG_H) / 2;
      heading = Math.random() * Math.PI * 2;
      bodyAngle = heading;
      requestAnimationFrame(frameLoop);
      scheduleThought();               /* kick off random bubbles   */
    }

    setTimeout(() => rootEl.classList.add("mascot--visible"), CONFIG.delayMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
