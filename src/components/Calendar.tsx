// Calendar component - beautiful mobile-first

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
          'aspect-square p-2 border-2 rounded-xl transition-all relative overflow-hidden group',
          'hover:border-blue-400 hover:shadow-lg active:scale-95',
          'min-h-[70px] sm:min-h-[90px]',
          isCurrentDay && 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 ring-4 ring-blue-200/50',
          !isInMonth && 'opacity-30',
          hasShifts && !isCurrentDay && 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300',
          !hasShifts && !isCurrentDay && 'bg-white hover:bg-gray-50',
          isWeekendDay && !hasShifts && !isCurrentDay && 'bg-gray-50'
        )}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/10 group-hover:to-purple-400/10 transition-all" />
        
        <div className="relative flex flex-col h-full text-left">
          {/* Date number with badge */}
          <div className="flex items-center justify-between mb-1">
            <div className={cn(
              'text-lg sm:text-xl font-bold',
              isCurrentDay && 'text-blue-600',
              hasShifts && !isCurrentDay && 'text-green-700',
              !hasShifts && !isCurrentDay && 'text-gray-700',
              isWeekendDay && !hasShifts && !isCurrentDay && 'text-gray-500'
            )}>
              {format(day, 'd')}
            </div>
            
            {hasShifts && (
              <div className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {shifts.length}
              </div>
            )}
          </div>
          
          {/* Shift info with icon */}
          {hasShifts && (
            <div className="flex-1 flex flex-col justify-end space-y-1">
              <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                ⏱ {formatDuration(totalHours)}
              </div>
            </div>
          )}
          
          {/* Weekend indicator */}
          {isWeekendDay && !hasShifts && (
            <div className="absolute bottom-2 right-2 text-gray-400 text-xs">
              🏖️
            </div>
          )}
        </div>
      </button>
    );
  };
  
  return (
    <div className="w-full">
      {/* Weekday headers with gradient */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className="text-center">
            <div className={cn(
              "text-sm font-bold py-2 rounded-lg",
              i === 0 ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            )}>
              {day}
            </div>
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
