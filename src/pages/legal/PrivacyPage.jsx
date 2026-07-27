import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrivacyPolicy } from '@/api/legal';
import { Spinner } from '@/components/ui/Spinner';

export const PrivacyPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPrivacyPolicy();
        setContent(res.data?.content || res.content || 'Privacy Policy not available.');
      } catch { setContent('Failed to load Privacy Policy.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="pb-20">
      <button onClick={() => navigate(-1)} className="text-[var(--color-text-secondary)] text-sm mb-4">← Back</button>
      <h1 className="text-xl font-black text-[var(--color-text)] mb-4">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};