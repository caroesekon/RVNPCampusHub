import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPeople, IoPersonAdd } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import VerifiedBadge from '../components/ui/VerifiedBadge.jsx';
import Button from '../components/ui/Button.jsx';
import friendApi from '../api/friendApi.js';
import userApi from '../api/userApi.js';

const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [friendsRes, suggestionsRes] = await Promise.all([
        friendApi.getFriends(),
        friendApi.getFriendSuggestions(10),
      ]);

      if (friendsRes.data.success) {
        setFriends(friendsRes.data.data.friends || []);
      }

      if (suggestionsRes.data.success) {
        setSuggestions(suggestionsRes.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load friends:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowSuggestion = async (userId) => {
    try {
      await userApi.followUser(userId);
      fetchData();
    } catch (error) {
      console.error('Follow failed:', error.message);
    }
  };

  const tabs = [
    { value: 'friends', label: `Friends (${friends.length})` },
    { value: 'suggestions', label: `Suggestions (${suggestions.length})` },
  ];

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Friends
        </h1>

        <div className="flex gap-2 mb-4 border-b border-border-color">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 font-medium text-sm transition-all border-b-2 -mb-px ${
                activeTab === tab.value
                  ? 'border-rvnp-green text-rvnp-green'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : activeTab === 'friends' ? (
          friends.length === 0 ? (
            <EmptyState
              icon={IoPeople}
              title="No friends yet"
              description="Follow people to make friends!"
            />
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => navigate(`/profile/${friend.follower?.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary transition-all text-left cursor-pointer"
                >
                  <Avatar
                    src={friend.follower?.avatarUrl}
                    name={friend.follower?.fullName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-text-primary truncate">
                        {friend.follower?.fullName}
                      </span>
                      {friend.follower?.hdmVerified && <VerifiedBadge size={14} />}
                    </div>
                    {friend.follower?.course && (
                      <span className="text-xs text-text-muted">{friend.follower.course}</span>
                    )}
                    {friend.follower?.campus && (
                      <span className="text-xs text-text-muted block">
                        📍 {friend.follower.campus.name}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )
        ) : suggestions.length === 0 ? (
          <EmptyState
            icon={IoPersonAdd}
            title="No suggestions"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border-color bg-bg-primary"
              >
                <Avatar
                  src={suggestion.avatarUrl}
                  name={suggestion.fullName}
                  size="md"
                  onClick={() => navigate(`/profile/${suggestion.id}`)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className="font-medium text-text-primary truncate cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${suggestion.id}`)}
                    >
                      {suggestion.fullName}
                    </span>
                    {suggestion.hdmVerified && <VerifiedBadge size={14} />}
                  </div>
                  {suggestion.course && (
                    <span className="text-xs text-text-muted">{suggestion.course}</span>
                  )}
                </div>
                <Button size="sm" onClick={() => handleFollowSuggestion(suggestion.id)}>
                  <IoPersonAdd className="inline mr-1" size={14} />
                  Follow
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Friends;