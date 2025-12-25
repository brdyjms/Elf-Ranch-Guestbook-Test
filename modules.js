'use strict';

/* =========================================================
   modules.js
   Reusable helpers + UI renderers (global namespace: window.ER)
   ========================================================= */

(function () {
  const ER = (window.ER = window.ER || {});

  /* =========================================================
     General Utilities
     ========================================================= */

  ER.escapeHtml = function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  };

  /* =========================================================
     Phone + Maps Helpers
     ========================================================= */

  ER.normalizePhoneForTel = function normalizePhoneForTel(phone) {
    const trimmed = (phone || '').trim();
    if (!trimmed) return '';
    const plus = trimmed.startsWith('+') ? '+' : '';
    const digits = trimmed.replace(/[^\d]/g, '');
    return plus + digits;
  };

  ER.mapsSearchLink = function mapsSearchLink(address1, address2) {
    const full = [address1, address2]
      .map(s => (s || '').trim())
      .filter(Boolean)
      .join(', ');
    if (!full) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(full)}`;
  };

  /* =========================================================
     Color Helpers (used by app.js theming)
     ========================================================= */

  ER.shiftHex = function shiftHex(hex, percent) {
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const hexToRgb = (hx) => {
      const h = (hx || '').replace('#', '').trim();
      const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      const int = parseInt(full, 16);
      return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
    };
    const rgbToHex = (r, g, b) => {
      const to = (n) => n.toString(16).padStart(2, '0');
      return `#${to(r)}${to(g)}${to(b)}`;
    };

    const { r, g, b } = hexToRgb(hex);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;

    const nr = Math.round((t - r) * p + r);
    const ng = Math.round((t - g) * p + g);
    const nb = Math.round((t - b) * p + b);

    return rgbToHex(clamp(nr, 0, 255), clamp(ng, 0, 255), clamp(nb, 0, 255));
  };

  /* =========================================================
     Shared UI Components
     ========================================================= */

  // Generic phone/map action row (currently emoji icons)
  // Later you can swap the icon markup here once, and every page updates.
  ER.renderActionButtons = function renderActionButtons({
    phone = '',
    address1 = '',
    address2 = '',
    ariaLabelBase = 'Location'
  }) {
    const tel = ER.normalizePhoneForTel(phone);
    const telHref = tel ? `tel:${tel}` : '';

    const hasAddr1 = (address1 || '').trim().length > 0;
    const hasAddr2 = (address2 || '').trim().length > 0;
    const mapHref = (hasAddr1 || hasAddr2) ? ER.mapsSearchLink(address1, address2) : '';

    return `
      <div class="card-actions">
        ${telHref
          ? `<a class="icon-btn" href="${telHref}" aria-label="Call ${ER.escapeHtml(ariaLabelBase)}">📞</a>`
          : `<span class="icon-btn" style="opacity:.35" aria-hidden="true">📞</span>`
        }
        ${mapHref
          ? `<a class="icon-btn" href="${mapHref}" target="_blank" rel="noopener" aria-label="Map ${ER.escapeHtml(ariaLabelBase)}">📍</a>`
          : `<span class="icon-btn" style="opacity:.35" aria-hidden="true">📍</span>`
        }
      </div>
    `;
  };


/* ========================================================================================================================================================== Page Specific JS  */


  /* =========================================================
     Emergency Page Renderers (uses PNG icons + stacked layout)
     ========================================================= */

  ER.renderNonEmergencyCard = function renderNonEmergencyCard(item) {
    const esc = ER.escapeHtml;

    const hasAddr1 = (item.address1 || '').trim().length > 0;
    const hasAddr2 = (item.address2 || '').trim().length > 0;

    const tel = ER.normalizePhoneForTel(item.phone);
    const telHref = tel ? `tel:${tel}` : '';

    const mapHref = (hasAddr1 || hasAddr2)
      ? ER.mapsSearchLink(item.address1, item.address2)
      : '';

    const lines = [
      item.name ? esc(item.name) : '',
      item.phone ? `Phone: ${esc(item.phone)}` : '',
      item.distance ? `Distance: ${esc(item.distance)}` : '',
      hasAddr1 ? esc(item.address1) : '',
      hasAddr2 ? esc(item.address2) : '',
    ].filter(Boolean).join('<br>');

    return `
      <div class="card emergency-card">
        <div class="emergency-card-content">
          <div class="card-title">${esc(item.title || 'Non-Emergency')}</div>
          <div class="card-body">${lines || '—'}</div>
        </div>

        <div class="emergency-card-actions">
          ${telHref ? `
            <a class="emergency-icon-btn"
               href="${telHref}"
               aria-label="Call ${esc(item.name || item.title)}">
              <img src="Assets/Images/Icons/Icon-Phone.png" alt="Call">
            </a>
          ` : ''}

          ${mapHref ? `
            <a class="emergency-icon-btn"
               href="${mapHref}"
               target="_blank"
               rel="noopener"
               aria-label="Map ${esc(item.name || item.title)}">
              <img src="Assets/Images/Icons/Icon-Map.png" alt="Map">
            </a>
          ` : ''}
        </div>
      </div>
    `;
  };




  /* =========================================================
     Essentials Around Town Renderers
     ========================================================= */

  // Renders a place card with stacked phone+map icons on the right
  ER.renderEssentialsPlaceCard = function renderEssentialsPlaceCard(item) {
    const esc = ER.escapeHtml;

    const hasAddr1 = (item.address1 || '').trim().length > 0;
    const hasAddr2 = (item.address2 || '').trim().length > 0;

    const tel = ER.normalizePhoneForTel(item.phone);
    const telHref = tel ? `tel:${tel}` : '';

    const mapHref = (hasAddr1 || hasAddr2)
      ? ER.mapsSearchLink(item.address1, item.address2)
      : '';

    const lines = [
      item.name ? esc(item.name) : '',
      item.phone ? `Phone: ${esc(item.phone)}` : '',
      item.distance ? `Distance: ${esc(item.distance)}` : '',
      hasAddr1 ? esc(item.address1) : '',
      hasAddr2 ? esc(item.address2) : '',
    ].filter(Boolean).join('<br>');

    return `
      <div class="card essentials-card">
        <div class="essentials-card-content">
          <div class="card-title">${esc(item.title || 'Essentials')}</div>
          <div class="card-body">${lines || '—'}</div>
        </div>

        <div class="essentials-card-actions">
          ${telHref ? `
            <a class="essentials-icon-btn"
               href="${telHref}"
               aria-label="Call ${esc(item.name || item.title)}">
              <img src="Assets/Images/Icons/Icon-Phone.png" alt="Call">
            </a>
          ` : ''}

          ${mapHref ? `
            <a class="essentials-icon-btn"
               href="${mapHref}"
               target="_blank"
               rel="noopener"
               aria-label="Map ${esc(item.name || item.title)}">
              <img src="Assets/Images/Icons/Icon-Map.png" alt="Map">
            </a>
          ` : ''}
        </div>
      </div>
    `;
  };



/* =========================================================
   Local Eateries Renderers (expandable photo card)
   ========================================================= */

ER.renderLocalEateryCard = function renderLocalEateryCard(item) {
  const esc = ER.escapeHtml;

  const hasAddr1 = (item.address1 || '').trim().length > 0;
  const hasAddr2 = (item.address2 || '').trim().length > 0;

  const tel = ER.normalizePhoneForTel(item.phone);
  const telHref = tel ? `tel:${tel}` : '';

  const mapHref = (hasAddr1 || hasAddr2)
    ? ER.mapsSearchLink(item.address1, item.address2)
    : '';

  const webHref = (item.website2 || '').trim();
  const webText = (item.website1 || '').trim();

  const desc = String(item.description || '').trim();
  const descHtml = desc
    ? desc.split(/\n\s*\n/g).map(p => `<p>${esc(p)}</p>`).join('')
    : '<p>—</p>';

  const infoLines = [
    item.phone ? `<div class="eatery-line"><span class="eatery-k">Phone:</span> ${esc(item.phone)}</div>` : '',
    item.hours ? `<div class="eatery-line"><span class="eatery-k">Hours:</span> ${esc(item.hours)}</div>` : '',
    item.distance ? `<div class="eatery-line"><span class="eatery-k">Distance:</span> ${esc(item.distance)}</div>` : '',
    hasAddr1 ? `<div class="eatery-line">${esc(item.address1)}</div>` : '',
    hasAddr2 ? `<div class="eatery-line">${esc(item.address2)}</div>` : '',
    webText ? `<div class="eatery-line"><span class="eatery-k">Web:</span> ${esc(webText)}</div>` : '',
  ].filter(Boolean).join('');

  return `
    <article class="card eatery-card" data-eatery-card>
      <header class="eatery-head">
        <div class="eatery-title">${esc(item.title || 'Local Eatery')}</div>
        <button class="eatery-info-btn" type="button" aria-label="Show details">
          <img src="Assets/Images/Icons/Icon-Info.png" alt="">
        </button>
      </header>

      <div class="eatery-divider"></div>

      <div class="eatery-body">
        <div class="eatery-info-card" aria-hidden="true">
          <div class="eatery-info-inner">
            <div class="eatery-details-top">
              <div class="eatery-details-left">
                ${infoLines || '—'}
              </div>

              <div class="eatery-details-actions">
                ${telHref ? `
                  <a class="eatery-icon-btn" href="${telHref}" aria-label="Call ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Phone.png" alt="Call">
                  </a>
                ` : ''}

                ${mapHref ? `
                  <a class="eatery-icon-btn" href="${mapHref}" target="_blank" rel="noopener" aria-label="Directions to ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Map.png" alt="Map">
                  </a>
                ` : ''}

                ${webHref ? `
                  <a class="eatery-icon-btn" href="${esc(webHref)}" target="_blank" rel="noopener" aria-label="Website for ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Web.png" alt="Web">
                  </a>
                ` : ''}

              </div>
            </div>

            <div class="eatery-desc">
              ${descHtml}
            </div>
          </div>
        </div>

        <div class="eatery-photo-card" role="img" aria-label="${esc(item.title)} photo"
             style="background-image:url('${esc(item.image || '')}');">
        </div>
      </div>
    </article>
  `;
};



ER.wireExpandableEateryCards = function wireExpandableEateryCards(container) {
  if (!container) return;

  container.addEventListener('click', (e) => {
    const card = e.target.closest('[data-eatery-card]');
    if (!card) return;

    // Block toggle only for action links (phone/map/web)
    if (e.target.closest('a.eatery-icon-btn')) return;

    card.classList.toggle('is-open');

    const infoCard = card.querySelector('.eatery-info-card');
    if (infoCard) {
      infoCard.setAttribute(
        'aria-hidden',
        card.classList.contains('is-open') ? 'false' : 'true'
      );
    }
  });
};








/* =========================================================
   Local Markets Renderers (expandable photo card)
   ========================================================= */


ER.renderLocalMarketCard = function renderLocalMarketCard(item) {
  const esc = ER.escapeHtml;

  const tel = ER.normalizePhoneForTel(item.phone);
  const telHref = tel ? `tel:${tel}` : '';

  const hasAddr1 = (item.address1 || '').trim().length > 0;
  const hasAddr2 = (item.address2 || '').trim().length > 0;

  const mapHref = (hasAddr1 || hasAddr2)
    ? ER.mapsSearchLink(item.address1, item.address2)
    : '';

  const webHref = (item.website2 || '').trim();
  const webText = (item.website1 || '').trim();

  const desc = String(item.description || '').trim();
  const descHtml = desc
    ? desc.split(/\n\s*\n/g).map(p => `<p>${esc(p)}</p>`).join('')
    : '<p>—</p>';

  // Collect slideshow images: image1..imageN
  const images = [];
  for (let i = 1; i <= 20; i++) {
    const key = `image${i}`;
    if (item[key]) images.push(String(item[key]).trim());
  }
  const imagesJson = esc(JSON.stringify(images));

  const infoLines = [
    item.phone ? `<div class="market-line"><span class="market-k">Phone:</span> ${esc(item.phone)}</div>` : '',
    item.hours ? `<div class="market-line"><span class="market-k">Hours:</span> ${esc(item.hours)}</div>` : '',
    item.distance ? `<div class="market-line"><span class="market-k">Distance:</span> ${esc(item.distance)}</div>` : '',
    hasAddr1 ? `<div class="market-line">${esc(item.address1)}</div>` : '',
    hasAddr2 ? `<div class="market-line">${esc(item.address2)}</div>` : '',
    webText ? `<div class="market-line"><span class="market-k">Web:</span> ${esc(webText)}</div>` : '',
  ].filter(Boolean).join('');

  const mapImg = (item.imagemap || '').trim();

  return `
    <article class="card market-card" data-market-card>
      <header class="market-head">
        <div class="market-title">${esc(item.title || 'Local Market')}</div>
        <button class="market-info-btn" type="button" aria-label="Show details">
          <img src="Assets/Images/Icons/Icon-Info.png" alt="">
        </button>
      </header>

      <div class="market-divider"></div>

      <div class="market-body">
        <!-- Info card (collapsed by default) -->
        <div class="market-info-card" aria-hidden="true">
          <div class="market-info-inner">
            <div class="market-details-top">
              <div class="market-details-left">
                ${infoLines || '—'}
              </div>

              <div class="market-details-actions">
                ${telHref ? `
                  <a class="market-icon-btn" href="${telHref}" aria-label="Call ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Phone.png" alt="Call">
                  </a>
                ` : ''}

                ${mapHref ? `
                  <a class="market-icon-btn" href="${mapHref}" target="_blank" rel="noopener" aria-label="Directions to ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Map.png" alt="Map">
                  </a>
                ` : ''}

                ${webHref ? `
                  <a class="market-icon-btn" href="${esc(webHref)}" target="_blank" rel="noopener" aria-label="Website for ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Web.png" alt="Web">
                  </a>
                ` : ''}
              </div>
            </div>

            <div class="market-desc">
              ${descHtml}
            </div>
          </div>
        </div>

        <!-- NEW: Map image card (only meaningful when expanded, but we can show it always) -->
        ${mapImg ? `
          <div class="market-map-card" aria-label="${esc(item.title)} map"
               style="background-image:url('${esc(mapImg)}');">
          </div>
        ` : ''}

        <!-- Main image card with crossfade slideshow -->
        <div class="market-photo-card" data-slideshow="1" data-images="${imagesJson}"
             aria-label="${esc(item.title)} photos">
          <div class="market-photo-layer market-photo-back"></div>
          <div class="market-photo-layer market-photo-front"></div>
        </div>
      </div>
    </article>
  `;
};







ER.wireExpandableMarketCards = function wireExpandableMarketCards(container) {
  if (!container) return;

  container.addEventListener('click', (e) => {
    const card = e.target.closest('[data-market-card]');
    if (!card) return;

    // Don't toggle when tapping action links (phone/map/web)
    if (e.target.closest('a.market-icon-btn')) return;

    card.classList.toggle('is-open');

    const infoCard = card.querySelector('.market-info-card');
    if (infoCard) {
      infoCard.setAttribute(
        'aria-hidden',
        card.classList.contains('is-open') ? 'false' : 'true'
      );
    }
  });
};







ER.wireMarketSlideshows = function wireMarketSlideshows(container) {
  if (!container) return;

  const cards = container.querySelectorAll('.market-photo-card[data-slideshow="1"]');
  cards.forEach((photoCard) => {
    let images = [];
    try {
      images = JSON.parse(photoCard.getAttribute('data-images') || '[]');
    } catch (_) { images = []; }

    // No slideshow needed
    if (!images || images.length === 0) return;

    const front = photoCard.querySelector('.market-photo-front');
    const back  = photoCard.querySelector('.market-photo-back');
    if (!front || !back) return;

    let idx = 0;
    let nextIdx = images.length > 1 ? 1 : 0;

    // Initial state: back is next, front is current
    front.style.backgroundImage = `url("${images[idx]}")`;
    back.style.backgroundImage  = `url("${images[nextIdx]}")`;
    front.style.opacity = '1';

    if (images.length === 1) return;

    const holdMs = 5000;
    const fadeMs = 1000;

    // Prevent double-start if re-wired
    if (photoCard._slideshowTimer) clearInterval(photoCard._slideshowTimer);

    photoCard._slideshowTimer = setInterval(() => {
      // Ensure back has the next image fully visible
      back.style.backgroundImage = `url("${images[nextIdx]}")`;

      // Crossfade: fade front out revealing back (already at 100%)
      front.style.opacity = '0';

      // After fade, swap front to the new current and reset opacity
      window.setTimeout(() => {
        idx = nextIdx;
        nextIdx = (idx + 1) % images.length;

        front.style.backgroundImage = `url("${images[idx]}")`;
        front.style.opacity = '1';
      }, fadeMs);
    }, holdMs);
  });
};





/* =========================================================
   Local Adventures Renderers 
   ========================================================= */


ER.renderLocalAdventureCard = function renderLocalAdventureCard(item) {
  const esc = ER.escapeHtml;

  const tel = ER.normalizePhoneForTel(item.phone);
  const telHref = tel ? `tel:${tel}` : '';

  const hasAddr1 = (item.address1 || '').trim().length > 0;
  const hasAddr2 = (item.address2 || '').trim().length > 0;

  const dirHref = (hasAddr1 || hasAddr2)
    ? ER.mapsSearchLink(item.address1, item.address2)
    : '';

  const webHref = (item.website2 || '').trim();
  const webText = (item.website1 || '').trim();

  // Collect slideshow images: image1..imageN
  const images = [];
  for (let i = 1; i <= 20; i++) {
    const key = `image${i}`;
    if (item[key]) images.push(String(item[key]).trim());
  }
  const imagesJson = esc(JSON.stringify(images));

  // description paragraphs
  const desc = String(item.description || '').trim();
  const descHtml = desc
    ? desc.split(/\n\s*\n/g).map(p => `<p>${esc(p)}</p>`).join('')
    : '<p>—</p>';

  // Phone + phone2 formatting
  const phoneBlock = item.phone
    ? `
      <div class="adv-line adv-phone">
        <span class="adv-k">Phone:</span>
        <div class="adv-phone-lines">
          <div>${esc(item.phone)}</div>
          ${item.phone2 ? `<div class="adv-phone2">${esc(item.phone2)}</div>` : ''}
        </div>
      </div>
    `
    : '';

  const infoLines = [
    phoneBlock,
    item.hours ? `<div class="adv-line"><span class="adv-k">Hours:</span> ${esc(item.hours)}</div>` : '',
    item.reservations ? `<div class="adv-line"><span class="adv-k">Reservations:</span> ${esc(item.reservations)}</div>` : '',
    item.time ? `<div class="adv-line"><span class="adv-k">Time:</span> ${esc(item.time)}</div>` : '',
    item.distance ? `<div class="adv-line"><span class="adv-k">Distance:</span> ${esc(item.distance)}</div>` : '',
    item.parking ? `<div class="adv-line"><span class="adv-k">Parking:</span> ${esc(item.parking)}</div>` : '',
    item.fee ? `<div class="adv-line"><span class="adv-k">Fee:</span> ${esc(item.fee)}</div>` : '',
    item.dogs ? `<div class="adv-line"><span class="adv-k">Dogs:</span> ${esc(item.dogs)}</div>` : '',
    item.name ? `<div class="adv-line"><span class="adv-k">Name:</span> ${esc(item.name)}</div>` : '',
    hasAddr1 ? `<div class="adv-line">${esc(item.address1)}</div>` : '',
    hasAddr2 ? `<div class="adv-line">${esc(item.address2)}</div>` : '',
    webText ? `<div class="adv-line"><span class="adv-k">Web:</span> ${esc(webText)}</div>` : '',
  ].filter(Boolean).join('');

  const mapImg = (item.imagemap || '').trim();

  const hasShuttle = (item.shuttleText && item.shuttleUrl && item.shuttleIcon);

  return `
    <article class="card adv-card" data-adv-card>
      <header class="adv-head">
        <div class="adv-title">${esc(item.title || 'Local Adventure')}</div>
        <button class="adv-info-btn" type="button" aria-label="Show details">
          <img src="Assets/Images/Icons/Icon-Info.png" alt="">
        </button>
      </header>

      <div class="adv-divider"></div>

      <div class="adv-body">
        <!-- Info card -->
        <div class="adv-info-card" aria-hidden="true">
          <div class="adv-info-inner">
            <div class="adv-details-top">
              <div class="adv-details-left">
                ${infoLines || '—'}
              </div>

              <div class="adv-details-actions">
                ${telHref ? `
                  <a class="adv-icon-btn" href="${telHref}" aria-label="Call ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Phone.png" alt="Call">
                  </a>
                ` : ''}

                ${dirHref ? `
                  <a class="adv-icon-btn" href="${dirHref}" target="_blank" rel="noopener" aria-label="Directions to ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Map.png" alt="Map">
                  </a>
                ` : ''}

                ${webHref ? `
                  <a class="adv-icon-btn" href="${esc(webHref)}" target="_blank" rel="noopener" aria-label="Website for ${esc(item.title)}">
                    <img src="Assets/Images/Icons/Icon-Web.png" alt="Web">
                  </a>
                ` : ''}
              </div>
            </div>

            <div class="adv-desc">
              ${descHtml}
            </div>
          </div>
        </div>

        <!-- Steelhead shuttle card (ONLY when data present; hidden until expanded by CSS) -->
        ${hasShuttle ? `
          <div class="adv-shuttle-card" aria-hidden="true">
            <div class="adv-shuttle-inner">
              <div class="adv-shuttle-text">${esc(item.shuttleText)}</div>
              <a class="adv-shuttle-btn" href="${esc(item.shuttleUrl)}" target="_blank" rel="noopener" aria-label="Shuttle info">
                <img src="${esc(item.shuttleIcon)}" alt="Shuttle">
              </a>
            </div>
          </div>
        ` : ''}

        <!-- Map card (only shows when expanded by CSS) -->
        ${mapImg ? `
          <div class="adv-map-card" aria-hidden="true" style="background-image:url('${esc(mapImg)}');"></div>
        ` : ''}

        <!-- Main image card with crossfade slideshow -->
        <div class="adv-photo-card" data-slideshow="1" data-images="${imagesJson}" aria-label="${esc(item.title)} photos">
          <div class="adv-photo-layer adv-photo-back"></div>
          <div class="adv-photo-layer adv-photo-front"></div>
        </div>
      </div>
    </article>
  `;
};




ER.wireExpandableAdventureCards = function wireExpandableAdventureCards(container) {
  if (!container) return;

  container.addEventListener('click', (e) => {
    const card = e.target.closest('[data-adv-card]');
    if (!card) return;

    // Don’t toggle if tapping action links or shuttle link
    if (e.target.closest('a.adv-icon-btn, a.adv-shuttle-btn')) return;

    card.classList.toggle('is-open');

    // aria-hidden updates
    const infoCard = card.querySelector('.adv-info-card');
    if (infoCard) infoCard.setAttribute('aria-hidden', card.classList.contains('is-open') ? 'false' : 'true');

    const mapCard = card.querySelector('.adv-map-card');
    if (mapCard) mapCard.setAttribute('aria-hidden', card.classList.contains('is-open') ? 'false' : 'true');

    const shuttleCard = card.querySelector('.adv-shuttle-card');
    if (shuttleCard) shuttleCard.setAttribute('aria-hidden', card.classList.contains('is-open') ? 'false' : 'true');
  });
};




ER.wireAdventureSlideshows = function wireAdventureSlideshows(container) {
  if (!container) return;

  const cards = container.querySelectorAll('.adv-photo-card[data-slideshow="1"]');
  cards.forEach((photoCard) => {
    let images = [];
    try { images = JSON.parse(photoCard.getAttribute('data-images') || '[]'); }
    catch (_) { images = []; }

    if (!images || images.length === 0) return;

    const front = photoCard.querySelector('.adv-photo-front');
    const back  = photoCard.querySelector('.adv-photo-back');
    if (!front || !back) return;

    let idx = 0;
    let nextIdx = images.length > 1 ? 1 : 0;

    front.style.backgroundImage = `url("${images[idx]}")`;
    back.style.backgroundImage  = `url("${images[nextIdx]}")`;
    front.style.opacity = '1';

    if (images.length === 1) return;

    const holdMs = 5000;
    const fadeMs = 1000;

    if (photoCard._slideshowTimer) clearInterval(photoCard._slideshowTimer);

    photoCard._slideshowTimer = setInterval(() => {
      back.style.backgroundImage = `url("${images[nextIdx]}")`;
      front.style.opacity = '0';

      window.setTimeout(() => {
        idx = nextIdx;
        nextIdx = (idx + 1) % images.length;
        front.style.backgroundImage = `url("${images[idx]}")`;
        front.style.opacity = '1';
      }, fadeMs);
    }, holdMs);
  });
};
































})();
