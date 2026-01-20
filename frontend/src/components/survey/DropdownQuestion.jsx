import PropTypes from 'prop-types';

export default function DropdownQuestion({ question, value, onChange, error }) {
  const options = question.options || [];

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`
        w-full px-3 py-2 min-h-[44px] border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${error ? 'border-red-300' : 'border-gray-300'}
        ${!value ? 'text-gray-500' : 'text-gray-900'}
      `}
    >
      <option value="">Select an option...</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

DropdownQuestion.propTypes = {
  question: PropTypes.shape({
    question_id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
    required: PropTypes.bool,
  }).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};
