import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useSettings } from './SettingsContext';
import { getChats, getMessages, sendMessage as apiSendMessage } from '@/api/chat';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { isAIEnabled } = useSettings();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  const totalUnread = chats.reduce((sum, chat) => {
    const unread = chat.unreadCount || {};
    return sum + (unread[user?._id] || 0);
  }, 0);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getChats();
      let allChats = res.data || res;
      if (!isAIEnabled('chatEnabled')) {
        allChats = allChats.filter(c => !c.isAI);
      }
      setChats(allChats);
    } catch {}
  }, [user, isAIEnabled]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const openChat = useCallback(async (chatId) => {
    setActiveChat(chatId);
    try {
      const res = await getMessages(chatId);
      const msgs = res.data || res;
      setMessages(prev => ({ ...prev, [chatId]: msgs }));
      return msgs;
    } catch {
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (chatId, content, type = 'text', fileUrl = null, fileName = null) => {
    try {
      const body = { content, type };
      if (fileUrl) body.fileUrl = fileUrl;
      if (fileName) body.fileName = fileName;
      const res = await apiSendMessage(chatId, body);
      const newMsg = res.data || res;
      setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), newMsg] }));
      setChats(prev => {
        const updated = prev.map(c =>
          c._id === chatId
            ? { ...c, lastMessage: { sender: user._id, content: type === 'image' ? '📷 Image' : type === 'file' ? '📎 File' : content, type, createdAt: new Date() }, updatedAt: new Date() }
            : c
        );
        return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
      return newMsg;
    } catch {
      return null;
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat:newMessage', (message) => {
      const chatId = message.chat;
      setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), message] }));
      fetchChats();
    });

    socket.on('user:typing', ({ chatId, userId, userName }) => {
      if (userId !== user?.id) {
        setTypingUsers(prev => ({ ...prev, [chatId]: userName }));
        setTimeout(() => setTypingUsers(prev => ({ ...prev, [chatId]: null })), 3000);
      }
    });

    socket.on('chat:messageRead', ({ chatId, messageId, readBy }) => {
      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(m =>
          m._id === messageId ? { ...m, readBy: [...(m.readBy || []), readBy] } : m
        ),
      }));
    });

    return () => {
      socket.off('chat:newMessage');
      socket.off('user:typing');
      socket.off('chat:messageRead');
    };
  }, [socket, user, fetchChats]);

  const emitTyping = (chatId) => socket?.emit('user:typing', { chatId });
  const emitStopTyping = (chatId) => socket?.emit('user:stopTyping', { chatId });

  return (
    <ChatContext.Provider value={{
      chats, activeChat, messages, typingUsers, totalUnread,
      openChat, sendMessage, fetchChats, emitTyping, emitStopTyping, setActiveChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};