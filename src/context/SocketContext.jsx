import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-user', user.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id]);

  const joinCampus = (campusId) => {
    if (socket && isConnected) {
      socket.emit('join-campus', campusId);
    }
  };

  const leaveCampus = (campusId) => {
    if (socket && isConnected) {
      socket.emit('leave-campus', campusId);
    }
  };

  const joinGroup = (groupId) => {
    if (socket && isConnected) {
      socket.emit('join-group', groupId);
    }
  };

  const leaveGroup = (groupId) => {
    if (socket && isConnected) {
      socket.emit('leave-group', groupId);
    }
  };

  const onNotification = (callback) => {
    if (socket) {
      socket.on('notification', callback);
    }
  };

  const onNewMessage = (callback) => {
    if (socket) {
      socket.on('new-message', callback);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinCampus,
        leaveCampus,
        joinGroup,
        leaveGroup,
        onNotification,
        onNewMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};