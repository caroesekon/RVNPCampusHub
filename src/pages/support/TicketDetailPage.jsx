import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, respondToTicket } from '@/api/support';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { timeAgo } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export const TicketDetailPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTicketById(ticketId);
        setTicket(res.data || res);
      } catch { toast.error('Ticket not found'); navigate('/support'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [ticketId]);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await respondToTicket(ticketId, reply.trim());
      setReply('');
      const res = await getTicketById(ticketId);
      setTicket(res.data || res);
      toast.success('Reply sent');
    } catch { toast.error('Failed'); }
    finally { setSending(false); }
  };

  const statusColors = { open: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700', resolved: 'bg-gray-100 text-gray-700', closed: 'bg-gray-100 text-gray-400' };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!ticket) return null;

  return (
    <div className="pb-20">
      <button onClick={() => navigate('/support')} className="text-[var(--color-text-secondary)] text-sm mb-4">← Back</button>

      <div className="mb-4">
        <h2 className="text-xl font-black text-[var(--color-text)]">{ticket.subject}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
            {ticket.status?.replace('_', ' ')}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">{ticket.ticketId}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {ticket.messages?.map((msg, i) => (
          <div key={i} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
              msg.senderType === 'user'
                ? 'bg-[var(--color-primary)] text-white rounded-br-md'
                : 'bg-[var(--color-bg)] text-[var(--color-text)] rounded-bl-md'
            }`}>
              <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
              <span className={`text-[10px] mt-1 block ${msg.senderType === 'user' ? 'text-white/70' : 'text-[var(--color-text-muted)]'}`}>
                {timeAgo(msg.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
        <div className="flex gap-2">
          <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type a reply..." className="input flex-1" />
          <Button size="sm" onClick={handleReply} disabled={sending || !reply.trim()}>Send</Button>
        </div>
      )}
    </div>
  );
};