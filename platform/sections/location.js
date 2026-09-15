import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 9 -- address, cross-street, hours table, map, service area.
 *
 * The cross-street line is the single most useful sentence on the page for
 * someone who is already driving.
 *
 * The map is an iframe, not a mapping library: no API key, no billing, no
 * quota, and it stays below the fold behind `loading="lazy"`.
 */
export default {
  id: 'location',

  css() {
    return `
  .location { background: var(--wash); border-top: 1px solid var(--line); padding-top: var(--section-pad); padding-bottom: var(--section-pad); }
  .location-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 30px; }
  .location-address { font-size: 18px; font-weight: 700; line-height: 1.4; }
  .location-cross { font-size: 15.5px; color: var(--ink-2); margin-top: 4px; }
  .btn-directions {
    display: inline-flex; align-items: center; gap: 7px; margin-top: 12px;
    background: var(--surface); border: 1.5px solid var(--link); border-radius: var(--radius-md);
    padding: 11px 15px; font-weight: 700; text-decoration: none; font-size: 15.5px;
  }
  .hours-row { display: flex; justify-content: space-between; gap: 16px; padding: 9px 0; border-bottom: 1px solid var(--line-2); font-size: 16px; }
  .hours-row span:first-child { color: var(--ink-2); }
  .hours-row span:last-child { font-weight: 700; }
  .service-area { margin-top: 18px; font-size: 15.5px; color: var(--ink-2); text-wrap: pretty; }
  .service-area b { color: var(--ink); }
  .map-frame { border: 1px solid var(--line); border-radius: var(--radius-lg); overflow: hidden; min-height: 330px; background: var(--surface); }
  .map-frame iframe { width: 100%; height: 100%; min-height: 330px; border: 0; display: block; }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const { business, hours } = config;

    return html`<section id="location" class="location">
  <div class="wrap location-grid">
    <div>
      <h2 style="margin-bottom:16px">${text('locationHeading', 'Hours & directions')}</h2>
      <div class="location-address">${data.address}</div>
      ${business.crossStreet ? html`<div class="location-cross">${business.crossStreet}</div>` : ''}
      ${data.directionsUrl ? html`<a class="btn-directions" href="${data.directionsUrl}">${text('directionsCta', 'Get directions')}</a>` : ''}
      ${hours.rows.length ? html`<div style="margin-top:22px">
        ${hours.rows.map((row) => html`<div class="hours-row"><span>${row.day}</span><span>${row.time}</span></div>`)}
      </div>` : ''}
      ${business.serviceArea ? html`<div class="service-area"><b>${text('serviceAreaLabel', 'Service area:')}</b> ${business.serviceArea}</div>` : ''}
    </div>
    ${data.mapSrc ? html`<div class="map-frame">
      <iframe src="${data.mapSrc}" title="${data.mapTitle}" loading="lazy"></iframe>
    </div>` : ''}
  </div>
</section>`;
  },
};
