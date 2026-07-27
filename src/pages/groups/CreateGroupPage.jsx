import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '@/api/groups';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GROUP_CATEGORIES } from '@/utils/constants';
import toast from 'react-hot-toast';

export const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('social');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Group name is required');
    setCreating(true);
    try {
      const res = await createGroup({ name: name.trim(), description: description.trim(), category });
      toast.success('Group created!');
      navigate(`/groups/${res.data?._id || res._id}`);
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setCreating(false); }
  };

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-[var(--color-text-secondary)] text-sm">← Back</button>
        <h2 className="font-bold text-[var(--color-text)]">Create Group</h2>
        <button onClick={handleCreate} disabled={creating} className="text-[var(--color-primary)] font-semibold text-sm">
          {creating ? 'Creating...' : 'Create'}
        </button>
      </div>

      <div className="space-y-3">
        <Input label="Group Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Engineering Workshop" maxLength={50} />
        <div>
          <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input resize-none" placeholder="What's this group about?" maxLength={500} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="input">
            {GROUP_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <Button onClick={handleCreate} disabled={creating} className="w-full">{creating ? 'Creating...' : 'Create Group'}</Button>
      </div>
    </div>
  );
};