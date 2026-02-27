// Shift validation logic

import type { Shift, ValidationError } from '../types';
import { parseTime, shiftsOverlap, calculateShiftHours } from './utils';

export function validateShift(
  shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>,
  existingShifts: Shift[] = []
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check end time is after start time
  const startTime = parseTime(shift.start);
  const endTime = parseTime(shift.end);
  
  if (endTime <= startTime) {
    errors.push({
      field: 'end',
      message: 'End time must be after start time',
      severity: 'error',
    });
  }
  
  // Check for overlapping shifts on the same date
  const overlapping = existingShifts.filter(
    (existing) =>
      existing.date === shift.date &&
      shiftsOverlap(shift, existing)
  );
  
  if (overlapping.length > 0) {
    errors.push({
      field: 'time',
      message: `Overlaps with existing shift: ${overlapping[0].start}-${overlapping[0].end}`,
      severity: 'warning',
    });
  }
  
  // Warn if shift is unusually long (> 12 hours)
  const hours = calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
  if (hours > 12) {
    errors.push({
      field: 'duration',
      message: `Shift duration is unusually long (${hours.toFixed(1)}h)`,
      severity: 'warning',
    });
  }
  
  // Check total hours for the day
  const dayShifts = existingShifts.filter((s) => s.date === shift.date);
  const dayTotal = dayShifts.reduce((total, s) => {
    return total + calculateShiftHours(s.start, s.end, s.breakMinutes);
  }, 0) + hours;
  
  if (dayTotal > 16) {
    errors.push({
      field: 'duration',
      message: `Total hours for this day will be ${dayTotal.toFixed(1)}h (>16h)`,
      severity: 'warning',
    });
  }
  
  return errors;
}

export function hasErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.severity === 'error');
}

export function hasWarnings(errors: ValidationError[]): boolean {
  return errors.some((e) => e.severity === 'warning');
}
