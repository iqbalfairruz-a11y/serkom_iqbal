import React, { createContext, useState, useContext } from "react";
import {
  saveSession,
  clearSession,
  getToken,
  getUser,
} from "./utils";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const fromUtils = getUser();
    if (fromUtils) return fromUtils;
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => getToken() || "");

  const login = (tokenData, userData) => {
    const role = userData?.role || "pembeli";
    setToken(tokenData);
    setUser(userData);
    saveSession(tokenData, role, userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  const logout = () => {
    setToken("");
    setUser(null);
    clearSession();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("admin");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
