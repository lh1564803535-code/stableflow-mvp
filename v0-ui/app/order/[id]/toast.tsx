"use client";

import { useEffect } from "react";
import { Check, AlertTriangle } from "lucide-react";

export function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all ${
        type === "success"
          ? "border border-green-500/20 bg-green-900/90 text-green-300"
          : "border border-red-500/20 bg-red-900/90 text-red-300"
      }`}
    >
      {type === "success" ? (
        <Check className="h-4 w-4" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <span className="text-sm">{message}</span>
    </div>
  );
}
