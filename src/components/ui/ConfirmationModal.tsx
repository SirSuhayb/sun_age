import React from 'react';
import ReactDOM from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode; // Allow custom content
  hideConfirmButton?: boolean; // Optionally hide confirm button
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children,
  hideConfirmButton = false,
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 z-[99999] bg-solara-sunrise" style={{ opacity: 0.6 }} />
      <div className="relative z-[100000] w-full">
        <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto mt-0 pt-0">
          <div className="flex justify-between items-center mb-3 mt-0 pt-0">
            <div className="text-xl font-serif font-bold" style={{ letterSpacing: '-0.06em' }}>{title}</div>
            <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-800 text-xl font-bold">×</button>
          </div>
          <div className="text-xs font-mono text-gray-500 mb-5 tracking-widest uppercase">{message}</div>
          {/* Custom content (e.g., payment form) */}
          {children && <div className="mb-4">{children}</div>}
          <div className="flex justify-between gap-4 mt-6">
            <button
              className="flex-1 px-6 py-3 border border-gray-400 bg-gray-100 text-gray-700 rounded-none uppercase tracking-widest font-mono text-sm hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
            {!hideConfirmButton && (
              <button
                className="flex-1 px-6 py-3 border border-red-500 bg-red-100 text-red-700 rounded-none uppercase tracking-widest font-mono text-sm hover:bg-red-200 transition-colors"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? ReactDOM.createPortal(modalContent, document.body) : null;
}

// SimpleModal: overlays the app, shows only a close button and children, no actions

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function SimpleModal({ isOpen, onClose, children }: SimpleModalProps) {
  if (!isOpen) return null;
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div 
        className="absolute inset-0 z-[99999] bg-solara-sunrise" 
        style={{ opacity: 0.6 }} 
        onClick={onClose}
      />
      <div className="relative z-[100000] w-full">
        <div className="backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 p-6 max-w-[360px] mx-auto mt-0 pt-0">
          {/* No close button */}
          {children && <div>{children}</div>}
        </div>
      </div>
    </div>
  );
  return typeof window !== 'undefined' ? ReactDOM.createPortal(modalContent, document.body) : null;
} 