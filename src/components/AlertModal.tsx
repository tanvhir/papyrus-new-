import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Copy, Check } from 'lucide-react';
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
  debugInfo?: string;
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
  confirmText = 'OK',
  debugInfo
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (debugInfo) {
      await navigator.clipboard.writeText(debugInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        {debugInfo && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Debug Info</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 text-xs"
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="bg-stone-100 dark:bg-stone-900 p-3 rounded text-xs text-stone-700 dark:text-stone-300 overflow-auto max-h-48 whitespace-pre-wrap break-all">
              {debugInfo}
            </pre>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
