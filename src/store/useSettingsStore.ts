import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  apiKeys: {
    gemini: string;
    openrouter: string;
    groq: string;
  };
  setApiKey: (provider: keyof SettingsState['apiKeys'], key: string) => void;
  deleteApiKey: (provider: keyof SettingsState['apiKeys']) => void;
  selectedProvider: 'gemini' | 'openrouter' | 'groq';
  setSelectedProvider: (provider: 'gemini' | 'openrouter' | 'groq') => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKeys: { gemini: '', openrouter: '', groq: '' },
      setApiKey: (provider, key) => set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),
      deleteApiKey: (provider) => set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: '' } })),
      selectedProvider: 'gemini',
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),
      selectedModel: 'gemini-2.5-flash',
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    { name: 'cafe-settings' }
  )
);
