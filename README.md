# 📅 Personal Timesheet App

> Static web app for personal time tracking with multi-shift support and Excel export.
> Deployed on GitHub Pages.

## 🎯 Project Overview

**Created:** 2026-02-27  
**Status:** In Development  
**Deploy:** GitHub Pages (static SPA)

### Key Features

- ✅ Monthly calendar view with multi-shift per day
- ✅ Day drawer for quick shift entry
- ✅ Shift templates & settings
- ✅ Excel export (.xlsx) with 2 sheets
- ✅ PWA offline support
- ✅ No backend required (IndexedDB + localStorage)

### Tech Stack

- **Framework:** React 18 + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand (lightweight)
- **Storage:** IndexedDB (Dexie.js)
- **Export:** SheetJS (xlsx)
- **Date:** date-fns
- **Icons:** Lucide React
- **Deploy:** GitHub Pages + GitHub Actions

---

## 📁 Project Structure

```
timesheet-app/
├── public/                 # Static assets
├── src/
│   ├── components/         # UI components
│   │   ├── ui/            # shadcn/ui primitives
│   │   ├── Calendar.tsx   # Month calendar grid
│   │   ├── DayDrawer.tsx  # Shift entry drawer
│   │   ├── ShiftCard.tsx  # Individual shift display
│   │   └── ...
│   ├── lib/
│   │   ├── db.ts          # Dexie IndexedDB setup
│   │   ├── excel.ts       # Excel export logic
│   │   ├── utils.ts       # Helpers
│   │   └── validation.ts  # Shift validation
│   ├── stores/            # Zustand stores
│   │   ├── shifts.ts      # Shift data store
│   │   └── settings.ts    # App settings
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app
│   └── main.tsx           # Entry point
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Pages deployment
├── vite.config.ts
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🎨 Design System

### Colors (Tailwind config)

```js
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',  // cyan-500
    600: '#0284c7',
    700: '#0369a1',
  },
  accent: {
    500: '#a855f7',  // purple-500
  },
  neutral: {
    50: '#fafafa',
    800: '#262626',
    900: '#171717',
  }
}
```

### Typography

- **Font:** Inter (from Google Fonts)
- **Sizes:** text-sm (default), text-base (body), text-lg (headers)

### Component Style

- **Vibe:** Clean, minimal, SaaS-style (Linear/Notion inspired)
- **Spacing:** Generous whitespace, 4/8/16px grid
- **Borders:** Subtle (border-neutral-200 dark:border-neutral-800)
- **Shadows:** Soft (shadow-sm for cards)
- **Animations:** Smooth transitions (duration-200)

---

## 📊 Data Models

### Shift

```typescript
interface Shift {
  id: string;                    // UUID
  date: string;                  // YYYY-MM-DD
  start: string;                 // HH:mm
  end: string;                   // HH:mm
  breakMinutes: number;          // Minutes
  type: 'normal' | 'ot' | 'night' | 'leave' | 'training' | 'travel';
  project?: string;
  location?: string;
  note?: string;
  tags: string[];                // Color tags for visual grouping
  createdAt: number;             // Timestamp
  updatedAt: number;
}
```

### MonthRecord

```typescript
interface MonthRecord {
  id: string;                    // YYYY-MM
  month: string;                 // YYYY-MM
  shifts: Shift[];
  holidays: string[];            // [YYYY-MM-DD]
  isLocked: boolean;             // Prevent edits after month close
  settingsSnapshot?: Settings;   // Settings at time of lock
}
```

### Settings

```typescript
interface Settings {
  workWeek: number[];            // [1,2,3,4,5] (Mon-Fri)
  roundingMinutes: 5 | 10 | 15;
  autoBreak: {
    enabled: boolean;
    afterHours: number;          // Add break if shift > X hours
    minutes: number;
  };
  otRule: {
    enabled: boolean;
    afterTime: string;           // HH:mm (e.g., "18:00")
  };
  templates: ShiftTemplate[];
  excelColumns: {
    project: boolean;
    location: boolean;
    note: boolean;
    tags: boolean;
  };
}
```

### ShiftTemplate

```typescript
interface ShiftTemplate {
  id: string;
  name: string;
  shifts: Omit<Shift, 'id' | 'date' | 'createdAt' | 'updatedAt'>[];
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Setup & Core UI (Day 1)

- [ ] Init Vite + React + TypeScript
- [ ] Setup Tailwind + shadcn/ui
- [ ] Install dependencies (dexie, xlsx, date-fns, zustand)
- [ ] Create folder structure
- [ ] Setup Dexie database schema
- [ ] Create basic layout (header + main + sidebar)
- [ ] Implement month selector (prev/next buttons)

### Phase 2: Calendar & Day Drawer (Day 2-3)

- [ ] Calendar grid component
  - [ ] Render days of month
  - [ ] Show shift summary per day (total hours, badge, shift count)
  - [ ] Click to open Day Drawer
  - [ ] Highlight today, weekends, holidays
- [ ] Day Drawer component
  - [ ] List shifts for selected day (sortable)
  - [ ] Add/edit/delete shift form
  - [ ] Time picker (HH:mm input)
  - [ ] Shift type selector
  - [ ] Break input
  - [ ] Validation (overlap, end < start, >16h warning)
  - [ ] Quick actions: duplicate shift, apply template

### Phase 3: Data & State Management (Day 3-4)

- [ ] Zustand store for shifts
  - [ ] Load shifts from IndexedDB
  - [ ] CRUD operations (create, update, delete)
  - [ ] Filter by month
  - [ ] Calculate totals (hours, OT, days worked)
- [ ] Zustand store for settings
  - [ ] Load/save settings
  - [ ] Templates CRUD
- [ ] IndexedDB operations (Dexie)
  - [ ] Save/load shifts
  - [ ] Save/load settings
  - [ ] Export/import backup (JSON)

### Phase 4: Templates & Settings (Day 4)

- [ ] Templates page
  - [ ] List templates
  - [ ] Create/edit/delete template
  - [ ] Preview template shifts
- [ ] Settings page
  - [ ] Rounding options
  - [ ] Auto break settings
  - [ ] OT rules
  - [ ] Work week config
  - [ ] Excel column toggles

### Phase 5: Summary & Stats (Day 5)

- [ ] Sidebar stats
  - [ ] Total hours this month
  - [ ] Total OT
  - [ ] Working days
  - [ ] Shift count
  - [ ] Weekly breakdown
- [ ] Validation warnings
  - [ ] Missing check-out
  - [ ] Overlapping shifts
  - [ ] Shifts > 12h
  - [ ] Days > 16h total

### Phase 6: Excel Export (Day 5-6)

- [ ] Export logic (SheetJS)
  - [ ] Sheet 1: Timesheet (shift list)
    - [ ] Columns: Date | Day | Shift# | Start | End | Break | Hours | Type | Project | Note
    - [ ] Format dates (DD/MM/YYYY)
    - [ ] Format times (HH:MM)
    - [ ] Bold header + freeze top row
  - [ ] Sheet 2: Summary
    - [ ] Total hours, OT, working days, shift count
    - [ ] Weekly totals (W1-W5)
    - [ ] Type breakdown (normal/OT/night/etc.)
  - [ ] Auto column width
- [ ] Export button with month selector

### Phase 7: PWA & Offline (Day 6)

- [ ] Add manifest.json
- [ ] Service worker for offline caching
- [ ] Add to Home Screen prompt
- [ ] Offline indicator

### Phase 8: GitHub Pages Deploy (Day 7)

- [ ] Configure Vite base path
- [ ] Create GitHub Actions workflow
  - [ ] Build on push to main
  - [ ] Deploy to gh-pages branch
- [ ] Test deployment
- [ ] Update README with live URL

### Phase 9: Polish & Nice-to-haves (Day 7-8)

- [ ] Backup/restore (download/upload JSON)
- [ ] Month lock feature
- [ ] Charts (bar chart hours/week, pie chart shift types)
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts (N = new shift, E = export, etc.)
- [ ] Mobile optimization (touch gestures, drawer UX)

---

## 🎯 Acceptance Criteria

### Core Features

- ✅ User can add multiple shifts per day
- ✅ User can view monthly calendar with shift summaries
- ✅ User can edit/delete existing shifts
- ✅ System validates shift times (no overlap, end > start)
- ✅ User can export to Excel with 2 sheets (Timesheet + Summary)
- ✅ App works offline (PWA)
- ✅ Data persists across sessions (IndexedDB)

### UI/UX

- ✅ Calendar grid shows shift info at a glance
- ✅ Day drawer opens smoothly, allows quick entry
- ✅ Mobile-friendly (responsive, drawer UX works on phone)
- ✅ Loading states for async operations
- ✅ Success/error toasts for user feedback

### Performance

- ✅ Initial load < 2s
- ✅ Calendar render < 100ms
- ✅ Excel export < 1s for 1 month of data
- ✅ Smooth 60fps animations

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7",
    "xlsx": "^0.18.5",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🚀 Quick Start (Development)

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Notes

- **No backend:** All data stored client-side (IndexedDB)
- **Privacy:** Data never leaves user's device
- **Portability:** Export JSON backup to migrate data
- **Browser support:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🎨 Design References

- **Calendar:** Google Calendar, Notion Calendar
- **Drawer:** Linear side panel
- **Overall vibe:** Substack, Linear, Notion

---

**Next steps:** Setup Vite scaffold and start implementing Phase 1! 🚀
