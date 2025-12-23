import { useState, useCallback } from 'react';
import { Toast } from '../../components/ui/Toast';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'success' | 'error' | 'info';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  // New toast API that accepts an object with title, description, variant
  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7);
    const message = options.title ? `${options.title}: ${options.description}` : options.description;
    const type = options.variant || 'info';
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = () => (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </>
  );

  return { showToast, toast, ToastContainer };
};
