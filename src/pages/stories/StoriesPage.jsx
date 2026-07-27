import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { getStories, createStory, viewStory, reactToStory } from '@/api/stories';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { timeAgo } from '@/utils/formatDate';
import toast from 'react-hot-toast';

const REACTIONS = ['❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '👏'];

export const StoriesPage = () => {
  const { isFeatureEnabled } = useSettings();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCreator, setShowCreator] = useState(false);
  const [creatorMode, setCreatorMode] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [posting, setPosting] = useState(false);
  const storiesEnabled = isFeatureEnabled('stories');

  useEffect(() => {
    if (!storiesEnabled) return;
    fetchStories();
  }, [storiesEnabled]);

  const fetchStories = async () => {
    try {
      const res = await getStories();
      const grouped = {};
      (res.data || res).forEach(s => {
        const key = s.author?._id || s.author;
        if (!grouped[key]) grouped[key] = { author: s.author, stories: [] };
        grouped[key].stories.push(s);
      });
      setStories(Object.values(grouped));
    } catch (err) {
      console.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const openStory = (group, index = 0) => {
    setViewingStory(group);
    setCurrentIndex(index);
    const story = group.stories[index];
    if (story) viewStory(story._id).catch(() => {});
  };

  const nextStory = () => {
    if (viewingStory && currentIndex < viewingStory.stories.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      viewStory(viewingStory.stories[next]._id).catch(() => {});
    } else {
      setViewingStory(null);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleReaction = async (storyId, reaction) => {
    try {
      await reactToStory(storyId, reaction);
      toast.success(`Reacted ${reaction}`);
    } catch { toast.error('Failed'); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePostStory = async () => {
    if (creatorMode === 'text' && !textContent.trim()) return toast.error('Write something');
    if (creatorMode !== 'text' && !selectedFile) return toast.error('Select a file');
    setPosting(true);
    try {
      if (creatorMode === 'text') {
        await createStory({ textContent: textContent.trim(), backgroundColor: '#1B5E20', textColor: '#FFFFFF' });
      } else {
        const formData = new FormData();
        formData.append('story', selectedFile);
        formData.append('caption', caption);
        await createStory(formData);
      }
      toast.success('Story created!');
      setShowCreator(false);
      setTextContent('');
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchStories();
    } catch { toast.error('Failed'); }
    finally { setPosting(false); }
  };

  if (!storiesEnabled) {
    return <EmptyState icon="⭕" title="Stories are currently disabled" description="The admin has disabled this feature." />;
  }

  // Story Creator
  if (showCreator) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <button onClick={() => setShowCreator(false)} className="text-[var(--color-text-secondary)] font-semibold text-sm">Cancel</button>
          <h2 className="font-bold text-[var(--color-text)] text-sm">Create Story</h2>
          <button onClick={handlePostStory} disabled={posting} className="text-[var(--color-primary)] font-semibold text-sm">
            {posting ? 'Posting...' : 'Share'}
          </button>
        </div>
        <div className="flex gap-2 px-4 py-3">
          {['text', 'photo', 'video'].map(mode => (
            <button key={mode} onClick={() => { setCreatorMode(mode); setPreviewUrl(null); setSelectedFile(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${creatorMode === mode ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]'}`}>
              {mode === 'text' ? '📝 Text' : mode === 'photo' ? '📷 Photo' : '🎬 Video'}
            </button>
          ))}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {creatorMode === 'text' ? (
            <textarea value={textContent} onChange={e => setTextContent(e.target.value)} placeholder="Write your story..." rows={6} maxLength={500}
              className="w-full max-w-md bg-transparent text-[var(--color-text)] text-xl text-center resize-none placeholder-[var(--color-text-muted)] focus:outline-none" autoFocus />
          ) : (
            <div className="w-full max-w-md space-y-4">
              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden">
                  {creatorMode === 'video' ? <video src={previewUrl} controls className="w-full" /> : <img src={previewUrl} alt="Preview" className="w-full" />}
                  <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--color-border)] rounded-2xl cursor-pointer hover:border-[var(--color-primary)] transition-colors">
                  <span className="text-4xl mb-2">{creatorMode === 'photo' ? '📷' : '🎬'}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">Tap to select {creatorMode}</span>
                  <input type="file" accept={creatorMode === 'video' ? 'video/*' : 'image/*'} className="hidden" onChange={handleFileSelect} />
                </label>
              )}
              {previewUrl && <Input placeholder="Add a caption..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={200} />}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Story Viewer — rendered via portal to body
  if (viewingStory) {
    const story = viewingStory.stories[currentIndex];
    const isTextStory = story?.mediaType === 'text';
    const isOwnStory = viewingStory.author?._id === user?._id;

    return createPortal(
      <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ width: '100vw', height: '100dvh' }}>
        <div className="flex gap-1 p-2 pt-4">
          {viewingStory.stories.map((s, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
              <div className={`h-full bg-white rounded-full ${i < currentIndex ? 'w-full' : i === currentIndex ? 'animate-progress' : 'w-0'}`} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-[2px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-500">
              <Avatar src={viewingStory.author?.avatar} name={viewingStory.author?.firstName} size="sm" className="border-2 border-black" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{viewingStory.author?.firstName} {viewingStory.author?.lastName}</p>
              <p className="text-white/60 text-xs">{timeAgo(story?.createdAt)}</p>
            </div>
          </div>
          <button onClick={() => setViewingStory(null)} className="text-white text-2xl">✕</button>
        </div>

        <div className="flex-1 flex items-center justify-center relative overflow-hidden" onClick={nextStory}>
          {isTextStory ? (
            <div className="w-full h-full flex items-center justify-center p-8 text-center m-4 rounded-3xl" style={{ backgroundColor: story?.backgroundColor || '#1B5E20' }}>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: story?.textColor || '#FFFFFF' }}>{story?.textContent || story?.caption}</p>
            </div>
          ) : story?.mediaType === 'video' ? (
            <video src={story.mediaUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop />
          ) : (
            <img src={story.mediaUrl} alt="Story" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {story?.caption && !isTextStory && (
            <div className="absolute bottom-24 left-0 right-0 text-center px-4 z-10">
              <p className="text-white text-base sm:text-lg font-semibold drop-shadow-lg">{story.caption}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex gap-2">
            {REACTIONS.map(r => (
              <button key={r} onClick={(e) => { e.stopPropagation(); handleReaction(story._id, r); }} className="text-2xl hover:scale-125 transition-transform active:scale-90">{r}</button>
            ))}
          </div>
          {isOwnStory && (
            <div className="flex items-center gap-3 text-white text-sm">
              <span>👁️ {story?.viewCount || 0}</span>
              <span>💬 {story?.reactionCount || 0}</span>
            </div>
          )}
        </div>

        {currentIndex > 0 && (
          <button onClick={(e) => { e.stopPropagation(); prevStory(); }} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl">‹</button>
        )}
        {currentIndex < viewingStory.stories.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); nextStory(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl">›</button>
        )}
      </div>,
      document.body
    );
  }

  // Stories List
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="pb-20">
      <div className="mb-4">
        <h3 className="font-bold text-[var(--color-text)] text-sm mb-2">My Story</h3>
        <button onClick={() => setShowCreator(true)} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors">
          <div className="relative">
            <div className="p-[2px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-500">
              <Avatar src={user?.avatar} name={user?.firstName} size="md" className="border-2 border-[var(--color-surface)]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] flex items-center justify-center border-2 border-[var(--color-surface)]">+</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-[var(--color-text)] text-sm">Create a story</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Share a photo, video, or text</p>
          </div>
        </button>
      </div>

      <h3 className="font-bold text-[var(--color-text)] text-sm mb-2">Recent Stories</h3>
      {stories.length === 0 ? (
        <EmptyState icon="⭕" title="No stories yet" description="Follow people to see their stories!" />
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
          {stories.map((group, i) => (
            <button key={i} onClick={() => openStory(group, 0)} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="p-[2px] rounded-full bg-gradient-to-br from-[var(--color-primary)] to-blue-500">
                <Avatar src={group.author?.avatar} name={group.author?.firstName} size="lg" className="border-2 border-[var(--color-surface)]" />
              </div>
              <span className="text-[10px] text-[var(--color-text-secondary)] max-w-[60px] truncate">
                {group.author?._id === user?._id ? 'My Story' : group.author?.firstName || 'User'}
              </span>
              <span className="text-[9px] text-[var(--color-text-muted)]">{group.stories.length} new</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};