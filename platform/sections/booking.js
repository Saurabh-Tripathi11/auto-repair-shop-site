import { html } from '../core/html.js';
import { copyFor } from '../core/copy.js';

/**
 * Section 10 -- the callback form. Four fields, and an explicit escape hatch
 * telling anyone whose car is not safe to drive to call instead of typing.
 *
 * With no `forms.endpoint` the confirmation is a local swap, which is what the
 * handoff ships. With an endpoint the same two states are preserved: the
 * submission is POSTed in the background and the form is replaced on success,
 * falling back to a normal form post if the request fails.
 */
export default {
  id: 'booking',

  css() {
    return `
  .booking-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 32px; align-items: start; }
  .booking-form { display: flex; flex-direction: column; gap: 13px; }
  .booking-form label { display: flex; flex-direction: column; gap: 5px; font-size: 14px; font-weight: 700; color: var(--label-ink); }
  .booking-form input, .booking-form textarea {
    font-family: inherit; font-size: 16px; background: var(--surface); color: var(--ink);
    border: 1px solid var(--input-border); border-radius: var(--radius-md); padding: 0 13px; min-height: var(--target-input);
  }
  .booking-form textarea { padding: 11px 13px; min-height: 0; resize: vertical; }
  .booking-form input:focus, .booking-form textarea:focus { border-color: var(--link); outline: 2px solid var(--input-focus); }
  .booking-form button {
    font-family: inherit; background: var(--accent); color: var(--on-accent); border: 0; border-radius: var(--radius-md);
    min-height: var(--target-submit); font-weight: var(--w-bold); font-size: 18.5px; cursor: pointer; margin-top: 4px;
  }
  .booking-form button:hover { filter: brightness(1.08); }
  .booking-fine { font-size: 13.5px; color: var(--ink-quiet); }
  .booking-pot { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
  .booking-sent { border: 1px solid var(--success-border); background: var(--success-fill); border-radius: var(--radius-lg); padding: 20px; }
  .booking-sent-title { font-weight: var(--w-bold); font-size: 19px; margin-bottom: 5px; }`;
  },

  render({ config, data }) {
    const text = copyFor(config);
    const { forms } = config;
    const fields = config.forms.fields || DEFAULT_FIELDS;

    return html`<section id="book" class="wrap sec">
  <div class="booking-grid">
    <div>
      <h2 style="margin-bottom:8px">${text('bookingHeading', 'Request an appointment')}</h2>
      <p class="lede" style="margin:0 0 14px">${text('bookingLede', "Four things and we'll call you back, usually within the hour during shop hours.")}</p>
      <p class="lede" style="margin:0">${text('bookingEscape', "If the car isn't safe to drive, don't fill this out — call")} <a href="${data.phoneHref}" style="font-weight:700">${data.phone}</a> ${text('bookingEscapeTail', "and we'll talk you through it. We can arrange a tow.")}</p>
    </div>
    <div>
      <form class="booking-form" id="bookform" method="${forms.method || 'post'}" action="${forms.endpoint || '#'}">
        ${fields.map((field) => html`<label>${field.label}
          ${field.type === 'textarea'
            ? html`<textarea name="${field.name}" rows="${field.rows || 3}" placeholder="${field.placeholder || ''}"${field.required ? html` required` : ''}></textarea>`
            : html`<input name="${field.name}" type="${field.type || 'text'}" placeholder="${field.placeholder || ''}"${field.autocomplete ? html` autocomplete="${field.autocomplete}"` : ''}${field.required ? html` required` : ''}>`}
        </label>`)}
        ${forms.honeypot ? html`<div class="booking-pot" aria-hidden="true">
          <label>Company<input name="${forms.honeypot}" tabindex="-1" autocomplete="off"></label>
        </div>` : ''}
        <button type="submit">${text('bookingSubmit', 'Send request')}</button>
        <div class="booking-fine">${text('bookingPrivacy', "We use your number to call about this repair. That's it.")}</div>
      </form>
      <div class="booking-sent" id="booksent" hidden>
        <div class="booking-sent-title">${text('bookingSentTitle', "Thanks — we've got it.")}</div>
        <div style="color:var(--ink-2)">${text('bookingSentBody', "We'll call you during shop hours. If you'd rather not wait, call")} ${data.phone}.</div>
      </div>
    </div>
  </div>
</section>`;
  },

  script({ config }) {
    const endpoint = config.forms.endpoint;

    if (!endpoint) {
      return `  // No endpoint configured: confirm locally. Set forms.endpoint to POST for real.
  document.getElementById('bookform').addEventListener('submit', function (e) {
    e.preventDefault();
    this.hidden = true;
    document.getElementById('booksent').hidden = false;
  });`;
    }

    return `  // POST in the background, keep the two-state behaviour, fall back to a
  // normal form post if the request fails so a submission is never lost.
  document.getElementById('bookform').addEventListener('submit', function (e) {
    var form = this;
    e.preventDefault();
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.hidden = true;
        document.getElementById('booksent').hidden = false;
      })
      .catch(function () { form.submit(); });
  });`;
  },
};

const DEFAULT_FIELDS = [
  { name: 'name', label: 'Name', required: true, autocomplete: 'name' },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, autocomplete: 'tel' },
  { name: 'vehicle', label: 'Vehicle', placeholder: '2015 Honda Civic, 118k miles' },
  { name: 'problem', label: "What's it doing?", type: 'textarea', rows: 3, placeholder: 'Grinding noise from the front when I brake' },
];

export { DEFAULT_FIELDS };
