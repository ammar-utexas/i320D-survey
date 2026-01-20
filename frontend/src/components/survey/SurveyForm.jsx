import { useState, useCallback } from 'react';
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

  const vectors = survey?.vectors || [];

  return (
    <form onSubmit={handleSubmit}>
      {/* Survey Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {survey?.survey_title || survey?.title}
        </h1>
        {survey?.description && (
          <p className="text-gray-600">{survey.description}</p>
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
