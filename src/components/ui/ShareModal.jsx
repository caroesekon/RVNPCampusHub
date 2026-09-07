import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoClose,
  IoRefresh,
  IoChatbubble,
  IoPeople,
  IoLink,
  IoShare,
} from 'react-icons/io5';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';
import postApi from '../../api/postApi.js';
import messageApi from '../../api/messageApi.js';

const ShareModal = ({ isOpen, onClose, post, onShared }) => {
  const navigate = useNavigate();
  const [showMessages, setShowMessages] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [shareText, setShareText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowMessages(false);
      setShowGroups(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleShareToFeed = async () => {
    setSharing(true);

    try {
      const response = await postApi.sharePost(post.id, {
        type: 'FEED',
        content: { text: shareText.trim() },
      });

      if (response.data.success) {
        onShared?.(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error('Share to feed failed:', error.message);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareExternal = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    const text = post.content?.text || 'Check out this post';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RVNP Campus Hub',
          text,
          url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  const fetchConversations = async () => {
    setShowMessages(true);
    setShowGroups(false);

    try {
      const response = await messageApi.getConversations();

      if (response.data.success) {
        setConversations(response.data.data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error.message);
    }
  };

  const handleSendToConversation = async (conversationId) => {
    try {
      const response = await messageApi.sendMessage(conversationId, {
        content: {
          text: post.content?.text || 'Shared post',
          sharedPostId: post.id,
        },
        type: 'TEXT',
      });

      if (response.data.success) {
        onClose();
        navigate(`/messages/${conversationId}`);
      }
    } catch (error) {
      console.error('Send to conversation failed:', error.message);
    }
  };

  const shareOptions = [
    { icon: IoRefresh, label: 'Share to Feed', action: () => setShowGroups(false) || setShowMessages(false), color: 'text-rvnp-green' },
    { icon: IoChatbubble, label: 'Send in Message', action: fetchConversations, color: 'text-blue-500' },
    { icon: IoPeople, label: 'Share to Group', action: () => setShowGroups(true), color: 'text-purple-500' },
    { icon: IoLink, label: copied ? 'Copied!' : 'Copy Link', action: handleCopyLink, color: 'text-yellow-500' },
    { icon: IoShare, label: 'Share External', action: handleShareExternal, color: 'text-red-500' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Post" size="sm">
      {!showMessages && !showGroups ? (
        <div className="space-y-1">
          {shareOptions.map((option) => (
            <button
              key={option.label}
              onClick={option.action}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-secondary transition-all text-left"
            >
              <option.icon size={20} className={option.color} />
              <span className="text-text-primary text-sm font-medium">{option.label}</span>
            </button>
          ))}

          <div className="mt-3">
            <Input
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Add a comment (optional)"
            />
            <Button
              fullWidth
              onClick={handleShareToFeed}
              loading={sharing}
              className="mt-2"
            >
              Share Now
            </Button>
          </div>
        </div>
      ) : showMessages ? (
        <div className="space-y-1">
          <button
            onClick={() => setShowMessages(false)}
            className="text-sm text-text-muted hover:text-text-primary mb-2"
          >
            ← Back
          </button>

          {conversations.length === 0 ? (
            <p className="text-center text-text-muted py-4">No conversations yet</p>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants?.find(
                (p) => p.user?.id !== JSON.parse(localStorage.getItem('rvnp_user'))?.id
              )?.user;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSendToConversation(conv.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-secondary transition-all text-left"
                >
                  <div className="p-2 rounded-full bg-bg-secondary">
                    <IoChatbubble size={16} className="text-text-secondary" />
                  </div>
                  <span className="text-text-primary text-sm">
                    {conv.type === 'DIRECT' ? otherUser?.fullName : conv.group?.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <button
            onClick={() => setShowGroups(false)}
            className="text-sm text-text-muted hover:text-text-primary mb-2"
          >
            ← Back
          </button>
          <p className="text-center text-text-muted py-4">
            Group sharing coming soon
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ShareModal;