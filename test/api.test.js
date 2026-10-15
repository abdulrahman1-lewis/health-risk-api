const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

let server;
let base;

before(
  () =>
    new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        base = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    })
);

after(() => new Promise((resolve) => server.close(resolve)));

async function get(path) {
  const res = await fetch(base + path);
  return { status: res.status, body: await res.json() };
}

test('GET /ping', async () => {
  const r = await get('/ping');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { status: 'ok' });
});

test('GET /bp-category', async () => {
  assert.deepEqual((await get('/bp-category?systolic=118&diastolic=76')).body, { category: 'normal' });
  assert.deepEqual((await get('/bp-category?systolic=135&diastolic=70')).body, { category: 'stage 1' });
  assert.deepEqual((await get('/bp-category?systolic=190&diastolic=100')).body, { category: 'crisis' });
});

test('GET /bp-category rejects bad input', async () => {
  assert.equal((await get('/bp-category')).status, 400);
  assert.equal((await get('/bp-category?systolic=abc&diastolic=76')).status, 400);
  assert.equal((await get('/bp-category?systolic=300&diastolic=76')).status, 400);
  const r = await get('/bp-category?systolic=80&diastolic=90');
  assert.equal(r.status, 400);
  assert.match(r.body.error, /higher than diastolic/);
});

test('GET /bmi', async () => {
  const r = await get('/bmi?feet=5&inches=9&pounds=165');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { bmi: 24.4, category: 'normal' });
  assert.equal((await get('/bmi?feet=5&inches=9&pounds=220')).body.category, 'obese');
});

test('GET /bmi rejects bad input', async () => {
  assert.equal((await get('/bmi?feet=5&inches=12&pounds=165')).status, 400);
  assert.equal((await get('/bmi?feet=5&inches=9')).status, 400);
  assert.equal((await get('/bmi?feet=5.5&inches=9&pounds=165')).status, 400);
});

test('GET /risk-category', async () => {
  const r = await get('/risk-category?age=42&bmi=normal&bp=elevated&diabetes=true&cancer=false&alzheimers=false');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { score: 35, category: 'moderate risk' });
  // family flags are optional and default to false
  assert.deepEqual((await get('/risk-category?age=25&bmi=normal&bp=normal')).body, { score: 0, category: 'low risk' });
});

test('GET /risk-category rejects bad input', async () => {
  assert.equal((await get('/risk-category?age=42&bmi=huge&bp=normal')).status, 400);
  assert.equal((await get('/risk-category?age=10&bmi=normal&bp=normal')).status, 400);
  assert.equal((await get('/risk-category?age=42&bmi=normal&bp=normal&cancer=yes')).status, 400);
  assert.equal((await get('/risk-category?bmi=normal&bp=normal')).status, 400);
});

test('unknown route returns JSON 404', async () => {
  const r = await get('/nope');
  assert.equal(r.status, 404);
  assert.ok(r.body.error);
});

test('CORS header is present', async () => {
  const res = await fetch(base + '/ping', { headers: { Origin: 'https://example.com' } });
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
});
