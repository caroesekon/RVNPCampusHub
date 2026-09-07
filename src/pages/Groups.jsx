import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPeople, IoAdd, IoSearch } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import GroupCard from '../components/groups/GroupCard.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Input from '../components/ui/Input.jsx';
import Dropdown from '../components/ui/Dropdown.jsx';
import groupApi from '../api/groupApi.js';
import { useApp } from '../context/AppContext.jsx';

const Groups = () => {
  const navigate = useNavigate();
  const { campuses } = useApp();

  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'General',
    privacy: 'PUBLIC',
  });
  const [selectedCampus, setSelectedCampus] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { value: 'all', label: 'All Groups' },
    { value: 'my', label: 'My Groups' },
  ];

  const campusOptions = campuses.map((campus) => ({
    value: campus.id,
    label: campus.name,
  }));

  const categoryOptions = [
    { value: 'General', label: 'General' },
    { value: 'Academics', label: 'Academics' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Tech', label: 'Tech' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Business', label: 'Business' },
    { value: 'Social', label: 'Social' },
  ];

  const privacyOptions = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'PRIVATE', label: 'Private' },
    { value: 'CAMPUS_ONLY', label: 'Campus Only' },
  ];

  useEffect(() => {
    fetchGroups();
  }, [activeTab]);

  const fetchGroups = async () => {
    setLoading(true);

    try {
      if (activeTab === 'all') {
        const response = await groupApi.getAllGroups();
        if (response.data.success) {
          setGroups(response.data.data.groups || []);
        }
      } else {
        const response = await groupApi.getMyGroups();
        if (response.data.success) {
          setMyGroups(response.data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load groups:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newGroup.name.trim()) {
      setError('Group name is required');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await groupApi.createGroup({
        name: newGroup.name,
        description: newGroup.description,
        category: newGroup.category,
        privacy: newGroup.privacy,
        campusId: selectedCampus,
      });

      if (response.data.success) {
        setShowCreate(false);
        setNewGroup({ name: '', description: '', category: 'General', privacy: 'PUBLIC' });
        setSelectedCampus('');
        fetchGroups();
        navigate(`/groups/${response.data.data.id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const filteredGroups = activeTab === 'all'
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : myGroups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const displayGroups = activeTab === 'all' ? filteredGroups : filteredGroups;

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-text-primary">Groups</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="p-2.5 rounded-full bg-rvnp-green text-rvnp-white hover:bg-rvnp-green-light shadow-lg"
            title="Create Group"
          >
            <IoAdd size={22} />
          </button>
        </div>

        <div className="relative mb-3">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none placeholder:text-text-muted"
          />
        </div>

        <div className="flex gap-2 mb-4 border-b border-border-color">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 font-medium text-sm transition-all border-b-2 -mb-px ${
                activeTab === tab.value
                  ? 'border-rvnp-green text-rvnp-green'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : displayGroups.length === 0 ? (
          <EmptyState
            icon={IoPeople}
            title={activeTab === 'all' ? 'No groups found' : 'No groups joined'}
            description={activeTab === 'all' ? 'Create or search for groups!' : 'Join groups to see them here!'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Group" size="md">
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
              {error}
            </div>
          )}

          <Input
            label="Group Name"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            placeholder="Enter group name"
            required
          />

          <Input
            label="Description"
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            placeholder="What's this group about?"
          />

          <Dropdown
            label="Category"
            options={categoryOptions}
            value={newGroup.category}
            onChange={(value) => setNewGroup({ ...newGroup, category: value })}
          />

          <Dropdown
            label="Privacy"
            options={privacyOptions}
            value={newGroup.privacy}
            onChange={(value) => setNewGroup({ ...newGroup, privacy: value })}
          />

          <Dropdown
            label="Campus"
            options={campusOptions}
            value={selectedCampus}
            onChange={setSelectedCampus}
            placeholder="Select Campus (optional)"
          />

          <Button fullWidth onClick={handleCreate} loading={creating}>
            Create Group
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default Groups;