import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoStorefront,
  IoAdd,
  IoSearch,
  IoImage,
  IoClose,
  IoChatbubble,
} from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Input from '../components/ui/Input.jsx';
import Dropdown from '../components/ui/Dropdown.jsx';
import ListingCard from '../components/marketplace/ListingCard.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import VerifiedBadge from '../components/ui/VerifiedBadge.jsx';
import marketplaceApi from '../api/marketplaceApi.js';
import uploadApi from '../api/uploadApi.js';
import messageApi from '../api/messageApi.js';
import { useApp } from '../context/AppContext.jsx';
import { formatPrice } from '../utils/formatNumber.js';
import timeAgo from '../utils/timeAgo.js';

const CATEGORIES = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Books', label: 'Books' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Services', label: 'Services' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Food', label: 'Food' },
  { value: 'Other', label: 'Other' },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const { campuses } = useApp();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [showOffers, setShowOffers] = useState(null);
  const [offers, setOffers] = useState([]);

  // Create form
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Offer form
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [activeTab, selectedCategory, selectedCampus]);

  const fetchListings = async () => {
    setLoading(true);

    try {
      if (activeTab === 'my') {
        const response = await marketplaceApi.getMyListings();
        if (response.data.success) {
          setListings(response.data.data.listings || []);
        }
      } else {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedCampus) params.campusId = selectedCampus;

        const response = await marketplaceApi.getAllListings(params);
        if (response.data.success) {
          setListings(response.data.data.listings || []);
        }
      }
    } catch (error) {
      console.error('Failed to load listings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const imageUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, imageUrl]);
      setImageFiles((prev) => [...prev, file]);
    });
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.price) {
      setError('Title and price are required');
      return;
    }

    setCreating(true);
    setError('');

    try {
      let uploadedImages = [];
      if (imageFiles.length > 0) {
        const uploadResponse = await uploadApi.uploadMultiple(imageFiles);
        if (uploadResponse.data.success) {
          uploadedImages = uploadResponse.data.data.map((img) => img.url);
        }
      }

      const response = await marketplaceApi.createListing({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        images: uploadedImages,
        campusId: selectedCampus || undefined,
      });

      if (response.data.success) {
        setShowCreate(false);
        setForm({ title: '', description: '', price: '', category: 'Electronics' });
        setImages([]);
        setImageFiles([]);
        fetchListings();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setCreating(false);
    }
  };

  const handleContactSeller = async (listing) => {
    try {
      const response = await messageApi.createDirectConversation(listing.userId);
      if (response.data.success) {
        navigate(`/messages/${response.data.data.id}`);
      }
    } catch (error) {
      console.error('Failed to contact seller:', error.message);
    }
  };

  const handleMarkSold = async (listingId) => {
    try {
      await marketplaceApi.markAsSold(listingId);
      setShowDetails(null);
      fetchListings();
    } catch (error) {
      console.error('Failed to mark sold:', error.message);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      await marketplaceApi.deleteListing(listingId);
      setShowDetails(null);
      fetchListings();
    } catch (error) {
      console.error('Failed to delete:', error.message);
    }
  };

  const handleViewOffers = async (listingId) => {
    try {
      const response = await marketplaceApi.getOffers(listingId);
      if (response.data.success) {
        setOffers(response.data.data || []);
        setShowOffers(listingId);
      }
    } catch (error) {
      console.error('Failed to load offers:', error.message);
    }
  };

  const handleSubmitOffer = async (listingId) => {
    if (!offerAmount) return;
    setSendingOffer(true);

    try {
      await marketplaceApi.addOffer(listingId, parseFloat(offerAmount), offerMessage);
      setOfferAmount('');
      setOfferMessage('');
      setShowDetails(null);
    } catch (error) {
      console.error('Offer failed:', error.message);
    } finally {
      setSendingOffer(false);
    }
  };

  const filteredListings = listings.filter((listing) =>
    listing.title.toLowerCase().includes(search.toLowerCase()) ||
    (listing.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const campusOptions = campuses.map((campus) => ({
    value: campus.id,
    label: campus.name,
  }));

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-text-primary">Marketplace</h1>
          <button onClick={() => setShowCreate(true)} className="p-2.5 rounded-full bg-rvnp-green text-rvnp-white hover:bg-rvnp-green-light shadow-lg" title="Sell">
            <IoAdd size={22} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none placeholder:text-text-muted"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="w-36">
            <Dropdown
              options={CATEGORIES}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value)}
              placeholder="Category"
            />
          </div>
          <div className="w-40">
            <Dropdown
              options={campusOptions}
              value={selectedCampus}
              onChange={setSelectedCampus}
              placeholder="Campus"
            />
          </div>
          {selectedCategory && (
            <button onClick={() => setSelectedCategory('')} className="text-xs text-rvnp-green hover:underline">
              Clear
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-border-color">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${activeTab === 'all' ? 'border-rvnp-green text-rvnp-green' : 'border-transparent text-text-muted'}`}>
            All Listings
          </button>
          <button onClick={() => setActiveTab('my')} className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${activeTab === 'my' ? 'border-rvnp-green text-rvnp-green' : 'border-transparent text-text-muted'}`}>
            My Listings
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filteredListings.length === 0 ? (
          <EmptyState icon={IoStorefront} title="No listings" description="Buy and sell items within your campus!" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredListings.map((listing) => (
              <div key={listing.id} onClick={() => setShowDetails(listing)} className="cursor-pointer">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Sell Item" size="md">
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
              {error}
            </div>
          )}

          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What are you selling?"
            required
          />

          <Input
            label="Price (KSh)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0"
            required
          />

          <Dropdown
            label="Category"
            options={CATEGORIES}
            value={form.category}
            onChange={(value) => setForm({ ...form, category: value })}
          />

          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your item"
          />

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img src={image} alt="Upload" className="h-16 w-16 object-cover rounded-lg" />
                  <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 p-1 rounded-full bg-bg-tertiary text-text-secondary">
                    <IoClose size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 p-3 rounded-lg bg-bg-secondary text-text-secondary cursor-pointer">
            <IoImage size={20} />
            <span className="text-sm">Add Images</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
          </label>

          <Button fullWidth onClick={handleCreate} loading={creating}>
            Create Listing
          </Button>
        </div>
      </Modal>

      {/* Listing Details Modal */}
      <Modal isOpen={!!showDetails} onClose={() => setShowDetails(null)} title={showDetails?.title || 'Listing'} size="lg">
        {showDetails && (
          <div className="space-y-4">
            {showDetails.images && showDetails.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {showDetails.images.map((image, index) => (
                  <img key={index} src={image} alt={`Image ${index + 1}`} className="w-full rounded-lg object-cover max-h-48" />
                ))}
              </div>
            )}

            <p className="text-2xl font-semibold text-rvnp-green">{formatPrice(showDetails.price)}</p>

            {showDetails.description && (
              <p className="text-text-secondary">{showDetails.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span className="px-2 py-1 rounded bg-bg-secondary">{showDetails.category}</span>
              {showDetails.campus && <span>📍 {showDetails.campus.name}</span>}
              <span>{timeAgo(showDetails.createdAt)}</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary">
              <Avatar src={showDetails.user?.avatarUrl} name={showDetails.user?.fullName} size="sm" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-text-primary text-sm">{showDetails.user?.fullName}</span>
                  {showDetails.user?.hdmVerified && <VerifiedBadge size={12} />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {showDetails.userId !== JSON.parse(localStorage.getItem('rvnp_user'))?.id ? (
                <>
                  <Button fullWidth onClick={() => handleContactSeller(showDetails)}>
                    <IoChatbubble className="inline mr-1" size={16} />
                    Contact Seller
                  </Button>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Your offer (KSh)"
                    />
                    <Input
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="Message (optional)"
                    />
                    <Button size="sm" onClick={() => handleSubmitOffer(showDetails.id)} loading={sendingOffer}>
                      Offer
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {showDetails.status === 'ACTIVE' && (
                    <Button fullWidth variant="secondary" onClick={() => handleMarkSold(showDetails.id)}>
                      Mark as Sold
                    </Button>
                  )}
                  <Button fullWidth variant="outline" onClick={() => handleViewOffers(showDetails.id)}>
                    View Offers
                  </Button>
                  <Button fullWidth variant="danger" onClick={() => handleDelete(showDetails.id)}>
                    Delete Listing
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Offers Modal */}
      <Modal isOpen={!!showOffers} onClose={() => setShowOffers(null)} title="Offers" size="sm">
        {offers.length === 0 ? (
          <p className="text-center text-text-muted py-8">No offers yet</p>
        ) : (
          <div className="space-y-2">
            {offers.map((offer) => (
              <div key={offer.id} className="p-3 rounded-lg bg-bg-secondary">
                <p className="font-semibold text-rvnp-green">{formatPrice(offer.amount)}</p>
                {offer.message && <p className="text-sm text-text-secondary mt-1">{offer.message}</p>}
                <p className="text-xs text-text-muted mt-1">{timeAgo(offer.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Marketplace;