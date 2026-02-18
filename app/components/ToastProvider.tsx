"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useState } from "react";

type ToastType = "success" | "error";

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType }>({
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setOpen(true);
  };

  const getBorderColor = () =>
    toast.type === "success" ? "#4CAF50" : "#F44336"; // green / red

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}

        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          duration={3000}
          className="toast-container"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            background: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            borderLeft: `6px solid ${getBorderColor()}`,
            fontSize: "14px",
            fontWeight: 500,
            animation: "slideIn 0.25s ease-out",
          }}
        >
          {toast.message}
        </Toast.Root>

        <Toast.Viewport />
      </Toast.Provider>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
