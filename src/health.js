// Pure calculation functions. No Express, no I/O, so they are easy to unit test.

const LB_TO_KG = 0.45359237;
const INCH_TO_M = 0.0254;

// ----- Blood pressure -----------------------------------------------------
// normal | elevated | stage 1 | stage 2 | crisis
function bpCategory(systolic, diastolic) {
  if (systolic > 180 || diastolic > 120) return 'crisis';
  if (systolic >= 140 || diastolic >= 90) return 'stage 2';
  if (systolic >= 130 || diastolic >= 80) return 'stage 1';
  if (systolic >= 120) return 'elevated'; // diastolic is already below 80 here
  return 'normal';
}

// ----- BMI ----------------------------------------------------------------
// BMI = weight in kg / (height in meters)^2, rounded to 1 decimal like the table.
function calculateBmi(feet, inches, pounds) {
  const kilograms = pounds * LB_TO_KG;
  const meters = (feet * 12 + inches) * INCH_TO_M;
  return Math.round((kilograms / (meters * meters)) * 10) / 10;
}

// The assignment table covers 18.5 to 34.9. We also decide what happens outside it:
//   below 18.5 -> "underweight" (0 points, same as normal)
//   30.0 and up -> "obese" (75 points), including 35 and above
function bmiCategory(bmi) {
  if (bmi < 18.5) return 'underweight';
  if (bmi <= 24.9) return 'normal';
  if (bmi <= 29.9) return 'overweight';
  return 'obese';
}

// ----- Point tables -------------------------------------------------------
function agePoints(age) {
  if (age < 30) return 0;
  if (age < 45) return 10;
  if (age < 60) return 20;
  return 30;
}

const BMI_POINTS = { underweight: 0, normal: 0, overweight: 30, obese: 75 };
const BP_POINTS = { normal: 0, elevated: 15, 'stage 1': 30, 'stage 2': 75, crisis: 100 };
const FAMILY_POINTS_EACH = 10; // diabetes, cancer, Alzheimer's

function riskCategory(score) {
  if (score <= 20) return 'low risk';
  if (score <= 50) return 'moderate risk';
  if (score <= 75) return 'high risk';
  return 'uninsurable';
}

function calculateRisk({ age, bmi, bp, diabetes, cancer, alzheimers }) {
  const score =
    agePoints(age) +
    BMI_POINTS[bmi] +
    BP_POINTS[bp] +
    (diabetes ? FAMILY_POINTS_EACH : 0) +
    (cancer ? FAMILY_POINTS_EACH : 0) +
    (alzheimers ? FAMILY_POINTS_EACH : 0);
  return { score, category: riskCategory(score) };
}

module.exports = {
  bpCategory,
  calculateBmi,
  bmiCategory,
  agePoints,
  riskCategory,
  calculateRisk,
  BMI_POINTS,
  BP_POINTS
};
