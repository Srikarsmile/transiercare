// ===== Navbar Scroll =====
const navbar = document.getElementById('navbar');
let lastScrollY = 0;
let ticking = false;

function updateNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  ticking = false;
}

window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(updateNavbar);
    ticking = true;
  }
}, { passive: true });

// ===== Mobile Nav with overlay =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const mobileMenuBreakpoint = 768;
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

// Create overlay element for mobile menu
const navOverlay = document.createElement('div');
navOverlay.className = 'nav-overlay';
document.body.appendChild(navOverlay);

function syncMobileMenuAccessibility(isActive = navLinks.classList.contains('active')) {
  if (window.innerWidth > mobileMenuBreakpoint) {
    navLinks.removeAttribute('inert');
    navLinks.removeAttribute('aria-hidden');
    return;
  }

  navLinks.setAttribute('aria-hidden', String(!isActive));
  if (isActive) navLinks.removeAttribute('inert');
  else navLinks.setAttribute('inert', '');
}

function toggleMobileNav() {
  const isActive = navLinks.classList.toggle('active');
  navToggle.classList.toggle('active', isActive);
  navToggle.setAttribute('aria-expanded', String(isActive));
  navToggle.setAttribute('aria-label', isActive ? 'Close navigation menu' : 'Open navigation menu');
  navOverlay.classList.toggle('active', isActive);
  document.body.style.overflow = isActive ? 'hidden' : '';
  syncMobileMenuAccessibility(isActive);
  if (isActive) {
    requestAnimationFrame(() => navLinks.querySelector('a')?.focus({ preventScroll: true }));
  }
}

function closeMobileNav({ restoreFocus = false } = {}) {
  const wasActive = navLinks.classList.contains('active');
  navLinks.classList.remove('active');
  navToggle.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open navigation menu');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
  syncMobileMenuAccessibility(false);
  if (restoreFocus && wasActive) navToggle.focus();
}

syncMobileMenuAccessibility(false);

navToggle.addEventListener('click', toggleMobileNav);
navOverlay.addEventListener('click', () => closeMobileNav({ restoreFocus: true }));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileNav({ restoreFocus: true });

  if (event.key === 'Tab' && navLinks.classList.contains('active')) {
    const menuLinks = [...navLinks.querySelectorAll('a[href]')];
    const firstLink = menuLinks[0];
    const lastLink = menuLinks.at(-1);
    const activeElement = document.activeElement;

    if (!event.shiftKey && activeElement === lastLink) {
      event.preventDefault();
      navToggle.focus();
    } else if (!event.shiftKey && activeElement === navToggle) {
      event.preventDefault();
      firstLink.focus();
    } else if (event.shiftKey && activeElement === firstLink) {
      event.preventDefault();
      navToggle.focus();
    } else if (event.shiftKey && activeElement === navToggle) {
      event.preventDefault();
      lastLink.focus();
    }
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > mobileMenuBreakpoint) closeMobileNav();
  else syncMobileMenuAccessibility(navLinks.classList.contains('active'));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    const isPageAnchor = link.getAttribute('href')?.startsWith('#');
    closeMobileNav({ restoreFocus: !isPageAnchor });
  });
});

// ===== Smooth Scroll with easing =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    closeMobileNav();
    const navHeight = navbar.offsetHeight;
    const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top: targetPos, behavior: reducedMotionQuery.matches ? 'auto' : 'smooth' });
    if (anchor.classList.contains('skip-link') || anchor.closest('#navLinks')) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
});

// ===== Scroll Reveal with stagger =====
const scrollElements = document.querySelectorAll('.scroll-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

scrollElements.forEach(el => observer.observe(el));

// ===== Subtle parallax on hero background =====
const heroBg = document.querySelector('.hero-bg img');
let heroTicking = false;

if (heroBg && !reducedMotionQuery.matches) {
  window.addEventListener('scroll', () => {
    if (!heroTicking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const heroHeight = window.innerHeight;
        if (scrolled < heroHeight) {
          const parallax = scrolled * 0.15;
          heroBg.style.transform = `scale(1.05) translateY(${parallax}px)`;
        }
        heroTicking = false;
      });
      heroTicking = true;
    }
  }, { passive: true });
}
// ===== Form Handling =====
const form = document.getElementById('contactForm');

// Smooth focus labels
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('focus', () => {
    field.closest('.form-field').querySelector('label').style.color = 'var(--accent-dark)';
  });
  field.addEventListener('blur', () => {
    field.closest('.form-field').querySelector('label').style.color = '';
  });
});
