import PropTypes from 'prop-types';

export default function SingleChoiceWithTextQuestion({ question, value, onChange, error }) {
  const options = question.options || [];
  const currentValue = value || { choice: '', text: '' };

  const handleChoiceChange = (choice) => {
    onChange({ ...currentValue, choice });
  };

  const handleTextChange = (text) => {
    onChange({ ...currentValue, text });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((option, index) => (
          <label
            key={index}
            className={`
              flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors
              min-h-[44px]
              ${currentValue.choice === option
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-gray-200 hover:bg-gray-50'
              }
              ${error ? 'border-red-300' : ''}
            `}
          >
            <input
              type="radio"
              name={question.question_id}
              value={option}
              checked={currentValue.choice === option}
              onChange={(e) => handleChoiceChange(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-900">{option}</span>
          </label>
        ))}
      </div>

      {currentValue.choice && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {question.text_prompt || 'Please explain:'}
          </label>
          <textarea
            value={currentValue.text || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={3}
            maxLength={1000}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${error ? 'border-red-300' : 'border-gray-300'}
            `}
            placeholder="Enter your response..."
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            {(currentValue.text || '').length}/1000
          </p>
        </div>
      )}
    </div>
  );
}

SingleChoiceWithTextQuestion.propTypes = {
  question: PropTypes.shape({
    question_id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
    text_prompt: PropTypes.string,
    required: PropTypes.bool,
  }).isRequired,
  value: PropTypes.shape({
    choice: PropTypes.string,
    text: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};
