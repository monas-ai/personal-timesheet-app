// Calendar component - monthly grid view

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { useShiftStore } from '../stores/shifts';
import { formatDuration } from '../lib/utils';
import { cn } from '../lib/utils';
import { AlertCircle } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  month: Date;
  onDateClick: (date: string) => void;
}

export function Calendar({ month, onDateClick }: CalendarProps) {
  const { getShiftsByDate, getTotalHoursForDate } = useShiftStore();
  
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad start with empty cells for proper alignment
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
    
    // Check for warnings
    const hasLongDay = totalHours > 16;
    const hasOverlap = false; // TODO: implement overlap detection
    
    return (
      <button
        key={dateStr}
        onClick={() => onDateClick(dateStr)}
        className={cn(
          'aspect-square p-2 border rounded-lg transition-colors relative',
          'hover:border-primary-500 hover:bg-primary-50',
          isCurrentDay && 'border-primary-500 bg-primary-50',
          !isInMonth && 'opacity-30',
          hasShifts && 'bg-neutral-50'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Date number */}
          <div className="text-sm font-medium mb-1">
            {format(day, 'd')}
          </div>
          
          {/* Shift info */}
          {hasShifts && (
            <>
              <div className="text-xs font-semibold text-primary-600">
                {formatDuration(totalHours)}
              </div>
              <div className="text-xs text-neutral-500">
                {shifts.length} shift{shifts.length > 1 ? 's' : ''}
              </div>
              
              {/* Badge */}
              <div className="mt-auto">
                <span className="inline-block px-1.5 py-0.5 text-xs rounded bg-green-100 text-green-700">
                  Work
                </span>
              </div>
            </>
          )}
          
          {/* Warning icon */}
          {(hasLongDay || hasOverlap) && (
            <AlertCircle className="absolute top-1 right-1 w-3 h-3 text-orange-500" />
          )}
        </div>
      </button>
    );
  };
  
  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-neutral-500">
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
