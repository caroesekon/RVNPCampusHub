import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChatbubbleOutline, IoSearch, IoAdd, IoSparkles } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import VerifiedBadge from '../components/ui/VerifiedBadge.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import messageApi from '../api/messageApi.js';
import friendApi from '../api/friendApi.js';
import aiApi from '../api/aiApi.js';
import timeAgo from '../utils/timeAgo.js';
import { useNotifications } from '../context/NotificationContext.jsx';

const Messages = () => {
  const navigate = useNavigate();
  const { refreshUnreadCounts } = useNotifications();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [messageableUsers, setMessageableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [creating, setCreating] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('rvnp_user'));

  useEffect(() => {
    fetchConversations();
    fetchAIStatus();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await aiApi.getStatus();
      if (response.data.success) {
        setAiStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI status:', error.message);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await messageApi.getConversations();
      if (response.data.success) {
        setConversations(response.data.data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessageableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await friendApi.getMessageableUsers();
      if (response.data.success) {
        setMessageableUsers(response.data.data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenNewChat = () => {
    setShowNewChat(true);
    fetchMessageableUsers();
  };

  const handleStartChat = async (userId) => {
    setCreating(true);
    try {
      const response = await messageApi.createDirectConversation(userId);
      if (response.data.success) {
        setShowNewChat(false);
        navigate(`/messages/${response.data.data.id}`);
      }
    } catch (error) {
      console.error('Failed to start chat:', error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenConversation = (conversationId) => {
    navigate(`/messages/${conversationId}`);
    refreshUnreadCounts();
  };

  const handleStartAIChat = () => {
    navigate('/messages/ai');
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.participants?.find((p) => p.user?.id !== currentUser?.id)?.user;
    const name = otherUser?.fullName || conv.group?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const filteredUsers = messageableUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchUser.toLowerCase())
  );

  const getOtherUser = (conv) => {
    return conv.participants?.find((p) => p.user?.id !== currentUser?.id)?.user;
  };

  const getLastMessage = (conv) => {
    return conv.messages?.[0]?.content?.text || 'No messages yet';
  };

  const getRelationLabel = (relation) => {
    switch (relation) {
      case 'FRIEND': return 'Friend';
      case 'FOLLOWING': return 'Following';
      case 'FOLLOWER': return 'Follower';
      default: return '';
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-text-primary">Messages</h1>
          <button onClick={handleOpenNewChat} className="p-2.5 rounded-full bg-rvnp-green text-rvnp-white hover:bg-rvnp-green-light shadow-lg" title="New Chat">
            <IoAdd size={22} />
          </button>
        </div>

        <div className="relative mb-4">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none placeholder:text-text-muted" />
        </div>

        {aiStatus?.enabled && aiStatus?.chatEnabled && (
          <button onClick={handleStartAIChat} className="w-full flex items-center gap-3 p-3 mb-2 rounded-xl border border-rvnp-green bg-rvnp-green bg-opacity-5 hover:bg-rvnp-green hover:bg-opacity-10 transition-all text-left cursor-pointer">
            <Avatar src={aiStatus.avatarUrl} name={aiStatus.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-text-primary">{aiStatus.name}</span>
                <VerifiedBadge size={13} />
              </div>
              <span className="text-xs text-rvnp-green">AI Assistant • Always Online</span>
            </div>
            <IoSparkles size={18} className="text-rvnp-green shrink-0" />
          </button>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filteredConversations.length === 0 ? (
          <EmptyState icon={IoChatbubbleOutline} title="No conversations" description="Start a conversation with friends or people you follow!" />
        ) : (
          <div className="space-y-1.5">
            {filteredConversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const lastMessage = getLastMessage(conv);
              const isUnread = conv.unreadCount > 0;

              return (
                <div key={conv.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isUnread ? 'bg-rvnp-green bg-opacity-5 border-rvnp-green' : 'bg-bg-primary border-border-color hover:bg-bg-secondary'}`}>
                  <button onClick={() => navigate(`/profile/${otherUser?.id}`)} className="relative shrink-0 cursor-pointer">
                    <Avatar src={otherUser?.avatarUrl} name={otherUser?.fullName} size="md" />
                    {isUnread && <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-rvnp-green border-2 border-bg-primary" />}
                  </button>

                  <button onClick={() => handleOpenConversation(conv.id)} className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`truncate ${isUnread ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'}`}>
                          {conv.type === 'DIRECT' ? otherUser?.fullName : conv.group?.name}
                        </span>
                        {otherUser?.hdmVerified && <VerifiedBadge size={13} />}
                      </div>
                      <span className="text-xs text-text-muted shrink-0">{timeAgo(conv.updatedAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={`text-sm truncate ${isUnread ? 'font-medium text-text-primary' : 'text-text-muted'}`}>{lastMessage}</p>
                      {conv.unreadCount > 0 && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rvnp-green text-rvnp-white text-xs font-semibold flex items-center justify-center shrink-0">{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showNewChat} onClose={() => setShowNewChat(false)} title="New Conversation" size="sm">
        <div className="space-y-3">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input type="text" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} placeholder="Search friends and followers..." className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none placeholder:text-text-muted" />
          </div>
          {loadingUsers ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-text-muted py-8">No one to message yet. Follow people to start chatting!</p>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredUsers.map((user) => (
                <button key={user.id} onClick={() => handleStartChat(user.id)} disabled={creating} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-secondary transition-all text-left disabled:opacity-50">
                  <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-text-primary text-sm truncate">{user.fullName}</span>
                      {user.hdmVerified && <VerifiedBadge size={12} />}
                    </div>
                    <span className="text-xs text-text-muted">{getRelationLabel(user.relation)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default Messages;