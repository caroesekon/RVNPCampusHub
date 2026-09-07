import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoChatbubble,
  IoPersonAdd,
  IoPersonRemove,
  IoSettings,
  IoCamera,
  IoClose,
} from 'react-icons/io5';
import CoverPhoto from '../ui/CoverPhoto.jsx';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import VerifiedBadge from '../ui/VerifiedBadge.jsx';
import FriendsBadge from '../friends/FriendsBadge.jsx';
import StatCard from '../ui/StatCard.jsx';
import Modal from '../ui/Modal.jsx';
import Spinner from '../ui/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate } from '../../utils/formatDate.js';
import userApi from '../../api/userApi.js';

const ProfileHeader = ({ user, isFollowing, onFollow, onUnfollow, onMessage, onCoverChange, onAvatarChange }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showFullBio, setShowFullBio] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [imageViewer, setImageViewer] = useState(null);

  const isOwnProfile = currentUser?.id === user?.id;

  const handleAvatarClick = () => {
    if (user?.avatarUrl) {
      setImageViewer({ type: 'avatar', url: user.avatarUrl });
    } else if (isOwnProfile) {
      document.getElementById('avatar-input').click();
    }
  };

  const handleCoverClick = () => {
    if (user?.coverUrl) {
      setImageViewer({ type: 'cover', url: user.coverUrl });
    }
  };

  const fetchFollowers = async () => {
    setLoadingList(true);
    setShowFollowers(true);

    try {
      const response = await userApi.getFollowers(user.id);
      if (response.data.success) {
        setFollowers(response.data.data.followers || []);
      }
    } catch (error) {
      console.error('Failed to load followers:', error.message);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchFollowing = async () => {
    setLoadingList(true);
    setShowFollowing(true);

    try {
      const response = await userApi.getFollowing(user.id);
      if (response.data.success) {
        setFollowing(response.data.data.following || []);
      }
    } catch (error) {
      console.error('Failed to load following:', error.message);
    } finally {
      setLoadingList(false);
    }
  };

  return (
    <div>
      {/* Cover Photo - Clickable */}
      <div onClick={handleCoverClick} className="cursor-pointer">
        <CoverPhoto
          src={user?.coverUrl}
          editable={isOwnProfile}
          onImageSelect={onCoverChange}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-14 px-4 relative z-10">
          <div className="relative inline-block">
            {/* Avatar - Clickable */}
            <div onClick={handleAvatarClick} className="cursor-pointer">
              <Avatar
                src={user?.avatarUrl}
                name={user?.fullName}
                size="xl"
              />
            </div>

            {isOwnProfile && (
              <>
                <button
                  onClick={() => document.getElementById('avatar-input').click()}
                  className="absolute bottom-0 right-0 z-20 p-1.5 rounded-full bg-bg-primary border border-border-color text-text-secondary hover:text-text-primary shadow-lg cursor-pointer"
                >
                  <IoCamera size={14} />
                </button>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarChange}
                />
              </>
            )}
          </div>

          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <IoSettings className="inline mr-1" size={16} />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={onMessage}>
                  <IoChatbubble className="inline mr-1" size={16} />
                  Message
                </Button>

                {isFollowing ? (
                  <Button variant="secondary" size="sm" onClick={onUnfollow}>
                    <IoPersonRemove className="inline mr-1" size={16} />
                    Unfollow
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={onFollow}>
                    <IoPersonAdd className="inline mr-1" size={16} />
                    Follow
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              {user?.fullName}
            </h1>
            {user?.hdmVerified && <VerifiedBadge size={22} />}
            {user?.isFriend && <FriendsBadge isFriend={user.isFriend} size="md" />}
          </div>

          {user?.course && (
            <p className="text-text-secondary mt-1">
              {user.course}
              {user?.yearOfStudy && ` • Year ${user.yearOfStudy}`}
            </p>
          )}

          {user?.campus && (
            <p className="text-text-secondary text-sm mt-0.5">📍 {user.campus.name}</p>
          )}

          {user?.department && (
            <p className="text-text-secondary text-sm">🏛️ {user.department.name}</p>
          )}

          {user?.bio && (
            <p className="text-text-primary mt-2">
              {showFullBio ? user.bio : `${user.bio.slice(0, 100)}${user.bio.length > 100 ? '...' : ''}`}
              {user.bio.length > 100 && (
                <button onClick={() => setShowFullBio(!showFullBio)} className="text-text-muted hover:text-text-primary ml-1 text-sm">
                  {showFullBio ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          )}

          <p className="text-text-muted text-xs mt-2">
            Joined {formatDate(user?.createdAt, 'DD MMMM YYYY')}
          </p>

          <div className="flex gap-2 mt-4 border-t border-border-color pt-3 flex-wrap">
            <StatCard label="Posts" value={user?._count?.posts || 0} />
            <StatCard label="Reels" value={user?._count?.reels || 0} />
            <StatCard label="Friends" value={user?._count?.friends || 0} onClick={() => navigate('/friends')} />
            <StatCard label="Followers" value={user?._count?.followers || 0} onClick={fetchFollowers} />
            <StatCard label="Following" value={user?._count?.following || 0} onClick={fetchFollowing} />
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewer && (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-95 flex items-center justify-center" onClick={() => setImageViewer(null)}>
          <button
            onClick={() => setImageViewer(null)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white"
          >
            <IoClose size={28} />
          </button>

          <img
            src={imageViewer.url}
            alt={imageViewer.type === 'avatar' ? 'Profile Photo' : 'Cover Photo'}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Followers Modal */}
      <Modal isOpen={showFollowers} onClose={() => setShowFollowers(false)} title="Followers" size="sm">
        {loadingList ? (
          <div className="flex justify-center py-8"><Spinner size="md" /></div>
        ) : followers.length === 0 ? (
          <p className="text-center text-text-muted py-8">No followers yet</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {followers.map((follow) => (
              <button
                key={follow.id}
                onClick={() => { setShowFollowers(false); navigate(`/profile/${follow.follower?.id}`); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-secondary transition-all text-left"
              >
                <Avatar src={follow.follower?.avatarUrl} name={follow.follower?.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-text-primary text-sm truncate">{follow.follower?.fullName}</span>
                    {follow.follower?.hdmVerified && <VerifiedBadge size={12} />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Following Modal */}
      <Modal isOpen={showFollowing} onClose={() => setShowFollowing(false)} title="Following" size="sm">
        {loadingList ? (
          <div className="flex justify-center py-8"><Spinner size="md" /></div>
        ) : following.length === 0 ? (
          <p className="text-center text-text-muted py-8">Not following anyone yet</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {following.map((follow) => (
              <button
                key={follow.id}
                onClick={() => { setShowFollowing(false); navigate(`/profile/${follow.following?.id}`); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-secondary transition-all text-left"
              >
                <Avatar src={follow.following?.avatarUrl} name={follow.following?.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-text-primary text-sm truncate">{follow.following?.fullName}</span>
                    {follow.following?.hdmVerified && <VerifiedBadge size={12} />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfileHeader;