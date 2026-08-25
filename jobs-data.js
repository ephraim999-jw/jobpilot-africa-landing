// ==========================================================
// JobPilot Africa — Shared jobs data
// ==========================================================
// Single source of truth for both the homepage "Live Opportunities"
// preview (index.html) and the full search page (jobs.html).
//
// IMPORTANT: keep JOBPILOT_JOBS to REAL, verified listings only — no
// placeholders. Add a new object to the array below for each new real
// listing, with an "id" that's unique and stable (don't reuse/reshuffle
// existing ids, since a future version of the search page may deep-link
// to a specific id).
//
// This is a static file — there is no live database connection here.
// "Live search" on jobs.html means instant client-side filtering over
// this list, refreshed whenever this file is updated and redeployed.

window.JOBPILOT_CATEGORIES = [
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

window.JOBPILOT_JOBS = [
  { id: 'job-1', title: 'Data Analyst', company: 'Hartland Nigeria Limited', category: 'Technology', location: 'Lagos, Nigeria', salary: '₦125,000–150,000/month' },
  { id: 'job-2', title: 'Medical Lab Scientist', company: 'OPL Academy', category: 'Healthcare', location: 'Nigeria', salary: '₦400,000–500,000/month' },
  { id: 'job-3', title: 'Internal Control and Compliance Manager', company: 'Roundsquare Integrated Services Limited', category: 'Finance', location: 'Nigeria', salary: '₦500,000/month' },
  { id: 'job-4', title: 'Business Developer', company: 'Spectrum Books Limited', category: 'Sales & Marketing', location: 'Nigeria', salary: '₦250,000–300,000/month' },
  { id: 'job-5', title: 'Customer Service Officer', company: 'Solarworld Electric Technology Limited', category: 'Customer Service', location: 'Lagos, Nigeria', salary: '₦250,000/month' },
  { id: 'job-6', title: 'Human Resource Manager', company: 'Pazino Engineering & Construction Company Limited', category: 'Human Resources', location: 'Nigeria', salary: '₦300,000/month' },
  { id: 'job-7', title: 'Export Executive', company: 'Golden Oil Industries Limited', category: 'Logistics & Supply Chain', location: 'Nigeria', salary: '₦300,000–400,000/month' },
  { id: 'job-8', title: 'Science Teacher (British Curriculum)', company: 'Egatee Nigeria', category: 'Education', location: 'Lagos, Nigeria', salary: '₦180,000–250,000/month' },
];
