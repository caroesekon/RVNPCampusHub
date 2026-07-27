import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { formatChatTime } from '@/utils/formatDate';

export const ChatListItem = ({ chat, onClick }) => {
  const { user } = useAuth();
  const isGroup = chat.type === 'group';
  const isAI = chat.isAI;
  const isAnnouncement = chat.isAnnouncement;

  const otherPerson = !isGroup && !isAI && !isAnnouncement
    ? chat.participants?.find(p => { const id = typeof p === 'string' ? p : p._id; return id !== user?._id; })
    : null;

  const lastMsg = chat.lastMessage;
  const unread = chat.unreadCount?.[user?._id] || 0;

  const displayName = isAI ? 'HDM AI' : isAnnouncement ? 'RVNP Announcements' : isGroup ? chat.groupName : otherPerson ? `${otherPerson.firstName || ''} ${otherPerson.lastName || ''}`.trim() : 'Chat';
  const displayAvatar = otherPerson?.avatar || null;
  const isVerified = otherPerson?.hdmVerified;
  const isOnline = otherPerson?.isOnline;

  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors active:scale-[0.98]">
      {isAI ? (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-500 flex items-center justify-center flex-shrink-0 relative">
          <span className="text-2xl">🤖</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" fill="#3B82F6"/><path d="M7 11L10 13L15 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </div>
      ) : isAnnouncement ? (
        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-2xl flex-shrink-0">📢</div>
      ) : isGroup ? (
        <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-xl font-bold text-[var(--color-primary)] flex-shrink-0">{chat.groupName?.charAt(0) || 'G'}</div>
      ) : (
        <div className="relative flex-shrink-0">
          <Avatar src={displayAvatar} name={displayName} size="md" verified={isVerified} />
          {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[var(--color-surface)]" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[var(--color-text)] text-sm truncate flex items-center gap-1">
            {displayName}
            {isAI && <VerifiedBadge size={10} />}
            {isVerified && !isAI && <VerifiedBadge size={10} />}
          </span>
          {lastMsg?.createdAt && <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0 ml-2">{formatChatTime(lastMsg.createdAt)}</span>}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs text-[var(--color-text-secondary)] truncate">{lastMsg?.content || 'No messages yet'}</span>
          {unread > 0 && <span className="w-5 h-5 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 ml-2">{unread > 9 ? '9+' : unread}</span>}
        </div>
      </div>
    </div>
  );
};