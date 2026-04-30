import { useCallback, useMemo } from "react";
import api from "../../../services/api";
import { clearStoredToken, getStoredToken, storeToken } from "../../../services/session";

export const useAuthViewModel = () => {
  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const token = res.data.token;
    await storeToken(token);

    return res.data;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    await api.post("/auth/register", { fullName, email, password });
  }, []);

  const getCurrentUser = useCallback(async () => {
    const res = await api.get("/auth/me");
    return res.data;
  }, []);

  const updateCurrentUser = useCallback(async (payload) => {
    const res = await api.put("/auth/me", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await clearStoredToken();
  }, []);

  const deleteAccount = useCallback(async () => {
    await api.delete("/auth/me");
    await clearStoredToken();
  }, []);

  const hasSession = useCallback(async () => {
    const token = await getStoredToken();
    return Boolean(token);
  }, []);

  return useMemo(
    () => ({ login, register, getCurrentUser, updateCurrentUser, logout, deleteAccount, hasSession }),
    [login, register, getCurrentUser, updateCurrentUser, logout, deleteAccount, hasSession]
  );
};
