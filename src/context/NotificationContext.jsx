import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useSocket } from './SocketContext.jsx';
import notificationApi from '../api/notificationApi.js';
import messageApi from '../api/messageApi.js';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCounts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('new-message', (message) => {
        setUnreadMessages((prev) => prev + 1);
        fetchNotificationCount();
      });

      socket.on('notification', () => {
        fetchNotificationCount();
      });
    }

    return () => {
      socket?.off('new-message');
      socket?.off('notification');
    };
  }, [socket, isConnected]);

  const fetchCounts = async () => {
    try {
      const [notifRes, msgRes] = await Promise.all([
        notificationApi.getUnreadCount(),
        messageApi.getUnreadCount(),
      ]);

      if (notifRes.data.success) {
        setUnreadNotifications(notifRes.data.data.unreadCount || 0);
      }

      if (msgRes.data.success) {
        setUnreadMessages(msgRes.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread counts:', error.message);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();

      if (response.data.success) {
        setUnreadNotifications(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error.message);
    }
  };

  const refreshUnreadCounts = () => {
    fetchCounts();
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadNotifications,
        unreadMessages,
        refreshUnreadCounts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};