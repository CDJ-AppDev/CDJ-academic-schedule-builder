# Front-End JavaScript — Feature Documentation

## Overview
Browser-side JavaScript powers authentication flows, API access, schedule builder/plotter interactions, profile management, and a private admin dashboard that performs CRUD operations via the backend admin API.

## Key Files & Locations
- **Shared**
  - `frontend/scripts/utils.js`: app configuration (`APP_CONFIG`) + shared utilities (`APP_UTILS`)
  - `frontend/scripts/auth.js`: token handling, route guard, login/signup/reset flows, admin nav injection
  - `frontend/scripts/theme.js`: light/dark theme toggle + persistence
  - `frontend/scripts/popup.js`: shared modal/confirm UI
- **Pages**
  - `frontend/scripts/setup.js`: post-signup setup (program/year/semester)
  - `frontend/scripts/profile.js`: user profile updates and account actions
  - `frontend/scripts/subjects.js`, `frontend/scripts/classes.js`: builder catalog/selection logic
  - `frontend/scripts/plotter.js`: plotting schedule blocks
- **Private admin**
  - `admin/admin.js`: admin dashboard UI state, filters, modals, CRUD calls to `/api/admin/*`

## Features
- **API base URL resolution**: `APP_CONFIG.API_BASE` selects API origin based on protocol/host (supports `file://` and hosted environments).
- **Token propagation**: `auth.js` supports URL token pass-through for `file://` sandbox navigation.
- **Route guarding & role syncing**: `auth.js` checks `/api/user-session` to refresh cached user metadata and injects admin navigation for admin accounts.
- **Admin dashboard (CRUD)**
  - Tabs for users/programs/terms/courses/professors/course slots/schedules
  - Filtering logic for terms/courses/course slots
  - Modal create/edit flows that submit JSON to backend
  - **Audit change**: removed duplicate token helpers from `admin/admin.js` and centralized on the shared `auth.js` helpers; also switched admin page to load `utils.js` and use shared `escapeHtml`/time utilities (with fallbacks).

## Dependencies
- **Node.js Backend**: all data flows depend on `backend/db-server.js` endpoints
- **HTML Pages**: scripts are loaded by `pages/*.html` and `admin/admin.html`
- **CSS**: behavior assumes specific class/ID hooks styled in `frontend/css/*`

## TODOs & Known Limitations
- **Inline event handlers**: many pages use `onclick` / `onsubmit` attributes. Converting to `addEventListener` would improve maintainability but is a behavior-sensitive refactor.
- **Admin JS size**: `admin/admin.js` is monolithic; consider splitting into modules (api client, renderers, filters, modal forms).
- **Client-side validation**: some validation is UI-only; backend should remain the source of truth for validation.

