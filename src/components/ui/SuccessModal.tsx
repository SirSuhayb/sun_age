"use client";

import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  solarEarned?: number;
}

export function SuccessModal({ isOpen, onClose, title, message, solarEarned }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-sm text-gray-600 mb-4">
            {message}
          </p>
          
          {/* SOLAR earned */}
          {solarEarned && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                🌞 You earned <span className="font-bold">{solarEarned} SOLAR</span> for completing your guidance!
              </p>
            </div>
          )}
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
} 