"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FiX } from "react-icons/fi";

import styles from "./ToastProvider.module.css";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 6000;

/**
 * Small toast host used for cart feedback.
 *
 * The region is a polite live region so screen readers hear "Item removed"
 * without focus moving. Toasts that carry an action (Undo) are given a longer
 * default life, because an action nobody can reach in time is not an action.
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    ({ message, actionLabel, onAction, tone = "default", duration = DEFAULT_DURATION }) => {
      idRef.current += 1;
      const id = idRef.current;

      setToasts((current) => [...current.slice(-2), { id, message, actionLabel, onAction, tone }]);

      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );

      return id;
    },
    [dismiss]
  );

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    },
    []
  );

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${toast.tone === "success" ? styles.toastSuccess : ""}`.trim()}
          >
            <p className={styles.message}>{toast.message}</p>

            {toast.actionLabel && toast.onAction ? (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  toast.onAction();
                  dismiss(toast.id);
                }}
              >
                {toast.actionLabel}
              </button>
            ) : null}

            <button
              type="button"
              className={styles.close}
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
