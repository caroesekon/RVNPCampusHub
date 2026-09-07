import { useState, useEffect, useRef } from 'react';
import {
  IoImage,
  IoVideocam,
  IoClose,
  IoHappy,
  IoLocation,
  IoPersonAdd,
  IoSparkles,
} from 'react-icons/io5';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import Dropdown from '../ui/Dropdown.jsx';
import Modal from '../ui/Modal.jsx';
import VerifiedBadge from '../ui/VerifiedBadge.jsx';
import AIContentGenerator from '../ai/AIContentGenerator.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import postApi from '../../api/postApi.js';
import uploadApi from '../../api/uploadApi.js';
import userApi from '../../api/userApi.js';
import aiApi from '../../api/aiApi.js';

const FEELINGS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😍', label: 'Loved' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '🥳', label: 'Celebrating' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '🤗', label: 'Grateful' },
  { emoji: '😤', label: 'Frustrated' },
];

const PostComposer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { campuses } = useApp();

  const [text, setText] = useState('');
  const [privacy, setPrivacy] = useState('PUBLIC');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [feeling, setFeeling] = useState(null);
  const [location, setLocation] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);

  const videoInputRef = useRef(null);

  useEffect(() => {
    fetchAIStatus();
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await aiApi.getStatus();
      if (response.data.success) {
        setAiEnabled(response.data.data.enabled && response.data.data.contentEnabled);
      }
    } catch (error) {
      console.error('Failed to fetch AI status:', error.message);
    }
  };

  const privacyOptions = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'CAMPUS_ONLY', label: 'Campus Only' },
    { value: 'DEPARTMENT_ONLY', label: 'Department Only' },
    { value: 'FRIENDS_ONLY', label: 'Friends Only' },
  ];

  const locationOptions = campuses.map((campus) => ({
    value: campus.name,
    label: campus.name,
  }));

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const imageUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, imageUrl]);
      setImageFiles((prev) => [...prev, file]);
    });
    e.target.value = '';
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await userApi.searchUsers(query);
      if (response.data.success) {
        setSearchResults(response.data.data.users || []);
      }
    } catch (error) {
      console.error('User search failed:', error.message);
    }
  };

  const handleTagUser = (user) => {
    if (!taggedUsers.find((u) => u.id === user.id)) {
      setTaggedUsers((prev) => [...prev, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeTag = (userId) => {
    setTaggedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleAIInsert = (content) => {
    setText((prev) => (prev ? prev + '\n\n' + content : content));
  };

  const handleSubmit = async () => {
    if (!text.trim() && imageFiles.length === 0 && !video) return;
    setLoading(true);
    setError('');

    try {
      let uploadedImages = [];
      let uploadedVideo = null;

      if (imageFiles.length > 0) {
        const uploadResponse = await uploadApi.uploadMultiple(imageFiles);
        if (uploadResponse.data.success) {
          uploadedImages = uploadResponse.data.data.map((img) => img.url);
        }
      }

      if (video) {
        const uploadResponse = await uploadApi.uploadSingle(video);
        if (uploadResponse.data.success) {
          uploadedVideo = uploadResponse.data.data.url;
        }
      }

      const payload = {
        content: {
          text: text.trim(),
          images: uploadedImages,
          video: uploadedVideo,
          feeling: feeling ? { emoji: feeling.emoji, label: feeling.label } : null,
          location: location,
          taggedUsers: taggedUsers.map((u) => ({ id: u.id, fullName: u.fullName })),
        },
        privacy,
      };

      const response = await postApi.createPost(payload);
      if (response.data.success) {
        setText('');
        setImages([]);
        setImageFiles([]);
        setVideo(null);
        setVideoPreview(null);
        setFeeling(null);
        setLocation('');
        setLocationSearch('');
        setTaggedUsers([]);
        onPostCreated?.(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Post creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg-primary border border-border-color rounded-xl w-full overflow-hidden">
      {/* Line 1: Avatar + Textarea */}
      <div className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3 w-full">
          <div className="shrink-0">
            <Avatar src={user?.avatarUrl} name={user?.fullName} size="sm" />
          </div>

          <div className="flex-1 min-w-0 w-full">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={feeling ? `What's on your mind, feeling ${feeling.label}?` : "What's on your mind?"}
              rows={3}
              maxLength={1000}
              className="w-full max-w-full bg-bg-secondary text-text-primary rounded-lg p-2 sm:p-3 resize-none focus:outline-none placeholder:text-text-muted text-sm sm:text-base box-border"
            />

            {error && <p className="text-sm text-rvnp-red mt-2">{error}</p>}

            {(feeling || location || taggedUsers.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {feeling && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-secondary border border-border-color text-xs sm:text-sm text-text-primary">
                    <span>{feeling.emoji}</span>
                    <span>Feeling {feeling.label}</span>
                    <button onClick={() => setFeeling(null)} className="text-text-muted"><IoClose size={12} /></button>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-secondary border border-border-color text-xs sm:text-sm text-text-primary">
                    <IoLocation size={12} className="text-rvnp-green" />
                    <span>At {location}</span>
                    <button onClick={() => setLocation('')} className="text-text-muted"><IoClose size={12} /></button>
                  </span>
                )}
                {taggedUsers.map((tagged) => (
                  <span key={tagged.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rvnp-green bg-opacity-10 border border-rvnp-green text-xs sm:text-sm text-rvnp-green">
                    <span>With {tagged.fullName}</span>
                    <button onClick={() => removeTag(tagged.id)}><IoClose size={12} /></button>
                  </span>
                ))}
              </div>
            )}

            {videoPreview && (
              <div className="relative mt-2">
                <video src={videoPreview} className="w-full rounded-lg max-h-48 sm:max-h-64 object-cover" controls />
                <button onClick={removeVideo} className="absolute top-2 right-2 p-1.5 rounded-full bg-black bg-opacity-60 text-white">
                  <IoClose size={16} />
                </button>
              </div>
            )}

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt="Upload" className="h-14 w-14 sm:h-20 sm:w-20 object-cover rounded-lg" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-bg-tertiary text-text-secondary shadow">
                      <IoClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line 2: Icons (Mobile) / Icons + Privacy + Post (Desktop) */}
      <div className="border-t border-border-color px-2 sm:px-3 py-2">
        {/* Mobile: Icons only */}
        <div className="flex sm:hidden items-center justify-between w-full">
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            <label className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted cursor-pointer shrink-0" title="Image">
              <IoImage size={18} />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            </label>
            <label className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted cursor-pointer shrink-0" title="Video">
              <IoVideocam size={18} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
            </label>
            <button onClick={() => setShowFeelingPicker(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted shrink-0" title="Feeling">
              <IoHappy size={18} />
            </button>
            <button onClick={() => setShowLocationPicker(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted shrink-0" title="Location">
              <IoLocation size={18} />
            </button>
            <button onClick={() => setShowTagPicker(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted shrink-0" title="Tag">
              <IoPersonAdd size={18} />
            </button>
            {aiEnabled && (
              <button onClick={() => setShowAIGenerator(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-rvnp-green shrink-0" title="AI">
                <IoSparkles size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Desktop: Icons + Privacy + Post */}
        <div className="hidden sm:flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <label className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted cursor-pointer shrink-0" title="Add Image">
              <IoImage size={18} />
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            </label>
            <label className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted cursor-pointer shrink-0" title="Add Video">
              <IoVideocam size={18} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
            </label>
            <button onClick={() => setShowFeelingPicker(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted shrink-0" title="Feeling">
              <IoHappy size={18} />
            </button>
            <button onClick={() => setShowLocationPicker(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted shrink-0" title="Location">
              <IoLocation size={18} />
            </button>
            <button onClick={() => setShowTagPicker(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted shrink-0" title="Tag">
              <IoPersonAdd size={18} />
            </button>
            {aiEnabled && (
              <button onClick={() => setShowAIGenerator(true)} className="p-2 rounded-lg hover:bg-bg-secondary text-rvnp-green shrink-0" title="AI">
                <IoSparkles size={18} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="w-28">
              <Dropdown options={privacyOptions} value={privacy} onChange={setPrivacy} placeholder="Privacy" />
            </div>
            <Button size="sm" onClick={handleSubmit} loading={loading}>Post</Button>
          </div>
        </div>
      </div>

      {/* Line 3 (Mobile only): Privacy + Post */}
      <div className="sm:hidden border-t border-border-color px-3 py-2 flex items-center justify-between gap-2">
        <div className="w-28 flex-1">
          <Dropdown options={privacyOptions} value={privacy} onChange={setPrivacy} placeholder="Public" />
        </div>
        <Button size="sm" onClick={handleSubmit} loading={loading}>Post</Button>
      </div>

      {/* Modals */}
      <Modal isOpen={showFeelingPicker} onClose={() => setShowFeelingPicker(false)} title="How are you feeling?" size="sm">
        <div className="grid grid-cols-3 gap-2">
          {FEELINGS.map((feel) => (
            <button key={feel.label} onClick={() => { setFeeling(feel); setShowFeelingPicker(false); }} className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-bg-secondary transition-all">
              <span className="text-3xl">{feel.emoji}</span>
              <span className="text-xs text-text-secondary">{feel.label}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showLocationPicker} onClose={() => setShowLocationPicker(false)} title="Add Location" size="sm">
        <div className="space-y-3">
          <input type="text" value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Search or type custom location..." className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none" />
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {locationSearch.trim() && (
              <button onClick={() => { setLocation(locationSearch.trim()); setShowLocationPicker(false); setLocationSearch(''); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-secondary transition-all text-left">
                <IoLocation size={18} className="text-rvnp-green" />
                <span className="text-text-primary text-sm">Use "{locationSearch.trim()}"</span>
              </button>
            )}
            {locationOptions.filter((loc) => loc.label.toLowerCase().includes(locationSearch.toLowerCase())).map((loc) => (
              <button key={loc.value} onClick={() => { setLocation(loc.value); setShowLocationPicker(false); setLocationSearch(''); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-secondary transition-all text-left">
                <IoLocation size={18} className="text-rvnp-green" />
                <span className="text-text-primary text-sm">{loc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTagPicker} onClose={() => setShowTagPicker(false)} title="Tag People" size="sm">
        <div className="space-y-3">
          <input type="text" value={searchQuery} onChange={(e) => handleSearchUsers(e.target.value)} placeholder="Search for people..." className="w-full px-3 py-2 rounded-lg bg-bg-secondary text-text-primary border border-border-color focus:outline-none" />
          {taggedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {taggedUsers.map((tagged) => (
                <div key={tagged.id} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rvnp-green text-rvnp-white text-sm">
                  <span>{tagged.fullName}</span>
                  <button onClick={() => removeTag(tagged.id)}><IoClose size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {searchResults.map((result) => (
              <button key={result.id} onClick={() => handleTagUser(result)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-bg-secondary transition-all text-left">
                <Avatar src={result.avatarUrl} name={result.fullName} size="sm" />
                <span className="text-text-primary text-sm flex-1">{result.fullName}</span>
                {result.hdmVerified && <VerifiedBadge size={12} />}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {aiEnabled && (
        <AIContentGenerator isOpen={showAIGenerator} onClose={() => setShowAIGenerator(false)} onInsert={handleAIInsert} />
      )}
    </div>
  );
};

export default PostComposer;