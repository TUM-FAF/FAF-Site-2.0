/**
 * planetParallax.js
 * Applies a subtle 2.5D parallax drift to every [data-planet-img] element
 * inside a .page-end-wrapper container.
 *
 * The planet moves at ~18 % of the section's scroll progress (±28 px range),
 * creating a gentle floating-in-depth effect without being distracting.
 */
!(function () {
    'use strict';

    var planets = document.querySelectorAll('[data-planet-img]');
    if (!planets.length) return;

    var raf = null;

    function tick() {
        raf = null;
        for (var i = 0; i < planets.length; i++) {
            var img  = planets[i];
            var wrap = img.closest('.page-end-wrapper');
            if (!wrap) continue;

            var rect = wrap.getBoundingClientRect();
            var vh   = window.innerHeight;

            // Skip calculation when the section is fully off-screen
            if (rect.bottom < -80 || rect.top > vh + 80) continue;

            // progress 0 = section top at viewport bottom → 1 = section bottom at viewport top
            var progress = (vh - rect.top) / (vh + rect.height);
            // Clamp to [0, 1] to avoid wild values before/after the section
            progress = Math.min(1, Math.max(0, progress));

            // ±28 px range; planet drifts UP as you scroll DOWN
            var offset = (progress - 0.5) * 56;

            // data-planet-align="right" → skip the -50% X centering
            var align  = img.getAttribute('data-planet-align') || 'center';
            var xPart  = align === 'right' ? '0px' : '-50%';
            img.style.transform = 'translateX(' + xPart + ') translateY(' + offset.toFixed(1) + 'px)';
        }
    }

    window.addEventListener('scroll', function () {
        if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    // Also react to resize (viewport height changes on mobile)
    window.addEventListener('resize', function () {
        if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    // Initial position on load
    requestAnimationFrame(tick);
}());
