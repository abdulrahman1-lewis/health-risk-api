# Health Insurance Risk Calculator: API (Azure Node.js)

Node.js + Express. **All calculation and validation lives here.** The client only sends inputs and displays results.

## Files

```
server.js            starts the server (uses Azure's PORT)
src/app.js           the 4 routes, CORS, request/response console logging
src/health.js        pure calculation functions (BP, BMI, points, risk category)
src/validate.js      input validation
test/                unit tests (health.test.js) and API tests (api.test.js)
```

## Run locally

```
npm install
npm start          # http://localhost:3000
npm test           # runs all tests (needs Node 18+)
```

Try it in a browser:
- http://localhost:3000/ping
- http://localhost:3000/bp-category?systolic=118&diastolic=76
- http://localhost:3000/bmi?feet=5&inches=9&pounds=165
- http://localhost:3000/risk-category?age=42&bmi=normal&bp=elevated&diabetes=true

## The 4 APIs

All are `GET` and return JSON.

| API | Query string | Success response |
|-----|--------------|------------------|
| `/ping` | none | `{ "status": "ok" }` |
| `/bp-category` | `systolic`, `diastolic` | `{ "category": "normal" }` |
| `/bmi` | `feet`, `inches`, `pounds` | `{ "bmi": 24.4, "category": "normal" }` |
| `/risk-category` | `age`, `bmi`, `bp`, optional `diabetes`, `cancer`, `alzheimers` (true/false, default false) | `{ "score": 35, "category": "moderate risk" }` |

Errors return HTTP 400 with `{ "error": "plain-English message" }`.

Category values:
- BP: `normal`, `elevated`, `stage 1`, `stage 2`, `crisis`
- BMI: `underweight`, `normal`, `overweight`, `obese`
- Risk: `low risk`, `moderate risk`, `high risk`, `uninsurable`

## Validation ranges

| Input | Allowed |
|-------|---------|
| age | whole number 18 to 120 |
| feet / inches / pounds | 3 to 8 / 0 to 11 / 50 to 700 |
| systolic / diastolic | 70 to 240 / 40 to 140, and systolic must be higher than diastolic |
| bmi, bp (for `/risk-category`) | one of the category values above |

## Decisions the assignment didn't spell out

Review these as a team and change them in `src/health.js` if you disagree:
- BMI is rounded to 1 decimal before choosing a category, so the table gaps (24.9 to 25.0) never leave a value uncategorized.
- BMI below 18.5 is `underweight` and scores 0 points, the same as normal.
- BMI of 30.0 or higher is `obese` (75 points), including 35 and above.
- Each family disease adds 10 points, and they add up (all three = 30).
- Hypertensive crisis is checked first (systolic above 180 and/or diastolic above 120).

## Deploy to Azure App Service

1. Create a **Web App** (Runtime stack: Node 20 LTS or 22 LTS, Linux; the free F1 plan works).
2. In **Deployment Center**, connect your GitHub repo and branch. Azure creates the GitHub Action, so every push deploys.
3. In **Settings > Environment variables**, add `ALLOWED_ORIGINS` = your static site URL
   (for example `https://yourname.z13.web.core.windows.net`, no trailing slash). Without it, any origin is allowed.
4. Check `https://<your-app>.azurewebsites.net/ping` returns `{"status":"ok"}`.
5. Put that URL in the client's `js/config.js`.
6. Watch calls live in **Monitoring > Log stream** (the `[REQUEST]` / `[RESPONSE]` lines).

The free plan sleeps when idle, so the first request after a while can take a minute. That's why the client calls `/ping` when the page loads.
