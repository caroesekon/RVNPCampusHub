import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { createPost } from '@/api/posts';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';

const POST_TYPES = [
  { type: 'post', icon: '📝', label: 'Post' },
  { type: 'event', icon: '📅', label: 'Event' },
  { type: 'lost_found', icon: '🔑', label: 'Lost & Found' },
  { type: 'poll', icon: '📊', label: 'Poll' },
  { type: 'project', icon: '🔧', label: 'Project' },
  { type: 'qna', icon: '❓', label: 'Q&A' },
];

const FEELINGS = [
  { emoji: '😊', label: 'Happy' }, { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' }, { emoji: '😎', label: 'Cool' },
  { emoji: '🥰', label: 'Loved' }, { emoji: '😴', label: 'Sleepy' },
  { emoji: '🤩', label: 'Excited' }, { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '🙏', label: 'Grateful' }, { emoji: '💪', label: 'Motivated' },
  { emoji: '🎉', label: 'Celebrating' }, { emoji: '📚', label: 'Studying' },
];

export const CreatePostModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [type, setType] = useState('post');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [location, setLocation] = useState('');
  const [feeling, setFeeling] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showFeeling, setShowFeeling] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setFilePreviews(prev => [...prev, { url: reader.result, type: file.type }]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji.emoji);
    setShowEmoji(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return toast.error('Write something or add media');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('content', content);
      formData.append('isUrgent', isUrgent);
      if (location) formData.append('location', location);
      if (feeling) formData.append('feeling', feeling.label);
      if (type === 'poll') {
        const opts = pollOptions.filter(o => o.trim()).map(text => ({ text }));
        formData.append('pollOptions', JSON.stringify(opts));
      }
      files.forEach(file => formData.append('images', file));

      const res = await createPost(formData);
      onCreated(res.data || res);
      setContent(''); setType('post'); setFiles([]); setFilePreviews([]);
      setPollOptions(['', '']); setIsUrgent(false); setLocation(''); setFeeling(null);
      toast.success('Posted!');
    } catch (err) {
      toast.error(err.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const canAddMoreFiles = files.length < 5;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post" size="lg">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.firstName} size="md" />
          <div>
            <p className="font-semibold text-[var(--color-text)] text-sm">{user?.firstName} {user?.lastName}</p>
            {feeling && <p className="text-xs text-[var(--color-text-secondary)]">Feeling {feeling.emoji} {feeling.label}</p>}
            {location && <p className="text-xs text-[var(--color-text-secondary)]">📍 {location}</p>}
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {POST_TYPES.map(t => (
            <button key={t.type} onClick={() => setType(t.type)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                type === t.type ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
              }`}>{t.icon} {t.label}</button>
          ))}
        </div>

        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder={type === 'event' ? "What's happening? Add date and location..." : type === 'lost_found' ? 'Describe the lost or found item...' : type === 'poll' ? 'Ask a question...' : "What's on your mind?"}
          rows={4} className="input resize-none" maxLength={2000} />
        <p className="text-xs text-[var(--color-text-muted)] text-right -mt-2">{content.length}/2000</p>

        {type === 'poll' && (
          <div className="space-y-2">
            {pollOptions.map((opt, i) => (
              <input key={i} type="text" value={opt} onChange={e => { const u = [...pollOptions]; u[i] = e.target.value; setPollOptions(u); }}
                placeholder={`Option ${i + 1}`} className="input" />
            ))}
            {pollOptions.length < 4 && (
              <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs text-[var(--color-primary)] font-semibold">+ Add Option</button>
            )}
          </div>
        )}

        {filePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {filePreviews.map((preview, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden">
                {preview.type.startsWith('video/') ? <video src={preview.url} className="w-full h-24 object-cover" /> : <img src={preview.url} alt="Preview" className="w-full h-24 object-cover" />}
                <button onClick={() => removeFile(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center">✕</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap border-t border-[var(--color-border)] pt-3">
          <button onClick={() => fileInputRef.current?.click()} disabled={!canAddMoreFiles}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50">
            📷 {files.length > 0 ? `${files.length}/5` : 'Media'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileSelect} />

          <button onClick={() => { fileInputRef.current?.setAttribute('accept', 'video/*'); fileInputRef.current?.click(); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">🎬 Video</button>

          <button onClick={() => { const loc = prompt('Enter location:'); if (loc) setLocation(loc); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              location ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}>📍 {location || 'Location'}</button>

          <div className="relative">
            <button onClick={() => setShowFeeling(!showFeeling)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                feeling ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
              }`}>{feeling ? `${feeling.emoji} ${feeling.label}` : '😊 Feeling'}</button>
            {showFeeling && (
              <div className="absolute bottom-10 left-0 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] p-2 z-50 grid grid-cols-4 gap-1 w-56">
                {FEELINGS.map(f => (
                  <button key={f.label} onClick={() => { setFeeling(f); setShowFeeling(false); }}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-[var(--color-bg)] text-xs">
                    <span className="text-lg">{f.emoji}</span><span className="text-[9px] text-[var(--color-text-secondary)]">{f.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setShowEmoji(!showEmoji); setShowFeeling(false); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">😊 Emoji</button>
            {showEmoji && (
              <div className="absolute bottom-10 right-0 z-50"><EmojiPicker onEmojiClick={handleEmojiSelect} height={300} /></div>
            )}
          </div>

          <label className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--color-bg)] text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] cursor-pointer">
            <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-3 h-3 rounded" />🔥 Urgent
          </label>
        </div>

        <Button onClick={handleSubmit} disabled={loading || (!content.trim() && files.length === 0)} className="w-full">
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </Modal>
  );
};