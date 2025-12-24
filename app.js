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


// Local Markets — starter data
const LOCAL_MARKETS = [
  {
    title: "Speer's Market",
    phone: "(707) 887-2024",
    hours: "8:00 - 8:00",
    distance: "0.8 mi (1.3 km)",
    address1: "7891 Mirabel Rd",
    address2: "Forestville, CA 95436",
    website1: "SpeersMarket.com",
    website2: "https://www.speersmarket.com/",
    image1: "Assets/Images/Local/Speers-Market-1.jpg",
    image2: "Assets/Images/Local/Speers-Market-2.jpg",
    image3: "Assets/Images/Local/Speers-Market-3.jpg",
    image4: "Assets/Images/Local/Speers-Market-4.jpg",
    imagemap: "Assets/Images/Maps/Elf-to-Speers.jpg",
    description:
      "Great Corner Market! Wine, Produce & Deli! VERY Close by.\n\n" +
      "Located at the crossing of Mirabel and Trenton roads, it’s just moments away. Their wine and deli selections will send you on any adventure with a smile. " +
      "This small local market has easy parking, close to all the River action, and has been serving our community for the past 40 years."
  },
  {
    title: "Andy's Market",
    phone: "(707) 823-8661",
    hours: "8:00 - 8:00 (TFSS)",
    distance: "5.6 mi (9.0 km)",
    address1: "1691 N. Gravenstein",
    address2: "Sebastopol, CA 95472",
    website1: "AndysProduce.com",
    website2: "https://andysproduce.com/",
    image1: "Assets/Images/Local/Andys-Market-1.jpg",
    image2: "Assets/Images/Local/Andys-Market-2.jpg",
    imagemap: "Assets/Images/Maps/Elf-to-Andys.jpg",
    description:
      "Andy’s Produce Market takes pride in providing our community the freshest, highest quality fruits and vegetables around. " +
      "They focus on buying local and support neighboring family farms.\n\n" +
      "There is no other fruit/vegetable experience quite like Andy’s. You can find locally made dairy products, artisan breads, and many unique grocery items at Andy’s. " +
      "It’s worth the stop if you are a fresh foods fanatic."
  },
];




const LOCAL_ADVENTURES = [
  {
    title: "Burke’s Canoe Trips",
    phone: "(707) 887-1222",
    reservations: "Recommended",
    time: "3.5 - 5 Hours",
    address1: "8600 River Rd",
    address2: "Forestville, CA 95436",
    website1: "BurkesCanoeTrips.com",
    website2: "http://burkescanoetrips.com/",
    image1: "Assets/Images/Local/BC-01.jpg",
    image2: "Assets/Images/Local/BC-02.jpg",
    image3: "Assets/Images/Local/BC-03.jpg",
    description:
      "Located off River Rd on the Russian River, Burke’s is a ten mile self-guided canoe trip following the path to the ocean. You can comfortably do this trip in approximately 3 ½ hours, actual canoeing time.\n\n" +
      "However, most people picnic, swim, sunbath, etc. and are usually out close to 4 or 5 hours. You will see wildlife such as: otter, Great Blue Heron, osprey, turtles, egret, and more. Canoeing at Burke’s is a true Russian River Tradition."
  },
  {
    title: "Sonoma Canopy Tours",
    phone: "(833) 227-8510",
    reservations: "Required",
    time: "2.5 - 5 Hours",
    address1: "6250 Bohemian Hwy",
    address2: "Occidental, CA 95465",
    website1: "SonomaCanopyTours.com",
    website2: "https://www.sonomacanopytours.com/",
    image1: "Assets/Images/Local/SCT-01.jpg",
    image2: "Assets/Images/Local/SCT-02.jpg",
    description:
      "Nestled off the coast of Northern California and deep in the Redwood forest, Sonoma Canopy Tours is high adventure and completely unlike anything you’ve ever experienced.\n\n" +
      "With two unique courses, each a two-and-a-half hour Guided eco tour that include multiple zip lines, sky bridges, a majestic spiral staircase, a rappel to the forest floor, you will be immersed in the unparalleled beauty of the world famous California Coastal Redwoods."
  },
  {
    title: "Safari West",
    phone: "(800) 616-2695",
    hours: "Variable",
    address1: "3115 Porter Creek Rd",
    address2: "Santa Rosa, CA 95404",
    distance: "15.3 mi (24.6 km)",
    website1: "SafariWest.com",
    website2: "https://safariwest.com/",
    image1: "Assets/Images/Local/SW-01.jpg",
    image2: "Assets/Images/Local/SW-02.jpg",
    image3: "Assets/Images/Local/SW-03.jpg",
    image4: "Assets/Images/Local/SW-04.jpg",
    imagemap: "Assets/Images/Maps/Elf-to-Safari-West.jpg",
    description:
      "Since our founding in 1993, Safari West has become one of the premier wildlife destinations in the United States.\n\n" +
      "Guests visiting Safari West discover a 400-acre wilderness begging to be explored. With over 900 animals representing 90 different species roaming across some of the largest enclosures in the country, there’s a lot to see and do—a truly unique opportunity for a great experience."
  },
  {
    title: "Sonoma Ballooning",
    phone: "(707) 605-0863",
    reservations: "Required",
    address1: "21870 8th East",
    address2: "Sonoma, CA 95476",
    distance: "37.8 mi (60.8 km)",
    website1: "SonomaBallooning.com",
    website2: "https://sonomaballooning.com/",
    image1: "Assets/Images/Local/SB-01.jpg",
    imagemap: "Assets/Images/Maps/Elf-to-Hot-Air-Balloon.jpg",
    description:
      "Embark on a once-in-a-lifetime journey with a hot air balloon ride over Carneros, where Napa and Sonoma’s finest vineyards converge.\n\n" +
      "Float effortlessly over world-renowned wineries, capture stunning panoramic views of both valleys, and experience the magic of Wine Country from a unique perspective."
  },
  {
    title: "Northwood Golf Club",
    phone: "(707) 865-1116",
    reservations: "Recommended",
    hours: "7:30 - 7:30",
    address1: "17000 Armstrong Woods Rd",
    address2: "Guerneville, CA 95446",
    distance: "12.1 mi (19.5 km)",
    website1: "NorthwoodGolf.com",
    website2: "https://northwoodgolf.com/",
    image1: "Assets/Images/Local/NGC-01.jpg",
    imagemap: "Assets/Images/Maps/Elf-to-Golf.jpg",
    description:
      "Along the Russian River and in the heart of one of the world’s finest wine producing regions lies the most unique golf course you will ever experience.\n\n" +
      "Northwood Golf Course combines the magic of the architecture of Dr. Alister MacKenzie set amidst towering Redwood trees."
  },
  {
    title: "Armstrong Redwoods",
    phone: "(707) 869-2015",
    hours: "8:00 - 1 hr After Sunset",
    address1: "17000 Armstrong Woods Rd",
    address2: "Guerneville, CA 95446",
    fee: "$10 Per vehicle",
    dogs: "Only on paved road with leash",
    website1: "Parks.CA.Gov/?page_id=450",
    website2: "https://www.parks.ca.gov/?page_id=450",
    image1: "Assets/Images/Local/Redwood-01.jpg",
    imagemap: "Assets/Images/Maps/Elf-to-Redwood.jpg",
    description:
      "The serene, majestic beauty of this Grove is a living reminder of the magnificent primeval redwood forest that covered much of this area before logging operations began.\n\n" +
      "Armstrong Redwoods preserves stately and magnificent Sequoia sempervirens, commonly known as the coast redwood."
  },
  {
    title: "Steelhead Beach Regional Park",
    phone: "(707) 433-1625",
    phone2: "CA Relay 711",
    hours: "7:00 - Sunset",
    address1: "900 River Rd",
    address2: "Forestville, CA 95436",
    distance: "1.7 mi (2.7 km)",
    website1: "Use Search Engine",
    website2: "https://parks.sonomacounty.ca.gov/visit/find-a-park/steelhead-beach-regional-park",
    image1: "Assets/Images/Local/Steelhead-01.jpg",
    image2: "Assets/Images/Local/Steelhead-02.jpg",
    imagemap: "Assets/Images/Maps/Elf-to-Steelhead.jpg",
    shuttleText:
      "Sonoma County Regional Park Service started a fabulous beach shuttle in 2023. It’s a short 3 min drive to local high school and there’s a huge parking lot. Click icon for more info.",
    shuttleIcon: "Assets/Images/Icons/Icon-Shuttle.png",
    shuttleUrl: "https://parks.sonomacounty.ca.gov/visit/regional-parks-river-shuttle",
    description:
      "Steelhead Beach is a destination for summer fun on the Russian River. Swimming, paddling, sunbathing, picnicking, and barbecuing are favorite activities here during warm months.\n\n" +
      "Trails: Steelhead Beach includes several short trails that make a nearly 1-mile loop through woods along the riverbank.\n\n" +
      "Accessibility: ADA access to developed areas, group picnic areas, path to Russian River."
  },
  {
    title: "Riverfront Regional Park",
    phone: "(707) 433-1625",
    phone2: "CA Relay 711",
    hours: "7:00 - Sunset",
    address1: "8600 River Rd",
    address2: "Forestville, CA 95436",
    distance: "4.2 mi (6.8 km)",
    website1: "Use Search Engine",
    website2: "https://parks.sonomacounty.ca.gov/visit/find-a-park/riverfront-regional-park",
    image1: "Assets/Images/Local/Riverfront-01.jpg",
    image2: "Assets/Images/Local/Riverfront-02.jpg",
    imagemap: "Assets/Images/Maps/Elf-to-Riverfront.jpg",
    description:
      "Located along the Russian River, Riverfront Regional Park is just minutes from downtown Windsor and Healdsburg and surrounded by classic Wine Country scenery.\n\n" +
      "The 2-mile Lake Trail loops around the larger lake and has a short spur to a small gravel beach on the Russian River."
  },
  {
    title: "West County Regional Trail",
    phone: "(707) 433-1625",
    phone2: "Ranger",
    parking: "Free",
    reservations: "Recommended",
    hours: "Sunrise to Sunset",
    dogs: "On leash",
    address1: "9251 Ross Station Rd",
    address2: "Sebastopol, CA 95472",
    distance: "5.5 mi (8.9 km) (One Way)",
    image1: "Assets/Images/Maps/West-County-Regional-Trail.jpg",
    description:
      "The West County Regional Trail is a mostly paved, 5.5-mile biking/walking trail linking Forestville to Graton, then onto Sebastopol and Santa Rosa.\n\n" +
      "Parking is available on Ross Station Road, Graton Road, and near Sebastopol Charter School."
  },
  {
    title: "Local Bike Rentals",
    name: "Russian River Cycle Service",
    phone: "(707) 877-2453",
    website1: "RussianRiverCycles.com",
    website2: "https://russianrivercycles.com/",
    image1: "Assets/Images/Local/RRCS-01.jpg",
    description:
      "Local Bike Rentals *They Deliver*\n\nA great option if you want to explore the West County Regional Trail."
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


function initLocalMarkets(rootEl) {
  if (!rootEl) return;

  const container = rootEl.querySelector('#localMarketsList');
  if (!container) return;

  if (container.dataset.loaded === '1') return;

  container.innerHTML = LOCAL_MARKETS
    .map(window.ER.renderLocalMarketCard)
    .join('');

  container.dataset.loaded = '1';

  window.ER.wireExpandableMarketCards(container);
  window.ER.wireMarketSlideshows(container);
}




function initLocalAdventures(rootEl) {
  if (!rootEl) return;

  const container = rootEl.querySelector('#localAdventuresList');
  if (!container) return;

  if (container.dataset.loaded === '1') return;


  container.innerHTML = LOCAL_ADVENTURES
    .map(window.ER.renderLocalAdventureCard)
    .join('');

  container.dataset.loaded = '1';

  window.ER.wireExpandableAdventureCards(container);
  window.ER.wireAdventureSlideshows(container);
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
    initLocalMarkets(rootEl);
    initLocalAdventures(rootEl);

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
