// Zustand store for shift management

import { create } from 'zustand';
import type { Shift } from '../types';
import { db } from '../lib/db';
import { generateId, calculateShiftHours, getMonthString } from '../lib/utils';

interface ShiftStore {
  shifts: Shift[];
  currentMonth: string;
  selectedDate: string | null;
  loading: boolean;
  
  // Actions
  loadShifts: (month: string) => Promise<void>;
  addShift: (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Shift>;
  updateShift: (id: string, updates: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  deleteAllShiftsForDate: (date: string) => Promise<void>;
  setCurrentMonth: (month: string) => void;
  setSelectedDate: (date: string | null) => void;
  
  // Computed
  getShiftsByDate: (date: string) => Shift[];
  getTotalHoursForDate: (date: string) => number;
  getTotalHoursForMonth: () => number;
  getOTHoursForMonth: () => number;
  getWorkingDaysCount: () => number;
}

export const useShiftStore = create<ShiftStore>((set, get) => ({
  shifts: [],
  currentMonth: getMonthString(),
  selectedDate: null,
  loading: false,
  
  loadShifts: async (month: string) => {
    set({ loading: true });
    try {
      const shifts = await db.shifts
        .where('date')
        .startsWith(month)
        .toArray();
      set({ shifts, currentMonth: month });
    } finally {
      set({ loading: false });
    }
  },
  
  addShift: async (shiftData) => {
    const now = Date.now();
    const newShift: Shift = {
      ...shiftData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    await db.shifts.add(newShift);
    set((state) => ({ shifts: [...state.shifts, newShift] }));
    return newShift;
  },
  
  updateShift: async (id, updates) => {
    await db.shifts.update(id, { ...updates, updatedAt: Date.now() });
    set((state) => ({
      shifts: state.shifts.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      ),
    }));
  },
  
  deleteShift: async (id) => {
    await db.shifts.delete(id);
    set((state) => ({
      shifts: state.shifts.filter((s) => s.id !== id),
    }));
  },
  
  deleteAllShiftsForDate: async (date) => {
    const shiftsToDelete = get().getShiftsByDate(date);
    await Promise.all(shiftsToDelete.map((s) => db.shifts.delete(s.id)));
    set((state) => ({
      shifts: state.shifts.filter((s) => s.date !== date),
    }));
  },
  
  setCurrentMonth: (month) => {
    set({ currentMonth: month });
    get().loadShifts(month);
  },
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  getShiftsByDate: (date) => {
    return get()
      .shifts.filter((s) => s.date === date)
      .sort((a, b) => a.start.localeCompare(b.start));
  },
  
  getTotalHoursForDate: (date) => {
    const shifts = get().getShiftsByDate(date);
    return shifts.reduce((total, shift) => {
      return total + calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
    }, 0);
  },
  
  getTotalHoursForMonth: () => {
    return get().shifts.reduce((total, shift) => {
      return total + calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
    }, 0);
  },
  
  getOTHoursForMonth: () => {
    return get()
      .shifts.filter((s) => s.type === 'ot')
      .reduce((total, shift) => {
        return total + calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
      }, 0);
  },
  
  getWorkingDaysCount: () => {
    const uniqueDates = new Set(get().shifts.map((s) => s.date));
    return uniqueDates.size;
  },
}));
