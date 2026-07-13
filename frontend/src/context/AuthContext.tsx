import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { fetchMe, loginRequest, logoutRequest, registerRequest } from "../api/auth";
import { tokenStorage } from "../api/client";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; fullName: string; school?: string; gradYear?: number }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const onExpired = () => {
      tokenStorage.clear();
      setUser(null);
    };
    window.addEventListener("jah:session-expired", onExpired);
    return () => window.removeEventListener("jah:session-expired", onExpired);
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const result = await loginRequest({ email, password });
    tokenStorage.setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  };

  const register = async (input: { email: string; password: string; fullName: string; school?: string; gradYear?: number }) => {
    const result = await registerRequest(input);
    tokenStorage.setTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  };

  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clear();
    setUser(null);
    if (refreshToken) {
      await logoutRequest(refreshToken).catch(() => undefined);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
