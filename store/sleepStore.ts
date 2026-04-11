import { create } from 'zustand';

export interface AlarmConfig {
  id: string;
  time: string;
  enabled: boolean;
  soundId: string;
  days: string;
}

interface SleepStore {
  isSleeping: boolean;
  sleepStartTime: number | null;
  alarmTime: string | null;
  sleepMusicUrl: string | null;
  alarmId: string | null;
  alarmSoundFile: string | null;
  sleepGoal: number;
  alarms: AlarmConfig[];

  startSleep: (alarmTime: string, musicUrl?: string, alarmId?: string) => void;
  stopSleep: () => void;
  setMusicUrl: (url: string) => void;
  setAlarmId: (id: string) => void;
  setAlarmSoundFile: (file: string) => void;
  setSleepGoal: (hours: number) => void;
  addAlarm: (alarm: AlarmConfig) => void;
  toggleAlarm: (id: string, enabled: boolean) => void;
  removeAlarm: (id: string) => void;
}

export const useSleepStore = create<SleepStore>((set) => ({
  isSleeping: false,
  sleepStartTime: null,
  alarmTime: null,
  sleepMusicUrl: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_be0de90cce.mp3?filename=rain-and-thunder-12345.mp3', // Placeholder rain sound
  alarmId: null,
  alarmSoundFile: null,
  sleepGoal: 8,
  alarms: [],
  
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
  setSleepGoal: (hours) => set({ sleepGoal: hours }),
  
  addAlarm: (alarm) => set((state) => {
    // If the alarm time already exists, replace it, else push new
    const existingIndex = state.alarms.findIndex(a => a.time === alarm.time);
    if (existingIndex >= 0) {
      const newAlarms = [...state.alarms];
      newAlarms[existingIndex] = alarm;
      return { alarms: newAlarms, alarmTime: alarm.time }; // sync legacy as well
    }
    return { alarms: [...state.alarms, alarm], alarmTime: alarm.time };
  }),
  toggleAlarm: (id, enabled) => set((state) => ({
    alarms: state.alarms.map(a => a.id === id ? { ...a, enabled } : a)
  })),
  removeAlarm: (id) => set((state) => ({
    alarms: state.alarms.filter(a => a.id !== id)
  }))
}));
