// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile Navigation =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// ===== Scroll Reveal Animation =====
const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

const revealOnScroll = () => {
  const triggerPoint = window.innerHeight * 0.85;

  scrollRevealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < triggerPoint) {
      el.classList.add('visible');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== Counter Animation =====
const counters = document.querySelectorAll('.stat-number');
let countersStarted = false;

const animateCounters = () => {
  if (countersStarted) return;

  const statsSection = document.querySelector('.hero-stats');
  if (!statsSection) return;

  const sectionTop = statsSection.getBoundingClientRect().top;
  if (sectionTop > window.innerHeight) return;

  countersStarted = true;

  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
  });
};

window.addEventListener('scroll', animateCounters);
window.addEventListener('load', animateCounters);

// ===== Contact Form =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Simulate form submission
  setTimeout(() => {
    btn.textContent = 'Message Sent!';
    btn.style.background = '#10b981';
    contactForm.reset();

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1500);
});

// ===== Smooth Active Nav Link Highlight =====
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);

    if (link) {
      if (scrollPos >= top && scrollPos < top + height) {
        link.classList.add('active-link');
      } else {
        link.classList.remove('active-link');
      }
    }
  });
});
