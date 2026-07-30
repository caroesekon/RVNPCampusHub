import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

export const CommentInput = ({ onSubmit, placeholder = 'Write a comment...', replyingTo = null, onCancel }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await onSubmit(content.trim());
    setContent('');
    setSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar src={user?.avatar} name={user?.firstName} size="sm" />
      <div className="flex-1">
        {replyingTo && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--color-text-muted)]">Replying to {replyingTo}</span>
            <button onClick={onCancel} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-full bg-[var(--color-bg)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/40 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="text-sm font-semibold text-[var(--color-primary)] disabled:opacity-40 hover:text-[var(--color-primary)]/80"
          >
            {submitting ? '...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};