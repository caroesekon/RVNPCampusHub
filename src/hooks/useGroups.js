import { useState, useEffect, useCallback } from 'react';
import { getGroups, getGroupById, joinGroup, leaveGroup } from '@/api/groups.api';

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await getGroups();
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const join = async (groupId) => {
    await joinGroup(groupId);
    setGroups(prev => prev.map(g => g._id === groupId ? { ...g, isMember: true, memberCount: g.memberCount + 1 } : g));
  };

  const leave = async (groupId) => {
    await leaveGroup(groupId);
    setGroups(prev => prev.map(g => g._id === groupId ? { ...g, isMember: false, memberCount: g.memberCount - 1 } : g));
  };

  return { groups, loading, join, leave, refresh: fetchGroups };
};