import { useEffect, useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';
import { Calendar } from './components/Calendar';
import { DayDrawer } from './components/DayDrawer';
import { useShiftStore } from './stores/shifts';
import { useSettingsStore } from './stores/settings';
import { exportToExcel } from './lib/excel';
import { formatDuration } from './lib/utils';
import './index.css';

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const {
    loadShifts,
    getTotalHoursForMonth,
    getOTHoursForMonth,
    getWorkingDaysCount,
    shifts,
  } = useShiftStore();
  
  const { loadSettings, settings } = useSettingsStore();
  
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  useEffect(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    loadShifts(monthStr);
  }, [currentMonth, loadShifts]);
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleExport = () => {
    if (!settings) return;
    const monthStr = format(currentMonth, 'yyyy-MM');
    exportToExcel(shifts, settings, monthStr);
  };
  
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };
  
  const totalHours = getTotalHoursForMonth();
  const otHours = getOTHoursForMonth();
  const workingDays = getWorkingDaysCount();
  const shiftCount = shifts.length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - mobile optimized */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="px-3 sm:px-4 py-3">
          {/* Month selector */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold min-w-[120px] text-center">
                {format(currentMonth, 'MM/yyyy')}
              </h1>
              
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Actions - mobile optimized */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                className="p-2 sm:px-3 sm:py-2 border rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
                aria-label="Add shift"
              >
                <Plus className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 sm:px-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
                aria-label="Export to Excel"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Stats - mobile optimized grid */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1.5 rounded">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-blue-700">{formatDuration(totalHours)}</span>
            </div>
            {otHours > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1.5 rounded">
                <span className="text-gray-600">OT:</span>
                <span className="font-bold text-orange-700">{formatDuration(otHours)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1.5 rounded">
              <span className="text-gray-600">Days:</span>
              <span className="font-bold text-green-700">{workingDays}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1.5 rounded">
              <span className="text-gray-600">Shifts:</span>
              <span className="font-bold text-purple-700">{shiftCount}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content - mobile padding */}
      <main className="px-3 sm:px-4 py-4 sm:py-6 max-w-6xl mx-auto">
        <Calendar month={currentMonth} onDateClick={handleDateClick} />
      </main>
      
      {/* Day Drawer */}
      {selectedDate && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedDate(null)}
          />
          
          <DayDrawer date={selectedDate} onClose={() => setSelectedDate(null)} />
        </>
      )}
    </div>
  );
}

export default App;
