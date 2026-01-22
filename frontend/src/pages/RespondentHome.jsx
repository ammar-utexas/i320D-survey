import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { surveysApi } from '../api/surveys';
import Spinner from '../components/common/Spinner';

export default function RespondentHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchActiveSurveys = async () => {
      try {
        const data = await surveysApi.getActive();
        setSurveys(data);

        // If there's exactly one active survey, redirect to it
        if (data.length === 1) {
          navigate(`/s/${data[0].slug}`, { replace: true });
          return;
        }
      } catch (err) {
        console.error('Failed to fetch active surveys:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSurveys();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">SurveyFlow</h1>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.github_username}!</h2>

            {surveys.length === 0 ? (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  There are no active surveys at this time.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Check back later or contact your instructor.
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  Select a survey to respond:
                </p>
                <div className="mt-4 space-y-2">
                  {surveys.map((survey) => (
                    <button
                      key={survey.slug}
                      onClick={() => navigate(`/s/${survey.slug}`)}
                      className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{survey.title}</div>
                      {survey.description && (
                        <div className="text-sm text-gray-500 mt-1">{survey.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mt-6">
              <button
                onClick={logout}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
