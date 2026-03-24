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
        voiceLines: ["Get on your hands and knees.", "Inhale, drop your belly down.", "Exhale, round your spine up like a cat."],
        hasBreathingSync: true
      },
      {
        id: 'p2', name: 'Mountain Pose', sanskritName: 'Tadasana', durationSec: 30, group: 'Standing',
        description: 'Establish your grounding and posture.',
        voiceLines: ["Stand tall with feet together.", "Ground your feet firmly.", "Roll shoulders back, spine long."],
        warnings: ["Don't lock your knees."]
      },
      {
        id: 'p3', name: 'Forward Fold', sanskritName: 'Uttanasana', durationSec: 45, group: 'Flexibility',
        description: 'Release tension in your back.',
        voiceLines: ["Exhale and hinge at your hips.", "Let your head hang heavy.", "Bend your knees slightly if needed."],
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
        voiceLines: ["Step your feet back into a push-up position.", "Keep your core tight.", "Press the floor away from you."],
        hasBreathingSync: false
      },
      {
        id: 'p5', name: 'Tree Pose', sanskritName: 'Vrksasana', durationSec: 60, group: 'Balance',
        description: 'Find your center and balance.',
        voiceLines: ["Shift weight to your left foot.", "Place your right foot on your inner thigh.", "Find a focal point to stare at. Breathe."],
        warnings: ["Do not place foot on the knee joint."]
      },
      {
        id: 'p6', name: 'Child\'s Pose', sanskritName: 'Balasana', durationSec: 60, group: 'Relaxation',
        description: 'Rest and surrender.',
        voiceLines: ["Kneel on the floor, toes together.", "Sit back on your heels.", "Walk your hands forward, rest your forehead."],
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
