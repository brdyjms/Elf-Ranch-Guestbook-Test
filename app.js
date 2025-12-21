(function () {
  const SLIDE_MS = 720; // keep in sync with --slideMs if you edit it

  function setTileColors() {
    document.querySelectorAll('.tile[data-color]').forEach(tile => {
      tile.style.background = tile.dataset.color;
    });
  }

  // Shift hex brightness by percent: negative darkens, positive lightens
  function shiftHex(hex, percent) {
    const h = hex.replace('#','').trim();
    const full = h.length === 3 ? h.split('').map(c => c+c).join('') : h;
    const int = parseInt(full, 16);
    let r = (int >> 16) & 255;
    let g = (int >> 8) & 255;
    let b = int & 255;

    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;

    r = Math.round((t - r) * p + r);
    g = Math.round((t - g) * p + g);
    b = Math.round((t - b) * p + b);

    const to = (n) => n.toString(16).padStart(2,'0');
    return `#${to(r)}${to(g)}${to(b)}`;
  }

  function setDetailBackground() {
    const page = document.querySelector('.page[data-base]');
    if (!page) return;
    const base = page.dataset.base;
    // match but a few shades darker (change to +10 for lighter)
    const bg = shiftHex(base, -12);
    page.style.background = bg;
  }

  function animateNavigate(anchor, direction) {
    // direction: 'left' (to detail) or 'right' (back to home)
    const href = anchor.getAttribute('href');
    if (!href) return;

    // Prefer reducing motion settings
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      window.location.href = href;
      return;
    }

    const root = document.documentElement;
    // Apply animation to body so entire page slides
    document.body.classList.remove('slide-out-left','slide-out-right','slide-in-left','slide-in-right');

    if (direction === 'left') {
      document.body.classList.add('slide-out-left');
    } else {
      document.body.classList.add('slide-out-right');
    }

    window.setTimeout(() => {
      window.location.href = href;
    }, SLIDE_MS);
  }

  function wireHomeLinks() {
    // Home tiles slide left before going to new page
    document.querySelectorAll('a.tile').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        animateNavigate(a, 'left');
      });
    });
  }

  function wireDetailHomeButton() {
    const btn = document.querySelector('[data-home]');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Navigate back to home with slide right
      const fakeAnchor = document.createElement('a');
      fakeAnchor.setAttribute('href', 'index.html');
      animateNavigate(fakeAnchor, 'right');
    });
  }

  // When a page loads, slide in from the appropriate side (optional polish)
  function playEntrance() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // If coming from home -> detail, slide in from right
    // If coming from detail -> home, slide in from left
    // We'll infer from referrer ending
    const ref = document.referrer || '';
    document.body.classList.remove('slide-out-left','slide-out-right','slide-in-left','slide-in-right');

    if (ref.includes('index.html') && !location.pathname.endsWith('index.html')) {
      document.body.classList.add('slide-in-right');
    } else if (!ref.includes('index.html') && location.pathname.endsWith('index.html')) {
      document.body.classList.add('slide-in-left');
    }
  }

  // Init
  setTileColors();
  setDetailBackground();
  wireHomeLinks();
  wireDetailHomeButton();
  playEntrance();
})();
