import { useState } from 'react';
import { IoHeart, IoHeartOutline } from 'react-icons/io5';

const REACTIONS = [
  { type: 'LIKE', emoji: '👍', label: 'Like' },
  { type: 'LOVE', emoji: '❤️', label: 'Love' },
  { type: 'CARE', emoji: '🤗', label: 'Care' },
  { type: 'HAHA', emoji: '😂', label: 'Haha' },
  { type: 'WOW', emoji: '😮', label: 'Wow' },
  { type: 'SAD', emoji: '😢', label: 'Sad' },
  { type: 'ANGRY', emoji: '😡', label: 'Angry' },
];

const ReactionPicker = ({ onSelect, onRemove, currentReaction, size = 'md' }) => {
  const [showPicker, setShowPicker] = useState(false);

  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 30,
  };

  const getEmoji = (type) => {
    return REACTIONS.find((r) => r.type === type)?.emoji || '👍';
  };

  const handleSelect = (type) => {
    if (currentReaction === type) {
      onRemove?.();
    } else {
      onSelect?.(type);
    }
    setShowPicker(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`${sizes[size]} transition-transform hover:scale-110`}
      >
        {currentReaction ? (
          <span>{getEmoji(currentReaction)}</span>
        ) : (
          <IoHeartOutline size={iconSizes[size]} className="text-rvnp-green" />
        )}
      </button>

      {showPicker && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
          <div className="absolute bottom-full left-0 mb-2 z-20 flex gap-1 p-2 rounded-full bg-bg-primary border-2 border-rvnp-green shadow-lg">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                type="button"
                onClick={() => handleSelect(reaction.type)}
                className={`text-2xl transition-transform hover:scale-125 ${
                  currentReaction === reaction.type ? 'scale-125 ring-2 ring-rvnp-green rounded-full' : ''
                }`}
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReactionPicker;