import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { searchAll } from '@/api/search';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Spinner } from '@/components/ui/Spinner';
import { formatCompactNumber } from '@/utils/formatCurrency';
import toast from 'react-hot-toast';

export const ExplorePage = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults(null); setShowResults(false); return; }
    setLoading(true); setShowResults(true);
    debounceRef.current = setTimeout(async () => {
      try { const res = await searchAll(query.trim()); setResults(res.data || res); } catch { setResults(null); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (type, id) => {
    setShowResults(false); setQuery(''); setResults(null);
    if (type === 'user') navigate(`/profile/${id}`);
    else if (type === 'post') navigate(`/post/${id}`);
    else if (type === 'group') navigate(`/groups/${id}`);
    else if (type === 'listing') navigate(`/market/${id}`);
  };

  const handleInvite = async () => {
    const shareData = {
      title: 'RVNP Campus Hub',
      text: 'Join me on RVNP Campus Hub — The Digital Quad of Rift Valley National Polytechnic from HDM!',
      url: window.location.origin,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); toast.success('Thanks for sharing!'); } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast.success('Link copied! Share with friends.');
    }
  };

  return (
    <div className="pb-20">
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">🔍</span>
        <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => query.trim() && setShowResults(true)} placeholder="Search people, posts, groups..." className="input pl-10" />
        {query && <button onClick={() => { setQuery(''); setResults(null); setShowResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">✕</button>}
      </div>

      {showResults && (
        <div className="absolute left-4 right-4 top-14 z-40 bg-[var(--color-surface)] rounded-xl shadow-xl border border-[var(--color-border)] max-h-[70vh] overflow-y-auto">
          {loading ? <div className="flex justify-center py-6"><Spinner size="md" /></div> : results ? (
            <div>
              {results.users?.length > 0 && (
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">People</h3>
                  {results.users.map(u => (
                    <div key={u._id} onClick={() => handleSelect('user', u._id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                      <Avatar src={u.avatar} name={u.firstName} size="sm" verified={u.hdmVerified} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate flex items-center gap-1">{u.firstName} {u.lastName}{u.hdmVerified && <VerifiedBadge size={10} />}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">{u.department || 'RVNP'}{u.hostel ? ` • ${u.hostel}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {results.posts?.length > 0 && (
                <div className="p-3 border-t border-[var(--color-border)]">
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Posts</h3>
                  {results.posts.map(p => (
                    <div key={p._id} onClick={() => handleSelect('post', p._id)} className="p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                      <p className="text-sm text-[var(--color-text)] line-clamp-2">{p.content}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">by {p.author?.firstName} {p.author?.lastName}</p>
                    </div>
                  ))}
                </div>
              )}
              {results.groups?.length > 0 && (
                <div className="p-3 border-t border-[var(--color-border)]">
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Groups</h3>
                  {results.groups.map(g => (
                    <div key={g._id} onClick={() => handleSelect('group', g._id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-sm font-bold">{g.name?.charAt(0)}</div>
                      <div><p className="text-sm font-semibold text-[var(--color-text)]">{g.name}</p><p className="text-xs text-[var(--color-text-secondary)]">{formatCompactNumber(g.memberCount)} members</p></div>
                    </div>
                  ))}
                </div>
              )}
              {results.listings?.length > 0 && (
                <div className="p-3 border-t border-[var(--color-border)]">
                  <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase mb-2">Marketplace</h3>
                  {results.listings.map(l => (
                    <div key={l._id} onClick={() => handleSelect('listing', l._id)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer">
                      <span className="text-xl">📦</span>
                      <div><p className="text-sm font-semibold text-[var(--color-text)] truncate">{l.title}</p><p className="text-xs font-bold text-[var(--color-accent)]">KSh {l.price}</p></div>
                    </div>
                  ))}
                </div>
              )}
              {!results.users?.length && !results.posts?.length && !results.groups?.length && !results.listings?.length && (
                <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">No results for "{query}"</div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {!showResults && (
        <div className="space-y-4">
          <div className="bg-[var(--color-surface)] rounded-xl p-4">
            <h3 className="font-bold text-[var(--color-text)] text-sm mb-3">🔥 Trending</h3>
            <div className="space-y-2">
              {['Rugby Match Today', 'Exam Timetable Out', 'Hostel B Party', 'Workshop C Open', 'Agri Show Friday'].map((topic, i) => (
                <div key={i} onClick={() => { setQuery(topic); inputRef.current?.focus(); }} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer transition-colors"><span className="text-xs font-bold text-[var(--color-primary)]">#{i + 1}</span><span>{topic}</span></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🏆', label: 'Leaderboard', path: '/leaderboard' },
              { icon: '👥', label: 'Groups', path: '/groups' },
              { icon: '🛒', label: 'Market', path: '/market' },
              { icon: '🎫', label: 'Support', path: '/support' },
              { icon: '📤', label: 'Invite Friends', action: true },
            ].map(link => (
              <button key={link.label} onClick={() => link.action ? handleInvite() : navigate(link.path)}
                className="bg-[var(--color-surface)] rounded-xl p-3 text-center hover:bg-[var(--color-surface-hover)] transition-colors">
                <span className="text-2xl block mb-1">{link.icon}</span>
                <span className="text-xs font-semibold text-[var(--color-text)]">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};