import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  getGroupById, joinGroup, leaveGroup, requestToJoin,
  getGroupWall, getGroupEvents, getGroupFiles, createGroupEvent,
  rsvpEvent, approveMember, rejectMember, removeMember,
  addModerator, removeModerator, updateGroupSettings, getJoinRequests,
} from '@/api/groups';
import { createPost } from '@/api/posts';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toggle } from '@/components/ui/Toggle';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs } from '@/components/ui/Tabs';
import { timeAgo, formatDate } from '@/utils/formatDate';
import { formatCompactNumber } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export const GroupDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('wall');
  const [wall, setWall] = useState([]);
  const [events, setEvents] = useState([]);
  const [files, setFiles] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [settingsForm, setSettingsForm] = useState({});
  const [showRules, setShowRules] = useState(false);

  useEffect(() => { fetchGroup(); }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await getGroupById(id);
      const g = res.data || res;
      setGroup(g);
      setSettingsForm({
        requiresApproval: g.requiresApproval || false,
        isPrivate: g.isPrivate || false,
        rules: g.rules || [],
        description: g.description || '',
      });
    } catch { toast.error('Group not found'); navigate('/groups'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!group) return;
    if (tab === 'wall') fetchWall();
    else if (tab === 'events') fetchEvents();
    else if (tab === 'files') fetchFiles();
  }, [tab, group]);

  const fetchWall = async () => { try { const r = await getGroupWall(id); setWall(r.data || r); } catch {} };
  const fetchEvents = async () => { try { const r = await getGroupEvents(id); setEvents(r.data || r); } catch {} };
  const fetchFiles = async () => { try { const r = await getGroupFiles(id); setFiles(r.data || r); } catch {} };
  const fetchRequests = async () => { try { const r = await getJoinRequests(id); setRequests(r.data || r); } catch {} };

  const handleJoin = async () => {
    try {
      if (group.requiresApproval) {
        await requestToJoin(id);
        toast.success('Request sent!');
      } else {
        await joinGroup(id);
        toast.success('Joined!');
      }
      fetchGroup();
    } catch (e) { toast.error(e.message || 'Failed'); }
  };
  const handleLeave = async () => { try { await leaveGroup(id); toast.success('Left'); fetchGroup(); } catch { toast.error('Failed'); } };
  const handlePost = async () => {
    if (!postContent.trim()) return;
    setPosting(true);
    try { await createPost({ content: postContent.trim(), group: id, type: 'post' }); setPostContent(''); toast.success('Posted!'); fetchWall(); }
    catch { toast.error('Failed'); } finally { setPosting(false); }
  };
  const handleRSVP = async (eventId) => { try { await rsvpEvent(id, eventId); fetchEvents(); } catch { toast.error('Failed'); } };
  const handleApprove = async (userId) => { try { await approveMember(id, userId); toast.success('Approved'); fetchRequests(); fetchGroup(); } catch { toast.error('Failed'); } };
  const handleReject = async (userId) => { try { await rejectMember(id, userId); toast.success('Rejected'); fetchRequests(); } catch { toast.error('Failed'); } };
  const handleRemove = async (userId) => { if (!confirm('Remove this member?')) return; try { await removeMember(id, userId); toast.success('Removed'); fetchGroup(); } catch { toast.error('Failed'); } };
  const handleMakeMod = async (userId) => { try { await addModerator(id, userId); toast.success('Moderator added'); fetchGroup(); } catch { toast.error('Failed'); } };
  const handleRemoveMod = async (userId) => { try { await removeModerator(id, userId); toast.success('Removed'); fetchGroup(); } catch { toast.error('Failed'); } };
  const handleSaveSettings = async () => {
    try { await updateGroupSettings(id, settingsForm); toast.success('Saved'); setShowSettings(false); fetchGroup(); }
    catch { toast.error('Failed'); }
  };
  const handleAddRule = () => { setSettingsForm(prev => ({ ...prev, rules: [...(prev.rules || []), ''] })); };
  const handleRuleChange = (i, val) => { const r = [...settingsForm.rules]; r[i] = val; setSettingsForm(prev => ({ ...prev, rules: r })); };
  const handleRemoveRule = (i) => { setSettingsForm(prev => ({ ...prev, rules: prev.rules.filter((_, j) => j !== i) })); };

  const isMember = group?.members?.some(m => (m._id || m) === user?._id);
  const isAdmin = group?.admin === user?._id || group?.admin?._id === user?._id;
  const isMod = group?.moderators?.some(m => (m._id || m) === user?._id);
  const canManage = isAdmin || isMod;
  const hasRequested = group?.joinRequests?.some(r => (r._id || r) === user?._id);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!group) return null;

  const tabs = [
    { id: 'wall', label: '📰 Wall' },
    { id: 'events', label: '📅 Events' },
    { id: 'files', label: '📁 Files' },
  ];
  if (canManage) tabs.push({ id: 'manage', label: '⚙️ Manage' });

  return (
    <div className="pb-20">
      <button onClick={() => navigate('/groups')} className="text-[var(--color-text-secondary)] text-sm mb-3">← Back</button>

      {/* Header */}
      <div className="h-32 bg-gradient-to-r from-[var(--color-primary)]/30 to-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mb-4">
        <span className="text-5xl">👥</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-[var(--color-text)]">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {group.isPrivate && <Badge variant="gray" emoji="🔒">Private</Badge>}
            {group.requiresApproval && <Badge variant="gold" emoji="✅">Approval Required</Badge>}
          </div>
        </div>
        {canManage && (
          <button onClick={() => { setShowSettings(true); }} className="text-lg">⚙️</button>
        )}
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{group.description}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-muted)]">
        <span>👥 {formatCompactNumber(group.memberCount)} members</span>
        <span>• {group.category}</span>
      </div>

      {/* Rules */}
      {group.rules?.length > 0 && (
        <button onClick={() => setShowRules(!showRules)} className="text-xs text-[var(--color-primary)] mt-2 font-semibold">
          📋 {group.rules.length} rule{group.rules.length > 1 ? 's' : ''} {showRules ? '▲' : '▼'}
        </button>
      )}
      {showRules && (
        <div className="mt-2 p-3 bg-[var(--color-bg)] rounded-lg">
          <ol className="list-decimal pl-4 text-xs text-[var(--color-text-secondary)] space-y-1">
            {group.rules.map((rule, i) => <li key={i}>{rule}</li>)}
          </ol>
        </div>
      )}

      {/* Join / Leave */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {isMember ? (
          <>
            {!isAdmin && <Button variant="outline" size="sm" onClick={handleLeave}>Leave</Button>}
            {isAdmin && <Badge variant="green" emoji="👑">Owner</Badge>}
            {isMod && !isAdmin && <Badge variant="purple" emoji="🛡️">Moderator</Badge>}
            {canManage && (
              <Button variant="ghost" size="sm" onClick={() => { fetchRequests(); setShowRequests(true); }}>
                Requests {group.joinRequests?.length > 0 ? `(${group.joinRequests.length})` : ''}
              </Button>
            )}
          </>
        ) : hasRequested ? (
          <Badge variant="gold">⏳ Request Pending</Badge>
        ) : (
          <Button size="sm" onClick={handleJoin}>Join Group</Button>
        )}
      </div>

      {/* Post Input */}
      {isMember && tab === 'wall' && (
        <div className="flex gap-2 mt-4 mb-3">
          <input value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="Share something..." className="input flex-1" />
          <Button size="sm" onClick={handlePost} disabled={posting || !postContent.trim()}>Post</Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-3 mt-4" />

      {/* Wall */}
      {tab === 'wall' && (
        <div className="space-y-3">
          {wall.length === 0 ? <EmptyState icon="📰" title="No posts yet" /> : wall.map(post => (
            <div key={post._id} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar src={post.author?.avatar} name={post.author?.firstName} size="sm" />
                <span className="font-semibold text-[var(--color-text)] text-sm">{post.author?.firstName}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{timeAgo(post.createdAt)}</span>
              </div>
              <p className="text-sm text-[var(--color-text)]">{post.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Events */}
      {tab === 'events' && (
        <div className="space-y-3">
          {canManage && (
            <Button size="sm" variant="outline" onClick={() => {
              const title = prompt('Event title:');
              const date = prompt('Date (YYYY-MM-DD):');
              const loc = prompt('Location:');
              if (title && date) { createGroupEvent(id, { title, date, location: loc }).then(() => fetchEvents()); }
            }}>+ Add Event</Button>
          )}
          {events.length === 0 ? <EmptyState icon="📅" title="No events" /> : events.map(event => (
            <div key={event._id} className="card p-4">
              <p className="font-semibold text-[var(--color-text)]">{event.title}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{formatDate(event.date)} • {event.location}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{event.goingCount || 0} going</p>
              {isMember && (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => handleRSVP(event._id)}>
                  {event.going?.includes(user?._id) ? '✅ Going' : 'RSVP'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Files */}
      {tab === 'files' && (
        <div className="space-y-2">
          {files.length === 0 ? <EmptyState icon="📁" title="No files" /> : files.map(file => (
            <a key={file._id} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg)] transition-colors">
              <span className="text-2xl">📄</span>
              <div><p className="text-sm font-semibold text-[var(--color-text)]">{file.name}</p><p className="text-xs text-[var(--color-text-muted)]">Uploaded by {file.uploadedBy?.firstName || 'member'}</p></div>
            </a>
          ))}
        </div>
      )}

      {/* Manage Tab */}
      {tab === 'manage' && canManage && (
        <div className="space-y-4">
          <h3 className="font-bold text-[var(--color-text)]">Members ({group.memberCount})</h3>
          {group.members?.slice(0, 10).map(m => {
            const mid = m._id || m;
            const isMemberAdmin = group.admin === mid || group.admin?._id === mid;
            const isMemberMod = group.moderators?.some(mod => (mod._id || mod) === mid);
            return (
              <div key={mid} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg)]">
                <div className="flex items-center gap-2">
                  <Avatar name={m.firstName} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{m.firstName} {m.lastName} {isMemberAdmin && '👑'} {isMemberMod && '🛡️'}</p>
                  </div>
                </div>
                {!isMemberAdmin && (
                  <div className="flex gap-1">
                    {!isMemberMod ? (
                      <button onClick={() => handleMakeMod(mid)} className="text-xs text-[var(--color-primary)] px-2 py-1 hover:bg-[var(--color-surface-hover)] rounded">Make Mod</button>
                    ) : (
                      <button onClick={() => handleRemoveMod(mid)} className="text-xs text-yellow-500 px-2 py-1 hover:bg-[var(--color-surface-hover)] rounded">Remove Mod</button>
                    )}
                    <button onClick={() => handleRemove(mid)} className="text-xs text-[var(--color-accent)] px-2 py-1 hover:bg-[var(--color-surface-hover)] rounded">Remove</button>
                  </div>
                )}
              </div>
            );
          })}

          <Button variant="outline" size="sm" onClick={() => { setShowSettings(true); }}>Group Settings</Button>
        </div>
      )}

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Group Settings">
        <div className="space-y-4">
          <Toggle enabled={settingsForm.requiresApproval} onChange={v => setSettingsForm(prev => ({ ...prev, requiresApproval: v }))}
            label="Require Approval" description="Members must be approved before joining" />
          <Toggle enabled={settingsForm.isPrivate} onChange={v => setSettingsForm(prev => ({ ...prev, isPrivate: v }))}
            label="Private Group" description="Only members can see content" />
          <div>
            <label className="block text-sm font-semibold mb-1 text-[var(--color-text-secondary)]">Description</label>
            <textarea value={settingsForm.description} onChange={e => setSettingsForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2} className="input resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[var(--color-text-secondary)]">Rules</label>
              <button onClick={handleAddRule} className="text-xs text-[var(--color-primary)] font-semibold">+ Add</button>
            </div>
            {settingsForm.rules?.map((rule, i) => (
              <div key={i} className="flex gap-2 mb-1">
                <input value={rule} onChange={e => handleRuleChange(i, e.target.value)} placeholder={`Rule ${i + 1}`} className="input flex-1" />
                <button onClick={() => handleRemoveRule(i)} className="text-[var(--color-accent)] text-sm">✕</button>
              </div>
            ))}
          </div>
          <Button onClick={handleSaveSettings} className="w-full">Save Settings</Button>
        </div>
      </Modal>

      {/* Requests Modal */}
      <Modal isOpen={showRequests} onClose={() => setShowRequests(false)} title="Join Requests">
        {requests.length === 0 ? <EmptyState icon="📭" title="No pending requests" /> : requests.map(r => (
          <div key={r._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg)]">
            <div className="flex items-center gap-2">
              <Avatar src={r.avatar} name={r.firstName} size="sm" />
              <p className="text-sm font-semibold text-[var(--color-text)]">{r.firstName} {r.lastName}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleApprove(r._id)}>Approve</Button>
              <Button size="sm" variant="ghost" onClick={() => handleReject(r._id)}>Reject</Button>
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
};