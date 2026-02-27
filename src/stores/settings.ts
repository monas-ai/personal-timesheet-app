// Zustand store for settings management

import { create } from 'zustand';
import type { Settings, ShiftTemplate } from '../types';
import { db, initializeSettings } from '../lib/db';
import { generateId } from '../lib/utils';

interface SettingsStore {
  settings: Settings | null;
  loading: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  addTemplate: (template: Omit<ShiftTemplate, 'id'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<ShiftTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  loading: false,
  
  loadSettings: async () => {
    set({ loading: true });
    try {
      const settings = await initializeSettings();
      set({ settings });
    } finally {
      set({ loading: false });
    }
  },
  
  updateSettings: async (updates) => {
    const current = get().settings;
    if (!current) return;
    
    const updated = { ...current, ...updates };
    await db.settings.put({ ...updated, id: 'default' } as any);
    set({ settings: updated });
  },
  
  addTemplate: async (templateData) => {
    const current = get().settings;
    if (!current) return;
    
    const newTemplate: ShiftTemplate = {
      ...templateData,
      id: generateId(),
    };
    
    const updated = {
      ...current,
      templates: [...current.templates, newTemplate],
    };
    
    await db.settings.put({ ...updated, id: 'default' } as any);
    set({ settings: updated });
  },
  
  updateTemplate: async (id, updates) => {
    const current = get().settings;
    if (!current) return;
    
    const updated = {
      ...current,
      templates: current.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    };
    
    await db.settings.put({ ...updated, id: 'default' } as any);
    set({ settings: updated });
  },
  
  deleteTemplate: async (id) => {
    const current = get().settings;
    if (!current) return;
    
    const updated = {
      ...current,
      templates: current.templates.filter((t) => t.id !== id),
    };
    
    await db.settings.put({ ...updated, id: 'default' } as any);
    set({ settings: updated });
  },
}));
