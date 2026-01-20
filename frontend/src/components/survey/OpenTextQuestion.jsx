export default function OpenTextQuestion({ question, value, onChange, error }) {
  const maxLength = 1000;
  const currentLength = (value || '').length;

  return (
    <div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        maxLength={maxLength}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm resize-none
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
        placeholder="Enter your response..."
      />
      <p className={`mt-1 text-xs text-right ${currentLength >= maxLength ? 'text-red-500' : 'text-gray-500'}`}>
        {currentLength}/{maxLength}
      </p>
    </div>
  );
}
