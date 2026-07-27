import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createListing } from '@/api/market';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MARKET_CATEGORIES, LISTING_CONDITIONS } from '@/utils/constants';
import toast from 'react-hot-toast';

export const CreateListingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('other');
  const [condition, setCondition] = useState('good');
  const [location, setLocation] = useState(user?.hostel || '');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) return;

    setFiles(prev => [...prev, ...selected].slice(0, 4));

    selected.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(prev => [...prev, reader.result].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error('Title is required');
    if (!price || isNaN(price) || Number(price) <= 0) return toast.error('Enter a valid price');

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', price);
      formData.append('category', category);
      formData.append('condition', condition);
      formData.append('location', location);
      files.forEach(f => formData.append('images', f));

      const res = await createListing(formData);
      toast.success('Listing created!');
      navigate(`/market/${res.data?._id || res._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create listing');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/market')} className="text-[var(--color-text-secondary)] text-sm">← Back</button>
        <h2 className="font-bold text-[var(--color-text)]">New Listing</h2>
        <button onClick={handleSubmit} disabled={posting} className="text-[var(--color-primary)] font-semibold text-sm">
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Images */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-[var(--color-text-secondary)]">Photos (up to 4)</label>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {previews.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                <button onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] flex items-center justify-center">✕</button>
              </div>
            ))}
            {previews.length < 4 && (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-2xl text-[var(--color-text-muted)] hover:border-[var(--color-primary)] transition-colors flex-shrink-0">
                +
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>

        <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you selling?" maxLength={100} />

        <div>
          <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input resize-none" placeholder="Describe the item..." maxLength={1000} />
        </div>

        <Input label="Price (KSh)" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="500" />

        <div>
          <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input">
            {MARKET_CATEGORIES.filter(c => c.value !== 'all').map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Condition</label>
          <select value={condition} onChange={e => setCondition(e.target.value)} className="input">
            {LISTING_CONDITIONS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Hostel B" />

        <Button onClick={handleSubmit} disabled={posting} className="w-full">
          {posting ? 'Posting...' : 'Post Listing'}
        </Button>
      </div>
    </div>
  );
};