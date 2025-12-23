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

})();
