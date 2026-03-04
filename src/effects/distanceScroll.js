/**
 * distanceScroll.js
 * "Scroll into the distance" depth effect for Gallery and Events pages.
 *
 * Usage:
 *   import { initDistanceScroll } from '/src/effects/distanceScroll.js';
 *   initDistanceScroll();
 *
 * HTML requirements:
 *   - Container element with class  `.distance-stage`  (gets perspective)
 *   - Direct children are automatically treated as depth cards
 *
 * ── Tuning notes ──────────────────────────────────────────────────────────
 *  CONFIG.perspective   800–1600 px.  Lower = more dramatic foreshortening.
 *  CONFIG.maxScaleDown  0.75 stronger depth / 0.95 gentler.
 *  CONFIG.maxTranslate  px cards travel upward. Raise for "launch into sky".
 *  CONFIG.maxRotateX    degrees of forward tilt. 0 = flat, 6+ = noticeable.
 *  CONFIG.fadeMin       min opacity (0–1). null = keep cards fully opaque.
 *  CONFIG.triggerFrac   viewport fraction (0=top, 1=bottom) where effect begins.
 *  MOBILE_OVERRIDES     reduce intensity on touch devices. Higher maxScaleDown
 *                       (closer to 1.0) and lower maxTranslate = more comfort.
 *  MIN_CARD_WIDTH       CSS minmax() value; controls responsive grid breakpoint.
 * ──────────────────────────────────────────────────────────────────────────
 */

// ── Configuration ────────────────────────────────────────────────────────────

const CONFIG = {
    perspective:   1200,   // px
    maxScaleDown:  0.82,   // how small a card gets at full recession (0–1)
    maxTranslate:  160,    // px the card travels upward
    maxRotateX:    4,      // degrees of forward tilt (subtle)
    fadeMin:       0.50,   // opacity at full recession; null to disable fading
    triggerFrac:   0.45,   // fraction of viewport height where effect starts
};

const MOBILE_OVERRIDES = {
    maxScaleDown:  0.90,
    maxTranslate:   70,
    maxRotateX:     2,
    fadeMin:       0.65,
    triggerFrac:   0.50,
};

// Exported so pages can override before calling init.
export const distanceConfig = CONFIG;
export const distanceMobileConfig = MOBILE_OVERRIDES;

// ── Internal state ────────────────────────────────────────────────────────────

let stages      = [];
let needsUpdate = false;
let rafId       = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function isMobile() {
    return window.innerWidth <= 768;
}

function getCfg() {
    return isMobile() ? { ...CONFIG, ...MOBILE_OVERRIDES } : CONFIG;
}

// ── Core update ───────────────────────────────────────────────────────────────

function applyEffects() {
    const cfg         = getCfg();
    const vh          = window.innerHeight;
    const triggerLine = vh * cfg.triggerFrac;

    // Collect all cards (direct children of every stage).
    const allCards = [];
    stages.forEach(stage => {
        Array.from(stage.children).forEach(c => allCards.push(c));
    });

    // Batch-read layout info first (avoids repeated layout thrashing).
    const rects = allCards.map(c => c.getBoundingClientRect());

    // Batch-write transforms.
    allCards.forEach((card, i) => {
        const rect = rects[i];

        // Skip cards entirely below the visible area — nothing to do.
        if (rect.top > vh) {
            return;
        }

        const cardCenter = rect.top + rect.height * 0.5;
        let progress = (triggerLine - cardCenter) / triggerLine;
        progress = Math.max(0, Math.min(1, progress));

        if (progress === 0) {
            // Reset to natural position.
            card.style.transform = '';
            card.style.opacity   = '';
        } else {
            const scale     = 1 - (1 - cfg.maxScaleDown) * progress;
            const ty        = -(cfg.maxTranslate * progress);
            const rx        = cfg.maxRotateX * progress;
            card.style.transform = `translate3d(0,${ty.toFixed(2)}px,0) scale(${scale.toFixed(4)}) rotateX(${rx.toFixed(2)}deg)`;
            if (cfg.fadeMin != null) {
                const op = 1 - (1 - cfg.fadeMin) * progress;
                card.style.opacity = op.toFixed(4);
            }
        }
    });
}

function frame() {
    rafId = null;
    if (needsUpdate) {
        needsUpdate = false;
        applyEffects();
    }
}

function scheduleUpdate() {
    needsUpdate = true;
    if (!rafId) {
        rafId = requestAnimationFrame(frame);
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Initialise the distance-scroll effect.
 * Must be called after DOMContentLoaded (or at end of <body>).
 */
export function initDistanceScroll() {
    // Honour the user's motion preference — no transforms at all.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    stages = Array.from(document.querySelectorAll('.distance-stage'));
    if (!stages.length) return;

    const cfg = getCfg();

    stages.forEach(stage => {
        // Apply perspective to the stage container.
        stage.style.perspective = `${cfg.perspective}px`;

        // Add the tracking class + performance hint to every direct child card.
        Array.from(stage.children).forEach(card => {
            card.classList.add('distance-card');
        });
    });

    window.addEventListener('scroll', scheduleUpdate, { passive: true });

    window.addEventListener('resize', () => {
        // Recalculate perspective if breakpoint changed.
        const newCfg = getCfg();
        stages.forEach(s => {
            s.style.perspective = `${newCfg.perspective}px`;
        });
        scheduleUpdate();
    }, { passive: true });

    // Run once immediately so cards start at the correct state on load/refresh.
    scheduleUpdate();
}
