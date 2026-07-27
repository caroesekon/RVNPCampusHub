import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getListingById, markInterested, markAsSold, deleteListing, reportListing } from '@/api/market';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice } from '@/utils/formatCurrency';
import { timeAgo } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export const ListingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await getListingById(id); setListing(res.data || res); }
      catch { toast.error('Listing not found'); navigate('/market'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleInterested = async () => { try { await markInterested(id); toast.success('Interest shown!'); } catch { toast.error('Failed'); } };
  const handleSold = async () => { try { await markAsSold(id, user?._id); toast.success('Marked as sold'); navigate('/market'); } catch { toast.error('Failed'); } };
  const handleDelete = async () => { if (!confirm('Delete?')) return; try { await deleteListing(id); toast.success('Deleted'); navigate('/market'); } catch { toast.error('Failed'); } };
  const handleReport = async () => { const r = prompt('Reason:'); if (!r) return; try { await reportListing(id, { type: 'fraud', description: r }); toast.success('Reported'); } catch { toast.error('Failed'); } };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!listing) return null;

  const isOwner = listing.seller?._id === user?._id || listing.seller === user?._id;
  const conditionColors = { like_new: 'bg-green-100 text-green-700', good: 'bg-blue-100 text-blue-700', fair: 'bg-yellow-100 text-yellow-700', poor: 'bg-red-100 text-red-700' };

  return (
    <div className="pb-20">
      <button onClick={() => navigate('/market')} className="text-[var(--color-text-secondary)] text-sm mb-3">← Back to Market</button>

      {listing.images?.length > 0 && (
        <div className="mb-4">
          <div className="rounded-xl overflow-hidden mb-2 bg-[var(--color-bg)]">
            <img src={listing.images[currentImage]} alt={listing.title} className="w-full h-72 object-cover" />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {listing.images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === currentImage ? 'border-[var(--color-primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        {listing.status === 'sold' && <Badge variant="red">SOLD</Badge>}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${conditionColors[listing.condition] || ''}`}>{listing.condition?.replace('_', ' ')}</span>
        <span className="text-xs text-[var(--color-text-muted)]">{listing.category}</span>
      </div>

      <h1 className="text-xl font-black text-[var(--color-text)]">{listing.title}</h1>
      <p className="text-3xl font-black text-[var(--color-accent)] mt-1">{formatPrice(listing.price)}</p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">Posted {timeAgo(listing.createdAt)} • 📍 {listing.location || listing.seller?.hostel || 'RVNP'}</p>

      {listing.description && (
        <div className="mt-4"><h3 className="font-bold text-[var(--color-text)] text-sm mb-1">Description</h3><p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{listing.description}</p></div>
      )}

      <div className="flex items-center gap-3 mt-4 p-4 rounded-xl bg-[var(--color-bg)]">
        <Avatar src={listing.seller?.avatar} name={listing.seller?.firstName} size="lg" verified={listing.seller?.hdmVerified} />
        <div className="flex-1">
          <p className="font-bold text-[var(--color-text)] flex items-center gap-1">{listing.seller?.firstName} {listing.seller?.lastName}{listing.seller?.hdmVerified && <VerifiedBadge size={16} />}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{listing.seller?.department || 'RVNP'}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{listing.seller?.hostel && `📍 ${listing.seller.hostel}`}</p>
        </div>
      </div>

      {isOwner && <div className="flex gap-4 mt-4 text-sm text-[var(--color-text-secondary)]"><span>👁️ {listing.interestedCount || 0} interested</span></div>}

      <div className="flex gap-2 mt-4">
        {isOwner ? (
          <>
            <Button variant="outline" onClick={handleSold} className="flex-1">✅ Mark as Sold</Button>
            <Button variant="ghost" onClick={handleDelete}>🗑️</Button>
          </>
        ) : listing.status === 'active' ? (
          <>
            <Button onClick={handleInterested} className="flex-1">💬 I'm Interested</Button>
            <Button variant="ghost" onClick={handleReport}>🚩</Button>
          </>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)] italic">This item has been sold.</p>
        )}
      </div>
    </div>
  );
};