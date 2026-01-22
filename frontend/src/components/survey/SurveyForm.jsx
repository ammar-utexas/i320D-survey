import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import SurveySection from './SurveySection';
import Button from '../common/Button';
import { validateForm, hasErrors, getFirstErrorId } from '../../utils/validation';

export default function SurveyForm({
  survey,
  initialAnswers = {},
  onSubmit,
  onAnswerChange,
  submitting = false,
  submitLabel = 'Submit Survey',
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [errors, setErrors] = useState({});

  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: value };
      // Notify parent of change (for auto-save)
      if (onAnswerChange) {
        onAnswerChange(newAnswers);
      }
      return newAnswers;
    });

    // Clear error when user provides answer
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  }, [errors, onAnswerChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const validationErrors = validateForm(survey, answers);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      // Scroll to first error
      const firstErrorId = getFirstErrorId(survey, validationErrors);
      if (firstErrorId) {
        const element = document.getElementById(`question-${firstErrorId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Submit the form
    if (onSubmit) {
      await onSubmit(answers);
    }
  };

  // vectors are inside config for API responses, or at top level for direct config objects
  const vectors = survey?.config?.vectors || survey?.vectors || [];

  return (
    <form onSubmit={handleSubmit}>
      {/* Survey Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {survey?.config?.survey_title || survey?.survey_title || survey?.title}
        </h1>
        {(survey?.config?.description || survey?.description) && (
          <p className="text-gray-600">{survey?.config?.description || survey?.description}</p>
        )}
      </div>

      {/* Survey Sections */}
      {vectors.map((vector) => (
        <SurveySection
          key={vector.vector_id}
          vector={vector}
          answers={answers}
          errors={errors}
          onAnswerChange={handleAnswerChange}
        />
      ))}

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <Button
          type="submit"
          size="lg"
          loading={submitting}
          disabled={submitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

SurveyForm.propTypes = {
  survey: PropTypes.shape({
    survey_title: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    vectors: PropTypes.arrayOf(
      PropTypes.shape({
        vector_id: PropTypes.string.isRequired,
        vector_name: PropTypes.string.isRequired,
        questions: PropTypes.array,
      })
    ),
  }),
  initialAnswers: PropTypes.object,
  onSubmit: PropTypes.func,
  onAnswerChange: PropTypes.func,
  submitting: PropTypes.bool,
  submitLabel: PropTypes.string,
};
