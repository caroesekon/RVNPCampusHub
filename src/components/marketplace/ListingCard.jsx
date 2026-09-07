import { useNavigate } from 'react-router-dom';
import { IoLocation, IoTime } from 'react-icons/io5';
import { formatPrice } from '../../utils/formatNumber.js';
import timeAgo from '../../utils/timeAgo.js';

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/marketplace/${listing.id}`)}
      className="w-full bg-bg-primary border border-border-color rounded-xl overflow-hidden hover:bg-bg-secondary transition-all text-left cursor-pointer"
    >
      <div className="relative aspect-square bg-bg-secondary">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-text-muted">
            📦
          </div>
        )}

        {listing.status === 'SOLD' && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-rvnp-red text-white text-xs font-medium">
            SOLD
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-text-primary truncate">{listing.title}</h3>
        <p className="font-semibold text-rvnp-green mt-1">{formatPrice(listing.price)}</p>

        <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
          <span className="px-2 py-0.5 rounded bg-bg-secondary">{listing.category}</span>
          {listing.campus && (
            <span className="flex items-center gap-0.5">
              <IoLocation size={10} />
              {listing.campus.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1.5 text-xs text-text-muted">
          <IoTime size={10} />
          {timeAgo(listing.createdAt)}
        </div>
      </div>
    </button>
  );
};

export default ListingCard;