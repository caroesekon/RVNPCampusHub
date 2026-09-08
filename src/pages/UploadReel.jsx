import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoVideocam,
  IoClose,
  IoSparkles,
  IoLocation,
  IoImage,
} from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import Dropdown from '../components/ui/Dropdown.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import reelApi from '../api/reelApi.js';
import uploadApi from '../api/uploadApi.js';
import aiApi from '../api/aiApi.js';
import { useApp } from '../context/AppContext.jsx';

const UploadReel = () => {
  const navigate = useNavigate();
  const { campuses } = useApp();

  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('PUBLIC');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [uploading, setUploading] = useState(false);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const privacyOptions = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'CAMPUS_ONLY', label: 'Campus Only' },
    { value: 'FRIENDS_ONLY', label: 'Friends Only' },
    { value: 'ONLY_ME', label: 'Only Me' },
  ];

  const locationOptions = campuses.map((campus) => ({
    value: campus.name,
    label: campus.name,
  }));

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateCaption = async () => {
    setAiLoading(true);

    try {
      const response = await aiApi.generateContent(
        'Write a caption for my campus video',
        'reel_caption'
      );

      if (response.data.success) {
        setCaption(response.data.data.content);
      }
    } catch {
      // Silent
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!video) {
      setError('Please select a video');
      return;
    }

    setLoading(true);
    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Upload video
      setUploadStage('Uploading video...');
      let videoUrl = '';
      let thumbnailUrl = '';

      const videoResponse = await uploadApi.uploadSingle(video, (percent) => {
        setUploadProgress(percent);
      });

      if (videoResponse.data.success) {
        videoUrl = videoResponse.data.data.url;
        setUploadProgress(100);
      }

      // Upload thumbnail if selected
      if (thumbnail) {
        setUploadStage('Uploading thumbnail...');
        setUploadProgress(0);

        const thumbResponse = await uploadApi.uploadSingle(thumbnail, (percent) => {
          setUploadProgress(percent);
        });

        if (thumbResponse.data.success) {
          thumbnailUrl = thumbResponse.data.data.url;
          setUploadProgress(100);
        }
      }

      // Create reel
      setUploadStage('Creating reel...');
      const response = await reelApi.createReel({
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        caption,
        content: { location },
        privacy,
      });

      if (response.data.success) {
        setUploadProgress(100);
        setTimeout(() => {
          navigate('/reels');
        }, 500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadStage('');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Upload Reel
        </h1>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-bg-primary border border-rvnp-green rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-primary">
                {uploadStage || 'Uploading...'}
              </span>
              <span className="text-sm font-semibold text-rvnp-green">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-rvnp-green transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-bg-primary border border-border-color rounded-xl p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
              {error}
            </div>
          )}

          {/* Video Picker */}
          {videoPreview ? (
            <div className="relative">
              <video
                src={videoPreview}
                className="w-full aspect-[9/16] rounded-lg object-cover"
                controls
              />
              <button
                onClick={() => { setVideo(null); setVideoPreview(null); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black bg-opacity-60 text-white"
              >
                <IoClose size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => videoInputRef.current?.click()}
              className="w-full aspect-[9/16] rounded-lg border-2 border-dashed border-border-color flex flex-col items-center justify-center cursor-pointer hover:bg-bg-secondary"
              disabled={uploading}
            >
              <IoVideocam size={40} className="text-text-muted" />
              <span className="text-text-muted mt-2">Click to add video</span>
              <span className="text-xs text-text-muted mt-1">Max 200MB</span>
            </button>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoSelect}
            disabled={uploading}
          />

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Thumbnail (optional)
            </label>
            {thumbnailPreview ? (
              <div className="relative inline-block">
                <img src={thumbnailPreview} alt="Thumbnail" className="h-24 w-40 object-cover rounded-lg" />
                <button
                  onClick={() => { setThumbnail(null); setThumbnailPreview(null); }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-bg-tertiary text-text-secondary"
                >
                  <IoClose size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => thumbnailInputRef.current?.click()}
                className="flex items-center gap-2 p-3 rounded-lg bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                disabled={uploading}
              >
                <IoImage size={18} />
                <span className="text-sm">Add Thumbnail</span>
              </button>
            )}
          </div>

          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleThumbnailSelect}
            disabled={uploading}
          />

          {/* Caption with AI */}
          <div className="relative">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              disabled={uploading}
              className="w-full bg-bg-secondary text-text-primary rounded-lg p-3 resize-none focus:outline-none placeholder:text-text-muted"
            />
            <button
              onClick={handleGenerateCaption}
              disabled={aiLoading || uploading}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-rvnp-green text-rvnp-white"
              title="AI Caption"
            >
              {aiLoading ? <Spinner size="sm" /> : <IoSparkles size={16} />}
            </button>
          </div>

          {/* Location */}
          <Dropdown
            label="Location"
            options={locationOptions}
            value={location}
            onChange={setLocation}
            placeholder="Add location"
            disabled={uploading}
          />

          {/* Privacy */}
          <Dropdown
            label="Privacy"
            options={privacyOptions}
            value={privacy}
            onChange={setPrivacy}
            disabled={uploading}
          />

          {/* Upload Button */}
          <Button
            fullWidth
            onClick={handleUpload}
            loading={loading}
            disabled={!video || uploading}
          >
            {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Reel'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default UploadReel;