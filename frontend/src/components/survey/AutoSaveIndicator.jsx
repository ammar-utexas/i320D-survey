import PropTypes from 'prop-types';
import { formatRelativeTime } from '../../utils/formatters';

export default function AutoSaveIndicator({ status, lastSaved }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        {lastSaved && (
          <span className="text-gray-500">
            Last saved: {formatRelativeTime(lastSaved)}
          </span>
        )}
      </div>
      <div>
        {status === 'saving' && (
          <span className="text-gray-500 flex items-center gap-1">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </span>
        )}
        {status === 'saved' && (
          <span className="text-green-600 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            All changes saved
          </span>
        )}
        {status === 'error' && (
          <span className="text-red-600 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Failed to save
          </span>
        )}
      </div>
    </div>
  );
}

AutoSaveIndicator.propTypes = {
  status: PropTypes.oneOf(['idle', 'saving', 'saved', 'error']),
  lastSaved: PropTypes.string,
};
