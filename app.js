'use strict';

/* =========================================================
   app.js
   Navigation + swipe + per-page initialization
   Depends on modules.js (window.ER)
   ========================================================= */


/* =========================================================
   Page Data (Static)
   ========================================================= */

// Emergency Info — Non-emergency numbers (static; no TSV needed)
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
    address1: "",
    address2: ""
  },

];


// Essentials Around Town — template data (you will replace later)
const ESSENTIALS_AROUND_TOWN = [
  {
    title: "Local Bakery",
    name: "Nightingale Bakery",
    phone: "(707) 887-8887",
    distance: "",
    address1: "6660 Front St",
    address2: "Forestville, CA 95436"
  },
  {
    title: "Pharmacy",
    name: "Forestville Pharmacy",
    phone: "(707) 887-2260",
    distance: "",
    address1: "6652 nFront St",
    address2: "Forestville, CA 95436"
  },
  {
    title: "Home Store",
    name: "Ideal Hardware",
    phone: "(707) 887-7561",
    distance: "",
    address1: "6631 Front St",
    address2: "Forestville, CA 95436"
  },  
  {
    title: "ATM",
    name: "BMO Bank / ATM",
    phone: "(707) 887-3320",
    distance: "",
    address1: "6661 Front St",
    address2: "Forestville, CA 95436"
  },
  {
    title: "Laundromat",
    name: "Forestviclle Laundromat",
    phone: "",
    distance: "",
    address1: "6658 Front St",
    address2: "Forestville, CA 95436"
  },
  {
    title: "Gas Station",
    name: "Rotten Robbie Gas Station",
    phone: "(707) 887-7665",
    distance: "",
    address1: "7001 CA-116",
    address2: "Forestville, CA 95436"
  },
  {
    title: "Mail",
    name: "Post Office",
    phone: "(707) 887-2277",
    distance: "",
    address1: "6484 Mirabel Rd",
    address2: "Forestville, CA 95436"
  },

];


// Local Eateries — starter data
const LOCAL_EATERIES = [
  {
    title: "Sonoma Pizza Co",
    phone: "(707) 820-1031",
    hours: "11:00 - 8:00 (WTFSS)",
    distance: "1.3 mi (2.1 km)",
    address1: "6615 Front St",
    address2: "Forestville, CA 95436",
    website1: "SonomaPizzaCo.com",
    website2: "https://www.sonomapizzaco.com/",
    image: "Assets/Images/Local/Sonoma-Pizza-Co.jpg",
    description:
      "Local, organic, the very best of everything.\n\n" +
      "The art of pizza is a craft to be loved and approached as a never ending pursuit of perfection. " +
      "We pride ourselves on using the finest organic ingredients from local farms and the very best vendors."
  },
  {
    title: "Farmhouse Inn",
    phone: "(707) 887-3300",
    hours: "12:00 - 8:00 (TFSS)",
    distance: "0.9 mi (1.4 km)",
    address1: "7871 River Rd",
    address2: "Forestville, CA 95436",
    website1: "FarmHouseInn.com",
    website2: "https://www.farmhouseinn.com/",
    image: "Assets/Images/Local/Farmhouse-Inn.jpg",
    description:
      "What happens when two fifth-generation Sonoma farmers, a world-class maitre d’ and a team of sommeliers conspire?\n\n" +
      "Some call it magic…We call it Farmhouse Inn. Our restaurant has long been the cornerstone of our hotel.\n\n" +
      "Let us take you on a culinary journey, bite-by-bite, through the beautiful territory of Sonoma County."
  },

  {
    title: "Canneti's",
    phone: "(707) 887-2232",
    hours: "Variable (Closed Monday)",
    distance: "1.3 mi (2.1 km)",
    address1: "6675 Front St",
    address2: "Forestville, CA 95436",
    website1: "CannetiRoadhouse.com",
    website2: "https://cannetiroadhouse.com/",
    image: "Assets/Images/Local/Canneti.jpg",
    description:
      "“Canneti is the name of a road I used to walk to go from my parents’ house to elementary school.  I had a dream for a very long time, and when I moved to California years ago, I named that dream Canneti.  Here it is alive with its custom made rustic tables and stools, refinished wood counters and a Tuscan Country flair.  My cucina is a mix of many experiences, from a Relais & Chateaux two Michelin "
  },

  {
    title: "Russian River Vineyards",
    phone: "(707) 887-2232",
    hours: "12:00 - 5:00",
    distance: "1.9 mi (3.1 km)",
    address1: "5700 California N116",
    address2: "Forestville, CA 95436",
    website1: "RussianRiverVineyards.com",
    website2: "https://www.russianrivervineyards.com/",
    image: "Assets/Images/Local/Russian-River-Vineyards.jpg",
    description:
      "Russian River Vineyards has been a Forestville hot spot forever. Their unique food pairings with delectable wine is one of a kind. Outdoor musical events during the summer. Outdoor Dog Friendly."
  },




];





/* =========================================================
   Page Initializers
   Each initializer should NO-OP if its target DOM isn't present.
   ========================================================= */

function initEmergencyNumbers(rootEl) {
  if (!rootEl) return;

  const container = rootEl.querySelector('#nonEmergencyList');
  if (!container) return;

  // Avoid re-injecting after a swipe back/forth
  if (container.dataset.loaded === '1') return;

  container.innerHTML = NON_EMERGENCY_LOCATIONS
    .map(window.ER.renderNonEmergencyCard)
    .join('');

  container.dataset.loaded = '1';

  // Wire "Call 911" block
  const call911 = rootEl.querySelector('[data-call911]');
  if (call911) {
    const dial = () => { window.location.href = 'tel:911'; };
    call911.addEventListener('click', dial);
    call911.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') dial();
    });
  }
}


function initEssentialsAroundTown(rootEl) {
  if (!rootEl) return;

  const container = rootEl.querySelector('#essentialsList');
  if (!container) return;

  if (container.dataset.loaded === '1') return;

  container.innerHTML = ESSENTIALS_AROUND_TOWN
    .map(window.ER.renderEssentialsPlaceCard)
    .join('');

  container.dataset.loaded = '1';
}


function initLocalEateries(rootEl) {
  if (!rootEl) return;

  const container = rootEl.querySelector('#localEateriesList');
  if (!container) return;

  if (container.dataset.loaded === '1') return;

  container.innerHTML = LOCAL_EATERIES
    .map(window.ER.renderLocalEateryCard)
    .join('');

  container.dataset.loaded = '1';

  // Wire expand/collapse behavior
  window.ER.wireExpandableEateryCards(container);
}








/* =========================================================
   App Shell: 3-pane navigation + swipe gesture
   ========================================================= */

(() => {
  /* -----------------------------
     Constants / tuning
     ----------------------------- */
  const SLIDE_MS = 720;       // match CSS --slideMs
  const DETAIL_SHIFT = -12;   // subpage background darker

  // Swipe gesture tuning (subpages -> home)
  const SWIPE_MIN_PX = 60;
  const SWIPE_MAX_Y = 50;
  const SWIPE_MIN_VX = 0.15;

  // Track positions for 3 panes: [Prev | Current | Next]
  const POS_LEFT   = 'translateX(0%)';
  const POS_CENTER = 'translateX(-33.3333%)';
  const POS_RIGHT  = 'translateX(-66.6667%)';

  /* -----------------------------
     DOM references
     ----------------------------- */
  const track = document.getElementById('track');
  const screenPrev = document.getElementById('screenPrev');
  const screenCurrent = document.getElementById('screenCurrent');
  const screenNext = document.getElementById('screenNext');
  const globalHomeFab = document.getElementById('globalHomeFab');

  /* -----------------------------
     Visual helpers
     ----------------------------- */
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
    page.style.background = window.ER.shiftHex(page.dataset.base, DETAIL_SHIFT);
  }

  function isOnSubpage(rootEl) {
    return !!(rootEl && rootEl.querySelector('.page'));
  }

  function updateHomeFabVisibility(rootEl) {
    if (!globalHomeFab) return;
    globalHomeFab.classList.toggle('is-hidden', !isOnSubpage(rootEl));
  }

  /* -----------------------------
     Motion / interaction helpers
     ----------------------------- */
  function isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function lockDuringTransition(lock) {
    document.documentElement.style.pointerEvents = lock ? 'none' : '';
  }

  /* -----------------------------
     Page loading (fetch + parse)
     ----------------------------- */
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

  /* -----------------------------
     Track control (3-pane)
     ----------------------------- */
  function setTrack(pos, withTransition = true) {
    if (!track) return;
    track.style.transition = withTransition
      ? `transform ${SLIDE_MS}ms cubic-bezier(.2,.8,.2,1)`
      : 'none';
    track.style.transform = pos;
    void track.offsetWidth;
  }

  function clearSideScreens() {
    if (screenPrev) screenPrev.innerHTML = '';
    if (screenNext) screenNext.innerHTML = '';
  }

  /* -----------------------------
     Navigation
     ----------------------------- */
  let inFlight = false;

  async function slideTo(url, direction) {
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

      // Start centered, then animate to show Prev or Next
      setTrack(POS_CENTER, false);
      setTrack(direction === 'left' ? POS_RIGHT : POS_LEFT, true);

      window.setTimeout(() => {
        // Commit the new current content
        screenCurrent.innerHTML = (direction === 'left')
          ? screenNext.innerHTML
          : screenPrev.innerHTML;

        clearSideScreens();

        document.title = title;
        history.pushState({}, '', url);

        // Reset to center without visible jump
        setTrack(POS_CENTER, false);

        // Wire events on the newly injected content
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

  /* -----------------------------
     Swipe-right gesture (subpages -> home)
     ----------------------------- */
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
    if (!isOnSubpage(rootEl)) return;
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

    if (dx <= SWIPE_MIN_PX) return;
    if (Math.abs(dy) > SWIPE_MAX_Y) return;

    const vx = dx / dt;
    if (vx < SWIPE_MIN_VX) return;

    slideTo('index.html', 'right');
  }

  function wireSwipeGesture() {
    const el = screenCurrent || document;
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchend', onTouchEnd);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  /* -----------------------------
     Wiring: attach handlers after each swap
     ----------------------------- */
  function wireHandlers() {
    const rootEl = screenCurrent || document;

    // Home tiles (index.html)
    rootEl.querySelectorAll('a.tile[href]').forEach(a => {
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

    // Visual setup for current screen
    setTileColors(rootEl);
    applyDetailBackground(rootEl);
    updateHomeFabVisibility(rootEl);

    // Gestures
    wireSwipeGesture();

    // Page initializers (safe NO-OP unless page has target elements)  ------------------------------------------------ When you add a new sub page script, make sure to add the needed line here, Examples below
    //initEmergencyNumbers(rootEl);
    //initScoop(rootEl);
    //initDrivingTour(rootEl);

    initEmergencyNumbers(rootEl);
    initEssentialsAroundTown(rootEl);
    initLocalEateries(rootEl); // <-- add this

  }

  /* -----------------------------
     Back/forward support
     ----------------------------- */
  window.addEventListener('popstate', () => {
    const file = (location.pathname.split('/').pop() || 'index.html');
    const dir = (file === 'index.html') ? 'right' : 'left';
    slideTo(file, dir);
  });

  /* -----------------------------
     Init
     ----------------------------- */
  if (track) setTrack(POS_CENTER, false);
  wireHandlers();
})();
