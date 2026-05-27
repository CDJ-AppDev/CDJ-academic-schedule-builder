# 🎓 Academic Schedule Builder — Feature Showcase

> A complete step-by-step walkthrough of every feature in the application.
> 
> **Presentation Mode**: Follow each step sequentially. Demo time: ~15-20 minutes for a full walkthrough.

---

## 📋 Quick Navigation

### 🔐 Authentication & Setup (Steps 1-4)
### 🏠 Student Features (Steps 5-15)
### 👨‍💼 Admin Features (Steps 16-22)

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
**Time:** 1-2 minutes

### 🎯 What to show on screen:

1. **Landing Visual**
   - Centered **glassmorphic login card** on a dark animated grid background
   - Semi-transparent white card with blur effect
   - Clean, modern dark theme

2. **Form Elements**
   - **Email** input field (placeholder: "you@example.com")
   - **Password** input field (masked dots)
   - **Login →** button (prominent primary color with arrow icon)

3. **Navigation Links**
   - "Forgot password?" link (top right of card)
   - "Don't have an account? Sign up →" link (bottom of card)

### 🎬 Demo Steps:

1. **Enter credentials**: 
   - Email: `student@example.com` (or valid student account)
   - Click password field and enter password

2. **Click "Login →"** 
   - Watch the page load (brief loading state)
   - 🔄 Automatic redirect to `home.html`

3. **Show browser storage**:
   - Open DevTools (F12) → Application tab → LocalStorage
   - Highlight the `token` key with JWT value
   - Close DevTools

### ✨ Key Visual Features:
- Glassmorphism effect with backdrop blur
- Grid background animation
- Smooth card shadow and transitions
- Responsive design (works on mobile too)

> [!NOTE]
> **For Admin Demo**: Use an admin account email to see automatic redirect to `admin/admin.html` instead.

---

## Step 2: Authentication — Sign Up

**Page:** `pages/signup.html`  
**Time:** 2-3 minutes

### 🎯 What to show on screen:

1. **Form Layout**
   - **Email** input field
   - **Password** input field
   - **Confirm Password** input field
   - **Sign Up →** button
   - "Already have an account? Login →" link at the bottom

2. **Card Design**
   - Same glassmorphic dark theme as login page
   - Slightly taller card to accommodate 3 fields

### 🎬 Demo Steps:

1. **Test password mismatch validation  
**Time:** 1-2 minutes

### 🎯 What to show on screen:

1. **Minimal Form**
   - Large, centered **Email** input field
   - **Send Reset Email →** button
   - "Back to Login →" link

2. **Card Design**
   - Compact glassmorphic card
   - Clear, simple layout

### 🎬 Demo Steps:

1. **Enter a registered emai  
**Time:** 2-3 minutes

### 🎯 What to show on screen:

1. **Form Structure**
   - **Full Name** text input (e.g., "John Doe")
   - **Program** dropdown (disabled initially, lists: BSCS, BSIT, BSBA, etc.)
   - **Year Level** dropdown (disabled until program selected)
   - **Semester** dropdown (disabled until year selected)
   - **Continue →** button (disabled until all fields filled)

2. **Visual Feedback**
   - Greyed-out disabled fields
   - Field activates as previous selections are made
   - Color change to active state

### 🎬 Demo Steps:

1. **Fill Full Name**:
   - Click name field
   - Type: `Jane Doe`
   - 👀 Program dropdown should activate

2. **Select Program** (cascading):
   - Click Program dropdown
   - 📂 Shows: BSCS, BSIT, BSBA, etc.
   - Select: `BSCS` (Bachelor of Science in Computer Science)
   - 👀 Year Level dropdown activates

3. **Select Year Level**:
   - Click Year Level dropdown
   - 📂 Shows: 1st Year, 2nd Year, 3rd Year, 4th Year
   - Select: `2nd Year`
   - 👀 Semester dropdown activates

4. **Select Semester**:
   - Click Semester dropdown
   - 📂 Shows: 1st Semester, 2nd Semester
   - Select: `1st Semester`
   - 👀 Continue button becomes enabled (color changes)

5. **Proceed to Home**:
   - Click "Continue →"
   - 🔄 Automatic redirect to `home.html`
   - Setup complete! User is now ready to build schedules

### ✨ Key Visual Features:
- **Cascading dropdowns** — intelligent field activation
- **Disabled state styling** — clear visual hierarchy
- **Progress indication** — step-by-step unlocking
- Smooth transitions between active/inactive states

> [!IMPORTANT]
> **Data Seeding**: Program  
**Time:** 1-2 minutes

### 🎯 What to show on screen:

1. **Sticky Navigation Header** (stays at top when scrolling)
   - **App Logo/Brand** (left side): "🎓 ASB"
   - **Nav Buttons** (center): Home | Builder | Plotter
   - **User Section** (right side):
     - Username display: "Jane Doe"
     - ⚙️ Settings icon (clickable)
     - 🚪 Logout icon (clickable)

2. **Hero Section**
   - Welcome message: "Welcome back, Jane!"
   - Brief subtitle about the app

3. **Two Main Feature Cards**
   - **Card 1: 🗓️ Schedule Builder**
     - Icon + large title  
**Time:** 3-4 minutes

### 🎯 What to show on screen:

1. **Available Classes Section**
   - Title: "📚 Available Classes"
   - Loading state (briefly shows skeleton loaders if data fetches)
   - Finally shows: **collapsible course cards** in a list

2. **Course Cards** (Accordion Style)
   - **Card Header** (colored bar):
     - Course Code: `CS402`
     - Course Name: `Advanced Data Structures`
     - Arrow icon (↓ / ↑) to indicate expand/collapse
     - Color-coded by course (different courses = different header colors)
   
   - **Card Body** (expands when header clicked):
     - Table/List of **available time slots**:
       - Day (MON, TUE, WED, etc.)
       - Time (08:00 - 10:00, 10:00 - 12:00, etc.)
       - Room (CL1, CL2, WH301, TBA, etc.)
       - Professor (Dr. Smith, Prof. Johnson, etc.)
       - 🟢 **ADD** button (bright green, pill-shaped, right side)
     - Multiple slots per course (different sections/times)

3. **Accordion Behavior**
   - Only ONE course card open at a time
   - Opening a new card closes the previous one
   - Smooth expand/collapse animation

### 🎬 Demo Steps:

1. **Browse Available Courses**:
   - Show several collapsed course cards
   - Point out color coding for visual distinction
   - Explain: "These are all classes available for your 2nd Year, 1st Semester BSCS program"

2. **Expand First Course** (e.g., CS402):
   - Click header: "CS402 - Advanced Data Structures"
   - 📂 Card expands downward smoothly
   - Show time slots:
     - MON/WED 08:00-10:00 | Room CL1 | Dr. Smith | 🟢 ADD
     - TUE/THU 14:00-16:00 | Room CL2 | Prof. Johnson | 🟢 ADD
     - FRI 09:00-11:00 | Room WH301 | Dr. Smith | 🟢 ADD

3. **Add a Class**:
   - Click 🟢 **ADD** on first slot (MON/WED with Dr. Smith)
   - ✅ Slot moves to the **Schedules** section below
   - Card remains open for reference

4. **Add Another Slot from Same Course**:
   - Click 🟢 **ADD** on a different time slot
   - ❌ **Show error/warning**: "CS402 is already in your schedule"
   - Explain: "Can't double-book the same course"

5. **Switch to Different Course**:
   - Click header of second course (e.g., "CS501 - Web Development")
   - 📂 First card auto-closes
   - 📂 Second card opens (accordion behavior)
   - Show different slots and professors

6. **Add Second Course**:
   - Click 🟢 **ADD** on a slot from CS501
   - ✅ Slot appears in Schedules section

### ✨ Key Visual Features:
- **Accordion pattern** — clean, compact UI
- **Color-coded headers** — easy visual identification
- **Smooth transitions** — professional feel
- **Pill-shaped buttons** — modern design element
- **Time formatting** — 24-hour display

### 🔑 Key Features Highlighted:
- **Course discovery** — browse all available options
- **Conflict detection** — prevents duplicate course adds
- **UI efficiency** — accordion keeps interface clean
- **API integration** — data fetched from backend based on user's enrolled term
   - Point to each nav button: Home, Builder, Plotter
   - Highlight username display
   - Show Settings & Logout icons

2. **Click Settings** (optional):
   - 📋 Shows quick profile menu (if implemented)
   - Close menu

3. **Access Schedule Builder**:
   - Click "Schedule Builder" card OR click "Builder" in nav
   - 🔄 Smooth transition to builder.html

4. **Return to Home**:
   - Click "Home" nav button
   - Back at dashboard

5. **Access Schedule Plotter** (optional now):
   - Click "Schedule Plotter" card
   - 🔄 Smooth transition to plotter.html

### ✨ Key Visual Features:
- Sticky header for consistent navigation
- Responsive grid layout for cards
- Smooth hover animations on cards
- Clear visual hierarchy with icons
- Dark theme with accent colors

### 🔑 Key Features Highlighted:
- **Auth integration**: Username from JWT token
- **Navigation**: Three main sections accessible from anywhere
- **User experience**: Home as central hub
- Inline password strength indicator (if implemented)
- Smooth field focus/blur animations
- Success feedback before redirect

> [!TIP]
> **Flow**: Sign Up → Setup → Home. This ensures new users complete their academic profile immediately.

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
**Time:** 2-3 minutes

### 🎯 What to show on screen:

1. **Add Irregular Course Card**
   - **Card Header**: "➕ Add Irregular Course" (purple/violet color, distinct from regular courses)
   - Always visible below the regular available courses
   - Click to expand the form

2. **Irregular Course Form** (expands when clicked)
   - **Course Code** input (e.g., "LAB101", "SPECIAL001")
   - **Course Name** input (e.g., "Lab Session", "Special Topics")
   - **Units** input field (numeric, e.g., "1", "2", "3")
   - **Teacher Name** input (e.g., "Dr. Anderson", "Prof. Lee")
   - **Room Code** input (e.g., "CL1", "WH301", "LAB1", "TBA")
   - **Day** dropdown (MON, TUE, WED, THU, FRI, SAT)
   - **Start Time** time picker (e.g., 08:00)
   - **End Time** time picker (e.g., 10:00)
   - 🟣 **Add Course** button (purple, matches header color)

3. **Visual Distinction**
   - Purple/violet header vs. colored headers for regular courses
   - Indicates "manual entry" vs. "system data"

### 🎬 Demo Steps:

1. **Scroll to Irregular Course Card**:
   - Point out purple header: "➕ Add Irregular Course"
   - Explain: "For students taking courses outside their regular schedule"

2. **Click to Expand**:
   - Click card header
   - 📂 Form fields reveal with smooth animation

3. **Fill Irregular Course**:
   - **Course Code**: Type `LAB101`
   - **Course Name**: Type `Chemistry Lab Session`
   - **Units**: Type `1`
   - **Teacher Name**: Type `Dr. Martinez`
   - **Room Code**: Type `LAB3`
   - **Day**: Select `Thursday` (THU)
   - **Start Time**: Set to `14:00` (2:00 PM)
   - **End Time**: Set to `16:00` (4:00 PM)

4. **Add Course**:
   - Click 🟣 **Add Course** button
   - ✅ Course appears in **Schedules** section below with grey pill styling
   - Form clears for next entry (optional)

5. **Show in Schedule**:
   - Point to added irregular course in Schedules
   - Show: "Chemistry Lab Session | THU 14:00-16:00 | Room LAB3 | Dr. Martinez"
   - Visual distinction with grey styling

### ✨ Key Visual Features:
- **Color coding** — purple for irregular vs. multi-color for regular
- **Form organization** — clear field grouping (course info vs. time info)
- **Time pickers** — user-friendly time selection (no manual typing)
- **Removable entries** — each added irregular course has a delete (X) button

### 🔑 Key Features Highlighted:
- **Flexibility** — students can add courses not in the official catalog
- **Manual control** — full control over course details
- **Visual tracking** — easy to spot irregular vs. regular courses in schedule
- **API-free workflow** — no backend data needed for irregular courses

---

## Step 8: Schedule Builder — Managing Multiple Schedules

**Page:** `pages/builder.html`  
**Time:** 2-3 minutes

### 🎯 What to show on screen:

1. **Schedules Section Header**
   - Title: "📋 Schedules"
   - Horizontal bar with schedule selector on the right

2. **Schedule Selector Dropdown**
   - Positioned top-right of Schedules section
   - Shows: `+ Create New Schedule` (always first option)
   - Lists saved schedules: "Schedule 1", "Spring 2024", "Summer Plan", etc.
   - Current schedule name highlighted/selected

3. **Schedule List Area**
   - Displays courses in current selected schedule
   - Same visual style as courses added from Available Classes
   - Each course shows: code, name, time, room, professor
   - Red delete (X) button per course
  
**Time:** 2-3 minutes

### 🎯 What to show on screen:

#### **SAVING:**

1. **Save Schedule Bar** (sticky at bottom)
   - Label: "💾 Save Schedule as:"
   - **Schedule Name Input** (rounded pill-shaped, placeholder: "Enter schedule name")
   - **Units Display** (info box): "Units: 15 / 21 (Regular)"
     - Shows current vs. required units
     - Status badge: 🟢 "Regular" or 🟡 "Irregular"
   - 🟢 **SAVE** button (bright green, pill-shaped, with save icon)

2. **Unit Status Indicator**
   - 🟢 **Regular**: Units meet standard requirement (e.g., 15-21 units)
   - 🟡 **Irregular**: Units are below/above standard (e.g., <15 or >21)
   - Helps students understand academic standing

### 🎬 Demo Steps (Saving):

1. **Name the Schedule**:
   - Click schedule name input field
   - Type: `BSCS Year 2 Sem 1 - Option A`

2. **Review Unit Status**:
   - Point to units display: "Units: 18 / 21 (Regular)"
   - Explain: "Student is a regular student (within unit range)"
  
**Time:** 3-4 minutes

### 🎯 What to show on screen:

1. **Select Schedule Panel** (left sidebar)
   - Title: "📋 Select Schedule"
   - List of all user's saved schedules as clickable items
   - Each item shows: schedule name, unit count, status badge
   - Currently selected schedule is highlighted/active
   - Example:
     ```
     ✓ BSCS Year 2 Sem 1 - Option A (18 units)
       Spring 2024 Backup (15 units)
       Summer Plan (21 units)
     ```

2. **Generate Button**
   - 🟢 **Generate Schedule** button (bright green, centered)
   - Positioned below the schedule list

3. **Timetable Grid** (after generation)
   - **Grid Layout**:
     - **Vertical axis (left)**: Time labels 7 AM → 8 PM (in 1-hour increments)
     - **Horizontal axis (top)**: Days MON, TUE, WED, THU, FRI, SAT
     - **Grid cells**: Light grey background, borders define time slots
     
**Time:** 1-2 minutes

### 🎯 What to show on screen:

1. **OPTIONS Panel**
   - Title: "⚙️ OPTIONS"
   - Two-column checkbox layout for granular control

2. **Checkbox Options** (2 columns):
   
   **Left Column** | **Right Column**
   ---|---
   ☐ Hide Professor | ☐ Hide Time
   ☐ Hide Subject Code | ☐ Hide Day
   ☐ Hide Subject Name | ☐ Hide Room

3. **Live Update**
   - Any checkbox change instantly updates the timetable blocks
   - No "Apply" button needed — real-time rendering

### 🎬 Demo Steps:
  
**Time:** 2-3 minutes

### 🎯 What to show on screen:

1. **Block Color Customization**
   - **Label**: "🎨 Custom Block Color"
   - **Color picker input** (HTML5 `<input type="color">`)
   - **Hex code display** next to picker (e.g., `#3B82F6`)
   - Default: Some professional color (e.g., blue)

2. **Font Color Customization**
   - **Label**: "🔤 Custom Font Color"
   - **Color picker input** (HTML5 `<input type="color">`)
   - **Hex code display** next to picker (e.g., `#FFFFFF`)
   - Default: White or dark color for contrast

3. **Live Preview**  
**Time:** 1-2 minutes

### 🎯 What to show on screen:

1. **Export Button**
   - 🟢 **Save as PNG** button (bright green, pill-shaped)
   - Positioned below or near the timetable grid
   - Only visible/enabled after a schedule is generated

2. **Export Process**
   - Uses `html2canvas` library to capture timetable grid
   - Converts rendered timetable → PNG image file
   - Automatic download to user's device

3. **File Output**
   - Downloaded `.png` file with auto-generated name
   - Example: `schedule_20240527.png` or `timetable.png`
   - Includes: Grid, time labels, day labels, all course blocks, colors

### 🎬 Demo Steps:

1. **Show Export Button**:
   - Point to 🟢 **Save as PNG** button
   - Explain: "This converts the timetable to an image file"

2. **Click Save as PNG**:
   - Click the button
   - ⏳ Brief processing (2-3 seconds, depending on browser)
   - 📥 Automatic download starts
   - Browser shows download notification

3. **Verify Downloaded File**:
   - Point to download notification/folder
   - Show: PNG file created with timetable image
   - Example: `schedule_20240527.png`

4. **Show Use Cases**:
   - Explain: "Students can now:"
     - Share with classmates
     - Print for reference
     - Email to advisor
     - Post on social media
     - Keep as personal record

5. **Open Downloaded Image** (optional):
   - Open the PNG file in image viewer
   - Show: High-quality timetable with all customizations applied
   - Colors, text, information all preserved
   - Professional appearance suitable for sharing

### ✨ Key Visual Features:
- **Screenshot-quality output** — clean, sharp PNG image
- **Customizations preserved** — colors, hidden/shown fields all reflected
- **No watermarks** — pure timetable image
- **Resolution-aware** — rendered at screen resolution or higher

### 🔑 Key Features Highlighted:
- **Shareable format** — PNG works everywhere
- **Easy distribution** — email, messaging, social media
- **Print-ready** — can be printed at any size
- **Professional output** — suitable for academic/professional contexts
- **One-click export** — simple, no configuration needed

> [!TIP]
> **Pro Tip**: Students should hide unnecessary fields (Step 11) BEFORE exporting for the cleanest image!
   - Pick a color from palette (e.g., purple, green, pink)
   - Click to select
   - 🔄 **Timetable updates instantly**
   - All course blocks change to new color
   - Hex code shows: e.g., `#8B5CF6`

4. **Open Font Color Picker**:
   - Click "🔤 Custom Font Color" input
   - 🎨 Color picker opens
   - Current color is selected

5. **Select Contrasting Font Color**:
   - If block is dark, pick light font (e.g., white)
   - If block is light, pick dark font (e.g., black)
   - 🔄 **Text in blocks updates instantly**
   - Example: Purple blocks `#8B5CF6` with white text `#FFFFFF`

6. **Try Multiple Combinations**:
   - Change block color again (e.g., yellow `#FBBF24`)
   - Change font color to black `#000000`
   - Point out: "Now you can customize the schedule to match your preferences"

### ✨ Key Visual Features:
- **Native color picker** — familiar, browser-standard interface
- **Hex code display** — for precise color reference
- **Real-time preview** — changes apply instantly
- **Contrast awareness** — good color combinations are visible

### 🔑 Key Features Highlighted:
- **Full personalization** — customize to brand colors, preferences
- **Accessibility control** — ensure text is readable
- **Professional branding** — match schedule to personal/school colors
- **Export flexibility** — save customized schedule as PNG
   - Course block now shows: Code, Name, Time, Room (no professor)
   - Explain: "Useful if you only need to see what class and when"

3. **Hide Time**:
   - Check: ☑️ Hide Time
   - 🔄 Another instant update
   - Course block now shows: Code, Name, Professor, Room (no time)
   - Explain: "Time is already shown by block position"

4. **Hide Subject Code**:
   - Check: ☑️ Hide Subject Code
   - Course block now shows: Name, Professor, Room (no code)

5. **Clean Minimal View**:
   - Check: ☑️ Hide Professor, ☑️ Hide Time, ☑️ Hide Day
   - Course block now shows minimal info: Code, Name, Room
   - Explain: "Great for a clean, minimalist screenshot"

6. **Reset to Full View** (optional):
   - Uncheck all options
   - 🔄 All details return

### ✨ Key Visual Features:
- **Real-time updates** — no page reload needed
- **Independent toggles** — any combination of options
- **Visual feedback** — blocks update as checkboxes change
- **Helpful descriptions** — explain why each option exists

### 🔑 Key Features Highlighted:
- **Customizable view** — student controls information density
- **Screenshot optimization** — create clean images for sharing
- **Print-ready views** — hide unnecessary details for print
- **Minimal configuration** — simple checkbox interface
### 🎬 Demo Steps:

1. **Open Plotter Page**:
   - Navigate to Schedule Plotter from Home or nav
   - Show left sidebar with saved schedules list

2. **Select a Schedule**:
   - Click on a saved schedule from the list
   - Schedule highlights (visual feedback)
   - Example: "BSCS Year 2 Sem 1 - Option A"

3. **Generate the Timetable**:
   - Click 🟢 **Generate Schedule** button
   - ⏳ Brief loading animation (if applicable)
   - 🎨 Timetable grid renders with:
     - Time axis (7 AM - 8 PM)
     - Day columns (MON - SAT)
     - Colored course blocks positioned correctly

4. **Inspect a Course Block**:
   - Point to a course block in the grid
   - Show all details inside block:
     - "CS402" (code)
     - "Advanced Data Structures" (name)
     - "Dr. Smith" (professor)
     - "08:00 - 10:00" (time)
     - "CL1" (room)

5. **Show Block Positioning**:
   - Point out: Monday column, 8 AM row
   - Explain: "Block height = class duration (2 hours here)"
   - Show how blocks adjust for different start times

6. **Multiple Courses Example** (if schedule has them):
   - Point to multiple courses on the same day
   - Show: "All classes visible, no conflicts"

### ✨ Key Visual Features:
- **Color-coded blocks** — visual distinction per course
- **Time-accurate positioning** — blocks reflect real schedule times
- **Clean grid layout** — professional, calendar-like appearance
- **Information density** — all details visible at a glance
- **Proportional height** — block height = duration

### 🔑 Key Features Highlighted:
- **Visual translation** — turn list of courses into calendar view
- **Conflict detection** — visually see overlaps (if any)
- **Professional output** — export-ready appearance
- **Quick generation** — instant visualization after selection
1. **Select Schedule to Delete** (optional if showing previous):
   - Click schedule dropdown
   - Select a schedule to delete

2. **Click DELETE Button**:
   - Red **DELETE** button is now visible
   - Click it

3. **Show Confirmation Modal**:
   - ⚠️ **Warning modal**: "Delete this schedule?"
   - Message: "This action cannot be undone."
   - Two buttons: 🔴 **Delete** (red/destructive) | ⭕ **Cancel** (grey/safe)

4. **Confirm Deletion**:
   - Click 🔴 **Delete** button
   - ✅ Modal closes
   - 🗑️ Schedule is removed from dropdown
   - Explain: "Schedule is now permanently deleted"

### ✨ Key Visual Features:
- **Pill-shaped inputs** — modern design pattern
- **Status badges** — color-coded unit compliance
- **Confirmation modals** — prevents accidental deletion
- **Success feedback** — confirms action completed
- **Sticky positioning** — always accessible at bottom of page

### 🔑 Key Features Highlighted:
- **Smart saving** — update existing or create new
- **Unit validation** — helps students stay on track
- **Academic tracking** — regular vs. irregular indicator
- **Data safety** — confirmation before destructive action
- **Persistence** — schedules saved to database (survives page reload)
   - Show units update in real-time: "Units: 12 / 21"

4. **Switch Back to First Schedule**:
   - Click schedule dropdown
   - Select: "Schedule 1" (or whatever the first was named)
   - 🔄 Courses switch back to original selection
   - Unit counter updates: "Units: 6 / 21"
   - Explain: "All schedules are saved independently"

5. **Save Schedule** (covered in Step 9):
   - Point to "Save Schedule" section at bottom
   - (Will demo actual save in next step)

### ✨ Key Visual Features:
- **Dropdown workflow** — quick schedule switching
- **Unit counter** — real-time feedback
- **Color status** — visual indication of unit compliance
- **Course cards** — consistent design across all sections

### 🔑 Key Features Highlighted:
- **Multiple draft support** — work on multiple schedules simultaneously
- **No data loss** — switching preserves all data
- **Comparison workflow** — try different course combinations
- **Independent storage** — each schedule is its own record

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
**Time:** 2-3 minutes

### 🎯 What to show on screen:

1. **Profile Information Panel** (left column)
   - Title: "👤 Profile Information"
   
   - **Username Row**:
     - 👤 Icon
     - Read-only text input: "jane_doe" (or current username)
     - ✏️ Edit button (pencil icon)
   
   - **Email Row**:
     - 📧 Icon
     - Read-only text input: "jane@example.com" (or current email)
     - ✏️ Edit button (pencil icon)
   
   - **Password Row**:
     - 🔒 Icon
     - Masked input with dots: "••••••••"
     - 👁️ Show/Hide toggle (eye icon on right)
     - ✏️ Edit button (pencil icon)

2. **Edit State**
   - Clicking pencil button enables the input field
   - Field changes from grey (disabled) to white/active
   - Save and Cancel buttons appear

### 🎬 Demo Steps:

1. **Show Profile Data**:
   - Point to all three rows (Username, Email, Password)
   - Explain: "Read-only by default for security"

2. **Edit Username**:
   - Click pencil icon next to Username
   - Input field becomes editable (white background)
   - Select all text and change it: "jane_doe_2024"
   - 💾 Save button appears
   - Click Save
   - ✅ **Success modal**: "Username updated!"
   - Field returns to read-only state

3. **Edit Email** (optional):
   - Click pencil icon next to Email
   - Clear field and type: "jane.doe.new@example.com"
   - Click Save
   - ✅ **Confirmation modal**: "Check your email to confirm this change"

4. **Show/Hide Password**:
   - Click 👁️ eye icon next to password field
   - Password dots change to visible characters: "SecurePass123!"
   - Click 👁️ again
   - Password returns to masked: "••••••••"
   - Explain: "Eye toggle lets you verify your password"

5. **Edit Password**:
   - Click pencil icon next to Password
   - Field becomes active and ready for input
   - (Don't actually change in demo, just show the interface)
   - Click Cancel to close without saving

### ✨ Key Visual Features:
- **Icon coding** — quick visual identification of each field
- **Disabled state** — grey input shows read-only status
- **Eye toggle** — familiar password visibility control
- **Pencil icon pattern** — standard edit affordance
- **Modal feedback** — clear confirmation of changes

### 🔑 Key Features Highlighted:
- **Security first** — fields are read-only by default
- **Granular editing** — edit one field at a time
- **Verification** — email confirmation for critical changes
- **Password masking** — toggle for security + usability

---

## Step 15: Profile — Academic Selection

**Page:** `pages/profile.html`  
**Time:** 2-3 minutes

### 🎯 What to show on screen:

1. **Academic Selection Panel** (right column)
   - Title: "🎓 Academic Selection"
   
   - **Available Courses Dropdown** (labeled "Program")
     - Shows current program: "BSCS" (selected)
     - Options: BSCS, BSIT, BSBA, etc.
   
   - **Select Year Dropdown** (cascades from Program)
     - Disabled until Program is selected
     - Shows current year: "2nd Year" (selected)
     - Options depend on program selection
   
   - **Select Semester Dropdown** (cascades from Year)
     - Disabled until Year is selected
     - Shows current semester: "1st Semester" (selected)
     - Options: 1st Semester, 2nd Semester (or trimester variations)
     
**Time:** 2-3 minutes  
**Access:** Admin accounts only

### 🎯 What to show on screen:

1. **Header**
   - Nav bar with "ADMIN" button visible (only for admin users)
   - Logo/branding

2. **Tabbed Interface** (top of admin panel)
   - Active tabs: **Users** | Programs | Terms | Courses | Professors | Course Slots | Schedules
   - **Users** tab is default/active (highlighted)

3. **Users Tab Content**
   - 🟢 **+ Create User** button (top-right)
   - **Users Table** with columns:
     - **ID**: Unique user identifier (e.g., 1, 2, 3)
     - **Name**: Full name (e.g., "Jane Doe", "John Smith")
     - **Email**: Email address (e.g., "jane@example.com")
     - **Access Role**: "user" or "admin" (displayed as badge)
     - **Assigned Term**: Academic term (e.g.,   
**Time:** 2 minutes

### 🎯 What to show on screen:

1. **Programs Tab**
   - Active tab in tabbed interface
   - 🟢 **+ Create Program** button (top-right)
   - **Programs Table** with columns:
     - **Program ID**: Unique identifier (e.g., 1, 2, 3)
     - **Program Name**: Full name (e.g., "BSCS", "BSIT", "BSBA")
     - **Total Years**: Number of years (e.g., 4, 3, 2)
     - **Semester Type**: "semester" or "trimester"
     - **Standard Units**: Baseline unit load (e.g., 15, 18, 21)
     - **Actions**: Edit and Delete icons
   
   - Example table:
     ```
     ID | Program Name | Years | Semester Ty  
**Time:** 2 minutes

### 🎯 What to show on screen:

1. **Terms Tab**
   - **Program Filter Dropdown** (top-left): "All Programs" or select specific program
   - 🟢 **+ Create Term** button (top-right)
   - **Terms Table** with columns:
     - **Term ID**: Unique identifier (e.g., 1, 2, 3)
     - **Program**: Program name linked (e.g., "BSCS")
     - **Year Level**: 1st Year, 2nd Year, etc.
     - **Semester**: 1st Semester, 2nd Semester (or trimester)
     - **Required Units**: Unit count (e.g., 21, 18, 15)
     - **Actions**: Edit and Delete icons
   
   - Example table:
     ```
     Term ID | Program | Year    | Semester     
**Time:** 2-3 minutes

### 🎯 What to show on screen:

1. **Courses Tab**
   - **Program Dropdown Filter** (top-left): Select program (e.g., "BSCS")
   - **Term Dropdown Filter** (top-center): Cascades based on Program selection
   - 🟢 **+ Create Course** button (top-right)
   - **Courses Table** with columns:
     - **Course Code**: Primary identifier (e.g., "CS402", "CS501")
     - **Course Name**: Full title (e.g., "Advanced Data Structures", "Web Development")
     - **Units**: Unit count (e.g., 3, 4)
     - **Term ID**: Which term this course belongs to
     - **Actions**: Edit and Delete icons
   
   - Example table (filtered to BSCS, 2nd Year, 1st Semester):
     ```
     Code  | Name                      | Units |   
**Time:** 1-2 minutes

### 🎯 What to show on screen:

1. **Professors Tab**
   - **Department Filter Dropdown** (top-left): Filter by department
   - 🟢 **+ Create Professor** button (top-right)
   - **Professors Table** with columns:
     - **ID**: Unique professor identifier (e.g., 1, 2, 3)
     - **Name**: Full name (e.g., "Dr. Smith", "Prof. Johnson")
     - **Department**: Department name (e.g., "Computer Science", "Mathematics", "Business")
     - **Actions**: Edit and Delete icons
   
   - Example table:
     ```
     ID | Name              | Department          | Actions
     1  | Dr. Smith         | Computer Science    |  
**Time:** 3-4 minutes

### 🎯 What to show on screen:

1. **Course Slots Tab** ⭐ **Most Important Admin Feature**
   - **Program Filter Dropdown** (top-left)
   - **Term Filter Dropdown** (cascades after Program)
   - **Course Filter Dropdown** (cascades after Term)
   - 🟢 **+ Create Course Slot** button (top-right)
   - **Course Slots Table** with columns:
     - **ID**: Unique slot identifier (e.g., 1, 2, 3)
     - **Course**: Course code (e.g., "CS402")
     - **Professor**: Professor name (e.g., "Dr. Smith")
     - **Day**: Day of week (MON, TUE, WED, THU, FRI, SAT)
     - **Time Block**: Time range (e.g., "08:00 - 10:00")
     - **Room**: Room code (e.g., "CL1", "WH301", "TBA")
     - **Actions**: Edit and Delete icons
   
   - Example table (BSCS → 2nd Year, 1st Sem → CS402):
     ```
     ID | Course | Professor     | Day | Time      | Room    | Actions
     1  | CS402  | Dr. Smith     | MON | 08-10    
**Time:** 2 minutes

### 🎯 What to show on screen:

1. **Schedules Tab** (Read-Only Admin View)
   - 🟢 **+ Create Schedule** button (disabled or not visible — admin can't directly create)
   - **Schedules Table** (displays all user-created schedules) with columns:
     - **ID**: Schedule identifier (e.g., 1, 2, 3)
     - **User (Name / Email)**: Student who created it (e.g., "Jane Doe / jane@example.com")
     - **Schedule Title**: Name given by student (e.g., "BSCS Year 2 Option A")
     - **Total Units**: Unit count selected (e.g., "18", "21")
     - **Status**: Compliance badge (🟢 Regular | 🟡 Irregular)
     - **Created At**: Timestamp (e.g., "2024-05-27 14:30")
     - **Actions**: Delete (trash) icon only
   
   - Example table:
     ```
     ID | User Name    | Email              | Title                | Units | Status    | Created At        | Actions
     1  | Jane Doe     | jane@example.com   | BSCS Yr 2 Opt A     | 18    | Regular   | 2024-05-27 14:30  | 🗑️
     2  | John Smith   | john@example.com   | BSIT Backup         | 15    | Irregular | 2024-05-26 09:15  | 🗑️
     3  | Maria Garcia | maria@example.com  | Summer Schedule     | 21    | Regular   | 2024-05-25 16:45  | 🗑️
     ```

2. **Read-Only Nature**
   - Admins can **view** all schedules
   - Admins can **delete** schedules (if necessary for cleanup)
   - Admins **cannot edit** schedule contents (students edit their own)
   - Admins **cannot create** schedules (students create their own)

### 🎬 Demo Steps:

1. **Click Schedules Tab**:
   - View all schedules from all users in system

2. **Review Schedule Data**:
   - Point to columns: User, Schedule Title, Units, Status
   - Explain: "This is a system-wide view of what all students have created"

3. **Analyze Unit Status**:
   - Show a Regular schedule: "18 units (within requirement)"
   - Show an Irregular schedule: "15 units (below requirement)"
   - Explain: "Status helps admins monitor student enrollment patterns"

4. **View User Information**:
   - Point to User Name and Email columns
   - Explain: "Admins can see who created each schedule"

5. **Delete a Schedule** (optional, use caution):
   - Click Delete (trash) icon on any row
   - ⚠️ **Confirmation modal**: "Delete this schedule permanently?"
   - Click 🔴 **Delete**
   - ✅ Schedule removed from table
   - Explain: "Used for cleanup or correcting data entry errors"

6. **Explain Use Cases**:
   - Monitoring: "See which programs/terms are popular"
   - Auditing: "Check if unit loads are reasonable"
   - Cleanup: "Remove test/duplicate schedules"
   - Support: "Help students recover deleted schedules"

### ✨ Key Visual Features:
- **User information** — full context per schedule
- **Timestamp tracking** — when each schedule was created/saved
- **Unit and Status** — quick compliance check
- **Delete-only actions** — read-only + limited destructive option

### 🔑 Key Features Highlighted:
- **Monitoring capability** — admins oversee all student activity
- **Data audit trail** — timestamps show when schedules were created
- **System health** — can identify patterns or issues
- **Limited control** — maintains student data integrity (no forced edits)

> [!NOTE]
> **Important Context**: Schedules are **student-created and student-owned**.
> Admins have oversight and cleanup powers, but students remain in control of their schedules.
> There is NO "Edit" action for admins — that prevents accidental data corruption
2. **Apply Term Filter**:
   - Click Term dropdown: Select "2nd Year, 1st Semester"
   - 🔄 Course dropdown populates

3. **Apply Course Filter**:
   - Click Course dropdown: Select "CS402"
   - 🔄 **Table shows slots for CS402**
   - Display three different time slots (different professors, times, rooms)

4. **Review Course Slots**:
   - Point to each row: "This is one schedulable class instance"
   - Explain: "Students will see these 3 options when selecting CS402 in the builder"
   - Show: Day, Time, Professor, Room all vary

5. **Create New Course Slot** (important):
   - Click 🟢 **+ Create Course Slot**
   - Modal opens with fields:
     - **Program**: Pre-select "BSCS"
     - **Term**: Pre-select "2nd Year, 1st Semester"
     - **Course**: Pre-select "CS402"
     - **Professor**: Select "Dr. Martinez" (dropdown)
     - **Day**: Select "Wednesday" (dropdown)
     - **Start Time**: Set "10:00" (time picker)
     - **End Time**: Set "12:00" (time picker)
     - **Room**: Type "LAB2" (input)
     - 💾 **Create**
   - ✅ New slot appears in table
   - Point out: New row with WED 10-12, LAB2, Dr. Martinez

6. **Show Impact on Student Builder**:
   - Explain: "If we were a student with BSCS 2nd Year enrollment, CS402 in the builder would now show 4 slot options (the original 3 + our new one)"

### ✨ Key Visual Features:
- **Three-level hierarchy** — precise data filtering
- **Time block display** — compact time range format
- **Room coding** — short, memorable room identifiers
- **Professor assignment** — links faculty to specific slots

### 🔑 Key Features Highlighted:
- **Slot creation** — what students see in the builder
- **Multiple sections** — same course, different times/professors
- **Essential data** — without slots, students see no classes
- **Flexibility** — support different schedules, rooms, instructors

> [!CRITICAL]
> **KEY INSIGHT**: Course Slots are the **MOST IMPORTANT** admin data!
> - No Course Slots = No "Available Classes" in student builder
> - Course Slots are what students **actually select** from
> - Every slot represents one schedulable class instance
3. **Create New Professor** (optional):
   - Click 🟢 **+ Create Professor**
   - Modal opens:
     - **Name**: Type "Dr. Lee"
     - **Department**: Select "Computer Science" (dropdown)
     - 💾 **Create**
   - ✅ New professor appears in table

### ✨ Key Visual Features:
- **Simple, flat structure** — just name and department
- **Department filtering** — organize by faculty area
- **Name-based lookup** — used when creating course slots

### 🔑 Key Features Highlighted:
- **Faculty management** — maintain professor roster
- **Department organization** — group faculty by area
- **Reusable data** — professors referenced in Course Slo
### 🎬 Demo Steps:

1. **Apply Program Filter**:
   - Click Program dropdown
   - Select: "BSCS"
   - 🔄 Term dropdown populates with BSCS terms

2. **Apply Term Filter**:
   - Click Term dropdown
   - Select: "2nd Year, 1st Semester"
   - 🔄 **Table updates** to show only courses for that term
   - Point out: CS402, CS403, CS404, MA201 are displayed

3. **Review Course Data**:
   - Point to columns: Code, Name, Units
   - Explain: "These courses will be available for students in this term"

4. **Create New Course** (optional):
   - Click 🟢 **+ Create Course**
   - Modal opens:
     - **Course Code**: Type "CS405"
     - **Course Name**: Type "Mobile Development"
     - **Units**: Type "3"
     - **Term**: Pre-selected "BSCS 2nd Year, 1st Semester"
     - 💾 **Create**
   - ✅ New course appears in table

### ✨ Key Visual Features:
- **Two-level filtering** — Program and Term dropdowns
- **Code-based identification** — course codes are unique, memorable
- **Unit allocation** — clearly shown per course

### 🔑 Key Features Highlighted:
- **Course hierarchy** — organized by Program and Term
- **Unit weighting** — courses have different unit values
- **Granular management** — filter to specific terms for focused work
- **Foundation for slots** — courses are populated with Course Slots next
1. **Click Terms Tab**:
   - View all terms in the system

2. **Apply Program Filter** (optional):
   - Click Program Filter dropdown
   - Select: "BSCS"
   - 🔄 **Table filters** to show only BSCS terms
   - Point out: All displayed terms have Program = "BSCS"

3. **Reset Filter** (optional):
   - Select "All Programs" to show all terms again

4. **Create New Term** (optional):
   - Click 🟢 **+ Create Term**
   - Modal opens:
     - **Program**: Select "BSCS" (dropdown)
     - **Year Level**: Select "3rd Year" (dropdown)
     - **Semester**: Select "1st Semester" (dropdown)
     - **Required Units**: Type "18"
     - 💾 **Create**
   - ✅ New term appears in table

### ✨ Key Visual Features:
- **Cascading structure** — Terms belong to Programs
- **Filter control** — manage large data sets
- **Unit requirements** — varies by year/semester

### 🔑 Key Features Highlighted:
- **Term definition** — combines program + year + semester
- **Required units** — compared against student's selected courses
- **Hierarchical organization** — Programs → Terms → Courses → Slots
   - Point to columns: Program Name, Total Years, Semester Type, Standard Units
   - Explain: "These define the structure of each academic program"

3. **Create New Program** (optional):
   - Click 🟢 **+ Create Program**
   - Modal opens with fields:
     - **Program Name**: Type "BSGE" (Engineering)
     - **Total Years**: Type "4"
     - **Semester Type**: Select "semester" (dropdown)
     - **Standard Units**: Type "18"
     - 💾 **Create**
   - ✅ New program added to table

4. **Edit Program** (optional):
   - Click Edit on a program row
   - Modify **Standard Units** (e.g., 18 → 20)
   - Click Save
   - ✅ Table updates

### ✨ Key Visual Features:
- **Structured data** — clear relationships between fields
- **Numeric inputs** — years and units are quantifiable
- **Standard units** — used for unit validation in builder

### 🔑 Key Features Highlighted:
- **Program hierarchy** — foundation for terms and courses
- **Semester vs. trimester** — flexibility for different academic calendars
- **Standard units** — affects regular/irregular student classification
1. **Access Admin Dashboard**:
   - Use admin account to login
   - 🔄 Automatically redirected to `admin/admin.html`
   - Show navigation: "Admin" button in header
   - Show tabbed interface at top

2. **View Users Table**:
   - Point to Users tab (active)
   - Show existing users in table
   - Point out columns: ID, Name, Email, Role, Term

3. **Create New User**:
   - Click 🟢 **+ Create User** button
   - ✅ **Modal opens**: "Create New User"
   - Form fields appear:
     - **Name**: Type "Alice Brown"
     - **Email**: Type "alice@example.com"
     - **Password**: Type "TempPass123!"
     - **Role**: Select "user" (dropdown: user | admin)
     - **Assigned Term**: Select academic term (cascading dropdowns)
     - 💾 **Create** button (blue)
   - Click Create
   - ✅ **Success modal**: "User created successfully"
   - New user appears in table

4. **Edit Existing User** (optional):
   - Click Edit (pencil) icon on any row
   - ✅ **Modal opens**: "Edit User"
   - Modify a field (e.g., change role to "admin")
   - Click Save
   - ✅ Table updates with new value

5. **Delete User** (optional):
   - Click Delete (trash) icon on any row
   - ⚠️ **Confirmation modal**: "Delete this user permanently?"
   - Click 🔴 **Delete**
   - ✅ User removed from table

### ✨ Key Visual Features:
- **Tab-based navigation** — organize multiple data views
- **CRUD buttons** — Create, Edit, Delete actions clear
- **Modal forms** — focused data entry
- **Table layout** — efficient data presentation
- **Confirmation dialogs** — prevent accidental deletion

### 🔑 Key Features Highlighted:
- **User management** — create, edit, delete accounts
- **Role assignment** — control admin vs. regular user access
- **Term assignment** — connect user to academic enrollment
- **Admin-only access** — security restricted to admin accounts
   - Click Program dropdown
   - 📂 Shows options: BSCS (current), BSIT, BSBA
   - Select: `BSIT` (Bachelor of Science in Information Technology)
   - 🔄 Year Level dropdown clears and resets (cascading behavior)

3. **Select New Year**:
   - Click Year Level dropdown
   - 📂 Shows: 1st Year, 2nd Year, 3rd Year, 4th Year
   - Select: `3rd Year`
   - 🔄 Semester dropdown resets

4. **Select Semester**:
   - Click Semester dropdown
  🎬 Complete Feature Showcase Summary

## Presentation Flow (Recommended)

### **Total Time: ~20 minutes for full walkthrough**

### **Suggested Segments:**

#### **Segment 1: Authentication & Onboarding** (4-5 min)
- Steps 1-4: Login → Sign Up → Forgot Password → Setup
- **Talk Track**: "Show how students get started and set up their academic profile"

#### **Segment 2: Core Student Features** (8-10 min)
- Steps 5-13: Home → Builder → Plotter
- **Talk Track**: "Demonstrate the main value: selecting classes and visualizing your schedule"
- **Include**: Browse, add irregular courses, manage multiple schedules, save, view plot, customize colors, export

#### **Segment 3: Student Account Management** (2-3 min)
- Steps 14-15: Profile page
- **Talk Track**: "Students can manage their account and change academic enrollment anytime"

#### **Segment 4: Admin Control Panel** (4-5 min)
- Steps 16-22: Admin dashboard tabs
- **Talk Track**: "Behind the scenes: how admins set up programs, courses, slots, and monitor usage"
- **Focus**: Users, Courses, Course Slots (most important), Schedules overview

---

## 🎯 Key Points to Emphasize During Demo

### **Student Perspective:**
✅ **Easy navigation** — Home → Builder → Plotter is intuitive  
✅ **Visual scheduling** — See schedule in real-time as you add courses  
✅ **Flexibility** — Try multiple schedules, switch programs anytime  
✅ **Export capability** — Share schedules as PNG images  
✅ **Irregular support** — Manually add courses outside official catalog  

### **Admin Perspective:**
✅ **System architecture** — Programs → Terms → Courses → Slots (logical hierarchy)  
✅ **Data control** — Manage all curricula centrally  
✅ **Student monitoring** — View all schedules, track unit loads  
✅ **Flexible customization** — Support different calendar systems (semester/trimester)  

---

## 📸 Screen Demo Checklist

### **Pages to Show:**
- [ ] Login page (dark, modern design)
- [ ] Dashboard home (two feature cards)
- [ ] Schedule Builder with collapsible courses
- [ ] Schedule Plotter with colorful timetable
- [ ] Profile page (edit account + academic selection)
- [ ] Admin dashboard (all 7 tabs)

### **Interactions to Perform:**
- [ ] Add a course from Available Classes
- [ ] Show conflict prevention (try adding same course twice)
- [ ] Switch between multiple schedules
- [ ] Save a schedule with naming
- [ ] Generate and visualize the timetable
- [ ] Customize colors in plotter
- [ ] Export as PNG
- [ ] Create/edit a record in admin (at least Users or Courses)
- [ ] Show cascading dropdowns in filters

### **Performance Tips:**
- **Pre-load data**: Have test accounts and sample schedules ready
- **Use browser DevTools**: Open to show localStorage token (Step 1)
- **Prepare admin data**: Create at least one term with multiple courses and slots
- **Test export**: Verify PNG download works before demo
- **Backup account**: Have a second admin account ready if first one has issues

---

## 🔑 Feature Highlights (Quick Talking Points)

1. **Complete schedule builder** — All classes for term shown with multiple time options per course
2. **Visual timetable** — Automatic layout, proportional block heights, color-coded courses
3. **Export to PNG** — Students can share schedules without screenshots
4. **Irregular course support** — Accommodate non-standard student loadspending
5. **Multiple draft schedules** — Try different course combinations
6. **Admin hierarchy** — Logical data model (Programs → Terms → Courses → Slots)
7. **Role-based access** — Student vs. Admin views completely separate
8. **Real-time updates** — All changes reflect immediately (no page reloads)
9. **Mobile responsive** — Works on phones and tablets
10. **Professional UI** — Modern design with smooth animations

---

## ⚡ Quick Troubleshooting During Demo

| Issue | Solution |
|---|---|
| "No courses showing in builder" | Check: User is enrolled in a term with courses and slots created |
| "Admin button not visible" | Check: Logged in as admin user (role = "admin") |
| "Color picker not working" | Try: Refresh page, use Chrome/Firefox (best supported) |
| "Export PNG fails" | Try: Zoom to 100%, use supported browser, check ad blockers |
| "Dropdown filters empty" | Check: Parent level has data (e.g., Programs exist before Terms) |
| "Schedule won't save" | Check: Network tab in DevTools, confirm API is running |

---2nd Semester
   - Select: `2nd Semester`

5. **Apply New Selection**:
   - Click 🟣 **Apply Selection** button
   - ⏳ Brief loading (API updates backend)
   - ✅ **Success modal**: "Academic selection updated!"
   - Modal shows: "You are now enrolled in: BSIT - 3rd Year, 2nd Semester"

6. **Show Summary**:
   - After modal closes, display section shows new selection
   - 🟠 **Go to Schedule Builder** button is now visible
   - Click it to navigate to builder with new courses available

7. **Builder Update** (optional):
   - Navigate to Schedule Builder
   - Show: Available Classes now reflect BSIT 3rd Year courses
   - Courses from previous selection are no longer available
   - New courses appear for new term

### ✨ Key Visual Features:
- **Cascading dropdowns** — intelligent field activation (like Step 4)
- **Color coding** — purple for apply action, orange for next action
- **Summary display** — clear confirmation of selection
- **Linked navigation** — seamless flow to builder

### 🔑 Key Features Highlighted:
- **On-demand switching** — change enrollment anytime
- **Cascading logic** — dependent field activation
- **Confirmation feedback** — clear success messages
- **Integrated workflow** — direct path to Schedule Builder
- **Real-time updates** — builder courses update immediately

---

## Step 16: Admin Dashboard — Users

**Page:** `admin/admin.html` → **Users** tab

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

**Page:** `admin/admin.html` → **Programs** tab

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

**Page:** `admin/admin.html` → **Terms** tab

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

**Page:** `admin/admin.html` → **Courses** tab

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

**Page:** `admin/admin.html` → **Professors** tab

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

**Page:** `admin/admin.html` → **Course Slots** tab

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

**Page:** `admin/admin.html` → **Schedules** tab

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
    │       ├─▶ [Admin] ──────────────────▶ Admin Dashboard (admin/admin.html)
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
