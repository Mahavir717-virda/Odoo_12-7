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
  confirmColorClass = "bg-brand hover:bg-brand-hover text-bg-base font-bold",
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
        className="absolute inset-0 bg-bg-base/85 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Modal Box */}
      <div className="bg-bg-card border border-border-sage rounded-2xl w-full max-w-lg shadow-2xl shadow-brand/5 relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-border-sage flex items-center justify-between">
          <h3 className="font-display font-bold text-text-primary text-base tracking-wide">{title}</h3>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-base/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable if needed) */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-text-secondary space-y-4">
          {children}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border-sage bg-bg-base/30 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-transparent border border-border-sage hover:border-text-secondary text-text-primary font-semibold text-xs transition-colors"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              type="button"
              disabled={isConfirmDisabled}
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-[0.98] ${confirmColorClass} ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
