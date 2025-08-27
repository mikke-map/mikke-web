'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastMessage } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, message, type, duration = 3000 } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'error':
        return 'bg-error-50 border-error-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      default:
        return 'bg-info-50 border-info-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-success-800';
      case 'error':
        return 'text-error-800';
      case 'warning':
        return 'text-warning-800';
      default:
        return 'text-info-800';
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-xl border shadow-soft animate-slide-in
        ${getBackgroundColor()}
        ${getTextColor()}
      `}
    >
      {getIcon()}
      <div className="flex-1 body-medium font-medium">
        {message}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded-lg hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default Toast;