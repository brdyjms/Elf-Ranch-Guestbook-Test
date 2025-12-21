(() => {
  // Keep in sync with your CSS --slideMs
  const SLIDE_MS = 720;
  const DETAIL_SHIFT = -12; // negative = darker, positive = lighter

  const track = document.getElementById('track');
  const screenCurrent = document.getElementById('screenCurrent');
  const screenNext = document.getElementById('screenNext');
  const globalHomeFab = document.getElementById('globalHomeFab');

  // ---------- Color helpers ----------
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

  // ---------- Per-page setup ----------
  function setTileColors(root = document) {
    root.querySelectorAll('.tile[data-color]').forEach(tile => {
      tile.style.background = tile.dataset.color;
    });
  }

  function applyDetailBackground(root = document) {
    const page = root.querySelector('.page[data-base]');
    if (!page) return;
    const base = page.dataset.base;
    page.style.background = shiftHex(base, DETAIL_SHIFT);
  }

  function updateHomeFabVisibility(root = document) {
    if (!globalHomeFab) return;
    const isSubpage = !!root.querySelector('.page');
    globalHomeFab.classList.toggle('is-hidden', !isSubpage);
  }

  function isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function lockDuringTransition(lock) {
    document.documentElement.style.pointerEvents = lock ? 'none' : '';
  }

  // ---------- Fetch + DOM swap ----------
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

  function resetTrackToRestingState() {
    // IMPORTANT: use transform:none so fixed overlays behave correctly on mobile
    track.style.transition = 'none';
    track.style.transform = 'none';
    // force layout
    void track.offsetWidth;
    track.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(.2,.8,.2,1)`;
  }

  async function slideTo(url, direction) {
    // direction: 'left' forward, 'right' back
    if (!track || !screenCurrent || !screenNext) {
      window.location.href = url;
      return;
    }

    if (isReducedMotion()) {
      window.location.href = url;
      return;
    }

    lockDuringTransition(true);

    try {
      // Load target page HTML
      const html = await fetchPage(url);
      const { inner, title } = parseIncoming(html);

      // Place incoming content into NEXT screen
      screenNext.innerHTML = inner;

      // Run setup on NEXT screen
      setTileColors(screenNext);
      applyDetailBackground(screenNext);

      // Ensure track is at rest before starting
      resetTrackToRestingState();

      // Animate to show next
      // next is to the right; we slide left to reveal it.
      track.style.transform = (direction === 'left')
        ? 'translateX(-50%)'
        : 'translateX(50%)';

      window.setTimeout(() => {
        // Commit the swap
        screenCurrent.innerHTML = screenNext.innerHTML;
        screenNext.innerHTML = '';

        // Update title + URL
        document.title = title;
        history.pushState({}, '', url);

        // Reset track so current screen is visible
        resetTrackToRestingState();

        // Re-wire handlers & update visibility on the NEW content
        wireHandlers();

        lockDuringTransition(false);
      }, SLIDE_MS);
    } catch (err) {
      lockDuringTransition(false);
      // fallback to normal navigation if anything fails
      window.location.href = url;
    }
  }

  // ---------- Event wiring ----------
  function wireHandlers() {
    // Home tiles => slide left to their page
    document.querySelectorAll('a.tile[href]').forEach(a => {
      a.onclick = (e) => {
        e.preventDefault();
        slideTo(a.getAttribute('href'), 'left');
      };
    });

    // Global Home button => slide right to index
    if (globalHomeFab) {
      globalHomeFab.onclick = (e) => {
        e.preventDefault();
        slideTo('index.html', 'right');
      };
    }

    // Apply page visuals
    setTileColors(document);
    applyDetailBackground(document);

    // Show/hide global home button based on current page
    updateHomeFabVisibility(document);
  }

  // Back/forward browser buttons
  window.addEventListener('popstate', () => {
    const file = (location.pathname.split('/').pop() || 'index.html');
    const dir = (file === 'index.html') ? 'right' : 'left';
    slideTo(file, dir);
  });

  // ---------- Init ----------
  wireHandlers();
  // Ensure resting state is transform:none
  if (track) resetTrackToRestingState();
})();
