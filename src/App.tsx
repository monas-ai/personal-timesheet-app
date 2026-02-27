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
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Month selector */}
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h1 className="text-2xl font-bold min-w-[140px] text-center">
                {format(currentMonth, 'MM/yyyy')}
              </h1>
              
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                className="px-4 py-2 border rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Shift</span>
              </button>
              
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">Total:</span>
              <span className="font-semibold">{formatDuration(totalHours)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">OT:</span>
              <span className="font-semibold text-orange-600">
                {formatDuration(otHours)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">Days:</span>
              <span className="font-semibold">{workingDays}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-600">Shifts:</span>
              <span className="font-semibold">{shiftCount}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <Calendar month={currentMonth} onDateClick={handleDateClick} />
      </main>
      
      {/* Day Drawer */}
      {selectedDate && (
        <>
          {/* Backdrop */}
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
