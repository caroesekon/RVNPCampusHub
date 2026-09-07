import { useState, useEffect } from 'react';
import { IoSparkles } from 'react-icons/io5';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import Spinner from '../ui/Spinner.jsx';
import aiApi from '../../api/aiApi.js';

const AIContentGenerator = ({ isOpen, onClose, onInsert }) => {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkAIStatus();
    }
  }, [isOpen]);

  const checkAIStatus = async () => {
    try {
      const response = await aiApi.getStatus();
      if (response.data.success) {
        setAiEnabled(
          response.data.data.enabled &&
          response.data.data.contentEnabled
        );
        if (!response.data.data.enabled || !response.data.data.contentEnabled) {
          setError('AI content generation is disabled by admin');
        }
      }
    } catch {
      setAiEnabled(false);
      setError('Failed to check AI status');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !aiEnabled) return;

    setLoading(true);
    setTyping(true);
    setError('');
    setContent('');

    try {
      const response = await aiApi.generateContent(prompt.trim());

      if (response.data.success) {
        setContent(response.data.data.content);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'AI generation failed');
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const handleInsert = () => {
    onInsert(content);
    onClose();
    setPrompt('');
    setContent('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✨ HDM AI Content Generator" size="md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rvnp-red bg-opacity-10 border border-rvnp-red text-rvnp-red text-sm">
            {error}
          </div>
        )}

        {aiEnabled ? (
          <>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                What do you want to write about?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Write a post about our campus sports event..."
                rows={3}
                className="w-full bg-bg-secondary text-text-primary rounded-lg p-3 resize-none focus:outline-none placeholder:text-text-muted"
              />
            </div>

            <Button fullWidth onClick={handleGenerate} loading={loading}>
              <IoSparkles className="inline mr-1" size={16} />
              Generate
            </Button>

            {typing && (
              <div className="bg-bg-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-text-muted">HDM AI is thinking</span>
                  {/* 3 Bouncing Dots */}
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-rvnp-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-rvnp-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-rvnp-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}

            {content && (
              <div className="bg-bg-secondary rounded-lg p-4">
                <p className="text-text-primary text-sm whitespace-pre-wrap">{content}</p>
                <Button fullWidth className="mt-3" onClick={handleInsert}>
                  Insert into Post
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-text-muted py-8">
            AI content generation is not available.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default AIContentGenerator;