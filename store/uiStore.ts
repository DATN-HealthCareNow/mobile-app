import { create } from "zustand";

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "cancel" | "default" | "destructive";
};

export type AlertConfig = {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
};

interface UIState {
  // Loading State
  isLoading: boolean;
  loadingText: string;
  showLoading: (text?: string) => void;
  hideLoading: () => void;

  // Alert State
  alertConfig: AlertConfig;
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingText: "Đang xử lý...",
  showLoading: (text = "Đang xử lý...") =>
    set({ isLoading: true, loadingText: text }),
  hideLoading: () => set({ isLoading: false }),

  alertConfig: {
    visible: false,
    title: "",
    message: "",
    buttons: [],
  },
  showAlert: (title, message, buttons = [{ text: "Đóng", style: "default" }]) =>
    set({
      alertConfig: {
        visible: true,
        title,
        message,
        buttons,
      },
    }),
  hideAlert: () =>
    set((state) => ({
      alertConfig: { ...state.alertConfig, visible: false },
    })),
}));
