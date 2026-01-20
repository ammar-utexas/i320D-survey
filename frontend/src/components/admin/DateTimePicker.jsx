import { formatDateTimeLocal } from '../../utils/formatters';

export default function DateTimePicker({
  label,
  value,
  onChange,
  minDate,
  error,
  disabled = false,
}) {
  const handleChange = (e) => {
    const newValue = e.target.value ? new Date(e.target.value).toISOString() : null;
    onChange(newValue);
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="datetime-local"
          value={value ? formatDateTimeLocal(value) : ''}
          onChange={handleChange}
          min={minDate ? formatDateTimeLocal(minDate) : undefined}
          disabled={disabled}
          className={`
            flex-1 px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Clear date"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
