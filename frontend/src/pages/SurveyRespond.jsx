import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { responsesApi } from '../api/responses';
import SurveyForm from '../components/survey/SurveyForm';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { formatRelativeTime } from '../utils/formatters';

export default function SurveyRespond() {
  const { slug } = useParams();
  const [survey, setSurvey] = useState(null);
  const [existingResponse, setExistingResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [pendingAnswers, setPendingAnswers] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch survey
        const surveyData = await responsesApi.getSurvey(slug);
        setSurvey(surveyData);

        // Try to fetch existing response
        try {
          const responseData = await responsesApi.getMyResponse(slug);
          if (responseData) {
            setExistingResponse(responseData);
            setLastSaved(responseData.updated_at);
          }
        } catch {
          // No existing response, that's okay
        }
      } catch (err) {
        setError(err.message || 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Auto-save with debounce
  useEffect(() => {
    if (!pendingAnswers) return;

    const timeoutId = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await responsesApi.submit(slug, {
          answers: pendingAnswers,
          is_draft: true,
        });
        setSaveStatus('saved');
        setLastSaved(new Date().toISOString());
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [pendingAnswers, slug]);

  const handleAnswerChange = useCallback((answers) => {
    setPendingAnswers(answers);
  }, []);

  const handleSubmit = async (answers) => {
    setSubmitting(true);
    setError(null);

    try {
      await responsesApi.submit(slug, {
        answers,
        is_draft: false,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load survey</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Submitted success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your response has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500">
            You can close this page or return to update your response.
          </p>
        </div>
      </div>
    );
  }

  // Get initial answers from existing response
  const initialAnswers = existingResponse?.answers || {};
  const isUpdate = existingResponse && !existingResponse.is_draft;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Auto-save indicator */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div>
            {lastSaved && (
              <span className="text-gray-500">
                Last saved: {formatRelativeTime(lastSaved)}
              </span>
            )}
          </div>
          <div>
            {saveStatus === 'saving' && (
              <span className="text-gray-500 flex items-center gap-1">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-green-600 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All changes saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600">
                Failed to save
              </span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* Survey Form */}
        <SurveyForm
          survey={survey}
          initialAnswers={initialAnswers}
          onSubmit={handleSubmit}
          onAnswerChange={handleAnswerChange}
          submitting={submitting}
          submitLabel={isUpdate ? 'Update Response' : 'Submit Survey'}
        />
      </div>
    </div>
  );
}
