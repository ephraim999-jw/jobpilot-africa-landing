// ==========================================================
// JobPilot Africa — Jobs search page (jobs.html)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Footer year ----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Header shadow + top scroll progress bar (shared look with index.html) ----
  const header = document.querySelector('.site-header');
  const scrollProgressEl = document.getElementById('scrollProgress');
  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  let ticking = false;
  const updateScrollChrome = () => {
    ticking = false;
    const scrollY = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', scrollY > 8);
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const docProgress = docHeight > 0 ? clamp01(scrollY / docHeight) : 0;
    if (scrollProgressEl) {
      scrollProgressEl.style.setProperty('--scroll-pct', `${(docProgress * 100).toFixed(2)}%`);
    }
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScrollChrome); }
  }, { passive: true });
  window.addEventListener('resize', updateScrollChrome, { passive: true });
  updateScrollChrome();

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Data ----
  const ALL_JOBS = window.JOBPILOT_JOBS || [];
  const CATEGORIES = window.JOBPILOT_CATEGORIES || [];
  const BOT_URL = 'https://t.me/JobPilot_Africa_Bot';

  // ---- Elements ----
  const searchInput = document.getElementById('jobSearchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const resultsGrid = document.getElementById('jobsResultsGrid');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('jobsEmptyState');
  const searchLoading = document.getElementById('searchLoading');

  // Populate the category dropdown from the shared category list (not just
  // categories that currently have listings), so it stays correct as more
  // real jobs are added later without needing a code change.
  if (categoryFilter) {
    const frag = document.createDocumentFragment();
    CATEGORIES.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      frag.appendChild(opt);
    });
    categoryFilter.appendChild(frag);
  }

  const jobCardHTML = (job) => `
    <div class="opportunity-card card-enter">
      <div class="opportunity-main">
        <span class="opportunity-title">${job.title}</span>
        <span class="opportunity-meta">
          <span>${job.company}</span>
          <span class="dot-sep">${job.location}</span>
          <span class="dot-sep opportunity-salary">${job.salary}</span>
        </span>
      </div>
      <div class="job-card-actions">
        <span class="opportunity-category">${job.category}</span>
        <a class="btn btn-primary btn-sm" href="${BOT_URL}" target="_blank" rel="noopener">Apply</a>
      </div>
    </div>
  `;

  const renderResults = (jobs) => {
    if (!resultsGrid) return;

    if (!jobs.length) {
      resultsGrid.innerHTML = '';
      emptyState.classList.add('is-active');
      resultsCount.textContent = '';
      return;
    }

    emptyState.classList.remove('is-active');
    resultsGrid.innerHTML = jobs.map(jobCardHTML).join('');
    resultsCount.innerHTML = `<strong>${jobs.length}</strong> job${jobs.length === 1 ? '' : 's'} found`;
  };

  const filterJobs = () => {
    const q = (searchInput.value || '').trim().toLowerCase();
    const cat = categoryFilter.value;
    return ALL_JOBS.filter((job) => {
      const matchesCategory = !cat || job.category === cat;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = `${job.title} ${job.company} ${job.location} ${job.category}`.toLowerCase();
      return haystack.includes(q);
    });
  };

  // Debounced "live search" — filtering itself is instant (it's a small
  // in-memory list), but a brief brand-colored loading animation plays
  // first so the search reads as a live lookup rather than a snap-cut,
  // the way real search products feel. Skipped entirely under
  // prefers-reduced-motion.
  let searchTimer = null;
  const runSearch = () => {
    const jobs = filterJobs();

    if (prefersReducedMotion) {
      renderResults(jobs);
      return;
    }

    if (searchLoading) searchLoading.classList.add('is-active');
    if (resultsGrid) resultsGrid.style.opacity = '0.35';

    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      renderResults(jobs);
      if (searchLoading) searchLoading.classList.remove('is-active');
      if (resultsGrid) resultsGrid.style.opacity = '1';
    }, 420);
  };

  let debounceTimer = null;
  const onInputChange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 200);
  };

  if (searchInput) searchInput.addEventListener('input', onInputChange);
  if (categoryFilter) categoryFilter.addEventListener('change', runSearch);

  // Initial render: show everything immediately, no artificial delay on
  // first load.
  renderResults(ALL_JOBS);

});
