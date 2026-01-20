import { useState } from 'react';
import { Link } from 'react-router-dom';
import { surveysApi } from '../api/surveys';
import FileUpload from '../components/admin/FileUpload';
import ValidationErrors from '../components/admin/ValidationErrors';
import SurveyUrlCopy from '../components/admin/SurveyUrlCopy';
import Button from '../components/common/Button';

export default function SurveyCreate() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [createdSurvey, setCreatedSurvey] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setErrors(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrors(['Please select a JSON file to upload']);
      return;
    }

    setLoading(true);
    setErrors(null);

    try {
      const text = await file.text();
      let config;

      try {
        config = JSON.parse(text);
      } catch {
        setErrors(['Invalid JSON format. Please check your file and try again.']);
        setLoading(false);
        return;
      }

      const survey = await surveysApi.create(config);
      setCreatedSurvey(survey);
    } catch (err) {
      // Handle validation errors from backend
      if (err.message) {
        try {
          const parsed = JSON.parse(err.message);
          setErrors(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          setErrors([err.message]);
        }
      } else {
        setErrors(['An unexpected error occurred. Please try again.']);
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (createdSurvey) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Survey Created!</h2>
            <p className="mt-2 text-gray-600">
              Your survey "{createdSurvey.title}" has been created successfully.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share this URL with respondents:
            </label>
            <SurveyUrlCopy slug={createdSurvey.slug} />
          </div>

          <div className="flex gap-3">
            <Link to={`/surveys/${createdSurvey.id}`} className="flex-1">
              <Button className="w-full">View Survey Details</Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button variant="secondary" className="w-full">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Upload form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Survey</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload a JSON configuration file to create a new survey.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Survey Configuration File
            </label>
            <FileUpload
              onFileSelect={handleFileSelect}
              disabled={loading}
            />
          </div>

          {errors && (
            <div className="mb-6">
              <ValidationErrors errors={errors} />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={loading}
              disabled={!file}
              className="flex-1"
            >
              Create Survey
            </Button>
            <Link to="/dashboard">
              <Button variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">JSON Format</h3>
        <p className="text-sm text-blue-700 mb-2">
          Your JSON file should include the survey title, description, and questions grouped by vectors.
        </p>
        <pre className="text-xs text-blue-600 bg-blue-100 rounded p-3 overflow-x-auto">
{`{
  "survey_title": "My Survey",
  "description": "Survey description",
  "vectors": [
    {
      "vector_id": "section1",
      "vector_name": "Section 1",
      "questions": [...]
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}
