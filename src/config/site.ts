/**
 * Company details shown in the footer, contact page and privacy policy.
 *
 * Lujamo is the public brand; the business operates under the proprietor's name.
 */
export const company = {
  name: 'Lujamo',
  legalName: 'Tiia Toikonniemi',
  businessId: '3657332-9',
  city: '', // Add a locality/address when supplied by the owner.
  email: 'tiia.toikonniemi@gmail.com',
  phone: '040 801 0878',
  phoneHref: '+358408010878',
};

/**
 * Generated photographic image of Finnish bedrock, expressing strength and durability.
 * Source and generation prompt: docs/visual-assets.md.
 */
export const heroImage = {
  src: '/images/lujamo-bedrock.webp',
  width: 1200,
  height: 900,
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
