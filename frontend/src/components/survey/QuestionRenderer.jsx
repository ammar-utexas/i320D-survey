import ScaleQuestion from './ScaleQuestion';
import SingleChoiceQuestion from './SingleChoiceQuestion';
import MultiCheckboxQuestion from './MultiCheckboxQuestion';
import DropdownQuestion from './DropdownQuestion';
import SingleChoiceWithTextQuestion from './SingleChoiceWithTextQuestion';
import OpenTextQuestion from './OpenTextQuestion';

const questionComponents = {
  scale_1_5: ScaleQuestion,
  single_choice: SingleChoiceQuestion,
  multi_checkbox: MultiCheckboxQuestion,
  dropdown: DropdownQuestion,
  single_choice_with_text: SingleChoiceWithTextQuestion,
  open_text: OpenTextQuestion,
};

export default function QuestionRenderer({ question, value, onChange, error }) {
  const Component = questionComponents[question.type];

  if (!Component) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
        Unknown question type: {question.type}
      </div>
    );
  }

  return (
    <Component
      question={question}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}
