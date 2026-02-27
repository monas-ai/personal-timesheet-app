import { useEffect, useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Plus, Settings, Eye } from 'lucide-react';
import { Calendar } from './components/Calendar';
import { DayDrawer } from './components/DayDrawer';
import { ViewerModal } from './components/ViewerModal';
import { SettingsModal } from './components/SettingsModal';
import { useShiftStore } from './stores/shifts';
import { useSettingsStore } from './stores/settings';
import { exportToExcel } from './lib/excel';
import { formatDuration, calculateSalary } from './lib/utils';
import './index.css';

function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
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
  const salary = settings?.salary.enabled ? calculateSalary(shifts, settings.salary) : null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Month Navigator */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h1 className="text-xl font-bold text-gray-900 min-w-[140px] text-center">
                Tháng {format(currentMonth, 'MM/yyyy')}
              </h1>
              
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowViewer(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Xem tổng quan"
              >
                <Eye className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Cài đặt"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Thêm ca</span>
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-600 font-medium">Tổng giờ</div>
              <div className="text-2xl font-bold text-blue-900">{formatDuration(totalHours)}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-600 font-medium">Số ngày</div>
              <div className="text-2xl font-bold text-green-900">{workingDays}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-purple-600 font-medium">Số ca</div>
              <div className="text-2xl font-bold text-purple-900">{shiftCount}</div>
            </div>
            
            {otHours > 0 && (
              <div className="bg-orange-50 rounded-lg p-3">
                <div className="text-sm text-orange-600 font-medium">Làm thêm</div>
                <div className="text-2xl font-bold text-orange-900">{formatDuration(otHours)}</div>
              </div>
            )}
            
            {salary && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="text-sm text-emerald-600 font-medium">Lương</div>
                <div className="text-2xl font-bold text-emerald-900">
                  {(salary.total / 1000000).toFixed(1)}tr
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Calendar */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Calendar month={currentMonth} onDateClick={handleDateClick} />
      </main>
      
      {/* Modals */}
      {selectedDate && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedDate(null)} />
          <DayDrawer date={selectedDate} onClose={() => setSelectedDate(null)} />
        </>
      )}
      
      {showViewer && (
        <ViewerModal
          month={currentMonth}
          shifts={shifts}
          settings={settings}
          onClose={() => setShowViewer(false)}
        />
      )}
      
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
