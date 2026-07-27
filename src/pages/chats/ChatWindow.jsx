import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { getChatById, deleteMessage, markAsRead } from '@/api/chat';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Spinner } from '@/components/ui/Spinner';
import { formatChatTime } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export const ChatWindow = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { messages: allMessages, sendMessage, openChat, emitTyping, emitStopTyping, typingUsers } = useChat();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const messages = allMessages[chatId] || [];
  const typingUser = typingUsers[chatId];

  useEffect(() => {
    const load = async () => {
      try {
        const chatRes = await getChatById(chatId);
        setChat(chatRes.data || chatRes);
        await openChat(chatId);
        const currentUnread = (chatRes.data?.unreadCount || chatRes.unreadCount || {})[user?._id] || 0;
        if (currentUnread > 0) await markAsRead(chatId);
      } catch { toast.error('Failed to load chat'); }
      finally { setLoading(false); }
    };
    load();
  }, [chatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingUser]);
  useEffect(() => {
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSend = async () => { if (!input.trim()) return; const c = input.trim(); setInput(''); await sendMessage(chatId, c); emitStopTyping(chatId); };
  const handleTyping = (e) => { setInput(e.target.value); emitTyping(chatId); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleDelete = async (msgId) => { try { await deleteMessage(msgId); toast.success('Deleted'); } catch { toast.error('Failed'); } };

  const getStatusIcon = (msg) => {
    if (msg.deletedAt) return null;
    if (msg.readBy?.length > 1) return (
      <span className="inline-flex ml-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7L5 10L12 3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 7L5 10L12 3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2, 3)"/>
        </svg>
      </span>
    );
    return (
      <span className="inline-flex ml-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" fill="#3B82F6" stroke="white" strokeWidth="2"/>
          <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const otherPerson = chat?.type === 'direct' ? chat.participants?.find(p => { const id = typeof p === 'string' ? p : p._id; return id !== user?._id; }) : null;
  const chatName = chat?.groupName || (otherPerson ? `${otherPerson.firstName || ''} ${otherPerson.lastName || ''}`.trim() : 'Chat');
  const chatAvatar = otherPerson?.avatar || null;
  const isOnline = otherPerson?.isOnline;
  const isVerified = otherPerson?.hdmVerified;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/chats')} className="text-[var(--color-text-secondary)] text-lg flex-shrink-0">←</button>
          <Avatar src={chatAvatar} name={chatName} size="sm" verified={isVerified} />
          <div className="min-w-0">
            <p className="font-semibold text-[var(--color-text)] text-sm truncate flex items-center gap-1">{chatName}{isVerified && <VerifiedBadge size={14} />}</p>
            {typingUser ? <p className="text-xs text-[var(--color-primary)]">typing...</p> : isOnline ? <p className="text-xs text-green-500">Online</p> : null}
          </div>
        </div>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full hover:bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-secondary)] text-lg">⋮</button>
          {showMenu && (
            <div className="absolute right-0 top-10 w-48 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] py-1 z-50">
              <button onClick={() => { toast.success('Pinned'); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">📌 Pin Chat</button>
              <button onClick={() => { toast.success('Marked unread'); setShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">📩 Mark as Unread</button>
              <button onClick={() => { setShowMenu(false); navigate('/privacy'); }} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">⚙️ Privacy Settings</button>
              <hr className="border-[var(--color-border)] my-1" />
              <button onClick={() => { if(confirm('Clear chat?')){toast.success('Cleared');setShowMenu(false);} }} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-accent)] hover:bg-[var(--color-bg)]">🗑️ Clear Chat</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {messages.length === 0 && <p className="text-center text-sm text-[var(--color-text-muted)] py-20">No messages yet. Say hello!</p>}
        {messages.map(msg => {
          const isMine = (msg.sender === user?._id || msg.sender?._id === user?._id);
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className="relative group max-w-[75%]">
                <div className={`px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-[var(--color-primary)] text-white rounded-br-md' : 'bg-[var(--color-bg)] text-[var(--color-text)] rounded-bl-md'} ${msg.deletedAt ? 'opacity-50 italic' : ''}`}>
                  {msg.deletedAt ? <p className="italic">Message deleted</p> : <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>}
                  <div className={`flex items-center justify-end gap-0.5 mt-0.5 ${isMine ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                    <span className="text-[10px]">{formatChatTime(msg.createdAt)}</span>
                    {isMine && getStatusIcon(msg)}
                  </div>
                </div>
                {isMine && !msg.deletedAt && <button onClick={() => handleDelete(msg._id)} className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs hidden group-hover:flex items-center justify-center">🗑</button>}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-[var(--color-border)] flex items-center gap-2 flex-shrink-0">
        <button className="text-xl">📎</button>
        <input type="text" value={input} onChange={handleTyping} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1 px-4 py-2 rounded-full bg-[var(--color-bg)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
        <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-lg disabled:opacity-50">📤</button>
      </div>
    </div>
  );
};