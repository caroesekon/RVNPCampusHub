import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { aiChat, getMessages, getChats } from '@/api/chat';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatChatTime } from '@/utils/formatDate';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';

export const AIChatPage = () => {
  const { isAIEnabled } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const emojiRef = useRef(null);
  const aiEnabled = isAIEnabled('chatEnabled');

 useEffect(() => {
  if (!aiEnabled) {
    navigate('/chats');
    toast.error('HDM AI is currently disabled');
  }
}, [aiEnabled]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadHistory = async () => {
    try {
      const chatsRes = await getChats();
      const chats = chatsRes.data || chatsRes;
      const existingAI = chats.find(c => c.isAI);

      if (existingAI) {
        setChatId(existingAI._id);
        const msgsRes = await getMessages(existingAI._id);
        const msgs = msgsRes.data || msgsRes;
        if (msgs.length > 0) {
          setMessages(msgs.map(m => ({
            _id: m._id,
            role: m.type === 'ai' ? 'ai' : 'user',
            content: m.content,
            createdAt: m.createdAt,
          })));
        } else {
          setMessages([{ _id: 'welcome', role: 'ai', content: 'Hello! I\'m HDM AI. Ask me anything about RVNP Campus Hub.', createdAt: new Date().toISOString() }]);
        }
      } else {
        setMessages([{ _id: 'welcome', role: 'ai', content: 'Hello! I\'m HDM AI. Ask me anything about RVNP Campus Hub.', createdAt: new Date().toISOString() }]);
      }
    } catch {
      setMessages([{ _id: 'welcome', role: 'ai', content: 'Hello! I\'m HDM AI. Ask me anything about RVNP Campus Hub.', createdAt: new Date().toISOString() }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!aiEnabled) return <EmptyState icon="🤖" title="HDM AI is currently disabled" description="The admin has disabled this feature." />;

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { _id: Date.now().toString(), role: 'user', content: input.trim(), createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiChat({ message: userMsg.content });
      if (res.data?.chatId) setChatId(res.data.chatId);
      const aiMsg = { _id: (Date.now() + 1).toString(), role: 'ai', content: res.data?.reply || res.reply || 'Sorry.', createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleEmojiSelect = (emoji) => { setInput(prev => prev + emoji.emoji); setShowEmoji(false); };

  const handleClearChat = () => {
    if (!confirm('Clear all chat history?')) return;
    setMessages([{ _id: 'welcome', role: 'ai', content: 'Hello! I\'m HDM AI. Ask me anything about RVNP Campus Hub.', createdAt: new Date().toISOString() }]);
    toast.success('Chat cleared locally');
    setShowMenu(false);
  };

  const handleExportChat = () => {
    const text = messages.map(m => `[${m.role === 'ai' ? 'HDM AI' : 'You'}] ${new Date(m.createdAt).toLocaleString()}\n${m.content}\n`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `hdm-ai-chat-${new Date().toISOString().slice(0, 10)}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported');
    setShowMenu(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/chats')} className="text-[var(--color-text-secondary)] text-lg">←</button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-500 flex items-center justify-center text-xl">🤖</div>
          <div>
            <p className="font-semibold text-[var(--color-text)] text-sm flex items-center gap-1">HDM AI<VerifiedBadge size={10} /></p>
            <p className="text-[10px] text-[var(--color-text-muted)]">from HDM</p>
          </div>
        </div>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full hover:bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-secondary)] text-lg">⋮</button>
          {showMenu && (
            <div className="absolute right-0 top-10 w-48 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] py-1 z-50">
              <button onClick={handleClearChat} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">🗑️ Clear Chat</button>
              <button onClick={handleExportChat} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">📤 Export Chat</button>
              <button onClick={() => { setShowMenu(false); navigate('/privacy'); }} className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]">⚙️ Privacy Settings</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
        {loadingHistory ? (
          <div className="flex justify-center py-10"><div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" /><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.1s' }} /><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div>
        ) : (
          messages.map(msg => (
            <div key={msg._id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[var(--color-primary)] text-white rounded-br-md' : 'bg-[var(--color-bg)] text-[var(--color-text)] rounded-bl-md'}`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>{formatChatTime(msg.createdAt)}</span>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start"><div className="bg-[var(--color-bg)] rounded-2xl rounded-bl-md px-4 py-2.5"><div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" /><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.1s' }} /><span className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div></div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-[var(--color-border)] flex-shrink-0">
        {showEmoji && <div className="mb-2" ref={emojiRef}><EmojiPicker onEmojiClick={handleEmojiSelect} width="100%" height={300} /></div>}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEmoji(!showEmoji)} className="text-xl">😊</button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask HDM AI anything..." disabled={loading} className="flex-1 px-4 py-2 rounded-full bg-[var(--color-bg)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50" />
          <button onClick={handleSend} disabled={!input.trim() || loading} className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-500 text-white flex items-center justify-center text-lg disabled:opacity-50">📤</button>
        </div>
      </div>
    </div>
  );
};