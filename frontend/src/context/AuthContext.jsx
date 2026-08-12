import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, if we have a token, try to restore the session
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient
      .get("/auth/me")
      .then((res) => setCurrentUser(res.data))
      .catch(() => {
        localStorage.removeItem("access_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const res = await apiClient.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("access_token", res.data.access_token);
    setCurrentUser(res.data.user);
    return res.data.user;
  }

  async function register(payload) {
    // payload: { email, full_name, phone, password, role }
    await apiClient.post("/auth/register", payload);
    // registration doesn't log the user in automatically — do that as a follow-up call
    return login(payload.email, payload.password);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setCurrentUser(null);
  }

  const value = { currentUser, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
