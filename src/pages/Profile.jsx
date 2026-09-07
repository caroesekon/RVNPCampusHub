import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import ProfileHeader from '../components/profile/ProfileHeader.jsx';
import ProfileTabs from '../components/profile/ProfileTabs.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import userApi from '../api/userApi.js';
import postApi from '../api/postApi.js';
import reelApi from '../api/reelApi.js';
import uploadApi from '../api/uploadApi.js';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReels, setLoadingReels] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');

  const userId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'reels') {
      fetchReels();
    }
  }, [activeTab, userId]);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const response = await userApi.getUserById(userId);

      if (response.data.success) {
        setUser(response.data.data);
        setIsFollowing(response.data.data.isFollowing || false);
      }
    } catch (error) {
      console.error('Failed to load profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await postApi.getUserPosts(userId);

      if (response.data.success) {
        setPosts(response.data.data.posts || []);
      }
    } catch (error) {
      console.error('Failed to load posts:', error.message);
    }
  };

  const fetchReels = async () => {
    setLoadingReels(true);

    try {
      const response = await reelApi.getUserReels(userId);

      if (response.data.success) {
        setReels(response.data.data.reels || []);
      }
    } catch (error) {
      console.error('Failed to load reels:', error.message);
    } finally {
      setLoadingReels(false);
    }
  };

  const handleFollow = async () => {
    try {
      await userApi.followUser(userId);
      setIsFollowing(true);
      await fetchProfile();
    } catch (error) {
      console.error('Follow failed:', error.message);
    }
  };

  const handleUnfollow = async () => {
    try {
      await userApi.unfollowUser(userId);
      setIsFollowing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Unfollow failed:', error.message);
    }
  };

  const handleMessage = () => {
    window.location.href = `/messages?recipientId=${userId}`;
  };

  const handleCoverChange = async (file) => {
    setUploading(true);
    setUploadType('cover');
    setUploadProgress(0);

    try {
      const response = await uploadApi.uploadSingle(file, (percent) => {
        setUploadProgress(percent);
      });

      if (response.data.success) {
        setUploadProgress(100);
        const coverUrl = response.data.data.url;
        await userApi.updateProfile({ coverUrl });

        if (isOwnProfile) {
          await refreshUser();
        }

        setUser((prev) => ({ ...prev, coverUrl }));
      }
    } catch (error) {
      console.error('Cover upload failed:', error.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadType('');
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleAvatarChange = async (file) => {
    setUploading(true);
    setUploadType('avatar');
    setUploadProgress(0);

    try {
      const response = await uploadApi.uploadSingle(file, (percent) => {
        setUploadProgress(percent);
      });

      if (response.data.success) {
        setUploadProgress(100);
        const avatarUrl = response.data.data.url;
        await userApi.updateProfile({ avatarUrl });

        if (isOwnProfile) {
          await refreshUser();
        }

        setUser((prev) => ({ ...prev, avatarUrl }));
      }
    } catch (error) {
      console.error('Avatar upload failed:', error.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadType('');
        setUploadProgress(0);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        {/* Upload Progress Bar */}
        {uploading && (
          <div className="bg-bg-primary border border-rvnp-green rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-primary">
                Uploading {uploadType}...
              </span>
              <span className="text-sm font-semibold text-rvnp-green">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-rvnp-green transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <ProfileHeader
          user={user}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          onMessage={handleMessage}
          onCoverChange={handleCoverChange}
          onAvatarChange={handleAvatarChange}
        />

        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4 space-y-4 pb-16 lg:pb-4">
          {activeTab === 'posts' ? (
            posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <EmptyState
                title="No posts yet"
                description="This user hasn't posted anything."
              />
            )
          ) : loadingReels ? (
            <div className="flex justify-center py-10">
              <Spinner size="md" />
            </div>
          ) : reels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  className="relative aspect-[9/16] rounded-xl overflow-hidden bg-bg-secondary"
                >
                  {reel.thumbnailUrl ? (
                    <img src={reel.thumbnailUrl} alt={reel.caption} className="w-full h-full object-cover" />
                  ) : (
                    <video src={reel.videoUrl} className="w-full h-full object-cover" muted />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                    <p className="text-white text-xs truncate">{reel.caption || 'Reel'}</p>
                    <div className="flex items-center gap-2 mt-1 text-white text-xs">
                      <span>▶ {reel.viewCount || 0}</span>
                      <span>❤️ {reel.likeCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reels yet"
              description="This user hasn't posted any reels."
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;