import PropTypes from 'prop-types';

export default function QuestionError({ error }) {
  if (!error) return null;

  return (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {error}
    </p>
  );
}

QuestionError.propTypes = {
  error: PropTypes.string,
};
