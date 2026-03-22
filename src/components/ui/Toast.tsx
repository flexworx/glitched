'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; }

const ToastContext = createContext<{ addToast: (message: string, type?: Toast['type']) => void }>({ addToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const COLORS = { success: '#00ff88', error: '#ff4444', info: '#0ea5e9', warning: '#ffcc00' };
  const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id}
            className="flex items-center gap-3 px-4 py-3 bg-[#0d0d1a] border rounded-xl shadow-2xl text-sm text-white animate-in slide-in-from-bottom-2"
            style={{ borderColor: COLORS[toast.type] + '40' }}>
            <span className="font-bold" style={{ color: COLORS[toast.type] }}>{ICONS[toast.type]}</span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
export default ToastProvider;
