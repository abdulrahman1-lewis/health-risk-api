// Input validation. Every function returns { value } on success or { error } on failure.
// Query-string values arrive as text, so we are strict about what counts as a whole number.

const { BMI_POINTS, BP_POINTS } = require('./health');

function wholeNumber(query, name, label, min, max) {
  const raw = query[name];
  if (raw === undefined || raw === '') {
    return { error: `${label} is required.` };
  }
  if (typeof raw !== 'string' || !/^\d+$/.test(raw.trim())) {
    return { error: `${label} must be a whole number.` };
  }
  const value = parseInt(raw.trim(), 10);
  if (value < min || value > max) {
    return { error: `${label} must be between ${min} and ${max}.` };
  }
  return { value };
}

function flag(query, name, label) {
  const raw = query[name];
  if (raw === undefined || raw === '') return { value: false };
  if (raw === 'true') return { value: true };
  if (raw === 'false') return { value: false };
  return { error: `${label} must be true or false.` };
}

function oneOf(query, name, label, allowed) {
  const raw = query[name];
  if (raw === undefined || raw === '') {
    return { error: `${label} is required.` };
  }
  const value = String(raw).trim().toLowerCase();
  if (!allowed.includes(value)) {
    return { error: `${label} must be one of: ${allowed.join(', ')}.` };
  }
  return { value };
}

// Runs a list of named checks and returns the first error, or all the values.
function run(checks) {
  const values = {};
  for (const [key, result] of checks) {
    if (result.error) return { error: result.error };
    values[key] = result.value;
  }
  return { values };
}

function validateBp(query) {
  const result = run([
    ['systolic', wholeNumber(query, 'systolic', 'Systolic blood pressure', 70, 240)],
    ['diastolic', wholeNumber(query, 'diastolic', 'Diastolic blood pressure', 40, 140)]
  ]);
  if (result.error) return result;
  if (result.values.systolic <= result.values.diastolic) {
    return { error: 'Systolic (upper number) must be higher than diastolic (lower number).' };
  }
  return result;
}

function validateBmi(query) {
  return run([
    ['feet', wholeNumber(query, 'feet', 'Height in feet', 3, 8)],
    ['inches', wholeNumber(query, 'inches', 'Height in inches', 0, 11)],
    ['pounds', wholeNumber(query, 'pounds', 'Weight in pounds', 50, 700)]
  ]);
}

function validateRisk(query) {
  return run([
    ['age', wholeNumber(query, 'age', 'Age', 18, 120)],
    ['bmi', oneOf(query, 'bmi', 'BMI category', Object.keys(BMI_POINTS))],
    ['bp', oneOf(query, 'bp', 'Blood pressure category', Object.keys(BP_POINTS))],
    ['diabetes', flag(query, 'diabetes', 'Diabetes')],
    ['cancer', flag(query, 'cancer', 'Cancer')],
    ['alzheimers', flag(query, 'alzheimers', "Alzheimer's")]
  ]);
}

module.exports = { validateBp, validateBmi, validateRisk };
