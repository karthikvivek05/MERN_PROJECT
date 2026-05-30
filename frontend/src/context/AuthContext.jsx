import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, { getErrorMessage } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const login = async (form) => {
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = getErrorMessage(err, "Login failed");
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (form) => {
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = getErrorMessage(err, "Registration failed");
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshProfile: loadMe,
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
