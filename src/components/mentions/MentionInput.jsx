import { useState, useRef } from 'react';
import Avatar from '../ui/Avatar.jsx';
import VerifiedBadge from '../ui/VerifiedBadge.jsx';
import userApi from '../../api/userApi.js';

const MentionInput = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    setCursorPosition(cursor);
    onChange(text);

    const textBeforeCursor = text.substring(0, cursor);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowDropdown(true);
      searchUsers(atMatch[1]);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await userApi.searchUsers(query);
      if (response.data.success) {
        setSearchResults(response.data.data.users || []);
      }
    } catch {
      // Silent
    }
  };

  const handleSelectUser = (user) => {
    const text = value;
    const before = text.substring(0, cursorPosition);
    const after = text.substring(cursorPosition);

    const mentionStart = before.lastIndexOf('@');
    const newBefore = before.substring(0, mentionStart) + `@${user.fullName} `;

    onChange(newBefore + after);
    setShowDropdown(false);
    setSearchResults([]);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-bg-primary border border-border-color rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {searchResults.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectUser(user)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary transition-all text-left"
            >
              <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-text-primary truncate">{user.fullName}</span>
                  {user.hdmVerified && <VerifiedBadge size={10} />}
                </div>
                {user.course && <span className="text-xs text-text-muted">{user.course}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;