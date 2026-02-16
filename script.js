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

// Create overlay element for mobile menu
const navOverlay = document.createElement('div');
navOverlay.className = 'nav-overlay';
document.body.appendChild(navOverlay);

function toggleMobileNav() {
  const isActive = navLinks.classList.toggle('active');
  navToggle.classList.toggle('active');
  navOverlay.classList.toggle('active', isActive);
  document.body.style.overflow = isActive ? 'hidden' : '';
}

function closeMobileNav() {
  navLinks.classList.remove('active');
  navToggle.classList.remove('active');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', toggleMobileNav);
navOverlay.addEventListener('click', closeMobileNav);

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
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
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
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

if (heroBg) {
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

// ===== Counter Animation =====
const counters = document.querySelectorAll('.ribbon-num');
let countersAnimated = false;

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersAnimated) {
      countersAnimated = true;
      animateCounters();
      counterObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const ribbon = document.querySelector('.ribbon');
if (ribbon) counterObserver.observe(ribbon);

function animateCounters() {
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out-expo curve
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      counter.textContent = Math.floor(eased * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = target;
      }
    }
    requestAnimationFrame(update);
  });
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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const originalHTML = btn.innerHTML;

  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.6s linear infinite">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
    Sending...
  `;
  btn.disabled = true;
  btn.style.opacity = '0.7';
  btn.style.transform = 'scale(0.98)';

  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  setTimeout(() => {
    btn.style.transform = '';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      Request Sent!
    `;
    btn.style.background = '#16a34a';
    btn.style.opacity = '1';
    form.reset();

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = '';
      btn.disabled = false;
      style.remove();
    }, 3000);
  }, 1500);
});
