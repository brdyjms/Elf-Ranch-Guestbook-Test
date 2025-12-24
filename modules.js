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

  // description: treat blank lines as paragraphs
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

  // NOTE:
  // - The card toggles open/closed when you tap the card.
  // - Tapping the action icons should NOT toggle (handled in wireExpandableEateryCards).
  return `
    <article class="card eatery-card" data-eatery-card>
      <header class="eatery-head">
        <div class="eatery-title">${esc(item.title || 'Local Eatery')}</div>
        <button class="eatery-info-btn" type="button" aria-label="Show details">
          <img src="Assets/Images/Icons/Icon-Info.png" alt="">
        </button>
      </header>

      <div class="eatery-divider"></div>

      <div class="eatery-stage">
        <div class="eatery-details" aria-hidden="true">
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

          <div class="eatery-desc">
            ${descHtml}
          </div>
        </div>

        <div class="eatery-photo" role="img" aria-label="${esc(item.title)} photo"
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

    // If user tapped a link (phone/map/web), don't toggle the card
    if (e.target.closest('a.eatery-icon-btn')) return;

    // Otherwise (including info button), toggle
    card.classList.toggle('is-open');

    const details = card.querySelector('.eatery-details');
    if (details) {
      details.setAttribute(
        'aria-hidden',
        card.classList.contains('is-open') ? 'false' : 'true'
      );
    }
  });
};























































})();
