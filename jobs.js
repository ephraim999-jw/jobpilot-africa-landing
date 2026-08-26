// ==========================================================
// JobPilot Africa — Jobs search page (jobs.html)
// Live-connected to the JobPilot Africa public jobs API (FastAPI on
// Railway, backed by the same Postgres database the Telegram bot uses).
// Falls back to a small static sample (jobs-data.js) only if the live
// API is unreachable, so the page never looks broken.
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

  // ---- Live data source ----
  const API_BASE = 'https://jobpilot-africa-production.up.railway.app/api/public/jobs';
  const BOT_URL = 'https://t.me/JobPilot_Africa_Bot';
  // Static fallback (jobs-data.js) — only used if the live API can't be reached.
  const FALLBACK_JOBS = window.JOBPILOT_JOBS || [];
  const CATEGORIES = window.JOBPILOT_CATEGORIES || [];

  // ---- Elements ----
  const searchInput = document.getElementById('jobSearchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const resultsGrid = document.getElementById('jobsResultsGrid');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('jobsEmptyState');
  const searchLoading = document.getElementById('searchLoading');
  const liveJobsCountEl = document.getElementById('liveJobsCount');
  const liveJobsBadgeEl = document.getElementById('liveJobsBadge');
  const fallbackNoticeEl = document.getElementById('jobsFallbackNotice');

  // The live database's own categorisation includes an uncategorised
  // "General" bucket alongside our 16 named industries, so the filter
  // needs to offer it too or a real slice of live jobs would be
  // unreachable through the dropdown.
  if (categoryFilter) {
    const frag = document.createDocumentFragment();
    CATEGORIES.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      frag.appendChild(opt);
    });
    const generalOpt = document.createElement('option');
    generalOpt.value = 'General';
    generalOpt.textContent = 'General / Other';
    frag.appendChild(generalOpt);
    categoryFilter.appendChild(frag);
  }

  const formatCount = (n) => n.toLocaleString('en-US');

  const jobCardHTML = (job) => `
    <div class="opportunity-card card-enter">
      <div class="opportunity-main">
        <span class="opportunity-title">${job.title}</span>
        <span class="opportunity-meta">
          <span>${job.company}</span>
          <span class="dot-sep">${job.location}</span>
          ${job.salary ? `<span class="dot-sep opportunity-salary">${job.salary}</span>` : ''}
        </span>
      </div>
      <div class="job-card-actions">
        <span class="opportunity-category">${job.category}</span>
        <a class="btn btn-primary btn-sm" href="${BOT_URL}" target="_blank" rel="noopener">Apply</a>
      </div>
    </div>
  `;

  const renderResults = (jobs, { usingFallback } = {}) => {
    if (!resultsGrid) return;

    if (fallbackNoticeEl) fallbackNoticeEl.classList.toggle('is-active', !!usingFallback);

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

  const setLiveCount = (total, { isFallback } = {}) => {
    if (!liveJobsCountEl) return;
    if (isFallback || typeof total !== 'number') {
      liveJobsCountEl.textContent = 'Live count unavailable right now — showing a saved sample';
      if (liveJobsBadgeEl) liveJobsBadgeEl.classList.add('is-fallback');
      return;
    }
    liveJobsCountEl.textContent = `${formatCount(total)} live jobs on JobPilot right now`;
    if (liveJobsBadgeEl) liveJobsBadgeEl.classList.remove('is-fallback');
  };

  // Client-side filtering is always applied on top of whatever the API
  // returns — a safety net in case a server-side category filter isn't
  // (yet) fully honored, so the page is never wrong even if the backend
  // is still catching up.
  const applyClientFilters = (jobs, { category, query }) => {
    return jobs.filter((job) => {
      if (category && job.category !== category) return false;
      if (!query) return true;
      const haystack = `${job.title} ${job.company} ${job.location} ${job.category}`.toLowerCase();
      return haystack.includes(query);
    });
  };

  let lastGoodBatch = null; // most recent successful live fetch, reused if a later fetch fails

  const fetchLiveJobs = async (category) => {
    const url = new URL(API_BASE);
    url.searchParams.set('limit', '50');
    if (category) url.searchParams.set('category', category);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      clearTimeout(timeout);
      return { jobs: Array.isArray(data.jobs) ? data.jobs : [], total: data.total_active_jobs };
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  };

  let requestId = 0;
  const runSearch = async () => {
    const myRequestId = ++requestId;
    const query = (searchInput.value || '').trim().toLowerCase();
    const category = categoryFilter.value;

    if (searchLoading) searchLoading.classList.add('is-active');
    if (resultsGrid) resultsGrid.style.opacity = '0.35';

    try {
      const { jobs, total } = await fetchLiveJobs(category);
      if (myRequestId !== requestId) return; // a newer search superseded this one
      lastGoodBatch = jobs;
      setLiveCount(total);
      renderResults(applyClientFilters(jobs, { category, query }));
    } catch (err) {
      if (myRequestId !== requestId) return;
      // Live fetch failed — fall back to the last good live batch if we
      // have one, otherwise the static sample, so the page still works.
      const fallbackSource = lastGoodBatch || FALLBACK_JOBS;
      setLiveCount(null, { isFallback: true });
      renderResults(applyClientFilters(fallbackSource, { category, query }), { usingFallback: true });
    } finally {
      if (myRequestId === requestId) {
        if (searchLoading) searchLoading.classList.remove('is-active');
        if (resultsGrid) resultsGrid.style.opacity = '1';
      }
    }
  };

  let debounceTimer = null;
  const onInputChange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, prefersReducedMotion ? 0 : 350);
  };

  if (searchInput) searchInput.addEventListener('input', onInputChange);
  if (categoryFilter) categoryFilter.addEventListener('change', runSearch);

  // Initial load — fetch everything live right away.
  runSearch();

});
