import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { surveysApi } from '../../api/surveys';

export default function DuplicateModal({
  isOpen,
  onClose,
  survey,
  onSuccess,
}) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  const handleOpen = () => {
    setTitle(`${survey?.title || 'Survey'} (Copy)`);
    setError(null);
  };

  // Initialize title when survey changes or modal opens
  if (isOpen && !title && survey) {
    handleOpen();
  }

  const handleClose = () => {
    setTitle('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newSurvey = await surveysApi.duplicate(survey.id, title.trim());
      handleClose();
      if (onSuccess) {
        onSuccess(newSurvey);
      }
      // Navigate to the new survey
      navigate(`/surveys/${newSurvey.id}`);
    } catch (err) {
      setError(err.message || 'Failed to duplicate survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Duplicate Survey" size="md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Create a copy of "{survey?.title}" with a new title.
          </p>

          <label
            htmlFor="duplicate-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Survey Title
          </label>
          <input
            id="duplicate-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter title for the copy"
            disabled={loading}
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !title.trim()}
          >
            Duplicate
          </Button>
        </div>
      </form>
    </Modal>
  );
}

DuplicateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  survey: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }),
  onSuccess: PropTypes.func,
};
