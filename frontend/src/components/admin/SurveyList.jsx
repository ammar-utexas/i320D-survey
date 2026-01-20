import SurveyCard from './SurveyCard';

export default function SurveyList({ surveys }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {surveys.map((survey) => (
        <SurveyCard key={survey.id} survey={survey} />
      ))}
    </div>
  );
}
