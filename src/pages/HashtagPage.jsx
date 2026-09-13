import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoPricetag } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import PostCard from '../components/posts/PostCard.jsx';
import searchApi from '../api/searchApi.js';

const HashtagPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (name) {
      fetchPosts();
    }
  }, [name]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await searchApi.searchPosts(name);
      if (response.data.success) {
        setPosts(response.data.data.posts || []);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary"
          >
            <IoArrowBack size={20} />
          </button>
          <div className="flex items-center gap-2">
            <IoPricetag size={18} className="text-rvnp-green" />
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              #{name}
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description={`No posts with #${name}`}
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HashtagPage;