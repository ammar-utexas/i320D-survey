/**
 * Check if a value is considered "filled" based on question type
 * @param {any} value - The answer value
 * @param {string} type - Question type
 * @returns {boolean} Whether the value is filled
 */
function isValueFilled(value, type) {
  if (value === null || value === undefined) return false;

  switch (type) {
    case 'scale_1_5':
      return typeof value === 'number' && value >= 1 && value <= 5;

    case 'single_choice':
    case 'dropdown':
      return typeof value === 'string' && value.trim() !== '';

    case 'multi_checkbox':
      return Array.isArray(value) && value.length > 0;

    case 'single_choice_with_text':
      return (
        typeof value === 'object' &&
        value.choice &&
        typeof value.choice === 'string' &&
        value.choice.trim() !== ''
      );

    case 'open_text':
      return typeof value === 'string' && value.trim() !== '';

    default:
      return value !== '' && value !== null && value !== undefined;
  }
}

/**
 * Validate a single required question
 * @param {object} question - Question object
 * @param {any} value - Answer value
 * @returns {string|null} Error message or null if valid
 */
export function validateRequired(question, value) {
  if (!question.required) return null;

  const isFilled = isValueFilled(value, question.type);

  if (!isFilled) {
    return 'This question is required';
  }

  return null;
}

/**
 * Validate all questions in a survey
 * @param {object} survey - Survey config with vectors and questions
 * @param {object} answers - Map of question_id to answer value
 * @returns {object} Map of question_id to error message
 */
export function validateForm(survey, answers) {
  const errors = {};

  const vectors = survey?.config?.vectors || survey?.vectors;
  if (!vectors) return errors;

  for (const vector of vectors) {
    if (!vector.questions) continue;

    for (const question of vector.questions) {
      const value = answers[question.question_id];
      const error = validateRequired(question, value);

      if (error) {
        errors[question.question_id] = error;
      }
    }
  }

  return errors;
}

/**
 * Check if there are any validation errors
 * @param {object} errors - Map of question_id to error message
 * @returns {boolean} True if there are errors
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

/**
 * Get the first question ID with an error (for scrolling)
 * @param {object} survey - Survey config
 * @param {object} errors - Map of question_id to error message
 * @returns {string|null} First question ID with error
 */
export function getFirstErrorId(survey, errors) {
  const vectors = survey?.config?.vectors || survey?.vectors;
  if (!vectors) return null;

  for (const vector of vectors) {
    if (!vector.questions) continue;

    for (const question of vector.questions) {
      if (errors[question.question_id]) {
        return question.question_id;
      }
    }
  }

  return null;
}
