"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { apiGetMe, apiLogout } from "./api";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initial load: get CSRF token and check if logged in
    const checkAuth = async () => {
      const { data } = await apiGetMe();
      if (data && data.username) {
        setUser(data);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData) => {
    if (userData.token) {
      localStorage.setItem('quiz_token', userData.token);
    }
    setUser(userData);
    router.push("/dashboard");
  };

  const logout = async () => {
    await apiLogout();
    localStorage.removeItem('quiz_token');
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
