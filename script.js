// ==========================================================
// JobPilot Africa — Landing Page Interactivity
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Header shadow on scroll ----
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeaderShadow = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  }

  // ---- Hero chat mockup: play the message-by-message sequence when it
  // scrolls into view, instead of on a fixed page-load timer ----
  const phoneCardBody = document.querySelector('.phone-card-body');
  if (phoneCardBody) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      phoneCardBody.classList.add('chat-animate');
    } else {
      const chatObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              phoneCardBody.classList.add('chat-animate');
              chatObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      chatObserver.observe(phoneCardBody);
    }
  }

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav when a link is tapped
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Categories data (16 categories / 81 roles) ----
  const categories = [
    { name: 'Technology', count: 8 },
    { name: 'Healthcare', count: 6 },
    { name: 'Finance', count: 5 },
    { name: 'Customer Service', count: 4 },
    { name: 'Education', count: 4 },
    { name: 'Engineering', count: 4 },
    { name: 'Remote Jobs', count: 6 },
    { name: 'Sales & Marketing', count: 6 },
    { name: 'Agriculture & Agribusiness', count: 5 },
    { name: 'Skilled Trades / Artisans', count: 7 },
    { name: 'Logistics & Supply Chain', count: 5 },
    { name: 'Hospitality & Tourism', count: 5 },
    { name: 'Human Resources', count: 4 },
    { name: 'Media, Content & Entertainment', count: 5 },
    { name: 'Security Services', count: 3 },
    { name: 'Manufacturing & Production', count: 4 },
  ];

  const grid = document.getElementById('categoryGrid');
  if (grid) {
    const frag = document.createDocumentFragment();
    categories.forEach((cat, idx) => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.style.animationDelay = `${Math.min(idx * 0.04, 0.5)}s`;
      card.innerHTML = `
        <span class="cat-name">${cat.name}</span>
        <span class="cat-count">${cat.count} role${cat.count === 1 ? '' : 's'}</span>
      `;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Animated stat counters ----
  const statEls = document.querySelectorAll('.stat-num');
  if (statEls.length) {
    const formatStat = (value, el) => {
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const num = el.dataset.comma ? value.toLocaleString('en-US') : value;
      return `${prefix}${num}${suffix}`;
    };

    const animateStat = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (!target || prefersReducedMotion) {
        el.textContent = formatStat(target, el);
        return;
      }
      const duration = 1300;
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(target * ease(progress));
        el.textContent = formatStat(value, el);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const statsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              statEls.forEach(animateStat);
              statsObserver.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      const statsStrip = document.querySelector('.stats-strip');
      if (statsStrip) statsObserver.observe(statsStrip);
    }
  }

  // ---- Journey scene: respect reduced motion for the SMIL-driven plane ----
  // CSS can't pause SMIL (animateMotion/animate), so under reduced motion we
  // remove those nodes entirely and park the plane at the destination badge.
  const journeyPlane = document.querySelector('.journey-plane');
  if (journeyPlane && prefersReducedMotion) {
    journeyPlane.querySelectorAll('animateMotion, animate').forEach((node) => node.remove());
    journeyPlane.setAttribute('transform', 'translate(860,72) rotate(12)');
  }

  // ---- Subtle mouse-parallax tilt on the hero phone mockup (desktop only) ----
  const heroVisual = document.getElementById('heroVisual');
  const phoneCard = document.getElementById('phoneCard');
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (heroVisual && phoneCard && supportsHover && !prefersReducedMotion) {
    const maxTilt = 8; // degrees

    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      phoneCard.style.transform = `rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt * 2}deg)`;
    });

    heroVisual.addEventListener('mouseleave', () => {
      phoneCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

});
