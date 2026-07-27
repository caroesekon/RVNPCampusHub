import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { SocketProvider } from '@/context/SocketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ChatProvider } from '@/context/ChatContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AppRoutes } from '@/routes';

// Suppress React Router v7 warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('React Router Future Flag Warning')) return;
  originalWarn(...args);
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <SettingsProvider>
              <SocketProvider>
                <NotificationProvider>
                  <ChatProvider>
                    <AppRoutes />
                    <ToastProvider />
                  </ChatProvider>
                </NotificationProvider>
              </SocketProvider>
            </SettingsProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}