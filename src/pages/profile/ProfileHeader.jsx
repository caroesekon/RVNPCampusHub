import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { EditProfileModal } from './EditProfileModal';
import { followUser, unfollowUser } from '@/api/friends';
import { blockUser, unblockUser } from '@/api/privacy';
import { resendVerification } from '@/api/auth';
import { BADGE_TYPES } from '@/utils/constants';
import { formatCompactNumber } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export const ProfileHeader = ({ profile, isOwnProfile, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [following, setFollowing] = useState(profile.followers?.some(f => f === user?._id || f?._id === user?._id));
  const [blocked, setBlocked] = useState(profile.blockedUsers?.includes(user?._id));
  const [resending, setResending] = useState(false);

  const isPrivate = profile.privacy?.hideProfile && !isOwnProfile;
  const showDepartment = isOwnProfile || profile.privacy?.showDepartment !== false;
  const showHostel = isOwnProfile || profile.privacy?.showHostel !== false;
  const canFollow = profile.privacy?.allowFriendRequests !== false;
  const canMessage = profile.privacy?.allowMessages !== 'none';

  const handleFollow = async () => {
    if (following) { await unfollowUser(profile._id); setFollowing(false); toast.success('Unfollowed'); }
    else { await followUser(profile._id); setFollowing(true); toast.success('Following'); }
    onUpdate();
  };

  const handleBlock = async () => {
    if (blocked) { await unblockUser(profile._id); setBlocked(false); toast.success('Unblocked'); }
    else { if (!confirm('Block this user?')) return; await blockUser(profile._id); setBlocked(true); toast.success('Blocked'); }
    onUpdate();
  };

  const handleResendVerification = async () => {
    setResending(true);
    try { await resendVerification(); toast.success('Verification email sent!'); navigate('/verify-email'); }
    catch { toast.error('Failed'); }
    finally { setResending(false); }
  };

  const campusLabels = {
    main: 'Main Campus', kericho_town: 'Kericho Town Campus', kureisoi: 'Kureisoi Campus',
    nakuru_town: 'Nakuru Town Campus', alumni: 'Alumni', guest: 'Guest',
  };

  if (isPrivate && !isOwnProfile) {
    return (
      <div className="text-center py-10">
        <span className="text-5xl block mb-3">🔒</span>
        <h3 className="text-lg font-bold text-[var(--color-text)]">This profile is private</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">This user has chosen to keep their profile private.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-44 -mx-4 -mt-4 overflow-hidden">
        {profile.coverPhoto ? (
          <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)]/40 via-[var(--color-primary)]/20 to-[var(--color-bg)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/80 to-transparent" />
        {isOwnProfile && (
          <button onClick={() => setEditOpen(true)} className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/50 transition-colors">🖼️ Edit Cover</button>
        )}
      </div>

      <div className="relative -mt-16 flex justify-center">
        <Avatar src={profile.avatar} name={profile.firstName} size="xl" />
        {isOwnProfile && (
          <button onClick={() => setEditOpen(true)} className="absolute bottom-0 right-[calc(50%-60px)] w-8 h-8 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] flex items-center justify-center text-sm shadow-md hover:bg-[var(--color-bg)] transition-colors">📷</button>
        )}
      </div>

      {isOwnProfile && !profile.emailVerified && (
        <div className="mt-3 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">⚠️ Email not verified</p>
          <Button size="sm" variant="outline" className="mt-1.5 text-xs" onClick={handleResendVerification} disabled={resending}>{resending ? 'Sending...' : 'Verify Email'}</Button>
        </div>
      )}

      <h2 className="text-xl font-black text-[var(--color-text)] text-center mt-2 flex items-center justify-center gap-1.5">
        {profile.firstName} {profile.lastName}
        {profile.hdmVerified && <VerifiedBadge size={18} />}
      </h2>

      <div className="flex items-center justify-center gap-1.5 mt-0.5 text-sm text-[var(--color-text-secondary)]">
        {showDepartment && profile.department && <span className="capitalize">{profile.department.replace(/_/g, ' ')}</span>}
        {showDepartment && profile.department && showHostel && profile.hostel && <span className="text-[var(--color-text-muted)]">•</span>}
        {showHostel && profile.hostel && <span className="capitalize">{profile.hostel.replace(/_/g, ' ')}</span>}
      </div>

      {profile.campus && <p className="text-xs text-[var(--color-text-muted)] text-center mt-0.5">{campusLabels[profile.campus] || profile.campus}</p>}

      <div className="flex justify-center gap-8 mt-4 text-sm">
        <div className="text-center"><span className="font-bold text-[var(--color-text)] block">{formatCompactNumber(profile.postCount || 0)}</span><span className="text-xs text-[var(--color-text-secondary)]">Posts</span></div>
        <button className="text-center" onClick={() => navigate(`/friends?tab=followers&userId=${profile._id}`)}><span className="font-bold text-[var(--color-text)] block">{formatCompactNumber(profile.followers?.length || 0)}</span><span className="text-xs text-[var(--color-text-secondary)]">Followers</span></button>
        <button className="text-center" onClick={() => navigate(`/friends?tab=following&userId=${profile._id}`)}><span className="font-bold text-[var(--color-text)] block">{formatCompactNumber(profile.following?.length || 0)}</span><span className="text-xs text-[var(--color-text-secondary)]">Following</span></button>
      </div>

      {profile.bio && <p className="text-sm text-[var(--color-text-secondary)] mt-3 text-center max-w-xs mx-auto leading-relaxed">{profile.bio}</p>}

      {profile.badges?.length > 0 && (
        <div className="flex justify-center gap-1 mt-3 flex-wrap">
          {profile.badges.slice(0, 6).map((b, i) => (
            <Badge key={i} variant={BADGE_TYPES[b.type]?.variant || 'gray'} emoji={BADGE_TYPES[b.type]?.emoji}>{BADGE_TYPES[b.type]?.label || b.type}</Badge>
          ))}
          {profile.badges.length > 6 && <Badge variant="gray">+{profile.badges.length - 6}</Badge>}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        {isOwnProfile ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>✏️ Edit Profile</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile?tab=settings')}>⚙️ Settings</Button>
          </>
        ) : (
          <>
            {canFollow && <Button variant={following ? 'outline' : 'primary'} size="sm" onClick={handleFollow}>{following ? '✓ Following' : '👥 Follow'}</Button>}
            {canMessage && <Button variant="outline" size="sm" onClick={() => navigate(`/chats?user=${profile._id}`)}>💬 Message</Button>}
            <Button variant="ghost" size="sm" onClick={handleBlock}>{blocked ? '🔓 Unblock' : '🚫 Block'}</Button>
          </>
        )}
      </div>

      {isOwnProfile && <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} user={profile} onUpdate={onUpdate} />}
    </div>
  );
};