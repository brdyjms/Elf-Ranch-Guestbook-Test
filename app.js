'use strict';

/* =========================================================
   Emergency Info: Static Non-Emergency Data + Rendering
   (Hard-coded so you can delete the TSV file)
   ========================================================= */

const NON_EMERGENCY_LOCATIONS = [
  {
    title: "Hospital",
    name: "Sutter Santa Rosa Regional Hospital",
    phone: "(707) 576-4000",
    distance: "8.5 mi (13.7 km)",
    address1: "30 Mark West Springs Rd",
    address2: "Santa Rosa, CA 95403"
  },
  {
    title: "Police Department",
    name: "",
    phone: "(707) 869-0202",
    distance: "8.8 mi (14.2 km)",
    address1: "16225 First St",
    address2: "Guernville, CA 95446"
  },
  {
    title: "Fire Department",
    name: "",
    phone: "(707) 887-2212",
    distance: "1.3 mi (2.1 km)",
    address1: "6554 Mirabel Rd",
    address2: "Forestville, CA 95436"
  },  
  {
    title: "Nearest Veterinarian",
    name: "VCA Forestville Animal Hospital",
    phone: "(707) 887-2261",
    distance: "2.6 mi (4.2 km)",
    address1: "5033 Gravenstein Hwy North",
    address2: "Sebastopol, CA 95472"
  },
  {
    title: "After Hours Veterinarian",
    name: "VCA PetCare East",
    phone: "(707) 579-3900",
    distance: "11.3 mi (18.2 km)",
    address1: "2425 Mendocino Ave",
    address2: "Santa Rosa, CA 95403"
  },
  {
    title: "Poison Control",
    name: "Hotline",
    phone: "(800) 222-1222",
    distance: "National",
    address1: "Template",
    address2: "Template"
  },
  {
    title: "Template",
    name: "Template",
    phone: "Template",
    distance: "Template",
    address1: "Template",
    address2: "Template"
  },      
];

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizePhoneForTel(phone) {
  const trimmed = (phone || '').trim();
  if (!trimmed) return '';
  const plus = trimmed.startsWith('+') ? '+' : '';
  const digits = trimmed.replace(/[^\d]/g, '');
  return plus + digits;
}

function mapsSearchLink(address1, address2) {
  const full = [address1, address2]
    .map(s => (s || '').trim())
    .filter(Boolean)
    .join(', ');
  if (!full) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
}

function renderNonEmergencyCardStatic(item) {
  const tel = normalizePhoneForTel(item.phone);
  const telHref = tel ? `tel:${tel}` : '';

  const hasAddr1 = (item.address1 || '').trim().length > 0;
  const hasAddr2 = (item.address2 || '').trim().length > 0;
  const mapHref = (hasAddr1 || hasAddr2) ? mapsSearchLink(item.address1, item.address2) : '';

  const lines = [
    item.name ? escapeHtml(item.name) : '',
    item.phone ? `Phone: ${escapeHtml(item.phone)}` : '',
    item.distance ? `Distance: ${escapeHtml(item.distance)}` : '',
    hasAddr1 ? escapeHtml(item.address1) : '',
    hasAddr2 ? escapeHtml(item.address2) : '',
  ].filter(Boolean).join('<br>');

  return `
    <div class="card">
      <div class="card-title">${escapeHtml(item.title || 'Non-Emergency')}</div>
      <div class="card-body">${lines || '—'}</div>
      <div class="card-actions">
        <a class="icon-btn" href="${telHref}" aria-label="Call ${escapeHtml(item.name || item.title)}">📞</a>
        ${mapHref ? `
          <a class="icon-btn" href="${mapHref}" target="_blank" rel="noopener"
             aria-label="Map ${escapeHtml(item.name || item.title)}">📍</a>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Populates Emergency-Info page cards (NO-OP on other pages).
 * Pass in the current screen element for best scoping.
 */
function initEmergencyNumbers(rootEl) {
  if (!rootEl) return;

  const container = rootEl.querySelector('#nonEmergencyList');
  if (!container) return;

  if (container.dataset.loaded === '1') return;

  container.innerHTML = NON_EMERGENCY_LOCATIONS
    .map(renderNonEmergencyCardStatic)
    .join('');

  container.dataset.loaded = '1';

  // Wire Call 911 block (if present)
  const call911 = rootEl.querySelector('[data-call911]');
  if (call911) {
    const dial = () => { window.location.href = 'tel:911'; };
    call911.addEventListener('click', dial);
    call911.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') dial();
    });
  }
}

/* =========================================================
   Main App: 3-pane slide navigation + swipe right to home
   ========================================================= */

(() => {
  const SLIDE_MS = 720;       // match CSS --slideMs
  const DETAIL_SHIFT = -12;   // subpage background darker

  // Swipe gesture tuning
  const SWIPE_MIN_PX = 60;    // minimum horizontal distance
  const SWIPE_MAX_Y = 50;     // if vertical movement exceeds this, ignore
  const SWIPE_MIN_VX = 0.15;  // px/ms minimum "speed"

  // Track positions for 3 panes: [Prev | Current | Next]
  const POS_LEFT   = 'translateX(0%)';            // show Prev
  const POS_CENTER = 'translateX(-33.3333%)';     // show Current
  const POS_RIGHT  = 'translateX(-66.6667%)';     // show Next

  const track = document.getElementById('track');
  const screenPrev = document.getElementById('screenPrev');
  const screenCurrent = document.getElementById('screenCurrent');
  const screenNext = document.getElementById('screenNext');
  const globalHomeFab = document.getElementById('globalHomeFab');

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function hexToRgb(hex) {
    const h = (hex || '').replace('#', '').trim();
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const int = parseInt(full, 16);
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  }

  function rgbToHex(r, g, b) {
    const to = (n) => n.toString(16).padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`;
  }

  function shiftHex(hex, percent) {
    const { r, g, b } = hexToRgb(hex);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const nr = Math.round((t - r) * p + r);
    const ng = Math.round((t - g) * p + g);
    const nb = Math.round((t - b) * p + b);
    return rgbToHex(clamp(nr, 0, 255), clamp(ng, 0, 255), clamp(nb, 0, 255));
  }

  function setTileColors(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll('.tile[data-color]').forEach(tile => {
      tile.style.background = tile.dataset.color;
    });
  }

  function applyDetailBackground(rootEl) {
    if (!rootEl) return;
    const page = rootEl.querySelector('.page[data-base]');
    if (!page) return;
    page.style.background = shiftHex(page.dataset.base, DETAIL_SHIFT);
  }

  function isOnSubpage(rootEl) {
    return !!(rootEl && rootEl.querySelector('.page'));
  }

  function updateHomeFabVisibility(rootEl) {
    if (!globalHomeFab) return;
    globalHomeFab.classList.toggle('is-hidden', !isOnSubpage(rootEl));
  }

  function isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function lockDuringTransition(lock) {
    document.documentElement.style.pointerEvents = lock ? 'none' : '';
  }

  async function fetchPage(url) {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return await res.text();
  }

  function parseIncoming(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');
    const incomingCurrent = doc.querySelector('#screenCurrent');
    if (!incomingCurrent) throw new Error('Incoming page missing #screenCurrent');
    const inner = incomingCurrent.innerHTML;
    const title = doc.querySelector('title')?.textContent?.trim() || document.title;
    return { inner, title };
  }

  function setTrack(pos, withTransition = true) {
    if (!track) return;
    track.style.transition = withTransition
      ? `transform ${SLIDE_MS}ms cubic-bezier(.2,.8,.2,1)`
      : 'none';
    track.style.transform = pos;
    void track.offsetWidth; // force layout
  }

  function clearSideScreens() {
    if (screenPrev) screenPrev.innerHTML = '';
    if (screenNext) screenNext.innerHTML = '';
  }

  let inFlight = false;

  async function slideTo(url, direction) {
    // direction: 'left' forward (to Next), 'right' back (to Prev)
    if (inFlight) return;

    if (!track || !screenPrev || !screenCurrent || !screenNext) {
      window.location.href = url;
      return;
    }

    if (isReducedMotion()) {
      window.location.href = url;
      return;
    }

    inFlight = true;
    lockDuringTransition(true);

    try {
      const html = await fetchPage(url);
      const { inner, title } = parseIncoming(html);

      if (direction === 'left') {
        screenNext.innerHTML = inner;
        setTileColors(screenNext);
        applyDetailBackground(screenNext);
      } else {
        screenPrev.innerHTML = inner;
        setTileColors(screenPrev);
        applyDetailBackground(screenPrev);
      }

      // Start centered, then animate
      setTrack(POS_CENTER, false);
      setTrack(direction === 'left' ? POS_RIGHT : POS_LEFT, true);

      window.setTimeout(() => {
        // Commit
        screenCurrent.innerHTML = (direction === 'left')
          ? screenNext.innerHTML
          : screenPrev.innerHTML;

        clearSideScreens();

        document.title = title;
        history.pushState({}, '', url);

        // Reset to centered without jump
        setTrack(POS_CENTER, false);

        // Re-wire everything on the new content
        wireHandlers();

        lockDuringTransition(false);
        inFlight = false;
      }, SLIDE_MS);

    } catch (err) {
      lockDuringTransition(false);
      inFlight = false;
      window.location.href = url;
    }
  }

  /* ---------- Swipe-right gesture (subpages -> home) ---------- */
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartT = 0;
  let tracking = false;

  function shouldIgnoreGestureTarget(target) {
    if (!target) return false;
    return !!target.closest('a, button, input, textarea, select, label');
  }

  function onTouchStart(e) {
    const rootEl = screenCurrent || document;
    if (!isOnSubpage(rootEl)) return;     // only on subpages
    if (inFlight) return;
    if (!e.touches || e.touches.length !== 1) return;

    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartT = performance.now();
    tracking = !shouldIgnoreGestureTarget(e.target);
  }

  function onTouchEnd(e) {
    if (!tracking) return;
    tracking = false;

    if (!e.changedTouches || e.changedTouches.length !== 1) return;
    const t = e.changedTouches[0];

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dt = Math.max(1, performance.now() - touchStartT);

    // mostly horizontal, to the right
    if (dx <= SWIPE_MIN_PX) return;
    if (Math.abs(dy) > SWIPE_MAX_Y) return;

    const vx = dx / dt; // px/ms
    if (vx < SWIPE_MIN_VX) return;

    slideTo('index.html', 'right');
  }

  function wireSwipeGesture() {
    const el = screenCurrent || document;

    // remove to avoid duplicates after swaps
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchend', onTouchEnd);

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  function wireHandlers() {
    const rootEl = screenCurrent || document;

    // Home tiles (only exist on index)
    rootEl.querySelectorAll('a.tile[href]').forEach(a => {
      a.onclick = (e) => {
        e.preventDefault();
        slideTo(a.getAttribute('href'), 'left');
      };
    });

    // Global Home button (exists on all pages)
    if (globalHomeFab) {
      globalHomeFab.onclick = (e) => {
        e.preventDefault();
        slideTo('index.html', 'right');
      };
    }

    // Visual setup for current screen
    setTileColors(rootEl);
    applyDetailBackground(rootEl);
    updateHomeFabVisibility(rootEl);

    // Swipe-right on subpages
    wireSwipeGesture();

    // Emergency page cards (safe NO-OP on other pages)
    initEmergencyNumbers(rootEl);
  }

  window.addEventListener('popstate', () => {
    const file = (location.pathname.split('/').pop() || 'index.html');
    const dir = (file === 'index.html') ? 'right' : 'left';
    slideTo(file, dir);
  });

  // INIT
  if (track) setTrack(POS_CENTER, false);
  wireHandlers();
})();
