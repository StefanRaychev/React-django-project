import React, { createContext, useState, useContext, useEffect  } from 'react';

// Create the context
export const AuthContext = createContext();

// Create the provider
export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(() => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser && storedUser !== "undefined"
      ? JSON.parse(storedUser)
      : null;
  } catch (e) {
    console.error("Invalid user data in localStorage:", e);
    return null;
  }
});


  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    const login = (userData, authToken = null) => {
    console.log("📥 login() raw input:", userData, authToken);
    console.log("💡 login() called in AuthContext.js");
    console.log("✅ login() extracted token:", authToken);
    const extractedUser = userData.user || userData;  // ✅ get user if wrapped in a "user" field
    console.log("✅ extracted user:", extractedUser);
    console.log("✅ extracted token:", authToken);
    setUser(extractedUser);
    setToken(authToken);
    console.log("🔁 setToken() fired");

    localStorage.setItem("user", JSON.stringify(extractedUser));
    if (authToken) {
      localStorage.setItem("token", authToken);
    }
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!token;

    // Debug log for tracing token and state
  useEffect(() => {
    console.log('🟢 Auth Debug');
    console.log('User:', user);
    console.log('Token:', token);
    console.log('Authenticated:', isAuthenticated);
  }, [user, token]);


  return (
<AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
