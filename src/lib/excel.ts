// Excel export functionality using SheetJS

import * as XLSX from 'xlsx';
import type { Shift, Settings } from '../types';
import { format } from 'date-fns';
import { calculateShiftHours, formatDate } from './utils';

interface ShiftRow {
  Date: string;
  Day: string;
  'Shift#': number;
  Start: string;
  End: string;
  Break: number;
  Hours: number;
  Type: string;
  Project?: string;
  Location?: string;
  Note?: string;
}

interface SummaryData {
  totalHours: number;
  totalOT: number;
  workingDays: number;
  shiftCount: number;
  weeklyTotals: { week: number; hours: number }[];
  typeBreakdown: { type: string; hours: number }[];
}

function getDayOfWeek(date: string): string {
  return format(new Date(date), 'EEE');
}

function getWeekNumber(date: string): number {
  const d = new Date(date);
  const day = d.getDate();
  return Math.ceil(day / 7);
}

function generateTimesheetData(shifts: Shift[], settings: Settings): ShiftRow[] {
  const rows: ShiftRow[] = [];
  
  // Group shifts by date
  const shiftsByDate: Record<string, Shift[]> = {};
  shifts.forEach((shift) => {
    if (!shiftsByDate[shift.date]) {
      shiftsByDate[shift.date] = [];
    }
    shiftsByDate[shift.date].push(shift);
  });
  
  // Sort dates
  const sortedDates = Object.keys(shiftsByDate).sort();
  
  // Generate rows
  sortedDates.forEach((date) => {
    const dayShifts = shiftsByDate[date].sort((a, b) =>
      a.start.localeCompare(b.start)
    );
    
    dayShifts.forEach((shift, index) => {
      const row: ShiftRow = {
        Date: formatDate(date, 'dd/MM/yyyy'),
        Day: getDayOfWeek(date),
        'Shift#': index + 1,
        Start: shift.start,
        End: shift.end,
        Break: shift.breakMinutes,
        Hours: parseFloat(
          calculateShiftHours(shift.start, shift.end, shift.breakMinutes).toFixed(2)
        ),
        Type: shift.type.charAt(0).toUpperCase() + shift.type.slice(1),
      };
      
      // Add optional columns based on settings
      if (settings.excelColumns.project && shift.project) {
        row.Project = shift.project;
      }
      if (settings.excelColumns.location && shift.location) {
        row.Location = shift.location;
      }
      if (settings.excelColumns.note && shift.note) {
        row.Note = shift.note;
      }
      
      rows.push(row);
    });
  });
  
  return rows;
}

function calculateSummary(shifts: Shift[]): SummaryData {
  const totalHours = shifts.reduce((total, shift) => {
    return total + calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
  }, 0);
  
  const totalOT = shifts
    .filter((s) => s.type === 'ot')
    .reduce((total, shift) => {
      return total + calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
    }, 0);
  
  const uniqueDates = new Set(shifts.map((s) => s.date));
  const workingDays = uniqueDates.size;
  
  const shiftCount = shifts.length;
  
  // Weekly totals
  const weeklyMap: Record<number, number> = {};
  shifts.forEach((shift) => {
    const week = getWeekNumber(shift.date);
    const hours = calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
    weeklyMap[week] = (weeklyMap[week] || 0) + hours;
  });
  
  const weeklyTotals = Object.entries(weeklyMap)
    .map(([week, hours]) => ({ week: parseInt(week), hours }))
    .sort((a, b) => a.week - b.week);
  
  // Type breakdown
  const typeMap: Record<string, number> = {};
  shifts.forEach((shift) => {
    const hours = calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
    typeMap[shift.type] = (typeMap[shift.type] || 0) + hours;
  });
  
  const typeBreakdown = Object.entries(typeMap).map(([type, hours]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    hours,
  }));
  
  return {
    totalHours,
    totalOT,
    workingDays,
    shiftCount,
    weeklyTotals,
    typeBreakdown,
  };
}

function generateSummarySheet(summary: SummaryData): any[][] {
  const rows: any[][] = [];
  
  rows.push(['Metric', 'Value']);
  rows.push(['Total Hours', summary.totalHours.toFixed(2)]);
  rows.push(['Total OT', summary.totalOT.toFixed(2)]);
  rows.push(['Working Days', summary.workingDays]);
  rows.push(['Total Shifts', summary.shiftCount]);
  rows.push([]);
  
  rows.push(['Weekly Breakdown']);
  summary.weeklyTotals.forEach((week) => {
    rows.push([`Week ${week.week}`, week.hours.toFixed(2)]);
  });
  rows.push([]);
  
  rows.push(['Type Breakdown']);
  summary.typeBreakdown.forEach((type) => {
    rows.push([type.type, type.hours.toFixed(2)]);
  });
  
  return rows;
}

export function exportToExcel(
  shifts: Shift[],
  settings: Settings,
  month: string
): void {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Timesheet
  const timesheetData = generateTimesheetData(shifts, settings);
  const timesheetWS = XLSX.utils.json_to_sheet(timesheetData);
  
  // Format timesheet sheet
  timesheetWS['!cols'] = [
    { wch: 12 }, // Date
    { wch: 6 },  // Day
    { wch: 8 },  // Shift#
    { wch: 8 },  // Start
    { wch: 8 },  // End
    { wch: 8 },  // Break
    { wch: 8 },  // Hours
    { wch: 10 }, // Type
    { wch: 15 }, // Project
    { wch: 15 }, // Location
    { wch: 30 }, // Note
  ];
  
  XLSX.utils.book_append_sheet(wb, timesheetWS, 'Timesheet');
  
  // Sheet 2: Summary
  const summary = calculateSummary(shifts);
  const summaryData = generateSummarySheet(summary);
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  
  summaryWS['!cols'] = [
    { wch: 20 }, // Metric
    { wch: 15 }, // Value
  ];
  
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
  
  // Write file
  const filename = `Timesheet_${month}.xlsx`;
  XLSX.writeFile(wb, filename);
}
