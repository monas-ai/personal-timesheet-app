// Settings Modal - salary configuration

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useSettingsStore } from '../stores/settings';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettingsStore();
  
  const [formData, setFormData] = useState({
    salaryEnabled: settings?.salary.enabled || false,
    hourlyRate: settings?.salary.hourlyRate || 50000,
    otMultiplier: settings?.salary.otMultiplier || 1.5,
    nightMultiplier: settings?.salary.nightMultiplier || 1.3,
  });
  
  useEffect(() => {
    if (settings) {
      setFormData({
        salaryEnabled: settings.salary.enabled,
        hourlyRate: settings.salary.hourlyRate,
        otMultiplier: settings.salary.otMultiplier,
        nightMultiplier: settings.salary.nightMultiplier,
      });
    }
  }, [settings]);
  
  const handleSave = async () => {
    if (!settings) return;
    
    await updateSettings({
      salary: {
        enabled: formData.salaryEnabled,
        hourlyRate: formData.hourlyRate,
        otMultiplier: formData.otMultiplier,
        nightMultiplier: formData.nightMultiplier,
      },
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative z-10">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Cài đặt</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Enable salary */}
          <div className="flex items-center justify-between">
            <label className="font-medium">Tính lương</label>
            <input
              type="checkbox"
              checked={formData.salaryEnabled}
              onChange={(e) => setFormData({ ...formData, salaryEnabled: e.target.checked })}
              className="w-5 h-5"
            />
          </div>
          
          {formData.salaryEnabled && (
            <>
              {/* Hourly rate */}
              <div>
                <label className="block font-medium mb-2">Lương theo giờ (VNĐ)</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="50000"
                  step="1000"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {(formData.hourlyRate / 1000).toFixed(0)}k/giờ
                </div>
              </div>
              
              {/* OT multiplier */}
              <div>
                <label className="block font-medium mb-2">Hệ số làm thêm (OT)</label>
                <input
                  type="number"
                  value={formData.otMultiplier}
                  onChange={(e) => setFormData({ ...formData, otMultiplier: parseFloat(e.target.value) || 1.5 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="1.5"
                  step="0.1"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Làm thêm = x{formData.otMultiplier} lương thường
                </div>
              </div>
              
              {/* Night multiplier */}
              <div>
                <label className="block font-medium mb-2">Hệ số ca đêm</label>
                <input
                  type="number"
                  value={formData.nightMultiplier}
                  onChange={(e) => setFormData({ ...formData, nightMultiplier: parseFloat(e.target.value) || 1.3 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="1.3"
                  step="0.1"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Ca đêm = x{formData.nightMultiplier} lương thường
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
