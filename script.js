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

  // ---- Live Opportunities data ----
  // PLACEHOLDER — swap these for real current listings from the JobPilot
  // database (title, company, category, location). Do not leave placeholder
  // entries live on the deployed site.
  const opportunities = [
    { title: 'Retail Sales Associate', company: 'TBD', category: 'Sales & Marketing', location: 'Lagos' },
    { title: 'Frontend Developer', company: 'TBD', category: 'Technology', location: 'Remote' },
    { title: 'Registered Nurse', company: 'TBD', category: 'Healthcare', location: 'Abuja' },
    { title: 'Logistics Coordinator', company: 'TBD', category: 'Logistics & Supply Chain', location: 'Port Harcourt' },
  ];

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

  // ---- Scroll-driven effects: header shadow, top progress bar, hero
  // parallax, and the flight-path plane. One rAF-throttled scroll listener
  // drives all of these so we're not doing redundant layout reads per
  // event. ----
  const scrollProgressEl = document.getElementById('scrollProgress');
  const heroBlobsEl = document.getElementById('heroBlobs');
  const heroTopEl = document.querySelector('.hero-top');
  const flightPlaneEl = document.getElementById('flightPlane');
  const flightGuideEl = document.getElementById('flightGuide');
  const flightTrailEl = document.getElementById('flightTrail');

  const clamp01 = (n) => Math.min(1, Math.max(0, n));

  // ---- Flight path: two hand-authored curved routes (desktop / mobile),
  // each in a 0–100 viewBox stretched non-uniformly to fill the viewport
  // (preserveAspectRatio="none" — same trick the hero parallax etc. rely
  // on). The plane's *position* along a route is driven by scroll, but the
  // mapping from "how far scrolled" to "how far along the path" is not
  // linear: it's remapped so the path's two tighter, tangled zigzag zones
  // (FLIGHT_LOOPS) line up with wherever the Live Opportunities and
  // Categories card grids actually land on the page — computed fresh from
  // real element positions, not hardcoded pixels, so it adapts to any
  // screen size or content reflow. -->
  const FLIGHT_PATHS = {
    desktop: 'M52.00,4.00 C54.22,4.67 72.89,8.67 72.00,10.00 C71.11,11.33 44.44,14.67 44.00,16.00 C43.56,17.33 68.89,20.67 68.00,22.00 C67.11,23.33 37.33,26.78 36.00,28.00 C34.67,29.22 51.78,32.11 56.00,33.00 C60.22,33.89 74.44,35.33 74.00,36.00 C73.56,36.67 52.67,38.33 52.00,39.00 C51.33,39.67 70.44,41.00 68.00,42.00 C65.56,43.00 31.56,46.67 30.00,48.00 C28.44,49.33 53.78,52.67 54.00,54.00 C54.22,55.33 31.78,59.00 32.00,60.00 C32.22,61.00 51.56,62.33 56.00,63.00 C60.44,63.67 72.89,65.44 72.00,66.00 C71.11,66.56 48.67,67.11 48.00,68.00 C47.33,68.89 67.56,72.67 66.00,74.00 C64.44,75.33 35.56,78.67 34.00,80.00 C32.44,81.33 50.22,84.22 52.00,86.00 C53.78,87.78 50.22,94.89 50.00,96.00',
    mobile: 'M56.00,5.00 C58.00,5.89 76.67,11.33 74.00,13.00 C71.33,14.67 33.33,18.33 32.00,20.00 C30.67,21.67 61.33,26.44 62.00,28.00 C62.67,29.56 37.78,32.89 38.00,34.00 C38.22,35.11 63.56,37.00 64.00,38.00 C64.44,39.00 41.78,41.67 42.00,43.00 C42.22,44.33 66.89,48.33 66.00,50.00 C65.11,51.67 34.44,56.22 34.00,58.00 C33.56,59.78 61.78,64.00 62.00,66.00 C62.22,68.00 36.89,73.78 36.00,76.00 C35.11,78.22 52.44,83.78 54.00,86.00 C55.56,88.22 50.44,94.89 50.00,96.00',
  };
  // Path-length fractions (0–1) where each route's tighter "weave around
  // the cards" zigzag actually happens — chosen when the routes above were
  // authored. Mobile keeps only one simplified loop.
  const FLIGHT_LOOPS = {
    desktop: { opportunities: [0.28, 0.44], categories: [0.61, 0.78] },
    mobile: { opportunities: [0.33, 0.5], categories: null },
  };

  let flightPathLength = 0;
  let flightRemapPairs = [[0, 0], [1, 1]];
  let flightEndY = 0;
  const isMobileFlight = () => window.innerWidth < 640;

  const applyFlightPath = () => {
    if (!flightGuideEl || !flightTrailEl) return;
    const d = FLIGHT_PATHS[isMobileFlight() ? 'mobile' : 'desktop'];
    if (flightGuideEl.getAttribute('d') !== d) {
      flightGuideEl.setAttribute('d', d);
      flightTrailEl.setAttribute('d', d);
    }
    flightPathLength = flightGuideEl.getTotalLength();
  };

  // Builds the piecewise scroll-progress → path-length-fraction control
  // points, keeping them sorted and strictly increasing so the remap below
  // is always well-behaved even if a section is missing or unusually short.
  const buildFlightRemap = (loops, oppRange, catRange) => {
    const pairs = [[0, 0], [1, 1]];
    if (loops.opportunities && oppRange) {
      pairs.push([oppRange[0], loops.opportunities[0]], [oppRange[1], loops.opportunities[1]]);
    }
    if (loops.categories && catRange) {
      pairs.push([catRange[0], loops.categories[0]], [catRange[1], loops.categories[1]]);
    }
    pairs.sort((a, b) => a[0] - b[0]);
    const cleaned = [];
    pairs.forEach((pr) => {
      const prev = cleaned[cleaned.length - 1];
      if (prev && (pr[0] <= prev[0] || pr[1] <= prev[1])) return; // keep strictly increasing
      cleaned.push(pr);
    });
    if (cleaned[cleaned.length - 1][0] < 1) cleaned.push([1, 1]);
    return cleaned;
  };

  const remap = (x, pairs) => {
    if (x <= pairs[0][0]) return pairs[0][1];
    for (let i = 1; i < pairs.length; i += 1) {
      if (x <= pairs[i][0]) {
        const [x0, y0] = pairs[i - 1];
        const [x1, y1] = pairs[i];
        const t = x1 > x0 ? (x - x0) / (x1 - x0) : 0;
        return y0 + (y1 - y0) * t;
      }
    }
    return pairs[pairs.length - 1][1];
  };

  // Anchors the whole journey to real elements: starts at the top of the
  // page, ends when the final "Get Started on Telegram" button is centered
  // in the viewport, and bends the middle of the route around wherever the
  // Live Opportunities / Categories sections actually fall — so it holds up
  // at any screen size or if section content (e.g. real job listings) makes
  // a section taller or shorter later.
  const computeFlightAnchors = () => {
    const ctaBtn = document.querySelector('.final-cta .btn-primary');
    if (!ctaBtn) { flightEndY = 0; return; }
    const pageTop = (el) => el.getBoundingClientRect().top + window.scrollY;

    flightEndY = Math.max(1, pageTop(ctaBtn) - window.innerHeight / 2);

    const loops = FLIGHT_LOOPS[isMobileFlight() ? 'mobile' : 'desktop'];
    const oppSection = document.getElementById('opportunities');
    const catSection = document.getElementById('categories');

    const rangeFor = (el) => {
      if (!el) return null;
      const start = clamp01(pageTop(el) / flightEndY);
      const end = clamp01((pageTop(el) + el.offsetHeight) / flightEndY);
      return [start, end];
    };

    flightRemapPairs = buildFlightRemap(loops, rangeFor(oppSection), rangeFor(catSection));
  };

  if (!prefersReducedMotion) {
    applyFlightPath();
    computeFlightAnchors();
  }

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

    // Flight path — plane position/rotation come from sampling a point
    // along the route, remapped through the section-aware pairs above.
    if (flightGuideEl && flightPlaneEl && flightPathLength && flightEndY) {
      const rawProgress = clamp01(scrollY / flightEndY);
      const pathFrac = remap(rawProgress, flightRemapPairs);
      const lenAt = pathFrac * flightPathLength;

      const here = flightGuideEl.getPointAtLength(lenAt);
      const ahead = flightGuideEl.getPointAtLength(Math.min(flightPathLength, lenAt + 1));
      // The path lives in a 0–100 viewBox stretched non-uniformly
      // (preserveAspectRatio="none") to fill the viewport, so convert to
      // real pixels before computing an angle — otherwise the bank angle
      // reads wrong on tall narrow phone screens vs wide desktop ones.
      const px = (pt) => (pt.x / 100) * window.innerWidth;
      const py = (pt) => (pt.y / 100) * window.innerHeight;
      const angle = Math.atan2(py(ahead) - py(here), px(ahead) - px(here)) * (180 / Math.PI);

      flightPlaneEl.style.setProperty('--plane-x', `${px(here)}px`);
      flightPlaneEl.style.setProperty('--plane-y', `${py(here)}px`);
      flightPlaneEl.style.setProperty('--plane-rot', `${angle}deg`);

      // Visible near-instantly at rest in the hero, full brightness within
      // the first few percent of scroll.
      let planeOpacity = rawProgress < 0.035 ? 0.85 + (rawProgress / 0.035) * 0.15 : 1;

      // Gentle deceleration into the landing — the plane scales down and
      // dims as it settles onto the final CTA, rather than stopping dead.
      // Most of this "settling" happens in the final approach itself (not
      // only after scrolling past it) so it reads as a graceful landing
      // even on pages with little scroll room left below the CTA.
      const landT = rawProgress > 0.9 ? clamp01((rawProgress - 0.9) / 0.1) : 0;
      planeOpacity *= 1 - landT * 0.75;
      flightPlaneEl.style.setProperty('--plane-scale', (1 - landT * 0.3).toFixed(3));

      // Once scrolled past the CTA landing point, finish fading out over a
      // short extra distance so it never lingers into the footer.
      const overshoot = scrollY - flightEndY;
      if (overshoot > 0) planeOpacity *= Math.max(0, 1 - overshoot / 180);

      flightPlaneEl.style.setProperty('--plane-opacity', Math.max(0, planeOpacity).toFixed(2));
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollEffects);
    }
  };
  const onResize = () => {
    if (!prefersReducedMotion) {
      applyFlightPath();
      computeFlightAnchors();
    }
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

  // Re-anchor the flight path once web fonts / late layout have settled —
  // section heights (and therefore where the plane's loops land) can shift
  // slightly once @font-face swaps in.
  if (!prefersReducedMotion) {
    window.addEventListener('load', () => {
      computeFlightAnchors();
      updateScrollEffects();
    });
  }

});
