// ==========================================================
// JobPilot Africa — Landing Page Interactivity
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.querySelector('.site-header');

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
        { threshold: 0.2 }
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

  // ---- Categories + Live Opportunities data now live in jobs-data.js
  // (window.JOBPILOT_CATEGORIES / window.JOBPILOT_JOBS) so the homepage
  // preview and the jobs.html search page share one source of truth. ----
  const categories = window.JOBPILOT_CATEGORIES || [];

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

  // ---- Live Opportunities preview (homepage shows a sample; the full,
  // searchable list lives on jobs.html) ----
  const opportunities = window.JOBPILOT_JOBS || [];

  const oppGrid = document.getElementById('opportunityGrid');
  if (oppGrid) {
    const frag = document.createDocumentFragment();
    opportunities.forEach((job, idx) => {
      const card = document.createElement('div');
      card.className = 'opportunity-card';
      card.style.animationDelay = `${Math.min(idx * 0.08, 0.5)}s`;
      card.innerHTML = `
        <div class="opportunity-main">
          <span class="opportunity-title">${job.title}</span>
          <span class="opportunity-meta">
            <span>${job.company}</span>
            <span class="dot-sep">${job.location}</span>
            <span class="dot-sep opportunity-salary">${job.salary}</span>
          </span>
        </div>
        <span class="opportunity-category">${job.category}</span>
      `;
      frag.appendChild(card);
    });
    oppGrid.appendChild(frag);
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

  // ---- Scroll-driven effects: header shadow, top progress bar, and hero
  // parallax. One rAF-throttled scroll listener drives all of these so
  // we're not doing redundant layout reads per event. ----
  const scrollProgressEl = document.getElementById('scrollProgress');
  const heroBlobsEl = document.getElementById('heroBlobs');
  const heroTopEl = document.querySelector('.hero-top');

  const clamp01 = (n) => Math.min(1, Math.max(0, n));

  let ticking = false;
  const updateScrollEffects = () => {
    ticking = false;
    const scrollY = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle('scrolled', scrollY > 8);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const docProgress = docHeight > 0 ? clamp01(scrollY / docHeight) : 0;

    if (scrollProgressEl) {
      scrollProgressEl.style.setProperty('--scroll-pct', `${(docProgress * 100).toFixed(2)}%`);
    }

    if (prefersReducedMotion) return; // everything below this line is motion

    // Hero parallax — progress through just the hero-top element's own
    // height (independent of total page length).
    if (heroBlobsEl && heroTopEl) {
      const rect = heroTopEl.getBoundingClientRect();
      const heroProgress = rect.height > 0 ? clamp01(-rect.top / rect.height) : 0;
      heroBlobsEl.style.setProperty('--hero-scroll', heroProgress.toFixed(3));
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollEffects);
    }
  };
  const onResize = () => {
    onScroll();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  updateScrollEffects(); // set initial state without waiting for the first scroll

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

  // ---- Safety net ----
  // Whatever the cause on a given device — an observer whose threshold
  // never quite gets crossed, an odd viewport-height quirk on a phone
  // browser, anything — content should never stay invisible forever.
  // Force everything to its finished state a few seconds after load.
  window.setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
    const grid = document.getElementById('categoryGrid');
    if (grid) grid.classList.add('is-visible');
    const oppGrid = document.getElementById('opportunityGrid');
    if (oppGrid) oppGrid.classList.add('is-visible');
    const pcb = document.querySelector('.phone-card-body');
    if (pcb) pcb.classList.add('chat-animate');
  }, 4000);

});
