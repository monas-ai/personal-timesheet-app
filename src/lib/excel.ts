// Excel export - Vietnamese standard format

import * as XLSX from 'xlsx';
import type { Shift, Settings } from '../types';
import { calculateShiftHours, formatDate } from './utils';

interface ShiftRow {
  'STT': number;
  'Ngày': string;
  'Thứ': string;
  'Ca': number;
  'Giờ bắt đầu': string;
  'Giờ kết thúc': string;
  'Nghỉ (phút)': number;
  'Tổng giờ': number;
  'Loại ca': string;
  'Dự án'?: string;
  'Địa điểm'?: string;
  'Ghi chú'?: string;
}

function getVietnameseDay(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[day];
}

function getShiftTypeName(type: string): string {
  const types: Record<string, string> = {
    'normal': 'Thường',
    'ot': 'Làm thêm',
    'night': 'Ca đêm',
    'leave': 'Nghỉ phép',
    'training': 'Đào tạo',
    'travel': 'Công tác',
  };
  return types[type] || type;
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
  let stt = 1;
  sortedDates.forEach((date) => {
    const dayShifts = shiftsByDate[date].sort((a, b) =>
      a.start.localeCompare(b.start)
    );
    
    dayShifts.forEach((shift, index) => {
      const row: ShiftRow = {
        'STT': stt++,
        'Ngày': formatDate(date, 'dd/MM/yyyy'),
        'Thứ': getVietnameseDay(date),
        'Ca': index + 1,
        'Giờ bắt đầu': shift.start,
        'Giờ kết thúc': shift.end,
        'Nghỉ (phút)': shift.breakMinutes,
        'Tổng giờ': parseFloat(
          calculateShiftHours(shift.start, shift.end, shift.breakMinutes).toFixed(2)
        ),
        'Loại ca': getShiftTypeName(shift.type),
      };
      
      // Add optional columns based on settings
      if (settings.excelColumns.project && shift.project) {
        row['Dự án'] = shift.project;
      }
      if (settings.excelColumns.location && shift.location) {
        row['Địa điểm'] = shift.location;
      }
      if (settings.excelColumns.note && shift.note) {
        row['Ghi chú'] = shift.note;
      }
      
      rows.push(row);
    });
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
  
  // Sheet 1: Bảng chấm công
  const timesheetData = generateTimesheetData(shifts, settings);
  const timesheetWS = XLSX.utils.json_to_sheet(timesheetData);
  
  // Format timesheet sheet
  const colWidths = [
    { wch: 6 },  // STT
    { wch: 12 }, // Ngày
    { wch: 10 }, // Thứ
    { wch: 6 },  // Ca
    { wch: 12 }, // Giờ bắt đầu
    { wch: 12 }, // Giờ kết thúc
    { wch: 12 }, // Nghỉ
    { wch: 10 }, // Tổng giờ
    { wch: 12 }, // Loại ca
    { wch: 20 }, // Dự án
    { wch: 20 }, // Địa điểm
    { wch: 35 }, // Ghi chú
  ];
  timesheetWS['!cols'] = colWidths;
  
  // Add header styling (bold, background color)
  const range = XLSX.utils.decode_range(timesheetWS['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    if (!timesheetWS[address]) continue;
    timesheetWS[address].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }
  
  XLSX.utils.book_append_sheet(wb, timesheetWS, 'Bảng chấm công');
  
  // Sheet 2: Tổng hợp
  const totalHours = shifts.reduce((sum, s) => 
    sum + calculateShiftHours(s.start, s.end, s.breakMinutes), 0
  );
  const totalOT = shifts.filter(s => s.type === 'ot').reduce((sum, s) => 
    sum + calculateShiftHours(s.start, s.end, s.breakMinutes), 0
  );
  const workingDays = new Set(shifts.map(s => s.date)).size;
  const shiftCount = shifts.length;
  
  // Calculate weekly totals
  const weeklyMap: Record<number, number> = {};
  shifts.forEach((shift) => {
    const d = new Date(shift.date);
    const week = Math.ceil(d.getDate() / 7);
    const hours = calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
    weeklyMap[week] = (weeklyMap[week] || 0) + hours;
  });
  
  // Type breakdown
  const typeMap: Record<string, number> = {};
  shifts.forEach((shift) => {
    const hours = calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
    const typeName = getShiftTypeName(shift.type);
    typeMap[typeName] = (typeMap[typeName] || 0) + hours;
  });
  
  const summaryData: any[][] = [
    ['CHỈ TIÊU', 'GIÁ TRỊ'],
    ['Tổng giờ làm việc', totalHours.toFixed(2)],
    ['Giờ làm thêm', totalOT.toFixed(2)],
    ['Số ngày làm việc', workingDays],
    ['Tổng số ca', shiftCount],
    [],
    ['PHÂN BỔ THEO TUẦN'],
    ...Object.entries(weeklyMap).map(([week, hours]) => [`Tuần ${week}`, hours.toFixed(2)]),
    [],
    ['PHÂN BỔ THEO LOẠI CA'],
    ...Object.entries(typeMap).map(([type, hours]) => [type, hours.toFixed(2)]),
  ];
  
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWS['!cols'] = [
    { wch: 25 }, // Chỉ tiêu
    { wch: 15 }, // Giá trị
  ];
  
  // Style summary headers
  ['A1', 'B1', 'A7', 'A10'].forEach(addr => {
    if (summaryWS[addr]) {
      summaryWS[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "70AD47" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  });
  
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Tổng hợp');
  
  // Write file
  const [year, monthNum] = month.split('-');
  const filename = `BangChamCong_Thang${monthNum}_${year}.xlsx`;
  XLSX.writeFile(wb, filename);
}
