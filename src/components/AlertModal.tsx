import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: AlertType;
  title: string;
  message?: string;
  onConfirm?: () => void;
  confirmText?: string;
}

const alertIcons = {
  error: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
  warning: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
  success: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />,
  info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
};

const alertStyles = {
  error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50',
  warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50',
  success: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50',
  info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50',
};

export const AlertModal: React.FC<AlertModalProps> = ({
  open,
  onOpenChange,
  type,
  title,
  message,
  onConfirm,
  confirmText = 'OK'
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">{alertIcons[type]}</div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          {message && (
            <DialogDescription className="mt-2 ml-9">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
