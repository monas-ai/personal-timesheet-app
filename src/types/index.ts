// Core types for the timesheet app

export type ShiftType = 'normal' | 'ot' | 'night' | 'leave' | 'training' | 'travel';

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  breakMinutes: number;
  type: ShiftType;
  project?: string;
  location?: string;
  note?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ShiftTemplate {
  id: string;
  name: string;
  shifts: Omit<Shift, 'id' | 'date' | 'createdAt' | 'updatedAt'>[];
}

export interface Settings {
  workWeek: number[]; // [1,2,3,4,5] for Mon-Fri
  roundingMinutes: 5 | 10 | 15;
  autoBreak: {
    enabled: boolean;
    afterHours: number;
    minutes: number;
  };
  otRule: {
    enabled: boolean;
    afterTime: string; // HH:mm
  };
  templates: ShiftTemplate[];
  excelColumns: {
    project: boolean;
    location: boolean;
    note: boolean;
    tags: boolean;
  };
}

export interface MonthRecord {
  id: string; // YYYY-MM
  month: string; // YYYY-MM
  shifts: Shift[];
  holidays: string[]; // [YYYY-MM-DD]
  isLocked: boolean;
  settingsSnapshot?: Settings;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
