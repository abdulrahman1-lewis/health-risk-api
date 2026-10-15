// The Express app. Exactly 4 APIs: ping, bp-category, bmi, risk-category.
const express = require('express');
const cors = require('cors');
const health = require('./health');
const { validateBp, validateBmi, validateRisk } = require('./validate');

const app = express();

// CORS: allow the static website to call this API from the browser.
// Set ALLOWED_ORIGINS in Azure (comma separated) to lock it to your site, e.g.
//   https://yourname.z13.web.core.windows.net
// If it is not set, any origin is allowed (fine for class, not for production).
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.length ? allowed : '*',
    methods: ['GET']
  })
);

// Meaningful console messages for every request and response (visible in Azure Log stream).
app.use((req, res, next) => {
  const started = Date.now();
  console.log(`[REQUEST ] ${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    console.log(
      `[RESPONSE] ${new Date().toISOString()}  ${req.method} ${req.path}  ${res.statusCode}  ${Date.now() - started}ms`
    );
  });
  next();
});

function bad(res, message) {
  return res.status(400).json({ error: message });
}

// 1. ping: wakes the server up
app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// 2. bp-category?systolic=118&diastolic=76  ->  { category }
app.get('/bp-category', (req, res) => {
  const { error, values } = validateBp(req.query);
  if (error) return bad(res, error);
  res.json({ category: health.bpCategory(values.systolic, values.diastolic) });
});

// 3. bmi?feet=5&inches=9&pounds=165  ->  { bmi, category }
app.get('/bmi', (req, res) => {
  const { error, values } = validateBmi(req.query);
  if (error) return bad(res, error);
  const bmi = health.calculateBmi(values.feet, values.inches, values.pounds);
  res.json({ bmi, category: health.bmiCategory(bmi) });
});

// 4. risk-category?age=42&bmi=normal&bp=elevated&diabetes=true  ->  { score, category }
app.get('/risk-category', (req, res) => {
  const { error, values } = validateRisk(req.query);
  if (error) return bad(res, error);
  res.json(health.calculateRisk(values));
});

// Anything else: a clear JSON error instead of an HTML page.
app.use((req, res) => {
  res.status(404).json({ error: 'Unknown API. Use /ping, /bp-category, /bmi or /risk-category.' });
});

// Last-resort handler so the client always gets JSON.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR   ] ${new Date().toISOString()}  ${err.stack || err}`);
  res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
});

module.exports = app;
