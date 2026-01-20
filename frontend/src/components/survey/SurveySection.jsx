import PropTypes from 'prop-types';
import QuestionRenderer from './QuestionRenderer';
import QuestionError from './QuestionError';

export default function SurveySection({ vector, answers, errors, onAnswerChange }) {
  const questions = vector.questions || [];

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Section Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          {vector.vector_name}
        </h3>
      </div>

      {/* Questions */}
      <div className="p-6 space-y-8">
        {questions.map((question, index) => (
          <div
            key={question.question_id}
            id={`question-${question.question_id}`}
            className="scroll-mt-4"
          >
            {/* Question Label */}
            <label className="block text-base font-medium text-gray-900 mb-3">
              <span className="text-gray-500 mr-2">{index + 1}.</span>
              {question.question}
              {question.required !== false && (
                <span className="text-red-500 ml-1" aria-label="required">*</span>
              )}
            </label>

            {/* Question Input */}
            <QuestionRenderer
              question={question}
              value={answers[question.question_id]}
              onChange={(value) => onAnswerChange(question.question_id, value)}
              error={errors[question.question_id]}
            />

            {/* Error Message */}
            <QuestionError error={errors[question.question_id]} />
          </div>
        ))}
      </div>
    </section>
  );
}

SurveySection.propTypes = {
  vector: PropTypes.shape({
    vector_id: PropTypes.string.isRequired,
    vector_name: PropTypes.string.isRequired,
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        question_id: PropTypes.string.isRequired,
        question: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        required: PropTypes.bool,
      })
    ),
  }).isRequired,
  answers: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onAnswerChange: PropTypes.func.isRequired,
};
