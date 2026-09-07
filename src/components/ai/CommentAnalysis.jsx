import { useState, useEffect } from 'react';
import { IoAnalytics } from 'react-icons/io5';
import Modal from '../ui/Modal.jsx';
import Spinner from '../ui/Spinner.jsx';
import aiApi from '../../api/aiApi.js';

const CommentAnalysis = ({ postId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const response = await aiApi.getStatus();

      if (response.data.success) {
        setAiEnabled(
          response.data.data.enabled &&
          response.data.data.commentAnalysisEnabled
        );
      }
    } catch (error) {
      console.error('Failed to check AI status:', error.message);
      setAiEnabled(false);
    }
  };

  const handleOpen = async () => {
    if (!aiEnabled) return;

    setIsOpen(true);
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await aiApi.analyzeComments(postId);

      if (response.data.success) {
        setAnalysis(response.data.data.analysis);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Hide button if AI disabled
  if (!aiEnabled) return null;

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1 text-xs text-text-muted hover:text-rvnp-green"
        title="AI Comment Analysis"
      >
        <IoAnalytics size={14} />
        AI Analysis
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="📊 Comment Analysis" size="md">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : error ? (
          <p className="text-center text-rvnp-red py-8">{error}</p>
        ) : analysis ? (
          <div className="space-y-3">
            {typeof analysis === 'string' ? (
              <p className="text-text-primary text-sm whitespace-pre-wrap">{analysis}</p>
            ) : (
              <>
                {analysis.summary && (
                  <div className="bg-bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-text-primary mb-1">Summary</h4>
                    <p className="text-text-secondary text-sm">{analysis.summary}</p>
                  </div>
                )}

                {analysis.sentiment && (
                  <div className="bg-bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-text-primary mb-1">Sentiment</h4>
                    <div className="flex gap-3 text-sm">
                      <span className="text-rvnp-green">👍 {analysis.sentiment.positive || 0}%</span>
                      <span className="text-text-muted">😐 {analysis.sentiment.neutral || 0}%</span>
                      <span className="text-rvnp-red">👎 {analysis.sentiment.negative || 0}%</span>
                    </div>
                  </div>
                )}

                {analysis.keyTopics && analysis.keyTopics.length > 0 && (
                  <div className="bg-bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-text-primary mb-1">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyTopics.map((topic, index) => (
                        <span key={index} className="px-2 py-1 rounded-full bg-rvnp-green bg-opacity-10 text-rvnp-green text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.notableComments && analysis.notableComments.length > 0 && (
                  <div className="bg-bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-text-primary mb-1">Notable Comments</h4>
                    <div className="space-y-2">
                      {analysis.notableComments.map((comment, index) => (
                        <p key={index} className="text-text-secondary text-sm italic">
                          "{comment}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default CommentAnalysis;