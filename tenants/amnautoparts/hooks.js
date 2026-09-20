/**
 * amnautoparts only.
 *
 * Every stock section reaches for `data.phoneHref` / `data.smsHref` for its
 * contact link -- header, footer, the sticky call-bar -- rather than building
 * a tel:/sms: URL itself. Overriding both here to the WhatsApp link means
 * every one of those sections is correct for a WhatsApp-only business with no
 * per-section changes: this is the one place "contact = WhatsApp" is stated,
 * not restated in four section files.
 *
 * business.phone still holds a normal-looking phone number (schema requires
 * one, and it reads fine as the visible label everywhere); only the *link*
 * changes.
 */
const WHATSAPP = 'https://wa.me/8615003318188';

export default {
  transform({ data }) {
    return { ...data, phoneHref: WHATSAPP, smsHref: WHATSAPP };
  },
};
