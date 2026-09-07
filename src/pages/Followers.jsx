import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPeople } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import VerifiedBadge from '../components/ui/VerifiedBadge.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import userApi from '../api/userApi.js';

const Followers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState({});

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    setLoading(true);

    try {
      const response = await userApi.getFollowers(currentUser.id);

      if (response.data.success) {
        const followersData = response.data.data.followers || [];
        setFollowers(followersData);

        const status = {};
        followersData.forEach((follow) => {
          status[follow.follower?.id] = follow.follower?.isFollowing || false;
        });
        setFollowingStatus(status);
      }
    } catch (error) {
      console.error('Failed to load followers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      if (followingStatus[userId]) {
        await userApi.unfollowUser(userId);
        setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
      } else {
        await userApi.followUser(userId);
        setFollowingStatus((prev) => ({ ...prev, [userId]: true }));
      }
    } catch (error) {
      console.error('Follow action failed:', error.message);
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Followers
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : followers.length === 0 ? (
          <EmptyState
            icon={IoPeople}
            title="No followers yet"
            description="People who follow you will appear here!"
          />
        ) : (
          <div className="space-y-2">
            {followers.map((follow) => {
              const follower = follow.follower;
              const isFollowing = followingStatus[follower?.id] || false;

              return (
                <div
                  key={follow.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border-color bg-bg-primary"
                >
                  <Avatar
                    src={follower?.avatarUrl}
                    name={follower?.fullName}
                    size="md"
                    onClick={() => navigate(`/profile/${follower?.id}`)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span
                        className="font-medium text-text-primary truncate cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${follower?.id}`)}
                      >
                        {follower?.fullName}
                      </span>
                      {follower?.hdmVerified && <VerifiedBadge size={12} />}
                    </div>
                    {follower?.course && (
                      <span className="text-xs text-text-muted">{follower.course}</span>
                    )}
                  </div>

                  {follower?.id !== currentUser?.id && (
                    <Button
                      size="sm"
                      variant={isFollowing ? 'secondary' : 'primary'}
                      onClick={() => handleFollow(follower?.id)}
                    >
                      {isFollowing ? '✓ Following' : 'Follow Back'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Followers;