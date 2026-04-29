import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";

export const useAuthViewModel = () => {
  const login = async (email, password) => {
    const res = await api.post("auth/login", { email, password });

    const token = res.data.token;
    await AsyncStorage.setItem("token", token);

    return token;
  };

  const register = async (fullName, email, password) => {
    await api.post("auth/register", { fullName, email, password });
  };

  return { login, register };
};