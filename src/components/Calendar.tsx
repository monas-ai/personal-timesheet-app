// Calendar component - mobile-first monthly grid

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { useShiftStore } from '../stores/shifts';
import { formatDuration } from '../lib/utils';
import { cn } from '../lib/utils';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    
    return (
      <button
        key={dateStr}
        onClick={() => onDateClick(dateStr)}
        className={cn(
          'aspect-square p-1 sm:p-2 border rounded-lg transition-all relative',
          'hover:border-blue-500 hover:bg-blue-50 active:scale-95',
          'min-h-[60px] sm:min-h-[80px]',
          isCurrentDay && 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
          !isInMonth && 'opacity-30',
          hasShifts && 'bg-green-50 border-green-300'
        )}
      >
        <div className="flex flex-col h-full text-left">
          {/* Date number - larger on mobile */}
          <div className={cn(
            'text-base sm:text-sm font-semibold mb-0.5',
            isCurrentDay && 'text-blue-600',
            hasShifts && !isCurrentDay && 'text-green-700'
          )}>
            {format(day, 'd')}
          </div>
          
          {/* Shift info - mobile optimized */}
          {hasShifts && (
            <div className="flex-1 flex flex-col justify-end">
              <div className="text-xs font-bold text-green-700 leading-tight">
                {formatDuration(totalHours)}
              </div>
              {shifts.length > 1 && (
                <div className="text-[10px] text-gray-500 leading-tight">
                  {shifts.length}×
                </div>
              )}
            </div>
          )}
        </div>
      </button>
    );
  };
  
  return (
    <div className="w-full">
      {/* Weekday headers - responsive */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className="text-center">
            <span className="text-xs sm:text-sm font-medium text-gray-600 sm:hidden">
              {day}
            </span>
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">
              {WEEKDAYS_FULL[i]}
            </span>
          </div>
        ))}
      </div>
      
      {/* Calendar grid - responsive gap */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {allDays.map((day) => renderDayCell(day))}
      </div>
    </div>
  );
}
