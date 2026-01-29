import React, { useEffect } from 'react';
import './ToastNotification.css';

/**
 * Simple toast (no external libs)
 * - bottom-left fixed
 * - auto hide by parent via onClose (we call it after durationMs)
 */
const ToastNotification = ({ variant = 'info', message, durationMs = 10000, onClick, onClose }) => {
  useEffect(() => {
    if (!durationMs) return;
    const t = setTimeout(() => {
      onClose && onClose();
    }, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onClose]);

  return (
    <div className={`toast toast-${variant}`} onClick={onClick} role="button" tabIndex={0}>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose && onClose();
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default ToastNotification;


