import { create } from 'zustand';

interface SleepStore {
  isSleeping: boolean;
  sleepStartTime: number | null;
  alarmTime: string | null;
  sleepMusicUrl: string | null;
  alarmId: string | null;
  alarmSoundFile: string | null;

  startSleep: (alarmTime: string, musicUrl?: string, alarmId?: string) => void;
  stopSleep: () => void;
  setMusicUrl: (url: string) => void;
  setAlarmId: (id: string) => void;
  setAlarmSoundFile: (file: string) => void;
}

export const useSleepStore = create<SleepStore>((set) => ({
  isSleeping: false,
  sleepStartTime: null,
  alarmTime: null,
  sleepMusicUrl: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_be0de90cce.mp3?filename=rain-and-thunder-12345.mp3', // Placeholder rain sound
  alarmId: null,
  alarmSoundFile: null,
  
  startSleep: (time, url, alarmIdParam) => set((state) => ({ 
      isSleeping: true, 
      sleepStartTime: Date.now(), 
      alarmTime: time,
      sleepMusicUrl: url || state.sleepMusicUrl,
      alarmId: alarmIdParam || state.alarmId
  })),
  stopSleep: () => set({ 
    isSleeping: false, 
    sleepStartTime: null, 
    alarmTime: null,
    alarmId: null
  }),
  setMusicUrl: (url) => set({ sleepMusicUrl: url }),
  setAlarmId: (id) => set({ alarmId: id }),
  setAlarmSoundFile: (file) => set({ alarmSoundFile: file }),
}));
