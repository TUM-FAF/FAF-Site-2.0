// stars.js – FAF star background, adapted for dark theme with orange accents

const canvasBackground = document.getElementById("backgroundCanvas");
const ctxBackground = canvasBackground.getContext("2d");
const canvasStars = document.getElementById("starsCanvas");
const ctxStars = canvasStars.getContext("2d");

const options = {
    starDensity: "medium",
    maxDistance: 100,
    starSize: { min: 0.8, max: 2.5 },
    speedFactor: 0.4,
    mouseRadius: 160,
    starColor: "rgba(255, 255, 255, 0.85)",
    connectionColor: "rgba(255, 155, 43, ${opacity})", // FAF orange
    lineThickness: 0.6,
    randomStarSpeeds: true,
    connectionsWhenNoMouse: true,
    percentStarsConnecting: 20,
    bounceOnEdges: false,
    idleRestartTime: 3000,
};

const starDensities = { low: 0.00005, medium: 0.00009, high: 0.0002 };
const CELL_SIZE = options.maxDistance;
let cells = {};
const stars = [];
const mouse = { x: null, y: null };
let animationIdleTimeout = null;

window.addEventListener("mousemove", (e) => {
    mouse.x = e.x; mouse.y = e.y;
    clearTimeout(animationIdleTimeout);
    animationIdleTimeout = setTimeout(() => { mouse.x = null; mouse.y = null; }, options.idleRestartTime);
});

window.addEventListener("resize", () => { stars.length = 0; cells = {}; resizeCanvas(); createStars(); });

function resizeCanvas() {
    canvasBackground.width = canvasStars.width = window.innerWidth;
    canvasBackground.height = canvasStars.height = window.innerHeight;
    ctxBackground.clearRect(0, 0, canvasBackground.width, canvasBackground.height);
}

function Star(x, y) {
    this.x = x; this.y = y;
    this.size = Math.random() * (options.starSize.max - options.starSize.min) + options.starSize.min;
    this.speedX = (Math.random() - 0.5) * options.speedFactor;
    this.speedY = (Math.random() - 0.5) * options.speedFactor;
    this.connects = Math.random() < options.percentStarsConnecting / 100;
    this.depth = Math.random() * 0.5 + 0.5;
}

Star.prototype.draw = function () {
    ctxStars.beginPath();
    ctxStars.fillStyle = options.starColor;
    ctxStars.arc(this.x, this.y, this.size * this.depth, 0, Math.PI * 2);
    ctxStars.closePath();
    ctxStars.fill();
};

function animateStars() {
    ctxStars.clearRect(0, 0, canvasStars.width, canvasStars.height);
    cells = {};
    stars.forEach((star) => {
        star.x += star.speedX; star.y += star.speedY;
        if (star.x > canvasStars.width) star.x = 0;
        if (star.x < 0) star.x = canvasStars.width;
        if (star.y > canvasStars.height) star.y = 0;
        if (star.y < 0) star.y = canvasStars.height;
        star.draw();
        let cellX = Math.floor(star.x / CELL_SIZE);
        let cellY = Math.floor(star.y / CELL_SIZE);
        if (!cells[cellX]) cells[cellX] = {};
        if (!cells[cellX][cellY]) cells[cellX][cellY] = [];
        cells[cellX][cellY].push(star);
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nx = cellX + i, ny = cellY + j;
                if (cells[nx] && cells[nx][ny]) {
                    cells[nx][ny].forEach((other) => {
                        const dx = star.x - other.x, dy = star.y - other.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        const mdx = star.x - mouse.x, mdy = star.y - mouse.y;
                        const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
                        if (dist < options.maxDistance && dist > 0 &&
                            (mdist < options.mouseRadius || (star.connects && other.connects))) {
                            const opacity = ((options.maxDistance - dist) / options.maxDistance) * 0.6;
                            ctxStars.beginPath();
                            ctxStars.moveTo(star.x, star.y);
                            ctxStars.lineTo(other.x, other.y);
                            ctxStars.strokeStyle = options.connectionColor.replace("${opacity}", opacity);
                            ctxStars.lineWidth = options.lineThickness;
                            ctxStars.setLineDash([]);
                            ctxStars.stroke();
                        }
                    });
                }
            }
        }
    });
    requestAnimationFrame(animateStars);
}

function createStars() {
    resizeCanvas();
    const count = starDensities[options.starDensity] * canvasStars.width * canvasStars.height;
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvasStars.width;
        const y = Math.random() * canvasStars.height;
        const star = new Star(x, y);
        stars.push(star);
        const cellX = Math.floor(x / CELL_SIZE), cellY = Math.floor(y / CELL_SIZE);
        if (!cells[cellX]) cells[cellX] = {};
        if (!cells[cellX][cellY]) cells[cellX][cellY] = [];
        cells[cellX][cellY].push(star);
    }
}

createStars();
animateStars();

/* ── Auto-hide header on scroll (mobile only) ─────────────────────────────
   Hides the fixed header when scrolling down past 80px, reveals it when
   scrolling back up or when the mobile nav is open.
─────────────────────────────────────────────────────────────────────────── */
(function () {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(function () {
            // Only apply on mobile viewports
            if (window.innerWidth > 768) {
                header.classList.remove('header-hidden');
                lastY = window.scrollY;
                ticking = false;
                return;
            }

            // Never hide while the burger menu is open
            if (document.body.classList.contains('nav-open')) {
                lastY = window.scrollY;
                ticking = false;
                return;
            }

            const currentY = window.scrollY;
            if (currentY > lastY && currentY > 80) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
            lastY = currentY;
            ticking = false;
        });
    }, { passive: true });
}());