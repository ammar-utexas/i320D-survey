import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { surveysApi } from '../../api/surveys';

export default function EditSurveyModal({
  isOpen,
  onClose,
  survey,
  onSuccess,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when survey changes or modal opens
  useEffect(() => {
    if (isOpen && survey) {
      setTitle(survey.title || '');
      setDescription(survey.description || '');
      setError(null);
    }
  }, [isOpen, survey]);

  const handleClose = () => {
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
      const updatedSurvey = await surveysApi.update(survey.id, {
        title: title.trim(),
        description: description.trim() || null,
      });
      handleClose();
      if (onSuccess) {
        onSuccess(updatedSurvey);
      }
    } catch (err) {
      setError(err.message || 'Failed to update survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Survey" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Survey title"
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description"
              disabled={loading}
            />
          </div>
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

EditSurveyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  survey: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
};
