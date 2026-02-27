# Product Requirements Document (PRD)

## Personal Timesheet App

**Version:** 1.0  
**Date:** 2026-02-27  
**Owner:** Em (OpenClaw Agent)  
**Status:** Draft → Ready for Implementation

---

## 1. Executive Summary

### Problem

Cá nhân cần tracking giờ công linh hoạt (nhiều ca/ngày, OT, các loại shift khác nhau) và export Excel để báo cáo kế toán/quản lý, nhưng:
- Apps hiện tại: phức tạp, cần đăng ký, tính phí
- Excel thủ công: chậm, dễ sai sót, không tiện trên mobile

### Solution

Static web app (GitHub Pages) cho phép:
- ✅ Tracking nhanh nhiều ca/ngày
- ✅ Calendar view trực quan
- ✅ Export Excel chuẩn
- ✅ Offline-first (PWA)
- ✅ No backend (privacy + miễn phí mãi mãi)

### Success Metrics

- Time to add shift: < 10 seconds
- Export Excel: < 1 second
- Mobile usability score: > 90/100
- PWA installable: Yes
- Data privacy: 100% client-side

---

## 2. User Personas

### Primary: Freelancer / Contractor

- **Need:** Track billable hours for multiple clients
- **Pain:** Excel sucks, apps cost money or leak data
- **Behavior:** Check calendar daily, export monthly

### Secondary: Employee with OT

- **Need:** Track regular + OT shifts for payroll
- **Pain:** Company system doesn't support multi-shift/day
- **Behavior:** Add shifts daily, export end-of-month

---

## 3. User Stories

### Epic 1: Shift Management

**US-1.1:** As a user, I can add multiple shifts to a single day, so I can track morning + afternoon + OT separately.

**Acceptance Criteria:**
- [ ] Day drawer shows list of existing shifts
- [ ] "Add shift" button creates new shift form
- [ ] Each shift has: start, end, break, type, notes
- [ ] System validates: end > start, no overlap
- [ ] Shifts displayed in chronological order

**US-1.2:** As a user, I can duplicate yesterday's shifts to today, so I don't re-type recurring schedules.

**Acceptance Criteria:**
- [ ] "Duplicate from yesterday" button in day drawer
- [ ] Copies all shifts from previous day
- [ ] Updates date to today
- [ ] Preserves type, break, project, note

**US-1.3:** As a user, I can apply a shift template (e.g., "Office 9-6"), so I save time on common schedules.

**Acceptance Criteria:**
- [ ] Template selector in day drawer
- [ ] Dropdown shows saved templates
- [ ] Applying template adds pre-configured shift(s)
- [ ] User can edit after applying

---

### Epic 2: Calendar View

**US-2.1:** As a user, I see a monthly calendar with shift summaries, so I get an overview at a glance.

**Acceptance Criteria:**
- [ ] Calendar shows current month (grid layout)
- [ ] Each day cell shows:
  - Total hours (e.g., "8h30")
  - Badge (Work / Off / Leave / Holiday)
  - Shift count (e.g., "2 shifts")
  - Warning icon if errors (overlap, >16h, etc.)
- [ ] Click day opens Day Drawer

**US-2.2:** As a user, I can navigate between months, so I can review past or plan future shifts.

**Acceptance Criteria:**
- [ ] Header shows "← MM/YYYY →"
- [ ] Click arrows changes month
- [ ] Calendar updates immediately
- [ ] URL updates (e.g., /?month=2026-02) for bookmarking

---

### Epic 3: Excel Export

**US-3.1:** As a user, I can export the current month to Excel, so I can submit to accounting or archive.

**Acceptance Criteria:**
- [ ] "Export Excel" button in header
- [ ] Downloads `.xlsx` file (filename: `Timesheet_YYYY-MM.xlsx`)
- [ ] Sheet 1 "Timesheet": one row per shift
  - Columns: Date | Day | Shift# | Start | End | Break | Hours | Type | Project | Note
- [ ] Sheet 2 "Summary": aggregated stats
  - Total hours, OT, working days, shift count
  - Weekly breakdown (W1-W5)
  - Type breakdown (normal/OT/night/etc.)
- [ ] Export completes in < 1 second for 1 month

**US-3.2:** As a user, I can choose which columns appear in Excel, so I avoid clutter when fields are unused.

**Acceptance Criteria:**
- [ ] Settings page has "Excel Columns" section
- [ ] Checkboxes: Project, Location, Note, Tags
- [ ] Export honors settings
- [ ] Changes persist across sessions

---

### Epic 4: Templates & Settings

**US-4.1:** As a user, I can save shift templates, so I quickly apply common schedules.

**Acceptance Criteria:**
- [ ] Templates page lists saved templates
- [ ] "New Template" button opens form
- [ ] Template includes: name, shift list (start/end/break/type)
- [ ] Can edit/delete templates
- [ ] Templates stored in IndexedDB

**US-4.2:** As a user, I can configure calculation rules (rounding, auto-break, OT threshold), so the app matches my workflow.

**Acceptance Criteria:**
- [ ] Settings page has sections:
  - Rounding: 5/10/15 minutes
  - Auto-break: enabled, after X hours, Y minutes break
  - OT rule: after HH:mm counts as OT
  - Work week: checkboxes for Mon-Sun
- [ ] Changes apply immediately to calculations
- [ ] Settings persist across sessions

---

### Epic 5: Offline & PWA

**US-5.1:** As a user, I can use the app offline, so I'm not blocked by internet issues.

**Acceptance Criteria:**
- [ ] App loads from cache when offline
- [ ] Can add/edit/delete shifts offline
- [ ] Changes sync to IndexedDB immediately
- [ ] "Offline" indicator in UI when no connection

**US-5.2:** As a user, I can install the app to my home screen, so it feels like a native app.

**Acceptance Criteria:**
- [ ] PWA manifest configured
- [ ] Service worker registered
- [ ] Browser shows "Add to Home Screen" prompt
- [ ] Installed app has custom icon + splash screen

---

### Epic 6: Data Backup

**US-6.1:** As a user, I can export all my data (JSON backup), so I can migrate to a new device or restore.

**Acceptance Criteria:**
- [ ] Settings has "Backup & Restore" section
- [ ] "Download Backup" exports `timesheet-backup.json`
- [ ] Backup includes: shifts, settings, templates
- [ ] "Upload Backup" restores from JSON file
- [ ] Confirmation prompt before restore (overwrites existing data)

---

## 4. Functional Requirements

### FR-1: Data Storage

- All data stored client-side in IndexedDB
- No server communication (privacy guarantee)
- Data never leaves user's device unless explicitly exported

### FR-2: Shift Validation

- **Overlap detection:** Warn if new shift overlaps existing shift same day
- **Time sanity:** End time must be after start time
- **Duration warning:** Alert if single shift > 12h or day total > 16h
- **Auto-calculation:** Compute hours = (end - start - break) with rounding

### FR-3: Calculation Rules

- **Rounding:** Round shift duration to nearest 5/10/15 min (user config)
- **Auto-break:** If shift > X hours, auto-add Y minutes break (user config)
- **OT detection:** Shifts starting after configured time (e.g., 18:00) auto-tagged OT

### FR-4: Multi-shift Support

- No limit on shifts per day
- Each shift independent (separate start/end/type/notes)
- Day summary aggregates all shifts

### FR-5: Export Format

**Sheet 1: Timesheet**

| Date | Day | Shift# | Start | End | Break | Hours | Type | Project | Note |
|------|-----|--------|-------|-----|-------|-------|------|---------|------|
| 01/02/2026 | Thu | 1 | 08:00 | 12:00 | 0 | 4.00 | Normal | ClientA | Morning |
| 01/02/2026 | Thu | 2 | 13:30 | 18:00 | 30 | 4.00 | Normal | ClientA | Afternoon |
| 01/02/2026 | Thu | 3 | 19:00 | 21:00 | 0 | 2.00 | OT | ClientA | Evening |

**Sheet 2: Summary**

```
Total Hours: 120.5
Total OT: 15.0
Working Days: 20
Total Shifts: 42

Weekly Breakdown:
W1: 32h
W2: 28h
W3: 30h
W4: 30.5h

Type Breakdown:
Normal: 105.5h
OT: 15h
Night: 0h
```

---

## 5. Non-Functional Requirements

### NFR-1: Performance

- Initial page load: < 2 seconds (3G network)
- Calendar render: < 100ms (for 31-day month with 100 shifts)
- Shift save: < 50ms (IndexedDB write)
- Excel export: < 1 second (1 month, ~60 shifts)
- 60fps UI animations

### NFR-2: Usability

- Mobile-first design (thumb-friendly tap targets)
- Drawer UX smooth on mobile (swipe to close)
- No unnecessary form fields (progressive disclosure)
- Clear error messages (validation feedback)

### NFR-3: Compatibility

- Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Android Chrome 90+
- Screen sizes: 320px (mobile) to 2560px (desktop)

### NFR-4: Accessibility

- Keyboard navigation (Tab, Enter, Escape)
- Screen reader support (ARIA labels)
- Color contrast: WCAG AA minimum
- Focus indicators visible

### NFR-5: Security & Privacy

- No external API calls (except fonts from Google)
- No tracking/analytics (unless user opts in)
- No user accounts (no auth, no passwords)
- Data never sent to server

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Framework | React 18 + Vite | Fast builds, modern DX, HMR |
| UI Kit | Tailwind + shadcn/ui | Beautiful components, fast setup |
| State | Zustand | Lightweight, simple API |
| Storage | IndexedDB (Dexie) | Reliable, supports large data |
| Export | SheetJS (xlsx) | Industry standard, client-side |
| Date | date-fns | Lightweight, tree-shakable |
| Icons | Lucide React | Consistent, customizable |

### 6.2 Data Flow

```
User Action → Zustand Store → IndexedDB → UI Update
                                  ↓
                            (on page load)
                                  ↓
                        Load from IndexedDB → Hydrate Store
```

### 6.3 Folder Structure

```
src/
├── components/
│   ├── ui/              # shadcn primitives
│   ├── Calendar.tsx
│   ├── DayDrawer.tsx
│   ├── ShiftCard.tsx
│   ├── MonthSelector.tsx
│   ├── SummaryStats.tsx
│   └── ...
├── lib/
│   ├── db.ts            # Dexie setup
│   ├── excel.ts         # Export logic
│   ├── calculations.ts  # Hour/OT math
│   ├── validation.ts    # Shift validation
│   └── utils.ts
├── stores/
│   ├── shifts.ts        # Shift CRUD + filters
│   └── settings.ts      # App config
├── types/
│   └── index.ts         # TS interfaces
├── App.tsx
└── main.tsx
```

### 6.4 Deployment

- **Host:** GitHub Pages (gh-pages branch)
- **CI/CD:** GitHub Actions
  - Trigger: Push to `main`
  - Steps: Install → Build → Deploy
- **Base path:** `/timesheet-app/` (configured in Vite)

---

## 7. UI Wireframes

### 7.1 Dashboard (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│  ← 02/2026 →    [+ Add Shift] [Export Excel] [Settings]│
│  120h | 15h OT | 20 days | 42 shifts                    │
├──────────────────────────────────┬──────────────────────┤
│  Calendar Grid                   │  Summary Stats       │
│  ┌─────┬─────┬─────┬─────┐      │  • Week 1: 32h       │
│  │ Mon │ Tue │ Wed │ Thu │      │  • Week 2: 28h       │
│  ├─────┼─────┼─────┼─────┤      │  • Week 3: 30h       │
│  │  1  │  2  │  3  │  4  │      │  • Week 4: 30h       │
│  │ 8h  │ 8h30│ Off │ 10h │      │                      │
│  │ Work│ Work│     │⚠️Work│      │  Type Breakdown:     │
│  │ 2ca │ 3ca │     │ 3ca │      │  • Normal: 105h      │
│  └─────┴─────┴─────┴─────┘      │  • OT: 15h           │
│  ... rest of month ...           │  • Night: 0h         │
└──────────────────────────────────┴──────────────────────┘
```

### 7.2 Day Drawer (Mobile)

```
┌────────────────────────────────┐
│  Thursday, 01/02/2026      [×] │
├────────────────────────────────┤
│  ┌──────────────────────────┐  │
│  │ Shift 1: 08:00 – 12:00  │  │
│  │ 4h | Normal | ClientA    │  │
│  │ [Edit] [Delete]          │  │
│  └──────────────────────────┘  │
│                                │
│  ┌──────────────────────────┐  │
│  │ Shift 2: 13:30 – 18:00  │  │
│  │ 4h | Normal | ClientA    │  │
│  │ Break: 30min             │  │
│  │ [Edit] [Delete]          │  │
│  └──────────────────────────┘  │
│                                │
│  ┌──────────────────────────┐  │
│  │ Shift 3: 19:00 – 21:00  │  │
│  │ 2h | OT | ClientA        │  │
│  │ [Edit] [Delete]          │  │
│  └──────────────────────────┘  │
│                                │
│  [+ Add Shift]                 │
│  [📋 Apply Template ▼]         │
│  [📅 Duplicate from Yesterday] │
│  [🗑️ Clear All Shifts]          │
└────────────────────────────────┘
```

### 7.3 Add/Edit Shift Form

```
┌────────────────────────────────┐
│  Add Shift                  [×]│
├────────────────────────────────┤
│  Start Time   [08:00]    🕒    │
│  End Time     [12:00]    🕒    │
│  Break (min)  [0      ]        │
│  Type         [Normal ▼]       │
│  Project      [ClientA ]       │
│  Location     [Office  ]       │
│  Note         [Morning work]   │
│  Tags         [🟢 Green]       │
│                                │
│  ⚠️ Validation:                 │
│  • Shift overlaps 13:30-18:00  │
│                                │
│  [Cancel]  [Save Shift]        │
└────────────────────────────────┘
```

---

## 8. User Flows

### Flow 1: Add First Shift

1. User opens app (first time)
2. Sees current month calendar (empty)
3. Clicks on today's date
4. Day drawer opens (empty)
5. Clicks "+ Add Shift"
6. Form appears: enters start/end/type
7. Clicks "Save Shift"
8. Shift appears in drawer + calendar updates (shows "4h | Work | 1 shift")
9. Drawer closes automatically

### Flow 2: Apply Template

1. User clicks on a day
2. Day drawer opens
3. Clicks "Apply Template ▼"
4. Dropdown shows: "Office 9-6", "Half Day", "OT Evening"
5. Selects "Office 9-6"
6. Two shifts added: 09:00-12:00, 13:30-18:00
7. Calendar updates (shows "8h | Work | 2 shifts")

### Flow 3: Export Excel

1. User clicks "Export Excel" button
2. System generates .xlsx file
3. Browser downloads `Timesheet_2026-02.xlsx`
4. User opens file, sees:
   - Sheet 1: List of all shifts (formatted table)
   - Sheet 2: Summary stats (totals, weekly breakdown)
5. User sends file to accounting

---

## 9. Edge Cases & Error Handling

### EC-1: Overlapping Shifts

**Scenario:** User adds shift 14:00-16:00 when 13:00-15:00 already exists.

**Handling:**
- Validation error in form: "⚠️ Overlaps with existing shift 13:00-15:00"
- User can:
  - Adjust times to remove overlap
  - Save anyway (warning remains but doesn't block)

### EC-2: End Before Start

**Scenario:** User enters start 18:00, end 17:00.

**Handling:**
- Validation error: "End time must be after start time"
- Save button disabled until fixed

### EC-3: Very Long Shift

**Scenario:** User enters 08:00-23:00 (15 hours).

**Handling:**
- Warning (not error): "⚠️ Shift duration unusual (15h). Confirm?"
- User can save anyway (some jobs have long shifts)

### EC-4: Day > 16 Hours

**Scenario:** User has 3 shifts totaling 18 hours in one day.

**Handling:**
- Calendar shows warning icon (⚠️) on that day
- Summary sidebar lists: "Unusual days: Feb 15 (18h)"
- User can ignore or adjust

### EC-5: Export Empty Month

**Scenario:** User exports month with no shifts.

**Handling:**
- Excel generated with empty Timesheet sheet
- Summary shows all zeros
- No error (valid use case)

### EC-6: Browser Storage Full

**Scenario:** IndexedDB quota exceeded.

**Handling:**
- Show error toast: "Storage full. Please export backup and delete old data."
- Suggest: Delete old months or increase browser storage

---

## 10. Future Enhancements (Out of Scope v1.0)

- **Multi-user support:** Separate workspaces per user (requires auth)
- **Cloud sync:** Sync via GitHub Gist / Dropbox (requires OAuth)
- **Charts:** Visualizations (bar/pie charts for hours breakdown)
- **Recurring shifts:** Auto-populate future shifts based on template
- **Invoice generation:** Export shifts as invoice (with rates)
- **Time tracking widget:** Chrome extension to quick-add shift
- **Integrations:** Export to Google Calendar, Notion, Toggl

---

## 11. Success Criteria (Launch)

- [ ] App deployed to GitHub Pages
- [ ] All Phase 1-8 features implemented
- [ ] Responsive on mobile (tested iPhone SE, Pixel 5)
- [ ] Lighthouse score: Performance > 90, Accessibility > 90
- [ ] No critical bugs (P0/P1)
- [ ] Documentation complete (README + in-app help)
- [ ] Demo video published

---

## 12. Timeline Estimate

| Phase | Tasks | Estimate | Dependencies |
|-------|-------|----------|--------------|
| 1. Setup | Vite scaffold, deps, folder structure | 2h | - |
| 2. Calendar & Drawer | UI components, click handlers | 6h | Phase 1 |
| 3. Data & State | Zustand stores, IndexedDB, CRUD | 4h | Phase 1 |
| 4. Templates & Settings | UI + logic for templates/settings | 3h | Phase 3 |
| 5. Summary & Stats | Calculations, sidebar stats | 2h | Phase 3 |
| 6. Excel Export | SheetJS integration, formatting | 3h | Phase 3 |
| 7. PWA & Offline | Manifest, service worker | 2h | Phase 1-6 |
| 8. Deploy | GitHub Actions, testing | 1h | Phase 7 |
| 9. Polish | Dark mode, charts, UX tweaks | 3h | Phase 8 |

**Total:** ~26 hours (~3-4 days full-time)

---

## 13. Open Questions

1. **Month lock feature:** Should locked months be editable? → Suggest: Allow with confirmation.
2. **Holiday auto-detection:** Should app fetch holidays from API? → Suggest: Manual input only (privacy).
3. **Dark mode:** Auto-detect or manual toggle? → Suggest: Manual toggle + persist preference.
4. **Shift colors:** Should colors be customizable? → Suggest: Pre-defined palette, customizable in v2.

---

**Status:** ✅ PRD Ready for Implementation  
**Next:** Scaffold Vite project + Phase 1 kickoff!
