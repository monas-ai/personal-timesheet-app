// Day Drawer - shift management for a specific day

import { useState } from 'react';
import { format } from 'date-fns';
import { useShiftStore } from '../stores/shifts';
import { useSettingsStore } from '../stores/settings';
import type { Shift, ShiftType } from '../types';
import { formatDuration, calculateShiftHours } from '../lib/utils';
import { validateShift, hasErrors } from '../lib/validation';
import { X, Trash2, Edit2 } from 'lucide-react';

interface DayDrawerProps {
  date: string | null;
  onClose: () => void;
}

export function DayDrawer({ date, onClose }: DayDrawerProps) {
  const { getShiftsByDate, shifts, addShift, deleteShift, updateShift } = useShiftStore();
  useSettingsStore();
  const [editingShift, setEditingShift] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    start: '09:00',
    end: '18:00',
    breakMinutes: 0,
    type: 'normal' as ShiftType,
    project: '',
    location: '',
    note: '',
  });
  
  if (!date) return null;
  
  const dayShifts = getShiftsByDate(date);
  const dateObj = new Date(date);
  const formattedDate = format(dateObj, 'EEEE, dd/MM/yyyy');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const shiftData = {
      date,
      ...formData,
      tags: [],
    };
    
    const errors = validateShift(shiftData, shifts);
    if (hasErrors(errors)) {
      alert(errors.filter((e) => e.severity === 'error').map((e) => e.message).join('\n'));
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
      breakMinutes: 0,
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
    if (confirm('Delete this shift?')) {
      await deleteShift(id);
    }
  };
  
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{formattedDate}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Shift list */}
      <div className="p-4 space-y-3">
        {dayShifts.length === 0 && (
          <p className="text-center text-neutral-500 py-8">
            No shifts for this day
          </p>
        )}
        
        {dayShifts.map((shift, index) => (
          <div
            key={shift.id}
            className="border rounded-lg p-3 bg-neutral-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium">
                  Shift {index + 1}: {shift.start} – {shift.end}
                </div>
                <div className="text-sm text-neutral-600">
                  {formatDuration(calculateShiftHours(shift.start, shift.end, shift.breakMinutes))} | {shift.type}
                  {shift.project && ` | ${shift.project}`}
                </div>
                {shift.breakMinutes > 0 && (
                  <div className="text-xs text-neutral-500">
                    Break: {shift.breakMinutes}min
                  </div>
                )}
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(shift)}
                  className="p-1.5 hover:bg-neutral-200 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(shift.id)}
                  className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {shift.note && (
              <div className="text-sm text-neutral-600 mt-2">
                {shift.note}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add/Edit form */}
      <div className="border-t p-4">
        <h3 className="font-medium mb-3">
          {editingShift ? 'Edit Shift' : 'Add Shift'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <input
                type="time"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End</label>
              <input
                type="time"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Break (minutes)</label>
            <input
              type="number"
              value={formData.breakMinutes}
              onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ShiftType })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="normal">Normal</option>
              <option value="ot">OT</option>
              <option value="night">Night</option>
              <option value="leave">Leave</option>
              <option value="training">Training</option>
              <option value="travel">Travel</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Optional"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
              placeholder="Optional"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {editingShift ? 'Update Shift' : 'Add Shift'}
            </button>
            
            {editingShift && (
              <button
                type="button"
                onClick={() => {
                  setEditingShift(null);
                  setFormData({
                    start: '09:00',
                    end: '18:00',
                    breakMinutes: 0,
                    type: 'normal',
                    project: '',
                    location: '',
                    note: '',
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
