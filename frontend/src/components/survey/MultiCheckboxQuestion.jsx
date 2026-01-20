export default function MultiCheckboxQuestion({ question, value, onChange, error }) {
  const options = question.options || [];
  const selectedValues = Array.isArray(value) ? value : [];

  const handleChange = (option, checked) => {
    if (checked) {
      onChange([...selectedValues, option]);
    } else {
      onChange(selectedValues.filter((v) => v !== option));
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <label
          key={index}
          className={`
            flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors
            min-h-[44px]
            ${selectedValues.includes(option)
              ? 'bg-blue-50 border-blue-300'
              : 'bg-white border-gray-200 hover:bg-gray-50'
            }
            ${error ? 'border-red-300' : ''}
          `}
        >
          <input
            type="checkbox"
            value={option}
            checked={selectedValues.includes(option)}
            onChange={(e) => handleChange(option, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-gray-900">{option}</span>
        </label>
      ))}
    </div>
  );
}
