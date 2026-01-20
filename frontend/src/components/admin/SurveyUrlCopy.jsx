import { useState } from 'react';
import { copyToClipboard } from '../../utils/clipboard';

export default function SurveyUrlCopy({ slug, className = '' }) {
  const [copied, setCopied] = useState(false);

  const surveyUrl = `${window.location.origin}/s/${slug}`;

  const handleCopy = async () => {
    const success = await copyToClipboard(surveyUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
          <span className="text-sm text-gray-600 truncate">{surveyUrl}</span>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-label="Copy survey URL"
      >
        {copied ? (
          <>
            <svg className="h-4 w-4 text-green-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="h-4 w-4 text-gray-500 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}
