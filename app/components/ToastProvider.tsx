"use client";

import * as Toast from "@radix-ui/react-toast";
import React, { createContext, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "warning";

type ToastState = {
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    duration: 3000,
  });

  const showToast = (message: string, type: ToastType = "success", duration = 3000) => {
    setToast({ message, type, duration });

    // Re-trigger toast even if already open
    setOpen(false);
    requestAnimationFrame(() => setOpen(true));
  };

  const borderColor = useMemo(() => {
    if (toast.type === "success") return "#4CAF50";
    if (toast.type === "warning") return "#FF9800";
    return "#F44336";
  }, [toast.type]);

  const contextValue = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={contextValue}>
      <Toast.Provider swipeDirection="right" duration={toast.duration ?? 3000}>
        {children}

        {/* Viewport should be fixed in top-right */}
        <Toast.Viewport
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            width: 360,
            maxWidth: "calc(100vw - 40px)",
            outline: "none",
          }}
        />

        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            padding: "12px 16px",
            borderRadius: 8,
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            borderLeft: `6px solid ${borderColor}`,
            fontSize: 14,
            fontWeight: 500,
            animation: "slideIn 0.25s ease-out",
            marginBottom: 10,
            color: 'black'
          }}
          
        >
          <Toast.Title style={{ marginRight: 8 }}>
            {toast.type === "success" ? "Success" : toast.type === "warning" ? "Warning" : "Error"}
          </Toast.Title>
          <Toast.Description>{toast.message}</Toast.Description>
        </Toast.Root>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(40px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};