import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  authService,
  ChangePasswordConfirmRequest,
  ForgotPasswordConfirmRequest,
  LoginRequest,
  OtpRequest,
  RegisterRequest,
} from "../api/services/authService";
import {
  notifySessionChange,
  subscribeToSessionChanges,
} from "../utils/sessionEvents";

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id_token: string }) => authService.googleLogin(data),
    onSuccess: async (data) => {
      await queryClient.cancelQueries();
      queryClient.clear();

      if (data.token) {
        await SecureStore.setItemAsync("accessToken", data.token);
      }
      if (data.user_id) {
        await SecureStore.setItemAsync("userId", data.user_id);
        if (data?.is_new_user || data?.isNewUser) {
          await SecureStore.setItemAsync(
            `fitTutorialPending:${data.user_id}`,
            "true",
          );
        }
      }
      await SecureStore.setItemAsync("authProvider", "google");

      notifySessionChange();
      console.log("[useGoogleLogin] Success, session updated");
    },
    onError: (error) => {
      console.error("Google Login failed", error);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (data) => {
      // Clear all cache before saving new user info to avoid stale data
      await queryClient.cancelQueries();
      queryClient.clear();

      // Save token and userId to Store
      if (data.token) {
        await SecureStore.setItemAsync("accessToken", data.token);
      }
      if (data.user_id) {
        await SecureStore.setItemAsync("userId", data.user_id);
      }
      await SecureStore.setItemAsync("authProvider", "password");

      // Notify session change - this triggers useSession update and forces refetch
      notifySessionChange();

      console.log("[useLogin] Success, session updated");
    },
    onError: (error) => {
      console.error("Login failed", error);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: async (data) => {
      // Clear old cache
      await queryClient.cancelQueries();
      queryClient.clear();

      // Save new session
      if (data.token) {
        await SecureStore.setItemAsync("accessToken", data.token);
      }
      if (data.user_id) {
        await SecureStore.setItemAsync("userId", data.user_id);
        await SecureStore.setItemAsync(
          `fitTutorialPending:${data.user_id}`,
          "true",
        );
      }
      await SecureStore.setItemAsync("authProvider", "password");
      notifySessionChange();
      console.log("[useRegister] Success, session updated");
    },
    onError: (error) => {
      console.error("Register failed", error);
    },
  });
};

export const useRequestRegisterOtp = () => {
  return useMutation({
    mutationFn: (data: OtpRequest) => authService.requestRegisterOtp(data),
  });
};

export const useRequestChangePasswordOtp = () => {
  return useMutation({
    mutationFn: (data: OtpRequest) =>
      authService.requestChangePasswordOtp(data),
  });
};

export const useConfirmChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordConfirmRequest) =>
      authService.confirmChangePassword(data),
  });
};

export const useRequestForgotPasswordOtp = () => {
  return useMutation({
    mutationFn: (data: OtpRequest) =>
      authService.requestForgotPasswordOtp(data),
  });
};

export const useConfirmForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordConfirmRequest) =>
      authService.confirmForgotPassword(data),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("authProvider");
    queryClient.clear(); // Xóa toàn bộ dữ liệu cũ khi logout
    notifySessionChange();
    console.log("Logged out");
  };
};

export const useSession = () => {
  const [session, setSession] = React.useState<{
    token: string | null;
    userId: string | null;
    isLoading: boolean;
  }>({
    token: null,
    userId: null,
    isLoading: true,
  });

  const loadSession = React.useCallback(async () => {
    try {
      const [token, userId] = await Promise.all([
        SecureStore.getItemAsync("accessToken"),
        SecureStore.getItemAsync("userId"),
      ]);
      setSession({ token, userId, isLoading: false });
    } catch (e) {
      console.error("[useSession] Error loading session:", e);
      setSession({ token: null, userId: null, isLoading: false });
    }
  }, []);

  React.useEffect(() => {
    loadSession();
    return subscribeToSessionChanges(loadSession);
  }, [loadSession]);

  return session;
};
