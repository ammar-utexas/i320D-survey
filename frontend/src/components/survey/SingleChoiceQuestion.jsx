export default function SingleChoiceQuestion({ question, value, onChange, error }) {
  const options = question.options || [];

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <label
          key={index}
          className={`
            flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors
            min-h-[44px]
            ${value === option
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
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-gray-900">{option}</span>
        </label>
      ))}
    </div>
  );
}
