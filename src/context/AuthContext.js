"use client";

import { createContext, useSyncExternalStore } from "react";
import {
  clearToken,
  getToken,
  isTokenReady,
  saveToken,
  subscribeToken,
} from "@/lib/auth/storage";

export const AuthContext = createContext(null);

/**
 * Browser token storage is an external system, so it is read through
 * useSyncExternalStore instead of an effect. That keeps the server render and
 * the first client paint identical (no token) while avoiding the cascading
 * render that setState-inside-useEffect causes.
 *
 * Every storage failure — and the in-memory fallback that keeps a session usable
 * when the browser refuses to persist it — is owned by the auth storage
 * boundary. Nothing imported here can throw, so this provider needs no guards of
 * its own and none are duplicated per component.
 */

// No browser storage exists while rendering on the server.
const getServerTokenSnapshot = () => null;
const getServerReadySnapshot = () => false;

export function AuthProvider({ children }) {
  const token = useSyncExternalStore(subscribeToken, getToken, getServerTokenSnapshot);
  const ready = useSyncExternalStore(subscribeToken, isTokenReady, getServerReadySnapshot);

  function login(newToken, remember) {
    saveToken(newToken, { remember });
  }

  function logout() {
    clearToken();
  }

  return (
    <AuthContext.Provider value={{ token, ready, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
