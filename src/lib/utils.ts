// Utility functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parse, differenceInMinutes } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time formatting
export function formatTime(time: string): string {
  // HH:mm format
  return time;
}

export function parseTime(time: string): Date {
  return parse(time, 'HH:mm', new Date());
}

// Calculate shift duration in hours
export function calculateShiftHours(
  start: string,
  end: string,
  breakMinutes: number,
  roundingMinutes: number = 15
): number {
  const startTime = parseTime(start);
  const endTime = parseTime(end);
  
  let totalMinutes = differenceInMinutes(endTime, startTime);
  
  // Subtract break
  totalMinutes -= breakMinutes;
  
  // Round to nearest interval
  if (roundingMinutes > 0) {
    totalMinutes = Math.round(totalMinutes / roundingMinutes) * roundingMinutes;
  }
  
  return totalMinutes / 60;
}

// Format duration as "Xh Ym" or "Xh" if no minutes
export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format date for display
export function formatDate(date: string, formatStr: string = 'dd/MM/yyyy'): string {
  return format(new Date(date), formatStr);
}

// Get month string (YYYY-MM)
export function getMonthString(date: Date = new Date()): string {
  return format(date, 'yyyy-MM');
}

// Check if two shifts overlap
export function shiftsOverlap(
  shift1: { start: string; end: string },
  shift2: { start: string; end: string }
): boolean {
  const s1Start = parseTime(shift1.start);
  const s1End = parseTime(shift1.end);
  const s2Start = parseTime(shift2.start);
  const s2End = parseTime(shift2.end);
  
  return s1Start < s2End && s2Start < s1End;
}
