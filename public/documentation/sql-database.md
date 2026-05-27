# SQL Database — Feature Documentation

## Overview
PostgreSQL schema for the Academic Schedule Builder, covering authentication credentials, user profiles, programs/terms, courses/professors/course slots, schedules, and password reset PINs.

## Key Files & Locations
- `backend/sql/1setup.sql`: schema definition (tables, constraints) + indexes
- `backend/sql/1terms.sql`: seed data for `program` + `term`
- `backend/sql/2users.sql`: seed users + profiles (AES-encrypted sample passwords)
- `backend/sql/3professors.sql`: seed professors
- `backend/sql/4courses.sql`: seed courses, course↔term mapping, and course slots

## Features
- **User auth storage**: `user_credentials` stores email, encrypted password, access role (`Admin`/`Default`), and timestamps.
- **User profile**: `user_profile` stores display name and selected `termid`.
- **Program/term modeling**:
  - `program` defines program metadata (duration, semester type, default units).
  - `term` defines program/year/semester with required units; uniqueness enforced by `(programid, yearlevel, semester)`.
- **Course catalog**:
  - `course` stores course identity and unit count.
  - `course_term` maps courses to one or more terms.
- **Scheduling primitives**:
  - `professor` stores instructor metadata.
  - `courseslot` stores meeting blocks (day/time/room) and optional professor assignment.
- **User schedules**:
  - `schedule` stores per-user named schedules; `schedulelist` is JSONB for selected course slots + manual entries.
- **Password reset**:
  - `password_reset_token` stores a 6-digit PIN and expiry per email.

## Dependencies
- **Node.js Backend**: all reads/writes are executed by `backend/db-server.js` via `pg` parameterized queries.
- **Kubernetes**: `k8s/postgres*.yaml` provides the Postgres Deployment/Service/PV/PVC.

## TODOs & Known Limitations
- **Passwords are reversibly encrypted**: the current design encrypts/decrypts passwords (AES) instead of using one-way hashing (e.g. bcrypt/argon2). This is a security risk and also forces the backend/admin tooling to handle decrypted secrets.
- **Seed data contains real-looking credentials**: `backend/sql/2users.sql` includes encrypted sample passwords and admin email; treat as non-production seed data.
- **Indexes added post-hoc**: `backend/sql/1setup.sql` now creates explicit indexes for foreign-key join columns; ensure your DB instance is rebuilt or migrations are applied if you rely on existing data.

