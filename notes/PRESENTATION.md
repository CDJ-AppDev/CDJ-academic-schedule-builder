# 🎓 Academic Schedule Builder — Feature Showcase

> A complete step-by-step walkthrough of every feature in the application.

---

## 📋 Table of Contents

1. [Authentication — Login](#step-1-authentication--login)
2. [Authentication — Sign Up](#step-2-authentication--sign-up)
3. [Authentication — Forgot Password](#step-3-authentication--forgot-password)
4. [First-Time Setup](#step-4-first-time-setup)
5. [Home Dashboard](#step-5-home-dashboard)
6. [Schedule Builder — Browsing Available Classes](#step-6-schedule-builder--browsing-available-classes)
7. [Schedule Builder — Adding Irregular Courses](#step-7-schedule-builder--adding-irregular-courses)
8. [Schedule Builder — Managing Multiple Schedules](#step-8-schedule-builder--managing-multiple-schedules)
9. [Schedule Builder — Saving & Deleting Schedules](#step-9-schedule-builder--saving--deleting-schedules)
10. [Schedule Plotter — Visualizing Your Schedule](#step-10-schedule-plotter--visualizing-your-schedule)
11. [Schedule Plotter — Display Options](#step-11-schedule-plotter--display-options)
12. [Schedule Plotter — Color Customization](#step-12-schedule-plotter--color-customization)
13. [Schedule Plotter — Export as PNG](#step-13-schedule-plotter--export-as-png)
14. [Profile — Account Management](#step-14-profile--account-management)
15. [Profile — Academic Selection](#step-15-profile--academic-selection)
16. [Admin Dashboard — Users](#step-16-admin-dashboard--users)
17. [Admin Dashboard — Programs](#step-17-admin-dashboard--programs)
18. [Admin Dashboard — Terms](#step-18-admin-dashboard--terms)
19. [Admin Dashboard — Courses](#step-19-admin-dashboard--courses)
20. [Admin Dashboard — Professors](#step-20-admin-dashboard--professors)
21. [Admin Dashboard — Course Slots](#step-21-admin-dashboard--course-slots)
22. [Admin Dashboard — Schedules](#step-22-admin-dashboard--schedules)

---

## Step 1: Authentication — Login

**Page:** `pages/login.html`

The entry point of the application. Users authenticate using their registered email and password.

### What to show:
- The centered **login card** on a dark grid background
- **Email** and **Password** fields
- The **Login →** primary button
- Links to **Forgot Password** and **Sign Up**

### Key behaviors:
- On successful login, the JWT token is stored in `localStorage` and the user is redirected to `home.html`
- If the user is already logged in (token present), they are automatically redirected away from this page
- Admin accounts are redirected to `private/admin.html`

> [!NOTE]
> The login card uses glassmorphism with a `backdrop-filter: blur` panel on a dark animated grid background.

---

## Step 2: Authentication — Sign Up

**Page:** `pages/signup.html`

New users can create an account using their email and a password (with confirmation).

### What to show:
- **Email**, **Password**, and **Confirm Password** fields
- The **Sign Up →** button
- The **Login** link for existing users

### Key behaviors:
- Password and Confirm Password must match — a custom popup modal appears on mismatch
- On successful registration, the user is redirected to `setup.html` to complete their profile
- Duplicate email addresses are rejected with an error modal

---

## Step 3: Authentication — Forgot Password

**Page:** `pages/forgot-password.html`

Allows users to request a password reset via their registered email address.

### What to show:
- A single **Email** input field
- The reset submission button
- Navigation back to Login

### Key behaviors:
- A confirmation modal appears after submission confirming the reset email has been sent

---

## Step 4: First-Time Setup

**Page:** `pages/setup.html`

After signing up, new users complete their academic profile before accessing the main app.

### What to show:
- **Full Name** text input
- **Program** dropdown — dynamically loaded from the API
- **Year Level** dropdown — unlocks after a program is selected
- **Semester** dropdown — unlocks after a year level is selected
- The **Continue →** button

### Key behaviors:
- Dropdowns are **cascading**: each one activates only when the previous selection is made
- On completion, the user's academic term is saved and they are redirected to `home.html`
- This page is skipped on subsequent logins

> [!IMPORTANT]
> The program, year, and semester data is seeded by the Admin via the Admin Dashboard.

---

## Step 5: Home Dashboard

**Page:** `pages/home.html`

The central hub after logging in — displays the two main tools available to the user.

### What to show:
- The **sticky navigation header** with: App brand, Home / Builder / Plotter nav buttons, username display, Settings icon, Logout icon
- Two **dashboard cards**:
  - 🗓️ **Schedule Builder** — "Select classes and build your schedule."
  - 📊 **Schedule Plotter** — "Visualize your weekly schedule and customize blocks."
- Clicking either card navigates to the respective page

### Key behaviors:
- If no valid JWT token is found in `localStorage`, the user is immediately redirected to `login.html`
- The username in the header is populated from the decoded JWT

---

## Step 6: Schedule Builder — Browsing Available Classes

**Page:** `pages/builder.html`

The core feature of the app. Students browse and select class slots offered for their enrolled term.

### What to show:
- The **Available Classes** section at the top
- Each course appears as a **collapsible course card** with a colored header showing the course code and name
- Clicking a card header **expands a dropdown** showing available time slots (day, time, room, professor)
- Each slot has an **ADD** button (green, pill-shaped)
- Opening one card **automatically closes** other open cards to reduce clutter

### Key behaviors:
- Courses and their slots are fetched from the API based on the user's enrolled term
- Added slots move into the **Schedules** section below
- The same course cannot be added twice to the same schedule

> [!TIP]
> The accordion behavior keeps the UI clean — only one course's slots are visible at a time.

---

## Step 7: Schedule Builder — Adding Irregular Courses

**Page:** `pages/builder.html`

Students taking courses outside their regular term (irregular students) can manually add custom class entries.

### What to show:
- The **Add Irregular Course** card (purple/violet header, always visible below the available courses)
- Click the header to expand the form
- Form fields:
  - Course Code (e.g., `CS101`)
  - Course Name (e.g., `Intro to Programming`)
  - Units (e.g., `3`)
  - Teacher Name
  - Room Code (e.g., `CL1`, `WH301`, or `TBA`)
  - Day (dropdown: Monday–Friday)
  - Start Time / End Time (time pickers)
- The **Add Course** button submits the irregular entry

### Key behaviors:
- Irregular course entries are visually distinguished with a grey pill-shaped card style
- They are saved into the schedule alongside regular slots
- No API lookup is performed — data is entered manually

---

## Step 8: Schedule Builder — Managing Multiple Schedules

**Page:** `pages/builder.html`

Users can create, switch between, and manage multiple schedule drafts simultaneously.

### What to show:
- The **Schedules** section heading
- The **schedule selector dropdown** (top-right of the Schedules header) — shows `+ Create New Schedule` plus any saved schedules
- Selecting `+ Create New Schedule` clears the current list and starts a fresh blank schedule
- Selecting a saved schedule name loads its courses into the view
- The **DELETE** button (red pill, appears only when a saved schedule is selected)

### Key behaviors:
- Each schedule is independently stored in the database per user
- Switching schedules does NOT discard unsaved work — a confirmation modal appears
- The unit counter at the bottom updates live as courses are added/removed

---

## Step 9: Schedule Builder — Saving & Deleting Schedules

**Page:** `pages/builder.html`

### Saving

At the bottom of the builder, the **Save Schedule** bar allows naming and saving the current selection.

#### What to show:
- The label: `Save Schedule as:`
- The **schedule name input** (rounded pill input)
- The **Units display** (e.g., `Units: 15 / 21`) showing current vs. required units
- The **Regular / Irregular status badge** indicating if the unit load qualifies as regular
- The green **SAVE** button (with save icon)

#### Key behaviors:
- If the schedule name already exists, it **updates** the existing record
- A success modal confirms the save
- Unit validation shows whether the student is on track for their term

### Deleting

- The red **DELETE** button (visible only for existing saved schedules) prompts a **confirmation modal** before permanently removing the schedule

> [!CAUTION]
> Deletion is permanent and cannot be undone.

---

## Step 10: Schedule Plotter — Visualizing Your Schedule

**Page:** `pages/plotter.html`

Converts saved schedules into a **visual weekly timetable grid**.

### What to show:
- The **Select Schedule** panel listing all the user's saved schedules as clickable items
- The **Generate Schedule** button (green, centered)
- After generating: the **timetable grid** rendered on a canvas-like area
  - Time axis on the left: **7 AM → 8 PM**
  - Day columns across the top: **MON, TUE, WED, THU, FRI, SAT**
  - Each enrolled class appears as a **colored block** positioned at the correct day and time slot, displaying:
    - Subject Code
    - Subject Name
    - Professor
    - Time
    - Room

### Key behaviors:
- Block heights are proportional to the class duration
- Blocks are positioned absolutely based on start time relative to 7 AM
- Multiple courses on the same day stack correctly in their respective columns

---

## Step 11: Schedule Plotter — Display Options

**Page:** `pages/plotter.html`

Users can toggle what information is shown inside each schedule block.

### What to show:
- The **OPTIONS** panel with two columns of checkboxes:

| Left Column | Right Column |
|---|---|
| ☐ Hide Professor | ☐ Hide Time |
| ☐ Hide Subject Code | ☐ Hide Day |
| ☐ Hide Subject Name | ☐ Hide Room |

### Key behaviors:
- Checking any option **instantly updates** all visible blocks on the timetable
- Useful for creating a clean, minimal version for screenshots or printing
- Combinations can be used — e.g., hide professor + time for a simplified room-only view

---

## Step 12: Schedule Plotter — Color Customization

**Page:** `pages/plotter.html`

Users can personalize the color scheme of their schedule blocks.

### What to show:
- **Custom Block Color** — a color picker input with a live hex display (e.g., `#000000`)
- **Custom Font Color** — a second color picker for the text inside blocks (e.g., `#FFFFFF`)
- Changes apply to all blocks when **Generate Schedule** is clicked

### Key behaviors:
- The hex code next to each picker updates live as the user moves the color picker
- Allows full contrast customization (dark block + white text, or light block + dark text)

---

## Step 13: Schedule Plotter — Export as PNG

**Page:** `pages/plotter.html`

Once satisfied with the visual output, users can save the timetable as an image.

### What to show:
- The **Save as PNG** button (green, appears after generating a schedule)
- Clicking it triggers `html2canvas` to capture the timetable grid area
- A `.png` file is automatically downloaded to the user's device

### Key behaviors:
- Only the timetable grid (`#capture-area`) is captured — not the entire page
- The exported image includes the exact colors and visible fields as configured
- File is named and downloaded automatically via a programmatic anchor click

> [!TIP]
> This is the primary way students share their finalized schedule — screenshot-ready at the click of a button.

---

## Step 14: Profile — Account Management

**Page:** `pages/profile.html`

Users can view and update their personal account credentials.

### What to show:
- The **Profile Information** panel (left column):
  - **Username** row — icon, read-only input, edit (pencil) button
  - **Email** row — icon, read-only input, edit button
  - **Password** row — icon, masked input, show/hide password toggle (eye icon), edit button
- Clicking the pencil icon on any row **enables** the input field for editing
- After editing, a **save confirmation** modal appears

### Key behaviors:
- Fields are **disabled by default** and only become editable on clicking the edit icon
- The password field has a built-in **show/hide toggle** (SVG eye icon)
- Changes are submitted to the backend and the stored profile is updated

---

## Step 15: Profile — Academic Selection

**Page:** `pages/profile.html`

Users can change their enrolled academic term at any time from the Profile page.

### What to show:
- The **Academic Selection** panel (right column):
  - **Available Courses** (Program) dropdown
  - **Select Year** dropdown (cascades from Program)
  - **Select Semester** dropdown (cascades from Year)
  - **Apply Selection** button (purple)
  - After applying: a summary of the selected courses appears, and a **Go to Schedule Builder** button becomes visible

### Key behaviors:
- Changing the academic selection updates which courses appear in the Schedule Builder
- The cascading dropdowns follow the same logic as the initial setup page
- A success modal confirms the change

---

## Step 16: Admin Dashboard — Users

**Page:** `private/admin.html` → **Users** tab

The Admin Dashboard is accessible only to users with the `admin` role.

### What to show:
- The **Admin** nav button visible only for admin accounts in the header
- The **tabbed interface** at the top: Users | Programs | Terms | Courses | Professors | Course Slots | Schedules
- The **Users** tab (default active):
  - Table columns: **ID, Name, Email, Access Role, Assigned Term, Actions**
  - **+ Create User** button opens a modal form
  - Each row has **Edit** and **Delete** action buttons

### Key behaviors:
- Creating a user allows setting their email, name, password, role (`user`/`admin`), and assigned term
- Editing updates the record inline via the modal
- Deleting prompts a confirmation before removal

---

## Step 17: Admin Dashboard — Programs

**Page:** `private/admin.html` → **Programs** tab

Manage academic programs (e.g., BSCS, BSIT, BSBA).

### What to show:
- Table columns: **Program ID, Program Name, Total Years, Semester Type, Standard Units, Actions**
- **+ Create Program** button
- Edit and Delete per row

### Key behaviors:
- **Total Years** defines how many year levels exist for the program (e.g., 4 for a 4-year course)
- **Semester Type** can be `semester` or `trimester`
- **Standard Units** sets the baseline unit load used in the builder's unit validator

---

## Step 18: Admin Dashboard — Terms

**Page:** `private/admin.html` → **Terms** tab

Terms represent a specific year level + semester combination within a program.

### What to show:
- A **Program filter dropdown** at the top to narrow the table view
- Table columns: **Term ID, Program, Year Level, Semester, Required Units, Actions**
- **+ Create Term** button

### Key behaviors:
- Terms connect Programs to their specific curriculum periods
- **Required Units** is compared against the student's selected courses in the builder's unit counter
- Filtering by program makes it easy to manage large curricula

---

## Step 19: Admin Dashboard — Courses

**Page:** `private/admin.html` → **Courses** tab

Courses are the individual subjects offered under each term.

### What to show:
- **Program** and **Term** cascading filter dropdowns
- Table columns: **Course Code, Course Name, Units, Term ID, Actions**
- **+ Create Course** button

### Key behaviors:
- Each course belongs to a **Term** — it only appears in the builder for students enrolled in that term
- **Course Code** is the primary key (e.g., `CS402`)
- Filtering by Program → Term allows focused management of each curriculum layer

---

## Step 20: Admin Dashboard — Professors

**Page:** `private/admin.html` → **Professors** tab

Manage the faculty members who teach the courses.

### What to show:
- A **Department filter** dropdown
- Table columns: **ID, Name, Department, Actions**
- **+ Create Professor** button

### Key behaviors:
- Professors are referenced when creating **Course Slots** (the specific class schedule entries)
- Department filtering makes it easy to manage large faculty lists

---

## Step 21: Admin Dashboard — Course Slots

**Page:** `private/admin.html` → **Course Slots** tab

Course Slots are the actual schedulable class instances — a course taught by a professor at a specific time and room.

### What to show:
- **Program → Term → Course** cascading filter dropdowns
- Table columns: **ID, Course, Professor, Day, Time Block, Room, Actions**
- **+ Create Course Slot** button

### Key behaviors:
- This is the data that **populates the Schedule Builder's "Available Classes"** section for students
- Each slot specifies: which course, which professor, what day of the week, start/end time, and room
- Multiple slots can exist per course (e.g., different sections or days)
- The three-level filter (Program → Term → Course) allows precise slot management

> [!IMPORTANT]
> Course Slots are the most critical data to set up — without them, students will see no available classes in the builder.

---

## Step 22: Admin Dashboard — Schedules

**Page:** `private/admin.html` → **Schedules** tab

A read-only administrative view of all schedules saved by all users.

### What to show:
- Table columns: **ID, User (Name / Email), Schedule Title, Total Units, Status, Created At, Actions**
- The **Delete** action button per row

### Key behaviors:
- Admins can **monitor all user-created schedules** across the entire system
- The **Status** column shows whether the schedule is `Regular` or `Irregular` based on unit load
- The **Created At** timestamp shows when the schedule was last saved
- Admins can delete any schedule if necessary (e.g., for cleanup)

> [!NOTE]
> There is no Edit action for schedules in the admin view — schedule contents are managed by students through the builder.

---

## 🗺️ Full User Flow Summary

```
Landing (index.html)
    │
    ├─▶ Login (login.html)
    │       ├─▶ [Admin] ──────────────────▶ Admin Dashboard (private/admin.html)
    │       └─▶ [Student] ──────────────▶ Home (home.html)
    │
    ├─▶ Sign Up (signup.html)
    │       └─▶ Setup (setup.html) ──────▶ Home (home.html)
    │
    └─▶ Forgot Password (forgot-password.html)

Home (home.html)
    ├─▶ Schedule Builder (builder.html)
    │       ├─▶ Browse & select class slots
    │       ├─▶ Add irregular courses manually
    │       ├─▶ Create & switch between schedules
    │       └─▶ Save / Delete schedules
    │
    ├─▶ Schedule Plotter (plotter.html)
    │       ├─▶ Select a saved schedule
    │       ├─▶ Configure display options
    │       ├─▶ Pick block & font colors
    │       ├─▶ Generate the timetable grid
    │       └─▶ Export as PNG
    │
    └─▶ Profile (profile.html)
            ├─▶ Edit username / email / password
            └─▶ Change program / year / semester
```

---

## 🛠️ Technology Stack (Reference)

| Layer | Technology |
|---|---|
| Frontend | HTML5, Vanilla CSS, Vanilla JavaScript |
| Styling | Custom design system via `main.css` + page-specific CSS |
| Fonts | Google Fonts — *Patrick Hand* (headings), *Inter* (body) |
| Image Export | `html2canvas` v1.4.1 (CDN) |
| Auth | JWT stored in `localStorage` |
| Deployment | Docker + Kubernetes (k8s) |
| Backend | REST API (Node/Express — `backend/`) |

---

*End of Feature Showcase — Academic Schedule Builder*
