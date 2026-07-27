import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, updatePost } from '@/api/posts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPostById(id);
        const post = res.data || res;
        setContent(post.content || '');
        setIsUrgent(post.isUrgent || false);
        setFeeling(post.feeling || '');
        setLocation(post.location?.name || '');
      } catch { toast.error('Post not found'); navigate('/'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleSave = async () => {
    if (!content.trim()) return toast.error('Content is required');
    setSaving(true);
    try {
      await updatePost(id, { content, isUrgent, feeling, location: location || null });
      toast.success('Post updated');
      navigate(`/post/${id}`);
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-[var(--color-text-secondary)] text-sm">← Back</button>
        <h2 className="font-bold text-[var(--color-text)]">Edit Post</h2>
        <button onClick={handleSave} disabled={saving} className="text-[var(--color-primary)] font-semibold text-sm">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={6}
        className="input resize-none mb-3"
        placeholder="Edit your post..."
        maxLength={2000}
      />
      <p className="text-xs text-[var(--color-text-muted)] text-right -mt-2 mb-3">{content.length}/2000</p>

      <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Add location" className="mb-3" />
      <Input label="Feeling" value={feeling} onChange={e => setFeeling(e.target.value)} placeholder="How are you feeling?" className="mb-3" />

      <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-4">
        <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-4 h-4 rounded" />
        Mark as urgent
      </label>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};