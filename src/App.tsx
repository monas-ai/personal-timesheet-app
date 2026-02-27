import { useEffect, useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Plus, Calendar as CalendarIcon } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - gradient + shadow */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-md">
        <div className="px-3 sm:px-6 py-4">
          {/* Month selector with gradient */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-blue-600 hidden sm:block" />
              
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-blue-50 rounded-lg active:scale-95 transition-all"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="w-5 h-5 text-blue-600" />
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent min-w-[120px] text-center">
                Tháng {format(currentMonth, 'MM/yyyy')}
              </h1>
              
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-blue-50 rounded-lg active:scale-95 transition-all"
                aria-label="Tháng sau"
              >
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </button>
            </div>
            
            {/* Actions with gradient buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                className="p-2 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all shadow-md flex items-center gap-2"
                aria-label="Thêm ca"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Thêm ca</span>
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all shadow-md flex items-center gap-2"
                aria-label="Xuất Excel"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Xuất Excel</span>
              </button>
            </div>
          </div>
          
          {/* Stats with colorful cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <div className="text-blue-100 text-xs font-medium mb-1">Tổng giờ</div>
              <div className="text-white text-lg font-bold">{formatDuration(totalHours)}</div>
            </div>
            
            {otHours > 0 && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                <div className="text-orange-100 text-xs font-medium mb-1">Làm thêm</div>
                <div className="text-white text-lg font-bold">{formatDuration(otHours)}</div>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
              <div className="text-green-100 text-xs font-medium mb-1">Số ngày</div>
              <div className="text-white text-lg font-bold">{workingDays}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <div className="text-purple-100 text-xs font-medium mb-1">Số ca</div>
              <div className="text-white text-lg font-bold">{shiftCount}</div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content with card wrapper */}
      <main className="px-3 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          <Calendar month={currentMonth} onDateClick={handleDateClick} />
        </div>
      </main>
      
      {/* Day Drawer */}
      {selectedDate && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setSelectedDate(null)}
          />
          
          <DayDrawer date={selectedDate} onClose={() => setSelectedDate(null)} />
        </>
      )}
    </div>
  );
}

export default App;
