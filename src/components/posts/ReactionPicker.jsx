import { useState, useRef, useEffect } from 'react';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'angry', emoji: '😡', label: 'Angry' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'cry', emoji: '😭', label: 'Cry' },
];

export const ReactionPicker = ({ onSelect, onClose, position = 'top' }) => {
  const [hovered, setHovered] = useState(null);
  const pickerRef = useRef(null);
  const longPressRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className={`absolute ${position === 'top' ? '-top-16' : 'top-10'} left-0 z-50 bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-border)] px-2 py-2 flex gap-1 animate-in`}
    >
      {REACTIONS.map((r) => (
        <button
          key={r.type}
          onClick={() => onSelect(r.type)}
          onMouseEnter={() => setHovered(r.type)}
          onMouseLeave={() => setHovered(null)}
          className={`w-10 h-10 flex items-center justify-center text-2xl rounded-full transition-all duration-200 hover:scale-125 ${
            hovered === r.type ? 'scale-125 bg-[var(--color-bg)]' : ''
          }`}
          title={r.label}
        >
          {r.emoji}
        </button>
      ))}
    </div>
  );
};