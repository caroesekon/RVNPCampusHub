import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoSend, IoCheckmark, IoCheckmarkDone, IoSparkles } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import VerifiedBadge from '../components/ui/VerifiedBadge.jsx';
import MentionTextarea from '../components/mentions/MentionTextarea.jsx';
import messageApi from '../api/messageApi.js';
import aiApi from '../api/aiApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { formatMessageTime } from '../utils/formatDate.js';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isAIChat, setIsAIChat] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId === 'ai') {
      setIsAIChat(true);
      fetchAIStatus();
      setLoading(false);
    } else {
      setIsAIChat(false);
      fetchConversation();
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    if (socket && isConnected && !isAIChat) {
      socket.on('new-message', (message) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });
    }
    return () => { socket?.off('new-message'); };
  }, [socket, isConnected, conversationId, isAIChat]);

  const fetchAIStatus = async () => {
    try {
      const response = await aiApi.getStatus();
      if (response.data.success) setAiStatus(response.data.data);
    } catch { /* Silent */ }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchConversation = async () => {
    try {
      const response = await messageApi.getConversationById(conversationId);
      if (response.data.success) setConversation(response.data.data);
    } catch { /* Silent */ }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messageApi.getMessages(conversationId);
      if (response.data.success) setMessages(response.data.data.messages || []);
    } catch { /* Silent */ } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      if (isAIChat) {
        const userMessage = { id: Date.now().toString(), senderId: user?.id, content: { text: newMessage.trim() }, createdAt: new Date().toISOString(), deliveredAt: new Date().toISOString() };
        setMessages((prev) => [...prev, userMessage]);
        setNewMessage('');
        const response = await aiApi.chat(newMessage.trim());
        if (response.data.success) {
          const aiMessage = { id: (Date.now() + 1).toString(), senderId: 'ai', content: { text: response.data.data.reply }, createdAt: new Date().toISOString(), readAt: new Date().toISOString() };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        const response = await messageApi.sendMessage(conversationId, { content: { text: newMessage.trim() }, type: 'TEXT' });
        if (response.data.success) setMessages((prev) => [...prev, response.data.data]);
      }
      setNewMessage('');
      scrollToBottom();
    } catch { /* Silent */ } finally { setSending(false); }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.target.value.includes('@')) {
      e.preventDefault();
      handleSend();
    }
  };

  const getTickIcon = (message) => {
    if (message.senderId !== user?.id) return null;
    if (message.readAt) return <IoCheckmarkDone size={16} className="text-blue-500" />;
    if (message.deliveredAt) return <IoCheckmarkDone size={16} className="text-text-muted" />;
    return <IoCheckmark size={16} className="text-text-muted" />;
  };

  const otherUser = conversation?.participants?.find((p) => p.user?.id !== user?.id)?.user;

  return (
    <Layout>
      <div className="w-full flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-7rem)]">
        <div className="flex items-center gap-3 p-3 border-b border-border-color">
          <button onClick={() => navigate('/messages')} className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary lg:hidden">
            <IoArrowBack size={20} />
          </button>

          {isAIChat ? (
            <>
              <Avatar src={aiStatus?.avatarUrl} name={aiStatus?.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h2 className="font-medium text-text-primary truncate">{aiStatus?.name || 'HDM AI'}</h2>
                  <VerifiedBadge size={12} />
                </div>
                <span className="text-xs text-rvnp-green flex items-center gap-1"><IoSparkles size={10} /> AI Assistant • Always Online</span>
              </div>
            </>
          ) : (
            <>
              <Avatar src={otherUser?.avatarUrl} name={otherUser?.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h2 className="font-medium text-text-primary truncate">{otherUser?.fullName}</h2>
                  {otherUser?.hdmVerified && <VerifiedBadge size={12} />}
                </div>
                {isConnected && <span className="text-xs text-rvnp-green">Online</span>}
              </div>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size="md" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center text-text-muted py-10">{isAIChat ? 'Ask HDM AI anything!' : 'No messages yet. Say hello!'}</div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-2 rounded-2xl relative ${message.senderId === user?.id ? 'bg-rvnp-green text-rvnp-white rounded-br-sm' : 'bg-bg-tertiary text-text-primary rounded-bl-sm'}`}>
                  <p className="text-sm sm:text-base whitespace-pre-wrap break-words pr-5">{message.content?.text}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <span className={`text-xs ${message.senderId === user?.id ? 'text-rvnp-white opacity-70' : 'text-text-muted'}`}>{formatMessageTime(message.createdAt)}</span>
                    {getTickIcon(message)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-border-color">
          <div className="flex items-end gap-2">
            <MentionTextarea
              value={newMessage}
              onChange={setNewMessage}
              placeholder={isAIChat ? 'Ask HDM AI...' : 'Type a message...'}
              rows={1}
              className="flex-1 bg-bg-secondary text-text-primary rounded-lg p-2 sm:p-3 resize-none focus:outline-none placeholder:text-text-muted text-sm sm:text-base"
            />
            <button onClick={handleSend} disabled={!newMessage.trim() || sending} className="p-2.5 rounded-full bg-rvnp-green text-rvnp-white hover:bg-rvnp-green-light disabled:opacity-50 shrink-0">
              <IoSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;