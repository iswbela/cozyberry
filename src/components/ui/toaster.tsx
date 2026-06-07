"use client";
import { useState, createContext, useContext, useCallback, useRef } from "react";

type Toast = { id: string; message: string; type?: "success" | "error" };

type ToastContextValue = {
  addToast: (msg: string, type?: "success" | "error") => void;
};

export const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-4 py-3 text-sm shadow-lg text-white pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "error" ? "bg-red-500" : "bg-[var(--accent)]"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Drop-in for layout — now just re-exports the provider wrapper */
export function Toaster({ children }: { children?: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

export const useToast = () => useContext(ToastContext);
