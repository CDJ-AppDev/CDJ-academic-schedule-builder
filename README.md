# Academic Schedule Builder (ASB)

Academic Schedule Builder is a full-stack web application for building, saving, and visualizing academic course schedules. It provides tools for students to select course slots, check conflicts, and generate timetables, while giving administrators powerful CRUD capabilities to manage the catalog structure.

## Core Documentation

This repository contains extensive architectural and product documentation:
- [Product Requirements Document (PRD.md)](./PRD.md)
- [Public Documentation (`public/documentation/`)](./public/documentation)
- [Project Notes (`public/notes/`)](./public/notes)

## Technology Stack

**Current Implementation:**
- **Frontend**: Static HTML5, CSS3, Vanilla JavaScript (No Framework)
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Deployment**: Docker, Kubernetes (Manifests included)

**Planned Migration:**
- A major frontend rebuild is planned to transition the UI to **Vite + React + TypeScript + Tailwind CSS** as outlined in [REACT-TAILWIND-REBUILD-PLAN.md](./public/notes/REACT-TAILWIND-REBUILD-PLAN.md).

## Features

### Student / End User
- **Auth & Onboarding**: Email signup, JWT-based sessions, password reset via PIN, cascading academic program/year/term setup.
- **Schedule Builder**: Browse available courses, add manual irregular entries, check for time conflicts, save multiple variations.
- **Timetable Visualization**: Monday-Saturday plotter grid (7:00 AM to 8:00 PM) with color customization, display toggles, and PNG export.
- **Profile Management**: Update user credentials, edit academic choices, switch between Light and Dark themes.

### Administrator
- **Catalog Management**: Admin dashboard with tabs for Programs, Terms, Courses, Professors, and Course Slots.
- **Data Filtering**: Cascading filters for efficient data retrieval.
- **User & Role Management**: View users, read-only schedules access, and promote/demote roles.
- **Validation**: Enforced database constraints and time range boundaries for schedule configurations.

## Project Structure

```text
├── admin/          # Admin dashboard HTML and JS
├── backend/        # Node.js API server, services, and SQL seed data
├── frontend/       # Vanilla JS modules and CSS stylesheets
├── k8s/            # Kubernetes deployment manifests
├── pages/          # Static HTML views (Login, Builder, Plotter, etc.)
├── public/         # Comprehensive documentation and architecture notes
├── graphify-out/   # Codebase graph dependency analysis
├── CODEX.md        # Technical AI manual and orientation guide
├── PRD.md          # Core product requirements document
└── README.md       # This file
```

## Future Roadmap

The application has a robust backlog of planned enhancements:
1. **First Release Pipeline**: React/TS conversion, GitHub Pages frontend hosting, Backend hosting config.
2. **Quality of Life**: Keyboard shortcuts, NO SIGNUP (public access) mode, custom colors.
3. **Advanced Integrations**: Department tracking, Team/Block cohorts, Shared Schedules, Admin batch edit, and advanced room conflict detection.

For the full list of planned items, refer to [TODO.md](./public/notes/TODO.md).