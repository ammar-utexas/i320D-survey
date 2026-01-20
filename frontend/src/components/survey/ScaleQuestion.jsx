import PropTypes from 'prop-types';

export default function ScaleQuestion({ question, value, onChange, error }) {
  const scales = [1, 2, 3, 4, 5];

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        {scales.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`
              flex-1 min-w-[44px] min-h-[44px] py-2 rounded-md border-2 font-medium transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${value === n
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
              ${error ? 'border-red-300' : ''}
            `}
            aria-label={`Rate ${n} out of 5`}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

ScaleQuestion.propTypes = {
  question: PropTypes.shape({
    question_id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    required: PropTypes.bool,
  }).isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};
