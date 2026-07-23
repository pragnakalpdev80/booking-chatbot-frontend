import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// eslint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));

  const login = (newToken) => {
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
