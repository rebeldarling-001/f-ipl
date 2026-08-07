/* =========================================================================
   FREEFIRE XIPL — SHARED THEME BEHAVIOR
   =========================================================================
   Load this once, near the end of <body>, on every page:
     <script src="theme.js"></script>

   Requires this shared markup to already be on the page (copy it from
   chrome-template.html): #splash, #embers, header#themeBtn/#menuBtn,
   #themeOverlay/#themePanel/.theme-opt buttons, #navOverlay/#navDrawer/
   #navClose, .scroll-progress-fill#scrollFill, #backToTop/#bttFill.

   Page-specific behavior (countdown timers, stat counters, carousels,
   registration status, etc.) stays inline in that page's own <script>
   block — it does NOT belong in this shared file.
   ========================================================================= */

// ---------- Always feel like a fresh visit ----------
        // Always feel like a fresh visit: reset scroll and defeat back/forward cache restores
        if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        window.scrollTo(0, 0);
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) { window.location.reload(); }
        });

// ---------- Splash screen removal ----------
        setTimeout(() => {
            const splash = document.getElementById('splash');

            splash.animate([
                { transform: "scale(1)", opacity: 1 },
                { transform: "scale(2.5)", opacity: 0 }
            ], {
                duration: 1600,
                easing: "cubic-bezier(.2,.8,.2,1)"
            });

            setTimeout(() => splash.style.display = "none", 600);
        }, 2100);

// ---------- Nav drawer ----------
        // Nav drawer
        const menuBtn = document.getElementById('menuBtn');
        const navDrawer = document.getElementById('navDrawer');
        const navOverlay = document.getElementById('navOverlay');
        const navClose = document.getElementById('navClose');
        function openNav() { closeTheme(); navDrawer.classList.add('show'); navOverlay.classList.add('show'); }
        function closeNav() { navDrawer.classList.remove('show'); navOverlay.classList.remove('show'); }
        menuBtn.addEventListener('click', openNav);
        navClose.addEventListener('click', closeNav);
        navOverlay.addEventListener('click', closeNav);
        document.querySelectorAll('.nav-link[data-scroll]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeNav();
                const targetEl = document.querySelector(link.getAttribute('href'));
                if (targetEl) setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth' }), 200);
            });
        });

// ---------- Theme switcher ----------
        // ====== THEME SWITCHER ======
        const THEME_KEY = 'xipl-theme';
        const DEFAULT_THEME = 'golden-fire';
        const themeBtn = document.getElementById('themeBtn');
        const themePanel = document.getElementById('themePanel');
        const themeOverlay = document.getElementById('themeOverlay');
        const themeClose = document.getElementById('themeClose');
        const themeOpts = document.querySelectorAll('.theme-opt');

        function getSavedTheme() {
            try { return localStorage.getItem(THEME_KEY) || DEFAULT_THEME; }
            catch (e) { return DEFAULT_THEME; }
        }

        function markActiveTheme(theme) {
            themeOpts.forEach(opt => opt.classList.toggle('active', opt.dataset.theme === theme));
        }

        function applyTheme(theme, persist) {
            document.documentElement.classList.add('theme-transitioning');
            document.documentElement.setAttribute('data-theme', theme);
            markActiveTheme(theme);
            if (persist) {
                try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage unavailable, theme still applies for this session */ }
            }
            window.clearTimeout(applyTheme._t);
            applyTheme._t = window.setTimeout(() => {
                document.documentElement.classList.remove('theme-transitioning');
            }, 650);
        }

        function openTheme() {
            themePanel.classList.add('show');
            themeOverlay.classList.add('show');
            themeBtn.setAttribute('aria-expanded', 'true');
        }
        function closeTheme() {
            themePanel.classList.remove('show');
            themeOverlay.classList.remove('show');
            themeBtn.setAttribute('aria-expanded', 'false');
        }

        themeBtn.addEventListener('click', () => {
            if (themePanel.classList.contains('show')) closeTheme(); else { closeNav(); openTheme(); }
        });
        themeClose.addEventListener('click', closeTheme);
        themeOverlay.addEventListener('click', closeTheme);
        themeOpts.forEach(opt => {
            opt.addEventListener('click', () => {
                applyTheme(opt.dataset.theme, true);
                closeTheme();
            });
        });

        // Initialize active swatch to whatever theme is currently applied (set pre-paint above, or default)
        markActiveTheme(document.documentElement.getAttribute('data-theme') || DEFAULT_THEME);


// ---------- Ambient ember particles ----------
        // Embers
        const emberField = document.getElementById('embers');
        for (let i = 0; i < 22; i++) {
            const e = document.createElement('div');
            e.className = 'ember';
            e.style.left = Math.random() * 100 + '%';
            e.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
            e.style.animationDuration = (6 + Math.random() * 6) + 's';
            e.style.animationDelay = (Math.random() * 8) + 's';
            emberField.appendChild(e);
        }

// ---------- Scroll-reveal (.fade-up elements) ----------
        // Scroll reveal
        const revealEls = document.querySelectorAll('.fade-up');
        const io = new IntersectionObserver((entries) => {
            entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
        }, { threshold: 0.15 });
        revealEls.forEach(el => io.observe(el));

// ---------- Scroll progress bar + back-to-top button ----------
// (wired up here — shared chrome, so it belongs in every page automatically)
const scrollFillEl = document.getElementById('scrollFill');
const backToTopBtn = document.getElementById('backToTop');
const bttFillEl = document.getElementById('bttFill');
const BTT_C = 131.9; // 2 * PI * 21, matches the SVG circle radius

function updateScrollChrome() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (scrollFillEl) scrollFillEl.style.width = (pct * 100) + '%';
    if (bttFillEl) bttFillEl.style.strokeDashoffset = BTT_C * (1 - pct);
    if (backToTopBtn) backToTopBtn.classList.toggle('show', window.scrollY > 400);
}
window.addEventListener('scroll', updateScrollChrome, { passive: true });
window.addEventListener('load', updateScrollChrome);
updateScrollChrome();

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}