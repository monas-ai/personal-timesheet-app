// Viewer Modal - overview statistics

import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { Shift, Settings } from '../types';
import { calculateShiftHours, formatDuration, calculateSalary } from '../lib/utils';

interface ViewerModalProps {
  month: Date;
  shifts: Shift[];
  settings: Settings | null;
  onClose: () => void;
}

export function ViewerModal({ month, shifts, settings, onClose }: ViewerModalProps) {
  // Calculate stats
  const totalHours = shifts.reduce((sum, s) => 
    sum + calculateShiftHours(s.start, s.end, s.breakMinutes), 0
  );
  
  const workingDays = new Set(shifts.map(s => s.date)).size;
  const shiftCount = shifts.length;
  
  // Type breakdown
  const typeStats = shifts.reduce((acc, shift) => {
    const hours = calculateShiftHours(shift.start, shift.end, shift.breakMinutes);
    if (!acc[shift.type]) {
      acc[shift.type] = { count: 0, hours: 0 };
    }
    acc[shift.type].count++;
    acc[shift.type].hours += hours;
    return acc;
  }, {} as Record<string, { count: number; hours: number }>);
  
  // Salary
  const salary = settings?.salary.enabled ? calculateSalary(shifts, settings.salary) : null;
  
  const typeNames: Record<string, string> = {
    'normal': 'Thường',
    'ot': 'Làm thêm',
    'night': 'Ca đêm',
    'leave': 'Nghỉ phép',
    'training': 'Đào tạo',
    'travel': 'Công tác',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Tổng quan tháng {format(month, 'MM/yyyy')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium mb-1">Tổng giờ</div>
              <div className="text-3xl font-bold text-blue-900">{formatDuration(totalHours)}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium mb-1">Số ngày</div>
              <div className="text-3xl font-bold text-green-900">{workingDays}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">Số ca</div>
              <div className="text-3xl font-bold text-purple-900">{shiftCount}</div>
            </div>
          </div>
          
          {/* Type breakdown */}
          <div>
            <h3 className="font-bold text-lg mb-3">Phân bổ theo loại ca</h3>
            <div className="space-y-2">
              {Object.entries(typeStats).map(([type, stats]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{typeNames[type] || type}</div>
                    <div className="text-sm text-gray-600">{stats.count} ca</div>
                  </div>
                  <div className="text-lg font-bold">{formatDuration(stats.hours)}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Salary breakdown */}
          {salary && (
            <div>
              <h3 className="font-bold text-lg mb-3">Chi tiết lương</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">Giờ thường</div>
                    <div className="text-sm text-gray-600">{formatDuration(salary.normalHours)}</div>
                  </div>
                  <div className="text-lg font-bold">{(salary.normalPay / 1000).toFixed(0)}k</div>
                </div>
                
                {salary.otHours > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium">Làm thêm (x{settings!.salary.otMultiplier})</div>
                      <div className="text-sm text-gray-600">{formatDuration(salary.otHours)}</div>
                    </div>
                    <div className="text-lg font-bold">{(salary.otPay / 1000).toFixed(0)}k</div>
                  </div>
                )}
                
                {salary.nightHours > 0 && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">Ca đêm (x{settings!.salary.nightMultiplier})</div>
                      <div className="text-sm text-gray-600">{formatDuration(salary.nightHours)}</div>
                    </div>
                    <div className="text-lg font-bold">{(salary.nightPay / 1000).toFixed(0)}k</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg border-2 border-green-300">
                  <div className="font-bold text-lg">Tổng lương</div>
                  <div className="text-2xl font-bold text-green-700">
                    {(salary.total / 1000000).toFixed(2)}tr
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                💡 Lương tính theo: {(settings!.salary.hourlyRate / 1000).toFixed(0)}k/giờ
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
