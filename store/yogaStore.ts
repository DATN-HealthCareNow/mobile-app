import { create } from 'zustand';

export type YogaGroup = 'Warm-up' | 'Standing' | 'Balance' | 'Flexibility' | 'Strength' | 'Relaxation';

export interface YogaPose {
  id: string;
  name: string;
  sanskritName: string;
  durationSec: number;
  description: string;
  group: YogaGroup;
  voiceLines: string[];
  hasBreathingSync?: boolean;
  warnings?: string[];
}

export interface YogaFlow {
  id: string;
  title: string;
  level: string;
  totalDurationMin: number;
  description: string;
  poses: YogaPose[];
}

// Danh sách các luồng (Flow) tĩnh mẫu
export const YOGA_FLOWS: YogaFlow[] = [
  {
    id: 'f1',
    title: 'Morning Sun Salutation',
    level: 'Beginner',
    totalDurationMin: 5,
    description: 'A perfect quick flow to wake up your body.',
    poses: [
      {
        id: 'p1', name: 'Cat-Cow Pose', sanskritName: 'Marjaryasana', durationSec: 30, group: 'Warm-up',
        description: 'Warm up your spine and prepare for movement.',
        voiceLines: ["Vào tư thế chống bằng hai tay và hai gối.", "Hít vào, hạ bụng xuống nhẹ nhàng.", "Thở ra, cong lưng lên như con mèo."],
        hasBreathingSync: true
      },
      {
        id: 'p2', name: 'Mountain Pose', sanskritName: 'Tadasana', durationSec: 30, group: 'Standing',
        description: 'Establish your grounding and posture.',
        voiceLines: ["Đứng thẳng, hai chân khép nhẹ.", "Giữ bàn chân bám chắc trên sàn.", "Mở vai ra sau, kéo dài cột sống."],
        warnings: ["Don't lock your knees."]
      },
      {
        id: 'p3', name: 'Forward Fold', sanskritName: 'Uttanasana', durationSec: 45, group: 'Flexibility',
        description: 'Release tension in your back.',
        voiceLines: ["Thở ra và gập người từ hông.", "Thả lỏng đầu và cổ.", "Nếu cần, hơi chùng đầu gối."],
        warnings: ["Don't overstretch if you feel pain."]
      }
    ]
  },
  {
    id: 'f2',
    title: 'Core Strength & Balance',
    level: 'Intermediate',
    totalDurationMin: 10,
    description: 'Build strength and improve your focus.',
    poses: [
      {
        id: 'p4', name: 'Plank Pose', sanskritName: 'Phalakasana', durationSec: 45, group: 'Strength',
        description: 'Core stability and strength.',
        voiceLines: ["Bước hai chân ra sau vào tư thế plank.", "Siết chặt cơ bụng.", "Dùng tay đẩy sàn ra xa cơ thể."],
        hasBreathingSync: false
      },
      {
        id: 'p5', name: 'Tree Pose', sanskritName: 'Vrksasana', durationSec: 60, group: 'Balance',
        description: 'Find your center and balance.',
        voiceLines: ["Dồn trọng tâm sang chân trái.", "Đặt bàn chân phải vào mặt trong đùi trái.", "Nhìn cố định một điểm và hít thở đều."],
        warnings: ["Do not place foot on the knee joint."]
      },
      {
        id: 'p6', name: 'Child\'s Pose', sanskritName: 'Balasana', durationSec: 60, group: 'Relaxation',
        description: 'Rest and surrender.',
        voiceLines: ["Quỳ gối xuống sàn, hai ngón chân cái chạm nhau.", "Ngồi lùi về gót chân.", "Trườn hai tay về trước và đặt trán xuống sàn."],
        hasBreathingSync: true
      }
    ]
  }
];

interface YogaStore {
  activeFlow: YogaFlow | null;
  workoutStartTime: number | null;
  currentPoseIndex: number;
  isPaused: boolean;

  startFlow: (flowId: string) => void;
  nextPose: () => void;
  prevPose: () => void;
  setPaused: (p: boolean) => void;
  endFlow: () => void;
}

export const useYogaStore = create<YogaStore>((set, get) => ({
  activeFlow: null,
  workoutStartTime: null,
  currentPoseIndex: 0,
  isPaused: false,

  startFlow: (flowId) => {
    const flow = YOGA_FLOWS.find(f => f.id === flowId);
    if (flow) {
      set({ activeFlow: flow, workoutStartTime: Date.now(), currentPoseIndex: 0, isPaused: false });
    }
  },
  nextPose: () => set((state) => {
    if (!state.activeFlow) return state;
    if (state.currentPoseIndex < state.activeFlow.poses.length - 1) {
      return { currentPoseIndex: state.currentPoseIndex + 1 };
    }
    return state;
  }),
  prevPose: () => set((state) => {
    if (state.currentPoseIndex > 0) {
      return { currentPoseIndex: state.currentPoseIndex - 1 };
    }
    return state;
  }),
  setPaused: (p) => set({ isPaused: p }),
  endFlow: () => set({ activeFlow: null, workoutStartTime: null, currentPoseIndex: 0, isPaused: false })
}));
