/* =========================================================================
   FREEFIRE XIPL — HOMEPAGE NOTIFICATION POPUP
   =========================================================================
   Loaded on index.html ONLY, right after theme.js:
     <script src="notify.js"></script>

   TO PUSH A NEW ANNOUNCEMENT: edit notifications.json only — add a new
   object to the "notifications" array (or edit the existing one) and
   re-upload that one file. Nothing here needs to change.

   This is a LIVE popup, not a load-once one: it checks notifications.json
   again every POLL_INTERVAL_MS while the homepage is open, so if you edit
   the file while someone already has the page open, they'll see the new
   notice pop up on its own within about a minute — no refresh needed.

   Behavior:
     - First check happens after FIRST_CHECK_DELAY_MS, timed to land a
       moment after the splash screen has fully cleared (splash finishes
       around 2.7s in theme.js) — not stacked on top of it.
     - Every check after that happens every POLL_INTERVAL_MS.
     - A brand-new notice (different "id" than last shown) always pops up
       right away, on any check.
     - The SAME notice re-appears every RESHOW_DAYS days as a reminder,
       even if it was dismissed before.
     - Dismissing (✕ or "Got it") just closes it for now.
   ========================================================================= */

(function () {
    const RESHOW_DAYS = 3;              // how often the SAME notice re-appears as a reminder
    const POLL_INTERVAL_MS = 45000;     // how often to check notifications.json while the page is open
    const FIRST_CHECK_DELAY_MS = 10000; // let the splash (finishes ~2.7s) fully clear first
    const STORAGE_KEY = 'xipl-notif-seen';

    let activeOverlay = null;

    function getSeenState() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {};
        } catch (e) {
            return {};
        }
    }

    function setSeenState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* localStorage unavailable — popup will just show every check */ }
    }

    function pickLatestActive(list) {
        return list
            .filter(n => n.active)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
    }

    function shouldShow(notice, seen) {
        if (!seen.lastId || seen.lastId !== notice.id) return true;
        const daysSince = (Date.now() - (seen.lastShownAt || 0)) / 86400000;
        return daysSince >= RESHOW_DAYS;
    }

    function formatDate(dateStr) {
        try {
            const d = new Date(dateStr + 'T00:00:00');
            const s = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            return s.toUpperCase() + ' · FREEFIRE XIPL';
        } catch (e) {
            return 'FREEFIRE XIPL';
        }
    }

    function showPopup(notice) {
        if (activeOverlay) return; // already showing something — don't stack popups

        const overlay = document.createElement('div');
        overlay.className = 'notify-overlay';
        activeOverlay = overlay;

        const hasLink = notice.link && notice.linkText;
        overlay.innerHTML = `
            <div class="notify-modal" id="notifyModal" role="dialog" aria-modal="true" aria-live="polite">
                <div class="notify-glow"></div>
                <div class="notify-shimmer"></div>
                <button class="notify-close" aria-label="Close">✕</button>
                <div class="notify-top">
                    <span class="notify-badge"><span class="dot"></span> ${notice.eyebrow || 'Official Announcement'}</span>
                    <div class="notify-icon">${notice.icon || '📣'}</div>
                    <div class="notify-title">${notice.title || ''}</div>
                    <div class="notify-date">${formatDate(notice.date)}</div>
                    <p class="notify-msg">${notice.message || ''}</p>
                </div>
                <hr class="notify-divider">
                <div class="notify-footer">
                    ${hasLink
                ? `<a href="${notice.link}" class="notify-cta">${notice.linkText}</a>`
                : `<button class="notify-cta" data-dismiss>Got It — Let's Play</button>`}
                    <button class="notify-skip" data-dismiss>Tap anywhere outside to dismiss</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        function close() {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 450);
            if (activeOverlay === overlay) activeOverlay = null;
            document.removeEventListener('keydown', onEsc);
        }
        function onEsc(e) { if (e.key === 'Escape') close(); }

        overlay.querySelector('.notify-close').addEventListener('click', close);
        overlay.querySelectorAll('[data-dismiss]').forEach(el => el.addEventListener('click', close));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', onEsc);

        requestAnimationFrame(() => overlay.classList.add('show'));
        setSeenState({ lastId: notice.id, lastShownAt: Date.now() });
    }

    function checkForNotice() {
        // cache: 'no-store' + a cache-busting query param so a mid-session edit to
        // notifications.json is picked up right away instead of serving a stale copy
        fetch('notifications.json?t=' + Date.now(), { cache: 'no-store' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (!data || !Array.isArray(data.notifications)) return;
                const notice = pickLatestActive(data.notifications);
                if (!notice) return;
                if (shouldShow(notice, getSeenState())) showPopup(notice);
            })
            .catch(() => { /* notifications.json missing or unreachable — fail silently */ });
    }

    setTimeout(() => {
        checkForNotice();
        setInterval(checkForNotice, POLL_INTERVAL_MS);
    }, FIRST_CHECK_DELAY_MS);
})();