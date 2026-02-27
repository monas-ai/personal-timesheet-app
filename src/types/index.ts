// Core TypeScript interfaces

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
  shifts: Array<{
    start: string;
    end: string;
    breakMinutes: number;
    type: ShiftType;
    tags: string[];
  }>;
}

export interface SalarySettings {
  enabled: boolean;
  hourlyRate: number; // VND per hour
  otMultiplier: number; // 1.5x for OT
  nightMultiplier: number; // 1.3x for night shift
}

export interface Settings {
  workWeek: number[]; // [1,2,3,4,5] = Mon-Fri
  roundingMinutes: number;
  autoBreak: {
    enabled: boolean;
    afterHours: number;
    minutes: number;
  };
  otRule: {
    enabled: boolean;
    afterTime: string;
  };
  templates: ShiftTemplate[];
  excelColumns: {
    project: boolean;
    location: boolean;
    note: boolean;
    tags: boolean;
  };
  salary: SalarySettings;
}

export interface MonthRecord {
  id: string; // YYYY-MM
  month: string;
  isLocked: boolean;
  note?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
