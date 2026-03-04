/* =============================================================
   SPACE-CAT MASCOT  ·  mascot.js  (single-sprite version)
   Uses full_cat.png with transform jitter for a hand-drawn feel.
   No external dependencies.
   =============================================================

   ── Asset pipeline ─────────────────────────────────────────────
   Drop your artwork at:  assets/mascot/full_cat.png
   Transparent background PNG, recommended width 120–160 px.
   ============================================================= */

;(function () {
  "use strict";

  /* ── ① CONFIGURATION ────────────────────────────────────────── */
  const CONFIG = {
    /* ms to wait after DOMContentLoaded before the mascot slides in  */
    delay: 1000,

    /* Which corner to appear in.
       Values: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'random' */
    corner: "random",

    /* Max px the mascot drifts toward the mouse (gravity effect)    */
    driftStrength: 24,

    /* Lerp factor per rAF frame — lower = slower/smoother (0–1)     */
    driftLerp: 0.04,

    /* Frames-per-second for jitter ticks                            */
    fps: 8,

    /* Tooltip CTA text                                              */
    tooltipText: "Welcome aboard — click to explore 🚀",

    /* Called when user clicks or presses Enter on the mascot.       */
    onClickCallback: null,

    /* px gap between mascot corner and viewport edge                */
    margin: 16,

    /* Path to PNG assets — trailing slash required                  */
    assetPath: "assets/mascot/",

    /* Filename of the full-body sprite inside assetPath             */
    spriteFile: "full_cat.png",
  };

  /* ── ② INTERNAL STATE ───────────────────────────────────────── */
  const CORNERS = ["bottom-right", "bottom-left", "top-right", "top-left"];

  /* Mouse-tracking state — initialised to viewport centre          */
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  /* Smooth drift offsets (lerped toward target each rAF)           */
  let driftX = 0, driftY = 0;
  let targetDriftX = 0, targetDriftY = 0;

  /* Jitter offsets applied to the sprite wrap each tick            */
  const jitter = { x: 0, y: 0, r: 0 };

  /* rAF tick timer for fps throttling                              */
  let lastFrameTime = 0;
  const FRAME_INTERVAL = 1000 / CONFIG.fps;

  let prevRafTime = 0;

  /* DOM references                                                 */
  let rootEl, spriteWrap;

  /* Whether the OS/user has requested reduced motion               */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ── ③ HELPERS ──────────────────────────────────────────────── */
  const lerp    = (a, b, t) => a + (b - a) * t;
  const clamp   = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand    = (lo, hi) => lo + Math.random() * (hi - lo);
  const randSign = () => (Math.random() < 0.5 ? 1 : -1);

  /** Re-roll a small random translate + rotate for the sprite      */
  function randomJitter() {
    jitter.x = rand(0.5, 2.5) * randSign();
    jitter.y = rand(0.3, 1.8) * randSign();
    jitter.r = rand(0.2, 1.5) * randSign();
  }

  /* ── ④ DOM CONSTRUCTION ──────────────────────────────────────── */
  function buildMascot() {
    const corner =
      CONFIG.corner === "random"
        ? CORNERS[Math.floor(Math.random() * CORNERS.length)]
        : CONFIG.corner;

    /* Root — focusable, accessible button                           */
    rootEl = document.createElement("div");
    rootEl.id = "mascot-root";
    rootEl.setAttribute("data-corner", corner);
    rootEl.setAttribute("aria-label", "Space cat mascot");
    rootEl.setAttribute("tabindex", "0");
    rootEl.setAttribute("role", "button");

    /* Entrance wrapper                                              */
    const inner = document.createElement("div");
    inner.id = "mascot-inner";

    /* Float animation wrapper                                       */
    const floatWrap = document.createElement("div");
    floatWrap.id = "mascot-float-wrap";

    /* Sprite wrap — receives the jitter transform each tick         */
    spriteWrap = document.createElement("div");
    spriteWrap.id = "mascot-sprite-wrap";

    /* Decorative star sparkles                                      */
    for (let i = 1; i <= 3; i++) {
      const s = document.createElement("div");
      s.className = `m-star m-star-${i}`;
      spriteWrap.appendChild(s);
    }

    /* The cat image                                                 */
    const img = document.createElement("img");
    img.id = "mascot-sprite";
    img.src = `${CONFIG.assetPath}${CONFIG.spriteFile}`;
    img.alt = "";
    spriteWrap.appendChild(img);

    /* Tooltip                                                       */
    const tooltip = document.createElement("div");
    tooltip.id = "mascot-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = CONFIG.tooltipText;

    /* Assemble                                                      */
    floatWrap.appendChild(spriteWrap);
    inner.appendChild(floatWrap);
    inner.appendChild(tooltip);
    rootEl.appendChild(inner);
    document.body.appendChild(rootEl);
  }

  /* ── ⑤ JITTER TICK ──────────────────────────────────────────────── */
  /* Called at CONFIG.fps — re-rolls jitter and applies it          */
  function tickFrame() {
    if (prefersReducedMotion) return;
    randomJitter();
    spriteWrap.style.transform =
      `translate(${jitter.x}px, ${jitter.y}px) rotate(${jitter.r}deg)`;
  }

  /* ── ⑥ RAF ANIMATION LOOP ────────────────────────────────────── */
  function rafLoop(now) {
    requestAnimationFrame(rafLoop);

    prevRafTime = now;

    /* ── Drift: lerp toward target offset ──────────────────────── */
    const lerpFactor = prefersReducedMotion ? 0 : CONFIG.driftLerp;
    driftX = lerp(driftX, targetDriftX, lerpFactor);
    driftY = lerp(driftY, targetDriftY, lerpFactor);

    /* Apply drift via the individual CSS `translate` property so it
       doesn't fight the entrance `transform` transition             */
    rootEl.style.translate = `${driftX.toFixed(2)}px ${driftY.toFixed(2)}px`;

    /* ── fps-gated jitter tick ───────────────────────────────────── */
    if (now - lastFrameTime >= FRAME_INTERVAL) {
      lastFrameTime = now;
      tickFrame();
    }
  }

  /* ── ⑦ DRIFT: MOUSE TRACKING ─────────────────────────────────── */
  function onMouseMove(e) {
    if (prefersReducedMotion) return;

    mouseX = e.clientX;
    mouseY = e.clientY;

    /* Centre of the mascot root element                             */
    const rect = rootEl.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    /* Direction vector from mascot centre to mouse                  */
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    /* Scale: full drift only when mouse is within 400px, tapers further */
    const influence = clamp(1 - dist / 400, 0, 1);

    targetDriftX = (dx / dist) * CONFIG.driftStrength * influence;
    targetDriftY = (dy / dist) * CONFIG.driftStrength * influence;
  }

  /* ── ⑧ ENTRANCE ─────────────────────────────────────────────── */
  function triggerEntrance() {
    /* The CSS transition on #mascot-inner does the heavy lifting;
       we just add the class.                                         */
    rootEl.classList.add("mascot--visible");
  }

  /* ── ⑨ INTERACTION — hover, click, keyboard  ─────────────────── */
  function bindInteraction() {
    /* Click / Enter → callback                                       */
    rootEl.addEventListener("click", handleActivate);
    rootEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      }
    });

    /* Touch devices: show tooltip briefly on first tap, fire
       callback on second tap within 600 ms                          */
    let lastTap = 0;
    rootEl.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTap < 600) {
        e.preventDefault();
        handleActivate();
      } else {
        lastTap = now;
        rootEl.classList.add("mascot--tooltip-visible");
        setTimeout(
          () => rootEl.classList.remove("mascot--tooltip-visible"),
          2500
        );
      }
    });
  }

  function handleActivate() {
    if (typeof CONFIG.onClickCallback === "function") {
      CONFIG.onClickCallback();
    } else {
      /* Default fallback: scroll to the first <main> section        */
      const target = document.querySelector("main, section");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* ── ⑩ BOOT ──────────────────────────────────────────────────── */
  function init() {
    buildMascot();
    bindInteraction();

    /* Start rAF loop immediately so lerp reaches 0 cleanly         */
    prevRafTime = performance.now();
    requestAnimationFrame(rafLoop);

    /* Track mouse globally                                          */
    document.addEventListener("mousemove", onMouseMove, { passive: true });

    /* Entrance after delay                                          */
    setTimeout(triggerEntrance, CONFIG.delay);
  }

  /* Wait for DOM — safe to call this script from <head> too         */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
