import { create } from 'zustand';

export interface StretchPose {
  id: string;
  name: string;
  durationSec: number;
  voiceStart: string;
  voiceHold: string;
  voiceEnd: string;
  warning?: string;
  hasBreathingSync?: boolean;
}

export interface StretchWorkout {
  id: string;
  title: string;
  totalDurationMin: number;
  poses: StretchPose[];
}

export const STRETCH_WORKOUTS: StretchWorkout[] = [
  {
    id: 's1',
    title: 'Giãn cơ cổ vai gáy',
    totalDurationMin: 5,
    poses: [
      {
        id: 'p1', name: 'Nghiêng đầu sang phải', durationSec: 30,
        voiceStart: "Nghiêng đầu sang phải, thả lỏng vai trái.",
        voiceHold: "Giữ trong 30 giây. Hít thở sâu.",
        voiceEnd: "Từ từ trở lại vị trí cũ.",
        warning: "Không xoay cổ quá nhanh",
        hasBreathingSync: true
      },
      {
        id: 'p2', name: 'Nghiêng đầu sang trái', durationSec: 30,
        voiceStart: "Đổi bên. Nghiêng đầu sang trái.",
        voiceHold: "Giữ tư thế. Thả lỏng bả vai phải.",
        voiceEnd: "Từ từ trở lại vị trí cũ.",
        warning: "Không nâng bả vai lên khi nghiêng đầu",
        hasBreathingSync: true
      },
      {
        id: 'p3', name: 'Giãn cơ vai', durationSec: 30,
        voiceStart: "Vắt chéo tay phải qua ngực, dùng tay trái ép vào.",
        voiceHold: "Giữ trong 30 giây.",
        voiceEnd: "Trở về trung tâm.",
        warning: "Ép nhẹ nhàng, không kéo quá mạnh",
      }
    ]
  },
  {
    id: 's2',
    title: '5 Phút Giãn Cơ Nhanh',
    totalDurationMin: 5,
    poses: [
      {
        id: 'p4', name: 'Gập người về trước', durationSec: 60,
        voiceStart: "Đứng thẳng, hai chân bằng vai. Từ từ gập người về phía trước.",
        voiceHold: "Thả lỏng hai tay. Hít thở đều.",
        voiceEnd: "Từ từ cuộn người đứng lên.",
        warning: "Có thể chùng nhẹ đầu gối nếu căng gân kheo",
        hasBreathingSync: true
      },
      {
        id: 'p5', name: 'Vặn mình trên ghế', durationSec: 60,
        voiceStart: "Ngồi thẳng lưng. Xoay người sang phải, tay trái đặt lên gối phải.",
        voiceHold: "Mắt nhìn qua vai phải. Giữ 30 giây mỗi bên.",
        voiceEnd: "Từ từ xoay trở lại.",
        warning: "Giữ lưng thẳng khi vặn mình",
        hasBreathingSync: false
      }
    ]
  },
  {
    id: 's3',
    title: '10 Phút Toàn Thân',
    totalDurationMin: 10,
    poses: [
      {
        id: 'p6', name: 'Giãn cơ đùi trước', durationSec: 60,
        voiceStart: "Đứng thăng bằng, co chân phải ra sau, dùng tay phải giữ gót chân.",
        voiceHold: "Giữ nguyên tư thế và siết nhẹ mông.",
        voiceEnd: "Thả chân xuống và chuẩn bị đổi bên.",
        warning: "Đừng để hai đầu gối tách xa nhau"
      }
    ]
  }
];

interface StretchStore {
  activeWorkout: StretchWorkout | null;
  workoutStartTime: number | null;
  currentPoseIndex: number;
  isPaused: boolean;

  startWorkout: (id: string) => void;
  nextPose: () => void;
  setPaused: (p: boolean) => void;
  endWorkout: () => void;
}

export const useStretchStore = create<StretchStore>((set, get) => ({
  activeWorkout: null,
  workoutStartTime: null,
  currentPoseIndex: 0,
  isPaused: false,

  startWorkout: (id) => {
    const workout = STRETCH_WORKOUTS.find(w => w.id === id);
    if (workout) {
      set({ activeWorkout: workout, workoutStartTime: Date.now(), currentPoseIndex: 0, isPaused: false });
    }
  },
  nextPose: () => set((state) => {
    if (!state.activeWorkout) return state;
    if (state.currentPoseIndex < state.activeWorkout.poses.length - 1) {
      return { currentPoseIndex: state.currentPoseIndex + 1 };
    }
    return state;
  }),
  setPaused: (p) => set({ isPaused: p }),
  endWorkout: () => set({ activeWorkout: null, workoutStartTime: null, currentPoseIndex: 0, isPaused: false })
}));
