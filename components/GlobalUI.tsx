import React from "react";
import { Modal, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useUIStore } from "../store/uiStore";
import { useTheme } from "../context/ThemeContext";

export function GlobalUI() {
  const { isLoading, loadingText, alertConfig, hideAlert } = useUIStore();
  const { mode } = useTheme();

  return (
    <>
      {/* Global Loading Overlay */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60">
          <View
            className={`items-center justify-center p-6 rounded-2xl shadow-xl min-w-[140px] ${
              mode === "dark" ? "bg-slate-800" : "bg-white"
            }`}
          >
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text
              className={`mt-4 font-semibold text-center ${
                mode === "dark" ? "text-white" : "text-slate-800"
              }`}
            >
              {loadingText}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Global Custom Alert */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl ${
              mode === "dark" ? "bg-slate-900 border border-slate-700" : "bg-white"
            }`}
          >
            <Text
              className={`text-xl font-bold text-center mb-2 ${
                mode === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              {alertConfig.title}
            </Text>
            <Text
              className={`text-center text-base mb-6 ${
                mode === "dark" ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {alertConfig.message}
            </Text>

            <View className="flex-row items-center justify-end space-x-3">
              {alertConfig.buttons?.map((button, index) => {
                const isDestructive = button.style === "destructive";
                const isCancel = button.style === "cancel";

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => {
                      hideAlert();
                      if (button.onPress) button.onPress();
                    }}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${
                      isDestructive
                        ? "bg-red-500"
                        : isCancel
                        ? mode === "dark"
                          ? "bg-slate-800 border border-slate-700"
                          : "bg-slate-100"
                        : "bg-blue-500"
                    }`}
                  >
                    <Text
                      className={`font-bold text-base ${
                        isCancel && mode !== "dark"
                          ? "text-slate-700"
                          : "text-white"
                      }`}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
