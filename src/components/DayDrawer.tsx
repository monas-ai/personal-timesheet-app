// Day Drawer - beautiful Vietnamese UI

import { useState } from 'react';
import { format } from 'date-fns';
import { useShiftStore } from '../stores/shifts';
import { useSettingsStore } from '../stores/settings';
import type { Shift, ShiftType } from '../types';
import { formatDuration, calculateShiftHours } from '../lib/utils';
import { validateShift, hasErrors } from '../lib/validation';
import { X, Trash2, Edit2, Clock } from 'lucide-react';

interface DayDrawerProps {
  date: string | null;
  onClose: () => void;
}

function getVietnameseDay(date: Date): string {
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[date.getDay()];
}

export function DayDrawer({ date, onClose }: DayDrawerProps) {
  const { getShiftsByDate, shifts, addShift, deleteShift, updateShift } = useShiftStore();
  useSettingsStore();
  const [editingShift, setEditingShift] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    start: '09:00',
    end: '18:00',
    breakMinutes: 60,
    type: 'normal' as ShiftType,
    project: '',
    location: '',
    note: '',
  });
  
  if (!date) return null;
  
  const dayShifts = getShiftsByDate(date);
  const dateObj = new Date(date);
  const formattedDate = `${getVietnameseDay(dateObj)}, ${format(dateObj, 'dd/MM/yyyy')}`;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const shiftData = {
      date,
      ...formData,
      tags: [],
    };
    
    const errors = validateShift(shiftData, shifts);
    if (hasErrors(errors)) {
      alert('Lỗi: ' + errors.filter((e) => e.severity === 'error').map((e) => e.message).join('\n'));
      return;
    }
    
    if (editingShift) {
      await updateShift(editingShift, formData);
      setEditingShift(null);
    } else {
      await addShift(shiftData);
    }
    
    // Reset form
    setFormData({
      start: '09:00',
      end: '18:00',
      breakMinutes: 60,
      type: 'normal',
      project: '',
      location: '',
      note: '',
    });
  };
  
  const handleEdit = (shift: Shift) => {
    setFormData({
      start: shift.start,
      end: shift.end,
      breakMinutes: shift.breakMinutes,
      type: shift.type,
      project: shift.project || '',
      location: shift.location || '',
      note: shift.note || '',
    });
    setEditingShift(shift.id);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Xóa ca làm này?')) {
      await deleteShift(id);
    }
  };
  
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'normal': 'bg-blue-500',
      'ot': 'bg-orange-500',
      'night': 'bg-purple-500',
      'leave': 'bg-gray-400',
      'training': 'bg-green-500',
      'travel': 'bg-indigo-500',
    };
    return colors[type] || 'bg-gray-500';
  };
  
  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      'normal': 'Thường',
      'ot': 'Làm thêm',
      'night': 'Ca đêm',
      'leave': 'Nghỉ phép',
      'training': 'Đào tạo',
      'travel': 'Công tác',
    };
    return names[type] || type;
  };
  
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-gradient-to-br from-white to-blue-50 shadow-2xl z-50 overflow-y-auto">
      {/* Header with gradient */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-4 flex items-center justify-between shadow-lg">
        <div>
          <h2 className="text-lg font-bold">{formattedDate}</h2>
          {dayShifts.length > 0 && (
            <div className="text-sm opacity-90 flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" />
              <span>{dayShifts.length} ca · {formatDuration(dayShifts.reduce((sum, s) => sum + calculateShiftHours(s.start, s.end, s.breakMinutes), 0))}</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Shift list */}
      <div className="p-4 space-y-3">
        {dayShifts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500 font-medium">Chưa có ca nào</p>
            <p className="text-sm text-gray-400 mt-1">Thêm ca mới bên dưới</p>
          </div>
        )}
        
        {dayShifts.map((shift, index) => (
          <div
            key={shift.id}
            className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${getTypeColor(shift.type)} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                    Ca {index + 1} · {getTypeName(shift.type)}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {shift.start} – {shift.end}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  ⏱ {formatDuration(calculateShiftHours(shift.start, shift.end, shift.breakMinutes))}
                  {shift.breakMinutes > 0 && ` · Nghỉ ${shift.breakMinutes} phút`}
                  {shift.project && ` · ${shift.project}`}
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(shift)}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(shift.id)}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {shift.note && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-sm text-gray-700 mt-2">
                💬 {shift.note}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add/Edit form with gradient */}
      <div className="border-t-2 border-gray-200 bg-gradient-to-br from-white to-purple-50 p-4">
        <h3 className="font-bold text-lg mb-3 text-gray-800">
          {editingShift ? '✏️ Sửa ca' : '➕ Thêm ca mới'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Giờ bắt đầu</label>
              <input
                type="time"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">Giờ kết thúc</label>
              <input
                type="time"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nghỉ (phút)</label>
            <input
              type="number"
              value={formData.breakMinutes}
              onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              min="0"
              placeholder="60"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Loại ca</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ShiftType })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="normal">Thường</option>
              <option value="ot">Làm thêm</option>
              <option value="night">Ca đêm</option>
              <option value="leave">Nghỉ phép</option>
              <option value="training">Đào tạo</option>
              <option value="travel">Công tác</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Dự án</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Tên dự án"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              rows={2}
              placeholder="Ghi chú thêm..."
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all shadow-lg"
            >
              {editingShift ? '✅ Cập nhật' : '➕ Thêm ca'}
            </button>
            
            {editingShift && (
              <button
                type="button"
                onClick={() => {
                  setEditingShift(null);
                  setFormData({
                    start: '09:00',
                    end: '18:00',
                    breakMinutes: 60,
                    type: 'normal',
                    project: '',
                    location: '',
                    note: '',
                  });
                }}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all font-semibold"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
