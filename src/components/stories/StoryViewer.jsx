import { useState, useEffect, useCallback } from 'react';
import { IoClose, IoChevronBack, IoChevronForward, IoHeart, IoEye } from 'react-icons/io5';
import Avatar from '../ui/Avatar.jsx';
import storyApi from '../../api/storyApi.js';
import { useAuth } from '../../context/AuthContext.jsx';

const REACTIONS = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'CARE', emoji: '🤗', label: 'Care' },
  { type: 'HAHA', emoji: '😂', label: 'Haha' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'SAD', emoji: '😢', label: 'Sad' },
  { type: 'ANGRY', emoji: '😡', label: 'Angry' },
];

const StoryViewer = ({ stories, initialIndex = 0, onClose }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [viewers, setViewers] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [myReaction, setMyReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [paused, setPaused] = useState(false);

  const currentStory = stories[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < stories.length - 1) {
        return prev + 1;
      }
      onClose();
      return prev;
    });
  }, [stories.length, onClose]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    setProgress(0);
    setPaused(false);

    if (paused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, paused, handleNext]);

  useEffect(() => {
    if (currentStory) {
      fetchStoryData(currentStory.id);
      setMyReaction(null);
      setViewers([]);
      setReactions([]);
    }
  }, [currentStory?.id]);

  const fetchStoryData = async (storyId) => {
    try {
      const [viewersRes, reactionsRes] = await Promise.all([
        storyApi.getViewers(storyId),
        storyApi.getReactions(storyId),
      ]);

      if (viewersRes.data.success) {
        setViewers(viewersRes.data.data || []);
      }

      if (reactionsRes.data.success) {
        setReactions(reactionsRes.data.data || []);
        const mine = reactionsRes.data.data.find((r) => r.userId === user?.id);
        setMyReaction(mine || null);
      }
    } catch (error) {
      console.error('Failed to load story data:', error.message);
    }
  };

  const handleReact = async (type) => {
    if (myReaction?.type === type) {
      setMyReaction(null);
      await storyApi.removeReaction(currentStory.id);
    } else {
      setMyReaction({ type });
      await storyApi.reactToStory(currentStory.id, type);
    }
    setShowReactions(false);
    fetchStoryData(currentStory.id);
  };

  const getReactionEmoji = (type) => {
    return REACTIONS.find((r) => r.type === type)?.emoji || '👍';
  };

  if (!currentStory) return null;

  const isOwner = currentStory.userId === user?.id;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="flex gap-1">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{
                  width:
                    index === currentIndex
                      ? `${progress}%`
                      : index < currentIndex
                      ? '100%'
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-6 left-4 flex items-center gap-2 z-20">
        <Avatar src={currentStory.user?.avatarUrl} name={currentStory.user?.fullName} size="sm" />
        <span className="text-white font-medium text-sm">{currentStory.user?.fullName}</span>
      </div>

      <button
        onClick={onClose}
        className="absolute top-6 right-4 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white"
      >
        <IoClose size={24} />
      </button>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white disabled:opacity-30"
        disabled={currentIndex === 0}
      >
        <IoChevronBack size={24} />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black bg-opacity-50 text-white disabled:opacity-30"
        disabled={currentIndex === stories.length - 1}
      >
        <IoChevronForward size={24} />
      </button>

      <div
        onClick={() => setPaused(!paused)}
        className="w-full h-full flex items-center justify-center"
      >
        {currentStory.content?.type === 'image' || currentStory.content?.imageUrl ? (
          <img
            src={currentStory.content?.imageUrl || currentStory.content?.url}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        ) : currentStory.content?.type === 'video' || currentStory.content?.videoUrl ? (
          <video
            src={currentStory.content?.videoUrl || currentStory.content?.url}
            autoPlay
            loop
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-white text-lg text-center p-8">
            {currentStory.content?.text}
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 z-20">
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="flex flex-col items-center text-white"
        >
          <span className="text-3xl">
            {myReaction ? getReactionEmoji(myReaction.type) : '❤️'}
          </span>
          <span className="text-xs mt-1">{reactions.length} reactions</span>
        </button>

        {isOwner && (
          <button onClick={() => setShowViewers(!showViewers)} className="flex flex-col items-center text-white">
            <IoEye size={28} />
            <span className="text-xs">{viewers.length} views</span>
          </button>
        )}
      </div>

      {showReactions && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
          <div className="flex gap-3 p-3 rounded-full bg-bg-primary shadow-lg">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReact(reaction.type)}
                className={`text-3xl transition-transform hover:scale-125 ${
                  myReaction?.type === reaction.type ? 'scale-125' : ''
                }`}
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {showViewers && isOwner && (
        <div className="absolute bottom-24 right-4 w-64 max-h-64 overflow-y-auto bg-bg-primary rounded-xl p-3 z-30">
          <h4 className="font-medium text-text-primary mb-2">Viewers</h4>
          {viewers.length === 0 ? (
            <p className="text-text-muted text-sm">No viewers yet</p>
          ) : (
            <div className="space-y-2">
              {viewers.map((viewer) => (
                <div key={viewer.id} className="flex items-center gap-2">
                  <Avatar src={viewer.user?.avatarUrl} name={viewer.user?.fullName} size="sm" />
                  <span className="text-sm text-text-primary">{viewer.user?.fullName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryViewer;