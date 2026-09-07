import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import storyApi from '../api/storyApi.js';
import StoryViewer from '../components/stories/StoryViewer.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Layout from '../components/layout/Layout.jsx';

const Stories = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, [userId]);

  const fetchStories = async () => {
    setLoading(true);

    try {
      const response = await storyApi.getActiveStories();

      if (response.data.success) {
        const allStories = response.data.data || [];
        const userStories = allStories.find(
          (group) => group.user?.id === userId
        );

        if (userStories) {
          setStories(userStories.stories || []);
        }
      }
    } catch (error) {
      console.error('Failed to load stories:', error.message);
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

  if (stories.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20 text-text-muted">
          No stories available
        </div>
      </Layout>
    );
  }

  return (
    <StoryViewer
      stories={stories}
      onClose={() => navigate('/feed')}
    />
  );
};

export default Stories;