import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 11 -- footer. Phone, address and hours repeated, plus the legal row.
 *
 * The state inspection licence number belongs here. It is a real, checkable
 * credential, and template sites never have one.
 */
export default {
  id: 'footer',

  css() {
    return `
  .site-footer { background: var(--dark); color: var(--on-dark-muted); padding: 34px var(--gutter) 40px; }
  .site-footer-in { max-width: var(--max); margin: 0 auto; }
  .footer-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 26px; }
  .footer-name { font-weight: var(--w-bold); font-size: 18px; color: #fff; }
  .site-footer .eyebrow { color: var(--on-dark-label); letter-spacing: 0.11em; margin-bottom: 6px; }
  .footer-phone { font-weight: var(--w-bold); font-size: 21px; color: #fff; text-decoration: none; }
  .site-footer a { color: var(--on-dark-muted); }
  .footer-line { font-size: 14.5px; }
  .footer-hours { display: flex; justify-content: space-between; gap: 14px; max-width: 225px; font-size: 14.5px; }
  .footer-hours span:last-child { color: #fff; }
  .footer-legal {
    border-top: 1px solid var(--dark-rule); margin-top: 26px; padding-top: 16px;
    font-size: 13px; color: var(--on-dark-legal); display: flex; flex-wrap: wrap; gap: 6px 18px;
  }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const { business, hours } = config;
    const legal = [
      `© ${data.thisYear} ${business.name}`,
      business.licenseLine,
      text('footerCredentials', [
        config.badges.length ? `${config.badges[0]} technicians` : '',
        business.warranty ? `${business.warranty} warranty` : '',
      ].filter(Boolean).join(' · ')),
    ].filter(Boolean);

    return html`<footer class="site-footer">
  <div class="site-footer-in">
    <div class="footer-cols">
      <div>
        <div class="footer-name">${business.name}</div>
        ${data.years ? html`<div class="footer-line" style="margin-top:6px">${data.years} years in ${business.city}</div>` : ''}
        ${config.owner.name ? html`<div class="footer-line">${config.owner.title || 'Owner'}: ${config.owner.name}</div>` : ''}
      </div>
      <div>
        <div class="eyebrow">${text('footerPhoneLabel', 'Phone')}</div>
        <a class="footer-phone" href="${data.phoneHref}">${data.phone}</a>
        ${data.smsHref ? html`<div class="footer-line" style="margin-top:2px"><a href="${data.smsHref}">${text('footerSms', 'or text us')}</a></div>` : ''}
      </div>
      <div>
        <div class="eyebrow">${text('footerAddressLabel', 'Address')}</div>
        <div class="footer-line" style="line-height:1.5">${data.address}</div>
        ${data.directionsUrl ? html`<div class="footer-line" style="margin-top:2px"><a href="${data.directionsUrl}">${text('footerDirections', 'Directions')}</a></div>` : ''}
      </div>
      ${hours.rows.length ? html`<div>
        <div class="eyebrow">${text('footerHoursLabel', 'Hours')}</div>
        ${hours.rows.map((row) => html`<div class="footer-hours"><span>${row.day}</span><span>${row.time}</span></div>`)}
      </div>` : ''}
    </div>
    <div class="footer-legal">
      ${legal.map((item) => html`<span>${item}</span>`)}
    </div>
  </div>
</footer>`;
  },
};
