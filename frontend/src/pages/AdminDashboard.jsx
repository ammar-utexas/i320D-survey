import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { surveysApi } from '../api/surveys';
import SurveyList from '../components/admin/SurveyList';
import EmptyState from '../components/admin/EmptyState';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await surveysApi.list();
      setSurveys(data);
    } catch (err) {
      setError(err.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Handle survey update (edit)
  const handleSurveyUpdate = useCallback((updatedSurvey) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === updatedSurvey.id ? updatedSurvey : s))
    );
  }, []);

  // Handle survey delete
  const handleSurveyDelete = useCallback((deletedId) => {
    setSurveys((prev) => prev.filter((s) => s.id !== deletedId));
  }, []);

  // Handle survey duplicate (just refresh list since user navigates away)
  const handleSurveyDuplicate = useCallback(() => {
    // The DuplicateModal navigates to the new survey, so no action needed here
    // But we could refresh if needed
  }, []);

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
        <h3 className="text-lg font-medium text-gray-900">Error loading surveys</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Button onClick={fetchSurveys}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Surveys</h1>
          <p className="mt-1 text-sm text-gray-500">
            {surveys.length} {surveys.length === 1 ? 'survey' : 'surveys'}
          </p>
        </div>
        <Link to="/surveys/new">
          <Button>
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Survey
          </Button>
        </Link>
      </div>

      {surveys.length === 0 ? (
        <EmptyState />
      ) : (
        <SurveyList
          surveys={surveys}
          onUpdate={handleSurveyUpdate}
          onDelete={handleSurveyDelete}
          onDuplicate={handleSurveyDuplicate}
        />
      )}
    </div>
  );
}
