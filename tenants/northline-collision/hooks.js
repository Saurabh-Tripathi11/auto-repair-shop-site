import { html } from '../../platform/core/html.js';

/**
 * Per-tenant hooks. Everything here applies to this tenant only, and none of it
 * required a change to the platform.
 *
 *   transform(ctx) -> data     add or adjust derived values
 *   head(ctx)      -> html     extra <head> tags
 *   styles(ctx)    -> css      appended after every section's CSS
 *   scripts(ctx)   -> js       appended to the page's single inline script
 */
export default {
  /** Northline quotes a response window rather than "within the hour". */
  transform({ data }) {
    return { ...data, callbackWindow: 'the same morning' };
  },

  head({ config }) {
    const domain = config.extra?.analytics?.plausibleDomain;
    if (!domain) return '';
    return html`<link rel="preconnect" href="https://plausible.io">
<script defer data-domain="${domain}" src="https://plausible.io/js/script.outbound-links.js"></script>`;
  },

  scripts({ config }) {
    if (!config.extra?.analytics?.plausibleDomain) return '';
    return `  // Attribute calls without slowing the page down: one delegated listener,
  // no tracking number, no redirect through a third party.
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (link && window.plausible) window.plausible('Call', { props: { from: link.dataset.place || 'page' } });
  });`;
  },
};
