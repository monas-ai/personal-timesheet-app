// IndexedDB setup using Dexie

import Dexie, { type Table } from 'dexie';
import type { Shift, Settings, MonthRecord } from '../types';

export class TimesheetDB extends Dexie {
  shifts!: Table<Shift, string>;
  settings!: Table<Settings, string>;
  monthRecords!: Table<MonthRecord, string>;

  constructor() {
    super('TimesheetDB');
    
    this.version(1).stores({
      shifts: 'id, date, type, [date+type]',
      settings: 'id',
      monthRecords: 'id, month, isLocked',
    });
  }
}

export const db = new TimesheetDB();

// Initialize default settings if not exists
export async function initializeSettings(): Promise<Settings> {
  const existing = await db.settings.get('default');
  if (existing) return existing;

  const defaultSettings: Settings = {
    workWeek: [1, 2, 3, 4, 5], // Mon-Fri
    roundingMinutes: 15,
    autoBreak: {
      enabled: false,
      afterHours: 6,
      minutes: 30,
    },
    otRule: {
      enabled: true,
      afterTime: '18:00',
    },
    templates: [],
    excelColumns: {
      project: true,
      location: true,
      note: true,
      tags: false,
    },
    salary: {
      enabled: false,
      hourlyRate: 50000, // 50k VND/hour default
      otMultiplier: 1.5,
      nightMultiplier: 1.3,
    },
  };

  await db.settings.put({ ...defaultSettings, id: 'default' } as any);
  return defaultSettings;
}
