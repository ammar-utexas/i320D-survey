import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { surveysApi } from '../api/surveys';
import SurveyStats from '../components/admin/SurveyStats';
import ResponseTable from '../components/admin/ResponseTable';
import SurveyUrlCopy from '../components/admin/SurveyUrlCopy';
import DateTimePicker from '../components/admin/DateTimePicker';
import ExportDropdown from '../components/admin/ExportDropdown';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { getSurveyStatus, getStatusBadgeClass, formatDate } from '../utils/formatters';

export default function SurveyResults() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responsesLoading, setResponsesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Schedule state
  const [opensAt, setOpensAt] = useState(null);
  const [closesAt, setClosesAt] = useState(null);
  const [scheduleError, setScheduleError] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const surveyData = await surveysApi.get(id);
        setSurvey(surveyData);
        setOpensAt(surveyData.opens_at);
        setClosesAt(surveyData.closes_at);
        setLoading(false);

        // Fetch responses separately
        setResponsesLoading(true);
        const responsesData = await surveysApi.getResponses(id);
        setResponses(responsesData);
      } catch (err) {
        setError(err.message || 'Failed to load survey');
        setLoading(false);
      } finally {
        setResponsesLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSaveSchedule = async () => {
    // Validation: closes_at must be after opens_at
    if (opensAt && closesAt && new Date(closesAt) <= new Date(opensAt)) {
      setScheduleError('Close date must be after open date');
      return;
    }

    setSavingSchedule(true);
    setScheduleError(null);
    setScheduleSuccess(false);

    try {
      const updated = await surveysApi.update(id, {
        opens_at: opensAt,
        closes_at: closesAt,
      });
      setSurvey(updated);
      setScheduleSuccess(true);
      setTimeout(() => setScheduleSuccess(false), 3000);
    } catch (err) {
      setScheduleError(err.message || 'Failed to save schedule');
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Error loading survey</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!survey) return null;

  const status = getSurveyStatus(survey.opens_at, survey.closes_at);
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const badgeClass = getStatusBadgeClass(status);

  // Calculate stats from responses
  const stats = {
    total: responses.length,
    completed: responses.filter((r) => r && !r.is_draft).length,
    in_progress: responses.filter((r) => r && r.is_draft).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900">{survey.title}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                {statusLabel}
              </span>
            </div>
            {survey.description && (
              <p className="text-gray-600 mb-3">{survey.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ExportDropdown surveyId={survey.id} surveySlug={survey.slug} />
            <Link to="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Survey URL */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Survey URL
        </label>
        <SurveyUrlCopy slug={survey.slug} />
      </div>

      {/* Schedule Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <DateTimePicker
            label="Opens At"
            value={opensAt}
            onChange={setOpensAt}
          />
          <DateTimePicker
            label="Closes At"
            value={closesAt}
            onChange={setClosesAt}
            minDate={opensAt}
            error={scheduleError}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveSchedule}
            loading={savingSchedule}
            disabled={savingSchedule}
          >
            Save Schedule
          </Button>
          {scheduleSuccess && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Schedule saved
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <SurveyStats stats={stats} />
      </div>

      {/* Response Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Responses</h2>
        <ResponseTable responses={responses} loading={responsesLoading} />
      </div>
    </div>
  );
}
