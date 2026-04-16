import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000/api/auth`;
  }

  return "http://localhost:3000/api/auth";
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  console.log("STORED TOKEN:", token);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
