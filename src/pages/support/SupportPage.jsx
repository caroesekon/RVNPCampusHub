import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTickets, createTicket } from '@/api/support';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { timeAgo } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export const SupportPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await getTickets();
      setTickets(res.data || res);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!subject.trim() || !message.trim()) return toast.error('Fill all fields');
    setSubmitting(true);
    try {
      await createTicket({ subject: subject.trim(), category, message: message.trim() });
      toast.success('Ticket created');
      setShowCreate(false);
      setSubject(''); setMessage(''); setCategory('general');
      fetchTickets();
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const statusColors = { open: 'text-green-500', in_progress: 'text-blue-500', resolved: 'text-gray-500', closed: 'text-gray-400' };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-[var(--color-text)]">Support</h2>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ New Ticket</Button>
      </div>

      {tickets.length === 0 ? (
        <EmptyState icon="🎫" title="No support tickets" description="Create a ticket if you need help." />
      ) : (
        <div className="space-y-2">
          {tickets.map(ticket => (
            <div key={ticket._id} onClick={() => navigate(`/support/${ticket._id}`)}
              className="card border-l-transparent p-4 cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[var(--color-text)] text-sm">{ticket.subject}</p>
                <span className={`text-xs font-semibold ${statusColors[ticket.status]}`}>
                  {ticket.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{ticket.ticketId} • {timeAgo(ticket.updatedAt)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Support Ticket">
        <div className="space-y-3">
          <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="What's the issue?" />
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input">
              <option value="general">General</option>
              <option value="account">Account</option>
              <option value="bug">Bug Report</option>
              <option value="feature_request">Feature Request</option>
              <option value="marketplace_dispute">Marketplace Dispute</option>
              <option value="payment">Payment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="input resize-none" placeholder="Describe your issue..." />
          </div>
          <Button onClick={handleCreate} disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};