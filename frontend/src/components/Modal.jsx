import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  confirmColorClass = "bg-[#06B6D4] hover:bg-[#0891B2] text-black font-bold",
  isConfirmDisabled = false
}) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Modal Box */}
      <div className="bg-[#11161D] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-gray-800/80 flex items-center justify-between">
          <h3 className="font-bold text-white text-base tracking-wide">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable if needed) */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-gray-300 space-y-4">
          {children}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800/80 bg-gray-950/20 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-transparent border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold text-xs transition-colors"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              type="button"
              disabled={isConfirmDisabled}
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-xs transition-all active:scale-[0.98] ${confirmColorClass} ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
