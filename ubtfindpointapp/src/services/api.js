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

const baseURL = getBaseUrl();
const api = axios.create({
  baseURL,
});

const refreshClient = axios.create({
  baseURL,
});

const getStoredAccessToken = async () => {
  const accessToken = await AsyncStorage.getItem("accessToken");

  if (accessToken) {
    return accessToken;
  }

  return AsyncStorage.getItem("token");
};

const storeTokens = async ({ accessToken, refreshToken }) => {
  await AsyncStorage.setItem("accessToken", accessToken);
  await AsyncStorage.setItem("token", accessToken);

  if (refreshToken) {
    await AsyncStorage.setItem("refreshToken", refreshToken);
  }
};

const isAuthEndpoint = (config) => {
  const requestUrl = `${config?.baseURL ?? ""}${config?.url ?? ""}`;

  return /\/login$|\/register$|\/refresh$|\/forgot-password$|\/reset-password$/i.test(requestUrl);
};

api.interceptors.request.use(async (config) => {
  if (isAuthEndpoint(config)) {
    return config;
  }

  const token = await getStoredAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry || isAuthEndpoint(originalRequest)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      return Promise.reject(error);
    }

    try {
      const { data } = await refreshClient.post("/refresh", { refreshToken });

      await storeTokens(data);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      await AsyncStorage.multiRemove(["accessToken", "token", "refreshToken"]);
      return Promise.reject(refreshError);
    }
  }
);

export default api;
