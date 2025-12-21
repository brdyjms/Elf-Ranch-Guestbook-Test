(() => {
  const SLIDE_MS = 720;       // match CSS --slideMs
  const DETAIL_SHIFT = -12;   // subpage background darker

  // Swipe gesture tuning
  const SWIPE_MIN_PX = 60;     // minimum horizontal distance
  const SWIPE_MAX_Y = 50;      // if vertical movement exceeds this, ignore
  const SWIPE_MIN_VX = 0.15;   // px/ms minimum horizontal velocity-ish

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
    const h = hex.replace('#', '').trim();
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

  function setTileColors(root = document) {
    root.querySelectorAll('.tile[data-color]').forEach(tile => {
      tile.style.background = tile.dataset.color;
    });
  }

  function applyDetailBackground(root = document) {
    const page = root.querySelector('.page[data-base]');
    if (!page) return;
    page.style.background = shiftHex(page.dataset.base, DETAIL_SHIFT);
  }

  function isOnSubpage(root = document) {
    return !!root.querySelector('.page');
  }

  function updateHomeFabVisibility(root = document) {
    if (!globalHomeFab) return;
    globalHomeFab.classList.toggle('is-hidden', !isOnSubpage(root));
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

      setTrack(POS_CENTER, false);
      setTrack(direction === 'left' ? POS_RIGHT : POS_LEFT, true);

      window.setTimeout(() => {
        screenCurrent.innerHTML = (direction === 'left')
          ? screenNext.innerHTML
          : screenPrev.innerHTML;

        clearSideScreens();

        document.title = title;
        history.pushState({}, '', url);

        setTrack(POS_CENTER, false);

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

  // -------- Swipe-right gesture (subpages -> home) --------
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartT = 0;
  let tracking = false;

  function shouldIgnoreGestureTarget(target) {
    if (!target) return false;
    return !!target.closest('a, button, input, textarea, select, label');
  }

  function onTouchStart(e) {
    if (!isOnSubpage(document)) return;          // only on subpages
    if (inFlight) return;
    if (!e.touches || e.touches.length !== 1) return;

    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartT = performance.now();
    tracking = !shouldIgnoreGestureTarget(e.target);
  }

  function onTouchMove(e) {
    if (!tracking) return;
    // We don't call preventDefault here; we just decide later.
    // This keeps vertical scrolling smooth.
  }

  function onTouchEnd(e) {
    if (!tracking) return;
    tracking = false;

    if (!e.changedTouches || e.changedTouches.length !== 1) return;
    const t = e.changedTouches[0];

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dt = Math.max(1, performance.now() - touchStartT);

    // Must be mostly horizontal, to the right
    if (dx <= SWIPE_MIN_PX) return;
    if (Math.abs(dy) > SWIPE_MAX_Y) return;

    const vx = dx / dt; // px per ms
    if (vx < SWIPE_MIN_VX) return;

    // Trigger back to home
    slideTo('index.html', 'right');
  }

  function wireSwipeGesture() {
    // Attach to the current screen container (safe for our swapped DOM)
    // Using passive listeners to avoid scroll jank.
    const el = screenCurrent || document;
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  function wireHandlers() {
    // Home tiles
    document.querySelectorAll('a.tile[href]').forEach(a => {
      a.onclick = (e) => {
        e.preventDefault();
        slideTo(a.getAttribute('href'), 'left');
      };
    });

    // Global Home button
    if (globalHomeFab) {
      globalHomeFab.onclick = (e) => {
        e.preventDefault();
        slideTo('index.html', 'right');
      };
    }

    // Visual setup for current
    setTileColors(document);
    applyDetailBackground(document);
    updateHomeFabVisibility(document);

    // Swipe-right on subpages
    wireSwipeGesture();
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
