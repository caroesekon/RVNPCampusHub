import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { getListings } from '@/api/market';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice } from '@/utils/formatCurrency';
import { timeAgo } from '@/utils/formatDate';

const CATEGORIES = [
  { id: 'all', icon: '🛒', label: 'All' },
  { id: 'textbooks', icon: '📚', label: 'Textbooks' },
  { id: 'tools', icon: '🔧', label: 'Tools' },
  { id: 'electronics', icon: '💻', label: 'Electronics' },
  { id: 'hostel', icon: '🏠', label: 'Hostel' },
  { id: 'clothing', icon: '👕', label: 'Clothing' },
  { id: 'other', icon: '📦', label: 'Other' },
];

export const MarketPage = () => {
  const { isFeatureEnabled } = useSettings();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const marketplaceEnabled = isFeatureEnabled('marketplace');

  useEffect(() => {
    if (!marketplaceEnabled) return;
    fetchListings();
  }, [category, marketplaceEnabled]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await getListings(category);
      setListings(res.data || res);
    } catch (err) {
      console.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  if (!marketplaceEnabled) {
    return (
      <EmptyState
        icon="🛒"
        title="Marketplace is currently disabled"
        description="The admin has disabled this feature."
      />
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-[var(--color-text)]">Marketplace</h2>
        <Button size="sm" onClick={() => navigate('/create-listing')}>+ Sell</Button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === c.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[var(--color-surface)] rounded-xl p-2 space-y-2">
              <div className="w-full h-36 skeleton rounded-lg" />
              <div className="w-3/4 h-3 skeleton rounded" />
              <div className="w-1/2 h-4 skeleton rounded" />
              <div className="w-1/3 h-2 skeleton rounded" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="No listings yet"
          description={category === 'all' ? 'Be the first to sell something!' : `No listings in ${category}.`}
          action={
            <Button size="sm" onClick={() => navigate('/create-listing')}>
              Create Listing
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {listings.map(item => (
            <div
              key={item._id}
              onClick={() => navigate(`/market/${item._id}`)}
              className="bg-[var(--color-surface)] rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              {/* Image */}
              <div className="w-full h-36 bg-[var(--color-bg)] flex items-center justify-center overflow-hidden">
                {item.images?.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl opacity-30">📦</span>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs font-semibold text-[var(--color-text)] truncate">
                  {item.title}
                </p>
                <p className="text-sm font-black text-[var(--color-accent)] mt-0.5">
                  {formatPrice(item.price)}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                    {item.location || item.seller?.hostel || 'RVNP'}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};