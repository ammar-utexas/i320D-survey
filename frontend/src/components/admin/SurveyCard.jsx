import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDate, getSurveyStatus, getStatusBadgeClass } from '../../utils/formatters';
import { copyToClipboard } from '../../utils/clipboard';
import { surveysApi } from '../../api/surveys';
import ConfirmModal from './ConfirmModal';
import DuplicateModal from './DuplicateModal';
import EditSurveyModal from './EditSurveyModal';

export default function SurveyCard({ survey, onUpdate, onDelete, onDuplicate }) {
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCopyUrl = async () => {
    const surveyUrl = `${window.location.origin}/s/${survey.slug}`;
    const success = await copyToClipboard(surveyUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    await surveysApi.delete(survey.id);
    if (onDelete) {
      onDelete(survey.id);
    }
  };

  const status = getSurveyStatus(survey.opens_at, survey.closes_at);
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeClass = getStatusBadgeClass(status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-3">
          {survey.title}
        </h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
          {statusLabel}
        </span>
      </div>

      {survey.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {survey.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{survey.response_count ?? 0} responses</span>
        </div>

        {survey.closes_at && (
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {status === 'closed' ? 'Closed' : 'Closes'} {formatDate(survey.closes_at)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <Link
          to={`/surveys/${survey.id}`}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
        >
          View Responses
        </Link>
        <button
          onClick={handleCopyUrl}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Copy survey URL"
        >
          {copied ? (
            <>
              <svg className="h-4 w-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy URL
            </>
          )}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Edit button */}
        <button
          onClick={() => setShowEditModal(true)}
          className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Edit survey"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        {/* Duplicate button */}
        <button
          onClick={() => setShowDuplicateModal(true)}
          className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Duplicate survey"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Delete button */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          aria-label="Delete survey"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Modals */}
      <EditSurveyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        survey={survey}
        onSuccess={onUpdate}
      />

      <DuplicateModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        survey={survey}
        onSuccess={onDuplicate}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Survey"
        message={`Are you sure you want to delete "${survey.title}"? This action cannot be undone and all responses will be permanently lost.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

SurveyCard.propTypes = {
  survey: PropTypes.shape({
    id: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    opens_at: PropTypes.string,
    closes_at: PropTypes.string,
    response_count: PropTypes.number,
  }).isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
};
