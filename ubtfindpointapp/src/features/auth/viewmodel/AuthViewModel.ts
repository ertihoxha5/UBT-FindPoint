import { useCallback, useMemo, useState, useEffect } from "react";
import api from "../../../services/api";
import { clearStoredToken, getStoredToken, storeToken } from "../../../services/session";

// Define types
interface User {
  id: number;
  email: string;
  fullName?: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const useAuthViewModel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      return res.data;
    } catch (error) {
      setUser(null);
      return null;
    }
  }, []);

  // Load user on mount if session exists
  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      const hasSession = await getStoredToken();
      if (hasSession) {
        await getCurrentUser();
      }
      setLoading(false);
    };
    loadUser();
  }, [getCurrentUser]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", { email, password });

    const token = res.data.token;
    const userData = res.data.user;
    await storeToken(token);
    setUser(userData);

    return res.data;
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string): Promise<void> => {
    await api.post("/auth/register", { fullName, email, password });
  }, []);

  const requestPasswordReset = useCallback(async (email: string, newPassword: string, confirmPassword: string): Promise<any> => {
    const res = await api.post("/auth/forgot-password", { email, newPassword, confirmPassword });
    return res.data;
  }, []);

  const updateCurrentUser = useCallback(async (payload: FormData | Record<string, any>): Promise<User> => {
    const res = await api.put("/auth/me", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await clearStoredToken();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<void> => {
    await api.delete("/auth/me");
    await clearStoredToken();
    setUser(null);
  }, []);

  const hasSession = useCallback(async (): Promise<boolean> => {
    const token = await getStoredToken();
    return Boolean(token);
  }, []);

  return useMemo(
    () => ({ 
      user, 
      loading,
      login, 
      register, 
      requestPasswordReset,
      getCurrentUser, 
      updateCurrentUser, 
      logout, 
      deleteAccount, 
      hasSession 
    }),
    [user, loading, login, register, requestPasswordReset, getCurrentUser, updateCurrentUser, logout, deleteAccount, hasSession]
  );
};
