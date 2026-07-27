import { useState, useEffect, useCallback } from 'react';
import { getListings, createListing, markInterested, markAsSold, deleteListing } from '@/api/market.api';

export const useMarket = (category = 'all') => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchListings = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getListings(category, pageNum);
      if (pageNum === 1) {
        setListings(res.data);
      } else {
        setListings(prev => [...prev, ...res.data]);
      }
      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchListings(1); }, [fetchListings]);

  const loadMore = () => { if (hasMore && !loading) fetchListings(page + 1); };

  const addListing = async (data) => {
    const res = await createListing(data);
    setListings(prev => [res.data, ...prev]);
    return res.data;
  };

  const interested = async (listingId) => {
    await markInterested(listingId);
  };

  const sellItem = async (listingId) => {
    await markAsSold(listingId);
    setListings(prev => prev.map(l => l._id === listingId ? { ...l, status: 'sold' } : l));
  };

  const removeListing = async (listingId) => {
    await deleteListing(listingId);
    setListings(prev => prev.filter(l => l._id !== listingId));
  };

  return { listings, loading, hasMore, loadMore, addListing, interested, sellItem, removeListing, refresh: () => fetchListings(1) };
};