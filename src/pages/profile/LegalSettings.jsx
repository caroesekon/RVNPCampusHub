import { useNavigate } from 'react-router-dom';

export const LegalSettings = () => {
  const navigate = useNavigate();

  const links = [
    { label: 'Terms of Service', path: '/legal/terms' },
    { label: 'Privacy Policy', path: '/legal/privacy' },
    { label: 'Community Guidelines', path: '/legal/guidelines' },
    { label: 'Marketplace Policy', path: '/legal/marketplace' },
  ];

  return (
    <div className="card border-l-transparent">
      <h3 className="font-bold text-[var(--color-text)] mb-3">📄 Legal</h3>
      <div className="space-y-2">
        {links.map(link => (
          <button key={link.path} onClick={() => navigate(link.path)} className="block w-full text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] py-1">
            {link.label} →
          </button>
        ))}
      </div>
    </div>
  );
};