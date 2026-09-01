import { create } from 'zustand';

export type AtmosphereMode = 
  | 'morning-zen' 
  | 'evening-chill' 
  | 'night-focus' 
  | 'busy-cafe' 
  | 'normal';

interface EnvironmentState {
  noiseLevel: number;
  lightLevel: number;
  atmosphereMode: AtmosphereMode;
  setNoiseLevel: (level: number) => void;
  setLightLevel: (level: number) => void;
}

const calculateMode = (noiseLevel: number, lightLevel: number): AtmosphereMode => {
  const hour = new Date().getHours();

  if (noiseLevel >= 60) return 'busy-cafe';

  const isMorning = hour >= 5 && hour < 12;
  const isEvening = hour >= 17 && hour < 21;
  const isNight = hour >= 21 || hour < 5;

  if (isMorning && lightLevel >= 60) return 'morning-zen';
  if (isEvening && lightLevel >= 20 && lightLevel < 60) return 'evening-chill';
  if (isNight && lightLevel < 20) return 'night-focus';

  return 'normal';
};

export const useEnvironmentStore = create<EnvironmentState>((set) => ({
  noiseLevel: 0,
  lightLevel: 50,
  atmosphereMode: 'normal',
  setNoiseLevel: (level: number) => set((state) => {
    const newNoise = Math.max(0, Math.min(100, level));
    return { noiseLevel: newNoise, atmosphereMode: calculateMode(newNoise, state.lightLevel) };
  }),
  setLightLevel: (level: number) => set((state) => {
    const newLight = Math.max(0, Math.min(100, level));
    return { lightLevel: newLight, atmosphereMode: calculateMode(state.noiseLevel, newLight) };
  }),
}));
