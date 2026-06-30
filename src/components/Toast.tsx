import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
};

const toastStyles = {
  success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50',
  error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50',
  warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50',
  info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50',
};

export const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const duration = toast.duration ?? 5000;
    const timer = setTimeout(() => onClose(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg pointer-events-auto',
        toastStyles[toast.type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {toastIcons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
      >
        <X className="w-4 h-4 text-stone-500 dark:text-stone-400" />
      </button>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};
