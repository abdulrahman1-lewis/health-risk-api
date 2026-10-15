const { test } = require('node:test');
const assert = require('node:assert/strict');
const h = require('../src/health');

test('bpCategory: boundaries from the AHA chart', () => {
  assert.equal(h.bpCategory(119, 79), 'normal');
  assert.equal(h.bpCategory(120, 79), 'elevated');
  assert.equal(h.bpCategory(129, 79), 'elevated');
  assert.equal(h.bpCategory(130, 70), 'stage 1');
  assert.equal(h.bpCategory(119, 80), 'stage 1');
  assert.equal(h.bpCategory(139, 89), 'stage 1');
  assert.equal(h.bpCategory(140, 70), 'stage 2');
  assert.equal(h.bpCategory(120, 90), 'stage 2');
  assert.equal(h.bpCategory(180, 120), 'stage 2');
  assert.equal(h.bpCategory(181, 100), 'crisis');
  assert.equal(h.bpCategory(150, 121), 'crisis');
});

test('calculateBmi: 5 ft 9 in, 165 lb is 24.4', () => {
  assert.equal(h.calculateBmi(5, 9, 165), 24.4);
});

test('bmiCategory: boundaries from the BMI table', () => {
  assert.equal(h.bmiCategory(18.4), 'underweight');
  assert.equal(h.bmiCategory(18.5), 'normal');
  assert.equal(h.bmiCategory(24.9), 'normal');
  assert.equal(h.bmiCategory(25.0), 'overweight');
  assert.equal(h.bmiCategory(29.9), 'overweight');
  assert.equal(h.bmiCategory(30.0), 'obese');
  assert.equal(h.bmiCategory(41.2), 'obese');
});

test('agePoints: boundaries', () => {
  assert.equal(h.agePoints(29), 0);
  assert.equal(h.agePoints(30), 10);
  assert.equal(h.agePoints(44), 10);
  assert.equal(h.agePoints(45), 20);
  assert.equal(h.agePoints(59), 20);
  assert.equal(h.agePoints(60), 30);
});

test('riskCategory: boundaries', () => {
  assert.equal(h.riskCategory(0), 'low risk');
  assert.equal(h.riskCategory(20), 'low risk');
  assert.equal(h.riskCategory(21), 'moderate risk');
  assert.equal(h.riskCategory(50), 'moderate risk');
  assert.equal(h.riskCategory(51), 'high risk');
  assert.equal(h.riskCategory(75), 'high risk');
  assert.equal(h.riskCategory(76), 'uninsurable');
});

test('calculateRisk: adds every penalty', () => {
  // 42 (10) + normal bmi (0) + elevated bp (15) + diabetes (10) = 35
  assert.deepEqual(
    h.calculateRisk({ age: 42, bmi: 'normal', bp: 'elevated', diabetes: true, cancer: false, alzheimers: false }),
    { score: 35, category: 'moderate risk' }
  );
  // 65 (30) + obese (75) + crisis (100) + all three family diseases (30) = 235
  assert.deepEqual(
    h.calculateRisk({ age: 65, bmi: 'obese', bp: 'crisis', diabetes: true, cancer: true, alzheimers: true }),
    { score: 235, category: 'uninsurable' }
  );
  // youngest, healthiest customer
  assert.deepEqual(
    h.calculateRisk({ age: 25, bmi: 'normal', bp: 'normal', diabetes: false, cancer: false, alzheimers: false }),
    { score: 0, category: 'low risk' }
  );
});
