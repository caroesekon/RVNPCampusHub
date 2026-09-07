import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoImage, IoClose } from 'react-icons/io5';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import storyApi from '../api/storyApi.js';
import uploadApi from '../api/uploadApi.js';

const CreateStory = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!image && !text.trim()) return;

    setLoading(true);
    setError('');

    try {
      let content = { text: text.trim() };

      if (image) {
        const response = await uploadApi.uploadSingle(image);

        if (response.data.success) {
          content = {
            type: 'image',
            imageUrl: response.data.data.url,
            text: text.trim(),
          };
        }
      }

      const storyResponse = await storyApi.createStory({
        content,
        privacy: 'PUBLIC',
      });

      if (storyResponse.data.success) {
        navigate('/feed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Story creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-heading font-bold text-text-primary mb-4">
          Create Story
        </h1>

        <div className="bg-bg-primary border border-border-color rounded-xl p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 text-red-500 text-sm">
              {error}
            </div>
          )}

          {preview ? (
            <div className="relative">
              <img src={preview} alt="Story" className="w-full rounded-lg max-h-96 object-cover" />
              <button
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white"
              >
                <IoClose size={20} />
              </button>
            </div>
          ) : (
            <label className="block w-full aspect-video rounded-lg border-2 border-dashed border-border-color flex flex-col items-center justify-center cursor-pointer hover:bg-bg-secondary">
              <IoImage size={40} className="text-text-muted" />
              <span className="text-text-muted mt-2">Click to add image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </label>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add text to your story..."
            rows={2}
            className="w-full bg-bg-secondary text-text-primary rounded-lg p-3 resize-none focus:outline-none placeholder:text-text-muted"
          />

          <Button fullWidth onClick={handleSubmit} loading={loading}>
            Share Story
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateStory;