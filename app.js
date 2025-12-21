(function () {
  const SLIDE_MS = 720;      // keep consistent with --slideMs
  const DETAIL_SHIFT = -12;  // darker background on subpages

  const track = document.getElementById('track');
  const screenCurrent = document.getElementById('screenCurrent');
  const screenNext = document.getElementById('screenNext');

  function setTileColors(root = document) {
    root.querySelectorAll('.tile[data-color]').forEach(tile => {
      tile.style.background = tile.dataset.color;
    });
  }

  function clamp(v, min, max){ return Math.min(max, Math.max(min, v)); }

  function hexToRgb(hex){
    const h = hex.replace('#','').trim();
    const full = h.length === 3 ? h.split('').map(c=>c+c).join('') : h;
    const int = parseInt(full, 16);
    return { r: (int>>16)&255, g: (int>>8)&255, b: int&255 };
  }

  function rgbToHex(r,g,b){
    const to = (n) => n.toString(16).padStart(2,'0');
    return `#${to(r)}${to(g)}${to(b)}`;
  }

  function shiftHex(hex, percent){
    const {r,g,b} = hexToRgb(hex);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const nr = Math.round((t - r) * p + r);
    const ng = Math.round((t - g) * p + g);
    const nb = Math.round((t - b) * p + b);
    return rgbToHex(clamp(nr,0,255), clamp(ng,0,255), clamp(nb,0,255));
  }

  function applyDetailBackground(root = document) {
    const page = root.querySelector('.page[data-base]');
    if (!page) return;
    const base = page.dataset.base;
    page.style.background = shiftHex(base, DETAIL_SHIFT);
  }

  async function fetchPage(url) {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return await res.text();
  }

  function parseIncoming(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');

    // Grab the incoming page's "current screen" content
    const incomingCurrent = doc.querySelector('#screenCurrent');
    if (!incomingCurrent) throw new Error('Incoming page missing #screenCurrent');

    // We want the *inside* of #screenCurrent (so we keep our shell/track)
    const inner = incomingCurrent.innerHTML;

    const title = doc.querySelector('title')?.textContent?.trim() || document.title;
    return { inner, title };
  }

  function isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function lockDuringTransition(lock) {
    // prevent double-taps during animation
    document.documentElement.style.pointerEvents = lock ? 'none' : '';
  }

  async function slideTo(url, direction) {
    // direction: 'left' forward, 'right' back
    if (!track || !screenCurrent || !screenNext) {
      // fallback: normal nav
      window.location.href = url;
      return;
    }

    if (isReducedMotion()) {
      window.location.href = url;
      return;
    }

    lockDuringTransition(true);

    try {
      // Prepare next screen content
      const html = await fetchPage(url);
      const { inner, title } = parseIncoming(html);

      screenNext.innerHTML = inner;

      // Run per-page setup on the NEXT screen DOM
      setTileColors(screenNext);
      applyDetailBackground(screenNext);

      // Position: next is always to the right by default.
      // Animate track to reveal it (left swipe), or reveal previous (right swipe).
      track.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(.2,.8,.2,1)`;

      // Ensure we start at 0 before animating
      track.style.transform = 'translateX(0%)';
      // Force layout so transform applies before we change it
      void track.offsetWidth;

      track.style.transform = (direction === 'left')
        ? 'translateX(-50%)'
        : 'translateX(50%)';

      // After animation, swap screens, reset track, update URL/title
      window.setTimeout(() => {
        // Commit content
        screenCurrent.innerHTML = screenNext.innerHTML;
        screenNext.innerHTML = '';

        // Reset track back to "current"
        track.style.transition = 'none';
        track.style.transform = 'none';          // <-- important
        void track.offsetWidth;                  // force reset
        track.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(.2,.8,.2,1)`;


        document.title = title;
        history.pushState({}, '', url);

        // Re-wire handlers on the new current screen
        wireHandlers();

        lockDuringTransition(false);
      }, SLIDE_MS);
    } catch (err) {
      lockDuringTransition(false);
      // fallback to normal navigation if anything fails
      window.location.href = url;
    }
  }

  function wireHandlers() {
    // Tiles (home) => slide left to subpage
    document.querySelectorAll('a.tile[href]').forEach(a => {
      a.onclick = (e) => {
        e.preventDefault();
        slideTo(a.getAttribute('href'), 'left');
      };
    });

    // Home FAB on subpages => slide right to index
    const homeBtn = document.querySelector('[data-home]');
    if (homeBtn) {
      homeBtn.onclick = (e) => {
        e.preventDefault();
        slideTo('index.html', 'right');
      };
    }

    // Apply per-page visuals on current screen
    setTileColors(document);
    applyDetailBackground(document);
  }

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    // On pop, do a normal fetch+swap without a directional guess
    // We’ll choose direction by whether we’re going to index.
    const target = location.pathname.split('/').pop() || 'index.html';
    const dir = (target.toLowerCase() === 'index.html') ? 'right' : 'left';
    slideTo(target, dir);
  });

  // Init
  wireHandlers();
})();
