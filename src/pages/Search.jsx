import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearch,
  IoPerson,
  IoGrid,
  IoVideocam,
  IoPeople,
  IoCalendar,
  IoStorefront,
} from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import VerifiedBadge from '../components/ui/VerifiedBadge.jsx';
import searchApi from '../api/searchApi.js';
import timeAgo from '../utils/timeAgo.js';
import { formatPrice } from '../utils/formatNumber.js';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [results, setResults] = useState({
    users: [],
    posts: [],
    reels: [],
    groups: [],
    events: [],
    listings: [],
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceTimeout = useRef(null);

  const tabs = [
    { value: 'users', label: 'Users' },
    { value: 'posts', label: 'Posts' },
    { value: 'reels', label: 'Reels' },
    { value: 'groups', label: 'Groups' },
    { value: 'events', label: 'Events' },
    { value: 'marketplace', label: 'Marketplace' },
  ];

  useEffect(() => {
    if (query.trim() && searched) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        handleSearch();
      }, 500);
    }

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query, activeTab]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      let response;

      switch (activeTab) {
        case 'users':
          response = await searchApi.searchUsers(query);
          if (response.data.success) {
            setResults((prev) => ({ ...prev, users: response.data.data.users || [] }));
          }
          break;
        case 'posts':
          response = await searchApi.searchPosts(query);
          if (response.data.success) {
            setResults((prev) => ({ ...prev, posts: response.data.data.posts || [] }));
          }
          break;
        case 'reels':
          response = await searchApi.searchReels(query);
          if (response.data.success) {
            setResults((prev) => ({ ...prev, reels: response.data.data.reels || [] }));
          }
          break;
        case 'groups':
          response = await searchApi.searchGroups(query);
          if (response.data.success) {
            setResults((prev) => ({ ...prev, groups: response.data.data.groups || [] }));
          }
          break;
        case 'events':
          response = await searchApi.searchEvents(query);
          if (response.data.success) {
            setResults((prev) => ({ ...prev, events: response.data.data.events || [] }));
          }
          break;
        case 'marketplace':
          response = await searchApi.searchMarketplace(query);
          if (response.data.success) {
            setResults((prev) => ({ ...prev, listings: response.data.data.listings || [] }));
          }
          break;
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      setSearched(true);
    } else {
      setSearched(false);
      setResults({
        users: [],
        posts: [],
        reels: [],
        groups: [],
        events: [],
        listings: [],
      });
    }
  };

  const renderResults = () => {
    if (loading) {
      return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
    }

    if (!searched || !query.trim()) {
      return (
        <EmptyState
          icon={IoSearch}
          title="Search"
          description="Search for users, posts, reels, groups, events, and marketplace items"
        />
      );
    }

    switch (activeTab) {
      case 'users':
        if (results.users.length === 0) return <EmptyState title="No users found" />;
        return (
          <div className="space-y-2">
            {results.users.map((user) => (
              <button
                key={user.id}
                onClick={() => navigate(`/profile/${user.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary transition-all text-left cursor-pointer"
              >
                <Avatar src={user.avatarUrl} name={user.fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-text-primary truncate">{user.fullName}</span>
                    {user.hdmVerified && <VerifiedBadge size={14} />}
                  </div>
                  {user.course && <span className="text-xs text-text-muted">{user.course}</span>}
                  {user.campus && <span className="text-xs text-text-muted block">📍 {user.campus.name}</span>}
                </div>
              </button>
            ))}
          </div>
        );

      case 'posts':
        if (results.posts.length === 0) return <EmptyState title="No posts found" />;
        return (
          <div className="space-y-2">
            {results.posts.map((post) => (
              <button
                key={post.id}
                onClick={() => navigate('/feed')}
                className="w-full p-4 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar src={post.user?.avatarUrl} name={post.user?.fullName} size="sm" />
                  <span className="font-medium text-text-primary">{post.user?.fullName}</span>
                  {post.user?.hdmVerified && <VerifiedBadge size={12} />}
                  <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="text-text-primary text-sm line-clamp-3">{post.content?.text}</p>
              </button>
            ))}
          </div>
        );

      case 'reels':
        if (results.reels.length === 0) return <EmptyState title="No reels found" />;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.reels.map((reel) => (
              <button key={reel.id} onClick={() => navigate('/reels')} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-bg-secondary cursor-pointer hover:opacity-80">
                {reel.thumbnailUrl ? (
                  <img src={reel.thumbnailUrl} alt={reel.caption} className="w-full h-full object-cover" />
                ) : (
                  <video src={reel.videoUrl} className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        );

      case 'groups':
        if (results.groups.length === 0) return <EmptyState title="No groups found" />;
        return (
          <div className="space-y-2">
            {results.groups.map((group) => (
              <button
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary transition-all text-left cursor-pointer"
              >
                <div className="p-2 rounded-full bg-bg-secondary">
                  <IoPeople size={20} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-text-primary block truncate">{group.name}</span>
                  <span className="text-xs text-text-muted">{group._count?.members || 0} members</span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'events':
        if (results.events.length === 0) return <EmptyState title="No events found" />;
        return (
          <div className="space-y-2">
            {results.events.map((event) => (
              <button
                key={event.id}
                onClick={() => navigate('/events')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary transition-all text-left cursor-pointer"
              >
                <div className="p-2 rounded-full bg-bg-secondary">
                  <IoCalendar size={20} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-text-primary block truncate">{event.title}</span>
                  {event.location && <span className="text-xs text-text-muted">📍 {event.location}</span>}
                </div>
              </button>
            ))}
          </div>
        );

      case 'marketplace':
        if (results.listings.length === 0) return <EmptyState title="No listings found" />;
        return (
          <div className="space-y-2">
            {results.listings.map((listing) => (
              <button
                key={listing.id}
                onClick={() => navigate('/marketplace')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border-color bg-bg-primary hover:bg-bg-secondary transition-all text-left cursor-pointer"
              >
                <div className="p-2 rounded-full bg-bg-secondary">
                  <IoStorefront size={20} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-text-primary block truncate">{listing.title}</span>
                  <span className="text-xs text-text-muted">{listing.category}</span>
                </div>
                <span className="font-semibold text-rvnp-green shrink-0">{formatPrice(listing.price)}</span>
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">Search</h1>

        <div className="relative mb-4">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search users, posts, reels, groups, events..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none focus:border-rvnp-green placeholder:text-text-muted"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </span>
          )}
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4 pb-16 lg:pb-4">{renderResults()}</div>
      </div>
    </Layout>
  );
};

export default Search;