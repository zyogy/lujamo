/**
 * Company details shown in the footer, contact page and privacy policy.
 *
 * TODO (owner): every value marked PLACEHOLDER must be confirmed before launch.
 * Placeholders use the reserved .example domain and zeroed IDs on purpose so
 * they can never be mistaken for real details.
 */
export const company = {
  name: 'Lujamo',
  legalName: 'Lujamo', // PLACEHOLDER – official registered name (Oy / Tmi / …)?
  businessId: '0000000-0', // PLACEHOLDER – Y-tunnus
  city: 'Suomi', // PLACEHOLDER – city / postal address
  email: 'info@lujamo.example', // PLACEHOLDER – shared contact address
  phone: '', // PLACEHOLDER – leave empty to hide
};

/**
 * Front page hero image. The default is a drawn illustration
 * (scripts/make-hero-art.mjs). To use a photo: put it in public/images/,
 * e.g. hero.jpg (about 1600×1200, under 250 KB), and point `src` at it.
 */
export const heroImage = {
  src: '/images/lujamo-hero.svg',
  width: 800,
  height: 600,
};

/**
 * Contact form backend (Phase A: Web3Forms, https://web3forms.com).
 * The access key is designed to be public (it only allows sending to the
 * owner's verified address). Leave the placeholder to keep the form in
 * "not configured" mode – it then points visitors to the email address.
 */
export const form = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: 'WEB3FORMS_ACCESS_KEY', // PLACEHOLDER
};

export const formConfigured = !form.accessKey.startsWith('WEB3FORMS');
