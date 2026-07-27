import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { getChats, createDirectChat } from '@/api/chat';
import { getFollowers } from '@/api/friends';
import { ChatListItem } from './ChatListItem';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export const ChatsPage = () => {
  const { isFeatureEnabled } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const chatEnabled = isFeatureEnabled('chat');

  useEffect(() => {
    if (!chatEnabled) return;
    fetchChats();
  }, [chatEnabled]);

  const fetchChats = async () => {
    try {
      const res = await getChats();
      setChats(res.data || res);
    } catch (err) {
      console.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const openNewChat = async () => {
    setShowNewChat(true);
    setLoadingFollowers(true);
    try {
      const res = await getFollowers(user._id);
      setFollowers(res.data || res);
    } catch (err) {
      toast.error('Failed to load followers');
    } finally {
      setLoadingFollowers(false);
    }
  };

  const startChat = async (followerId) => {
    try {
      const res = await createDirectChat(followerId);
      setShowNewChat(false);
      navigate(`/chats/${res.data?._id || res._id}`);
      toast.success('Chat started');
    } catch (err) {
      toast.error('Failed to start chat');
    }
  };

  if (!chatEnabled) {
    return <EmptyState icon="💬" title="Chat is currently disabled" description="The admin has disabled this feature." />;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-full skeleton" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-3 skeleton rounded" />
              <div className="w-48 h-2 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const pinnedChats = chats.filter(c => c.isPinned);
  const regularChats = chats.filter(c => !c.isPinned);

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[var(--color-text)]">Chats</h2>
        <Button size="sm" variant="outline" onClick={openNewChat}>+ New Chat</Button>
      </div>

      {chats.length === 0 ? (
        <EmptyState icon="💬" title="No conversations yet" description="Start a chat with your followers." action={<Button size="sm" onClick={openNewChat}>New Chat</Button>} />
      ) : (
        <div>
          {pinnedChats.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] px-1 mb-1 uppercase tracking-wide">Pinned</p>
              {pinnedChats.map(chat => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  onClick={() => {
                    if (chat.isAI) navigate('/ai-chat');
                    else navigate(`/chats/${chat._id}`);
                  }}
                />
              ))}
            </div>
          )}
          {regularChats.length > 0 && (
            <div>
              {pinnedChats.length > 0 && (
                <p className="text-xs font-semibold text-[var(--color-text-muted)] px-1 mb-1 uppercase tracking-wide">Chats</p>
              )}
              {regularChats.map(chat => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  onClick={() => {
                    if (chat.isAI) navigate('/ai-chat');
                    else navigate(`/chats/${chat._id}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showNewChat} onClose={() => setShowNewChat(false)} title="New Chat">
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">Select a follower to start a chat.</p>
        {loadingFollowers ? (
          <div className="flex justify-center py-6"><Spinner size="md" /></div>
        ) : followers.length === 0 ? (
          <EmptyState icon="👥" title="No followers yet" description="Follow someone to start chatting." />
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {followers.map(f => (
              <div key={f._id} onClick={() => startChat(f._id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                <Avatar src={f.avatar} name={f.firstName} size="md" verified={f.hdmVerified} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">{f.firstName} {f.lastName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{f.department || 'RVNP'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};