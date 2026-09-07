import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCalendar, IoLocation, IoAdd } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Input from '../components/ui/Input.jsx';
import Dropdown from '../components/ui/Dropdown.jsx';
import eventApi from '../api/eventApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatEventDate } from '../utils/formatDate.js';

const Events = () => {
  const { user } = useAuth();
  const { campuses } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
  });
  const [selectedCampus, setSelectedCampus] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const canAddEvent = ['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user?.role);

  const tabs = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
  ];

  const campusOptions = campuses.map((campus) => ({
    value: campus.id,
    label: campus.name,
  }));

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    setLoading(true);

    try {
      const response =
        activeTab === 'upcoming'
          ? await eventApi.getUpcomingEvents()
          : await eventApi.getOngoingEvents();

      if (response.data.success) {
        setEvents(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) {
      setError('Title, start time, and end time are required');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await eventApi.createEvent({
        title: form.title,
        description: form.description,
        location: form.location,
        campusId: selectedCampus || user?.campusId,
        startTime: form.startTime,
        endTime: form.endTime,
      });

      if (response.data.success) {
        setShowCreate(false);
        setForm({ title: '', description: '', location: '', startTime: '', endTime: '' });
        setSelectedCampus('');
        fetchEvents();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold text-text-primary">Events</h1>
          {canAddEvent && (
            <button
              onClick={() => setShowCreate(true)}
              className="p-2.5 rounded-full bg-rvnp-green text-rvnp-white hover:bg-rvnp-green-light shadow-lg"
              title="Add Event"
            >
              <IoAdd size={22} />
            </button>
          )}
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : events.length === 0 ? (
            <EmptyState icon={IoCalendar} title={`No ${activeTab} events`} description="Check back later!" />
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-4 rounded-xl border border-border-color bg-bg-primary">
                  <h3 className="font-medium text-text-primary text-lg">{event.title}</h3>
                  {event.description && (
                    <p className="text-text-secondary text-sm mt-1">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <IoCalendar size={14} />
                      {formatEventDate(event.startTime, event.endTime)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <IoLocation size={14} />
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.campus && (
                    <span className="inline-block mt-2 px-2 py-1 rounded bg-bg-secondary text-xs text-text-secondary">
                      {event.campus.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {canAddEvent && (
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Event" size="md">
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
              placeholder="Event title"
              required
            />

            <Input
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Event description"
            />

            <Input
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Event location"
            />

            <Dropdown
              label="Campus"
              options={campusOptions}
              value={selectedCampus}
              onChange={setSelectedCampus}
              placeholder="Select Campus"
            />

            <Input
              label="Start Time"
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />

            <Input
              label="End Time"
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />

            <Button fullWidth onClick={handleCreate} loading={creating}>
              Create Event
            </Button>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default Events;