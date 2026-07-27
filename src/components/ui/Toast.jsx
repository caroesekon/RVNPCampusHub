import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => (
  <Toaster
    position="top-center"
    toastOptions={{
      duration: 3000,
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      success: {
        iconTheme: { primary: 'var(--color-primary)', secondary: '#fff' },
      },
      error: {
        iconTheme: { primary: 'var(--color-accent)', secondary: '#fff' },
      },
    }}
  />
);