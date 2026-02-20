import { useState, useEffect } from "react";

export function useToast(duration = 3000) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), duration);
      return () => clearTimeout(timer);
    }
  }, [toast, duration]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  return { toast, showToast };
}
