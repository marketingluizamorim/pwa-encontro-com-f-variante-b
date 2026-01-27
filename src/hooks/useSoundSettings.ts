import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundSettingsState {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

export const useSoundSettings = create<SoundSettingsState>()(
  persist(
    (set) => ({
      isMuted: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      setMuted: (muted: boolean) => set({ isMuted: muted }),
    }),
    {
      name: 'sound-settings',
    }
  )
);
