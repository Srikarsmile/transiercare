import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../script.js', import.meta.url), 'utf8');

function renderSite({ width = 1024, reducedMotion = false } = {}) {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: 'https://transiercare.test/'
  });

  Object.defineProperty(dom.window, 'innerWidth', {
    configurable: true,
    value: width
  });
  dom.window.matchMedia = query => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {}
  });
  dom.window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
  };
  dom.window.requestAnimationFrame = callback => {
    callback();
    return 1;
  };
  dom.scrollCalls = [];
  dom.window.scrollTo = options => dom.scrollCalls.push(options);
  dom.window.eval(script);

  return dom;
}

test('keyboard users can skip directly to the main content', () => {
  const dom = renderSite();
  const skipLink = dom.window.document.querySelector('.skip-link');
  const main = dom.window.document.querySelector('main#main-content');

  assert.ok(skipLink, 'expected a visible-on-focus skip link');
  assert.equal(skipLink.getAttribute('href'), '#main-content');
  assert.ok(main, 'expected the primary content to use a main landmark');

  skipLink.click();
  assert.equal(dom.window.document.activeElement, main);
});

test('mobile navigation announces state and closes with Escape', () => {
  const dom = renderSite({ width: 390 });
  const { document } = dom.window;
  const toggle = document.querySelector('#navToggle');
  const menu = document.querySelector('#navLinks');

  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(toggle.getAttribute('aria-controls'), 'navLinks');
  assert.ok(menu.hasAttribute('inert'));
  assert.equal(menu.getAttribute('aria-hidden'), 'true');

  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.ok(menu.classList.contains('active'));
  assert.ok(!menu.hasAttribute('inert'));
  assert.equal(menu.getAttribute('aria-hidden'), 'false');
  assert.equal(document.activeElement, menu.querySelector('a'));

  const lastLink = menu.querySelector('li:last-child a');
  lastLink.focus();
  document.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true
  }));
  assert.equal(document.activeElement, toggle);

  document.dispatchEvent(new dom.window.KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true
  }));
  assert.equal(document.activeElement, menu.querySelector('a'));

  document.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.ok(!menu.classList.contains('active'));
  assert.ok(menu.hasAttribute('inert'));
  assert.equal(menu.getAttribute('aria-hidden'), 'true');
  assert.equal(document.activeElement, toggle);
});

test('mobile menu closure keeps keyboard focus in a useful place', () => {
  const dom = renderSite({ width: 390 });
  const { document } = dom.window;
  const toggle = document.querySelector('#navToggle');
  const firstLink = document.querySelector('#navLinks a[href="#about"]');
  const overlay = document.querySelector('.nav-overlay');

  toggle.click();
  overlay.click();
  assert.equal(document.activeElement, toggle);

  toggle.click();
  firstLink.click();
  assert.equal(document.activeElement, document.querySelector('#about'));
});

test('callback form exposes useful autofill fields and privacy context', () => {
  const dom = renderSite();
  const { document } = dom.window;
  const fields = {
    name: 'name',
    phone: 'tel',
    email: 'email'
  };

  for (const [id, expected] of Object.entries(fields)) {
    const input = document.getElementById(id);
    assert.equal(input.getAttribute('autocomplete'), expected);
    assert.ok(document.querySelector(`label[for="${id}"]`));
  }

  const submit = document.querySelector('#contactForm button[type="submit"]');
  assert.equal(submit.getAttribute('aria-describedby'), 'formPrivacy');
  const privacy = document.querySelector('#formPrivacy');
  assert.match(privacy.textContent, /FormSubmit/i);
  assert.match(privacy.textContent, /avoid sharing medical/i);
  assert.ok(privacy.querySelector('a[href^="mailto:"]'));
});

test('valid form submission is left to the configured Formsubmit POST', () => {
  const dom = renderSite();
  const form = dom.window.document.querySelector('#contactForm');
  const submitEvent = new dom.window.Event('submit', {
    bubbles: true,
    cancelable: true
  });

  form.dispatchEvent(submitEvent);

  assert.equal(submitEvent.defaultPrevented, false);
  assert.equal(form.method, 'post');
  assert.match(form.action, /^https:\/\/formsubmit\.co\//);
  dom.window.close();
});

test('reduced-motion visitors get instant scrolling and no hero parallax', () => {
  const dom = renderSite({ reducedMotion: true });
  const { document } = dom.window;
  const servicesLink = document.querySelector('a[href="#services"]');
  const heroImage = document.querySelector('.hero-bg img');

  servicesLink.click();
  assert.equal(dom.scrollCalls.at(-1).behavior, 'auto');

  Object.defineProperty(dom.window, 'scrollY', { configurable: true, value: 200 });
  dom.window.dispatchEvent(new dom.window.Event('scroll'));
  assert.equal(heroImage.style.transform, '');
});

test('mobile visitors always have direct call and callback actions', () => {
  const dom = renderSite();
  const bar = dom.window.document.querySelector('.mobile-contact-bar');

  assert.ok(bar, 'expected a persistent mobile contact bar');
  assert.ok(bar.querySelector('a[href^="tel:"]'));
  assert.ok(bar.querySelector('a[href="#contact"]'));
});

test('rendered icons resolve to decorative symbols', () => {
  const dom = renderSite();
  const { document } = dom.window;
  const icons = [...document.querySelectorAll('svg:not(.icon-sprite)')];

  assert.ok(icons.length > 0, 'expected the shared icon system to render icons');

  for (const icon of icons) {
    const uses = icon.querySelectorAll('use');
    const use = uses[0];
    const symbolId = use?.getAttribute('href');

    assert.ok(icon.classList.contains('site-icon'));
    assert.equal(icon.getAttribute('aria-hidden'), 'true');
    assert.equal(uses.length, 1);
    assert.ok(symbolId?.startsWith('#icon-'));
    assert.ok(document.querySelector(symbolId), `expected ${symbolId} to resolve`);
  }
});
