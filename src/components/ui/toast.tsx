"use client";

import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[999999] animate-slide-in">
      <div className={`px-4 py-2 rounded shadow-lg ${getTypeStyles()}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast manager for multiple toasts
interface ToastManagerProps {
  toasts: Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>;
  onRemove: (id: string) => void;
}

export function ToastManager({ toasts, onRemove }: ToastManagerProps) {
  return (
    <div className="fixed top-4 right-4 z-[999999] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
} 