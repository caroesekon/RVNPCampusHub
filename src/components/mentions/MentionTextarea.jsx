import { useState, useRef, useEffect } from 'react';
import Avatar from '../ui/Avatar.jsx';
import VerifiedBadge from '../ui/VerifiedBadge.jsx';
import userApi from '../../api/userApi.js';

const MentionTextarea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart;
    setCursorPosition(cursor);
    onChange(text);

    const textBeforeCursor = text.substring(0, cursor);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setShowDropdown(true);
      searchUsers(atMatch[1]);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const searchUsers = async (query) => {
    try {
      const response = await userApi.searchUsers(query || '');
      if (response.data.success) {
        setSearchResults(response.data.data.users || []);
      }
    } catch {
      setSearchResults([]);
    }
  };

  const handleSelectUser = (user) => {
    const text = value;
    const before = text.substring(0, cursorPosition);
    const after = text.substring(cursorPosition);
    const mentionStart = before.lastIndexOf('@');

    if (mentionStart === -1) return;

    const newBefore = before.substring(0, mentionStart) + `@${user.fullName} `;
    const newText = newBefore + after;

    onChange(newText);
    setShowDropdown(false);
    setSearchResults([]);

    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = newBefore.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-64 max-h-48 overflow-y-auto mt-1 bg-bg-primary border border-border-color rounded-lg shadow-lg"
        >
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectUser(user)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-secondary transition-all text-left"
              >
                <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-text-primary truncate">
                      {user.fullName}
                    </span>
                    {user.hdmVerified && <VerifiedBadge size={10} />}
                  </div>
                  {user.course && (
                    <span className="text-xs text-text-muted">{user.course}</span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-3">
              <p className="text-sm text-text-muted text-center">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentionTextarea;