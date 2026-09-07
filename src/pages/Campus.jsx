import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { IoPeople, IoLocation, IoGrid } from 'react-icons/io5';
import campusApi from '../api/campusApi.js';
import feedApi from '../api/feedApi.js';

const Campus = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campus, setCampus] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  const tabs = [
    { value: 'posts', label: 'Posts' },
    { value: 'users', label: 'Users' },
  ];

  useEffect(() => {
    fetchCampusData();
  }, [id]);

  const fetchCampusData = async () => {
    setLoading(true);

    try {
      const [campusRes, usersRes, postsRes] = await Promise.all([
        campusApi.getCampusById(id),
        campusApi.getCampusUsers(id),
        feedApi.getCampusFeed(id),
      ]);

      if (campusRes.data.success) {
        setCampus(campusRes.data.data);
      }

      if (usersRes.data.success) {
        setUsers(usersRes.data.data.users || []);
      }

      if (postsRes.data.success) {
        setPosts(postsRes.data.data.posts || []);
      }
    } catch (error) {
      console.error('Failed to load campus:', error.message);
    } finally {
      setLoading(false);
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
      <div className="max-w-2xl mx-auto">
        {campus && (
          <div className="bg-bg-primary border border-border-color rounded-xl p-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-bg-secondary">
                <IoGrid size={28} className="text-text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-text-primary">
                  {campus.name}
                </h1>
                <div className="flex items-center gap-3 text-text-muted text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <IoLocation size={14} />
                    {campus.location || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <IoPeople size={14} />
                    {campus._count?.users || 0} users
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-4 text-sm">
              <div>
                <span className="text-text-muted">Posts:</span>{' '}
                <span className="font-medium text-text-primary">{campus._count?.posts || 0}</span>
              </div>
              <div>
                <span className="text-text-muted">Reels:</span>{' '}
                <span className="font-medium text-text-primary">{campus._count?.reels || 0}</span>
              </div>
              <div>
                <span className="text-text-muted">Groups:</span>{' '}
                <span className="font-medium text-text-primary">{campus._count?.groups || 0}</span>
              </div>
              <div>
                <span className="text-text-muted">Events:</span>{' '}
                <span className="font-medium text-text-primary">{campus._count?.events || 0}</span>
              </div>
            </div>
          </div>
        )}

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4 pb-16 lg:pb-4">
          {activeTab === 'posts' ? (
            posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No posts"
                description="No posts from this campus yet."
              />
            )
          ) : users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border-color bg-bg-primary cursor-pointer hover:bg-bg-secondary"
                >
                  <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                  <div>
                    <span className="font-medium text-text-primary">{user.fullName}</span>
                    {user.course && (
                      <span className="text-xs text-text-muted ml-2">{user.course}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No users"
              description="No users found for this campus."
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Campus;