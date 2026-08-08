import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // auto-close after 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`notification-toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
      {type === 'success' ? (
        <CheckCircle size={20} style={{ color: 'var(--accent-green)' }} />
      ) : (
        <AlertTriangle size={20} style={{ color: 'var(--accent-rose)' }} />
      )}
      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{message}</span>
    </div>
  );
}
