# Node.js Backend — Feature Documentation

## Overview
Express-based JSON API that handles authentication, user profile setup, course catalog retrieval, schedule CRUD, and an admin-only CRUD dashboard backed by PostgreSQL.

## Key Files & Locations
- `backend/db-server.js`: Express server + routes + DB access (`pg`)
- `backend/package.json`: runtime dependencies and start script
- `backend/sql/*.sql`: schema and seed data (consumed externally during DB initialization)

## Features
- **Authentication**
  - `POST /api/signup`: creates `user_credentials` and `user_profile` (temporary username defaults to email)
  - `POST /api/login`: issues JWT (`{ user_id }`) and returns user metadata
  - `authenticateToken` middleware: verifies `Authorization: Bearer <token>` and sets `req.user`
- **Password reset (PIN)**
  - `POST /api/forgot-password`: validates email, creates a 6-digit PIN record in `password_reset_token`, sends email via SMTP (or dev fallback)
  - `POST /api/reset-password`: validates PIN/email/expiry, updates encrypted password, deletes PIN token
- **User program/term setup**
  - `POST /api/term`: transactional update of `user_profile.termid` (and optional `username`)
  - `GET /api/term`: returns either current user’s term selection or a specific term by query param
  - `GET /api/programs`: public list of programs
- **Catalog + schedules**
  - `GET /api/courses`: returns course + slot + professor details for the user’s selected term (multi-join query)
  - `GET /api/schedule`: returns user schedules; optimized to avoid N+1 by fetching all referenced `courseslot` rows in one query
  - `PUT /api/schedule`: upserts a schedule (create or update) with `schedulelist` JSON
  - `DELETE /api/schedule`: removes a course slot entry from a schedule’s JSONB list
  - `DELETE /api/schedule/:id`: deletes a schedule
- **Admin-only CRUD**
  - `adminOnly` middleware: confirms `user_credentials.useraccess = 'Admin'`
  - `GET/POST/PUT/DELETE /api/admin/*`: CRUD for programs, users, terms, courses, professors, course slots, and schedules
  - **Bug fix applied**: admin course update now correctly deletes `course_term` mappings for the *old* course code before inserting mappings for the new code.
- **Operational hardening**
  - Switched to `cors` middleware (replacing manual CORS headers)
  - Added centralized async error handler (catches `asyncHandler` routes)
  - Reduced noisy debug logging in production paths

## Dependencies
- **SQL Database**: PostgreSQL schema in `backend/sql/`
- **Email**: SMTP (`nodemailer`) with env-based configuration (and dev fallback)
- **Kubernetes**: `k8s/backend.yaml` provides runtime env vars and probes

## TODOs & Known Limitations
- **Credential security**: passwords are encrypted/decrypted (reversible). Move to one-way hashing (bcrypt/argon2) and remove password-decrypt functionality from API outputs and admin tooling.
- **Validation coverage**: the audit added input validation for core auth/reset flows; other admin endpoints still accept broad inputs and would benefit from schema validation (e.g. Zod/Joi) for stricter contracts.
- **JWT configuration**: authenticated routes depend on `JWT_SECRET`; ensure it is always set in production.

