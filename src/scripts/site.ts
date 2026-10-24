/*
 * Site-wide progressive enhancements. Everything here is optional:
 * without JS the nav is always visible, and nothing else is required.
 */

const LANG_KEY = 'lujamo-lang';
const HINT_KEY = 'lujamo-lang-hint-dismissed';

function store(kind: 'local' | 'session') {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/* Mobile menu */
const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-button]');
const nav = document.querySelector<HTMLElement>('[data-nav]');
if (menuButton && nav) {
  const setOpen = (open: boolean) => {
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  menuButton.addEventListener('click', () => setOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      menuButton.focus();
    }
  });
  window.matchMedia('(min-width: 52.01em)').addEventListener('change', (e) => e.matches && setOpen(false));
}

/* Header gains a soft shadow once the page has scrolled */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* Remember an explicit language choice */
document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]').forEach((link) => {
  link.addEventListener('click', () => store('local')?.setItem(LANG_KEY, link.dataset.langLink ?? ''));
});

/* Language hint: show at most one, never redirect */
const hint = document.querySelector<HTMLElement>('[data-lang-hint]');
if (hint && !store('local')?.getItem(HINT_KEY)) {
  const current = document.body.dataset.lang;
  const saved = store('local')?.getItem(LANG_KEY);
  const browser = (navigator.languages ?? [navigator.language]).map((l) => l.slice(0, 2).toLowerCase());
  // A saved choice wins; otherwise only hint if the browser's first language is not the page language
  const wanted = saved || (browser[0] !== current ? browser[0] : null);
  const line = wanted && wanted !== current ? hint.querySelector<HTMLElement>(`[data-hint-for="${wanted}"]`) : null;
  if (line) {
    line.hidden = false;
    hint.hidden = false;
    hint.querySelector('[data-hint-dismiss]')?.addEventListener('click', () => {
      hint.hidden = true;
      store('local')?.setItem(HINT_KEY, '1');
    });
  }
}
