import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";

export const useAuthViewModel = () => {
  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });

    const { accessToken, refreshToken } = res.data;

    await AsyncStorage.setItem("accessToken", accessToken);
    await AsyncStorage.setItem("token", accessToken);

    if (refreshToken) {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    }

    return accessToken;
  };

  const register = async (fullName, email, password) => {
    await api.post("/register", { fullName, email, password });
  };

  const forgotPassword = async (email) => {
    const res = await api.post("/forgot-password", { email });

    return res.data;
  };

  const resetPassword = async (resetToken, newPassword) => {
    const res = await api.post("/reset-password", { resetToken, newPassword });

    return res.data;
  };

  return { login, register, forgotPassword, resetPassword };
};