import { useState } from 'react';

export const CreateFAB = ({ actions }) => {
  const [open, setOpen] = useState(false);

  if (!actions || actions.length === 0) return null;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
        {open ? (
          <>
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => { action.onClick(); setOpen(false); }}
                className="flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-text)] px-4 py-3 rounded-xl shadow-lg font-semibold text-sm active:scale-95 transition-transform"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
            <button
              onClick={() => setOpen(false)}
              className="w-12 h-12 bg-[var(--color-bg)] text-[var(--color-text)] rounded-full shadow-lg flex items-center justify-center text-lg active:scale-90 transition-transform"
            >
              ✕
            </button>
          </>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="w-14 h-14 bg-[var(--color-primary)] text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-90 transition-transform"
          >
            +
          </button>
        )}
      </div>
    </>
  );
};