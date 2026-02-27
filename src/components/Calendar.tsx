// Clean calendar - inspired by reference screenshot

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, isWeekend } from 'date-fns';
import { useShiftStore } from '../stores/shifts';
import { formatDuration } from '../lib/utils';
import { cn } from '../lib/utils';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

interface CalendarProps {
  month: Date;
  onDateClick: (date: string) => void;
}

export function Calendar({ month, onDateClick }: CalendarProps) {
  const { getShiftsByDate, getTotalHoursForDate } = useShiftStore();
  
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array(startDayOfWeek).fill(null);
  
  const allDays = [...paddingDays, ...days];
  
  const renderDayCell = (day: Date | null) => {
    if (!day) {
      return <div key={Math.random()} className="aspect-square" />;
    }
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const shifts = getShiftsByDate(dateStr);
    const totalHours = getTotalHoursForDate(dateStr);
    const hasShifts = shifts.length > 0;
    const isCurrentDay = isToday(day);
    const isInMonth = isSameMonth(day, month);
    const isWeekendDay = isWeekend(day);
    
    return (
      <button
        key={dateStr}
        onClick={() => onDateClick(dateStr)}
        className={cn(
          'aspect-square p-2 border rounded-lg transition-all',
          'hover:border-blue-500 hover:bg-blue-50',
          'min-h-[60px] sm:min-h-[80px]',
          isCurrentDay && 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
          !isInMonth && 'opacity-30',
          hasShifts && !isCurrentDay && 'bg-green-50 border-green-300',
          !hasShifts && !isCurrentDay && 'bg-white',
          isWeekendDay && !hasShifts && !isCurrentDay && 'bg-gray-50'
        )}
      >
        <div className="flex flex-col h-full text-left">
          {/* Date number */}
          <div className={cn(
            'text-lg font-bold mb-1',
            isCurrentDay && 'text-blue-600',
            hasShifts && !isCurrentDay && 'text-green-700',
            !hasShifts && 'text-gray-700',
            isWeekendDay && !hasShifts && !isCurrentDay && 'text-gray-400'
          )}>
            {format(day, 'd')}
          </div>
          
          {/* Shift badge */}
          {hasShifts && (
            <div className="flex-1 flex flex-col justify-end gap-1">
              <div className="text-xs font-semibold text-green-700">
                {formatDuration(totalHours)}
              </div>
              {shifts.length > 1 && (
                <div className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded inline-block self-start">
                  {shifts.length} ca
                </div>
              )}
            </div>
          )}
        </div>
      </button>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className={cn(
            "text-center text-sm font-bold py-2 rounded",
            i === 0 ? "text-red-600" : "text-gray-700"
          )}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {allDays.map((day) => renderDayCell(day))}
      </div>
    </div>
  );
}
