/* =========================================================================
   FREEFIRE XIPL — HOMEPAGE NOTIFICATION POPUP
   =========================================================================
   Loaded on index.html ONLY, right after theme.js:
     notify.js loaded as a script tag

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
     - A visible countdown ("Closing in 10...", "9...", etc.) replaces the
       old "tap outside to dismiss" line, and counts down for AUTO_CLOSE_MS.
     - When there's no link, an "Okay, Got It" button lets people close it
       early. Either way, it always closes on its own once the countdown
       reaches zero.
   ========================================================================= */

(function () {
    const RESHOW_DAYS = 3;              // how often the SAME notice re-appears as a reminder
    const AUTO_CLOSE_MS = 10000;        // popup stays exactly this long, then always closes (no manual dismiss)
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
                : `<button class="notify-cta" data-dismiss>Okay, Got It</button>`}
                    <div class="notify-timer" aria-live="polite"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const timerEl = overlay.querySelector('.notify-timer');
        let secondsLeft = Math.round(AUTO_CLOSE_MS / 1000);
        function renderTimer() {
            if (timerEl) timerEl.textContent = secondsLeft > 0 ? `Closing in ${secondsLeft}...` : 'Closing...';
        }
        renderTimer();
        const countdownInterval = setInterval(() => {
            secondsLeft -= 1;
            renderTimer();
            if (secondsLeft <= 0) clearInterval(countdownInterval);
        }, 1000);

        function close() {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 450);
            if (activeOverlay === overlay) activeOverlay = null;
            clearInterval(countdownInterval);
            clearTimeout(autoCloseTimer);
        }

        overlay.querySelectorAll('[data-dismiss]').forEach(el => el.addEventListener('click', close));

        requestAnimationFrame(() => overlay.classList.add('show'));
        setSeenState({ lastId: notice.id, lastShownAt: Date.now() });

        // Auto-close after exactly AUTO_CLOSE_MS — happens either way, "Okay, Got It" just closes early
        const autoCloseTimer = setTimeout(close, AUTO_CLOSE_MS);
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