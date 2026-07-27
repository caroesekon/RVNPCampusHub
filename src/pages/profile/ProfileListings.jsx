import { useState, useEffect } from 'react';
import { getUserListings } from '@/api/users';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice } from '@/utils/formatCurrency';

export const ProfileListings = ({ userId }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserListings(userId);
        setListings(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [userId]);

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>;
  if (listings.length === 0) return <EmptyState icon="🛒" title="No listings" />;

  return (
    <div className="grid grid-cols-2 gap-3">
      {listings.map(item => (
        <div key={item._id} className="card border-l-transparent p-2">
          <div className="h-24 bg-[var(--color-bg)] rounded-md flex items-center justify-center text-2xl">📦</div>
          <p className="text-xs font-semibold text-[var(--color-text)] mt-1 truncate">{item.title}</p>
          <p className="text-sm font-bold text-[var(--color-accent)]">{formatPrice(item.price)}</p>
        </div>
      ))}
    </div>
  );
};