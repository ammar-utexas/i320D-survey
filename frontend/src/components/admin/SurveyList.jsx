import PropTypes from 'prop-types';
import SurveyCard from './SurveyCard';

export default function SurveyList({ surveys, onUpdate, onDelete, onDuplicate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {surveys.map((survey) => (
        <SurveyCard
          key={survey.id}
          survey={survey}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}

SurveyList.propTypes = {
  surveys: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
};
