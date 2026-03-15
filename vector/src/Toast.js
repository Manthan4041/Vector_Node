// Toast.js — notification system replacing all alert() calls
import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

let _toastId = 0;

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

// Standalone toast function for use outside React components
let _addToastFn = null;
export const toast = {
  success: (msg) => _addToastFn?.({ type: 'success', message: msg }),
  error: (msg) => _addToastFn?.({ type: 'error', message: msg }),
  info: (msg) => _addToastFn?.({ type: 'info', message: msg }),
  warning: (msg) => _addToastFn?.({ type: 'warning', message: msg }),
};

const ICONS = { success: '✓', error: '✗', info: 'ℹ', warning: '⚠' };
const COLORS = {
  success: { bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.35)', accent: '#22d3ee' },
  error: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', accent: '#f87171' },
  info: { bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.35)', accent: '#6C63FF' },
  warning: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', accent: '#fbbf24' },
};

const AUTO_DISMISS_MS = 4000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(({ type = 'info', message }) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, type, message, exiting: false }]);
    setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    return id;
  }, [dismissToast]);

  // Register standalone toast function
  useEffect(() => {
    _addToastFn = addToast;
    return () => { _addToastFn = null; };
  }, [addToast]);

  const ctx = {
    success: (msg) => addToast({ type: 'success', message: msg }),
    error: (msg) => addToast({ type: 'error', message: msg }),
    info: (msg) => addToast({ type: 'info', message: msg }),
    warning: (msg) => addToast({ type: 'warning', message: msg }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        display: 'flex', flexDirection: 'column-reverse', gap: '8px',
        zIndex: 9999, pointerEvents: 'none',
      }}>
        {toasts.map((t) => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 16px', minWidth: '260px', maxWidth: '400px',
                background: c.bg,
                backdropFilter: 'blur(16px)',
                border: `1px solid ${c.border}`,
                borderLeft: `3px solid ${c.accent}`,
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                pointerEvents: 'auto',
                animation: t.exiting ? 'toastOut 0.3s forwards' : 'toastIn 0.3s forwards',
                cursor: 'pointer',
              }}
              onClick={() => dismissToast(t.id)}
            >
              <span style={{ fontSize: '14px', color: c.accent, flexShrink: 0, fontWeight: 700 }}>
                {ICONS[t.type]}
              </span>
              <span style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.4 }}>
                {t.message}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
