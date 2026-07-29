"use client";

import { createContext, useSyncExternalStore } from "react";
import { AuthStorage } from "@/lib/auth/storage";

export const AuthContext = createContext(null);

/**
 * Browser token storage is an external system, so it is read through
 * useSyncExternalStore instead of an effect. That keeps the server render and
 * the first client paint identical (no token) while avoiding the cascading
 * render that setState-inside-useEffect causes.
 */
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitChange() {
  for (const listener of listeners) listener();
}

function getTokenSnapshot() {
  return AuthStorage.getToken() || sessionStorage.getItem("token") || null;
}

// No browser storage exists while rendering on the server.
function getServerTokenSnapshot() {
  return null;
}

// Storage has been read once the client has taken over from the server markup.
const getReadySnapshot = () => true;
const getServerReadySnapshot = () => false;

export function AuthProvider({ children }) {
  const token = useSyncExternalStore(subscribe, getTokenSnapshot, getServerTokenSnapshot);
  const ready = useSyncExternalStore(subscribe, getReadySnapshot, getServerReadySnapshot);

  function login(newToken, remember) {
    if (remember) AuthStorage.setToken(newToken);
    else sessionStorage.setItem("token", newToken);

    emitChange();
  }

  function logout() {
    AuthStorage.logout();
    sessionStorage.removeItem("token");
    emitChange();
  }

  return (
    <AuthContext.Provider value={{ token, ready, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
