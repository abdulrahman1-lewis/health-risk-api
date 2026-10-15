# Health Insurance Risk Calculator: API

Node.js + Express API for Health Insurance, Inc. **All calculation and data validation lives here.** The web client only sends inputs and displays results. Hosted on **Azure App Service**.

## Live links

| What | Link |
|------|------|
| Live API (health check) | https://abdul-health-risk-api-acgydsg0hte7g9aj.westus3-01.azurewebsites.net/ping |
| This repo (API) | https://github.com/abdulrahman1-lewis/health-risk-api |
| Client website | https://lemon-bay-09f25771e.6.azurestaticapps.net |
| Client repo | https://github.com/abdulrahman1-lewis/health-risk-client |

The API runs on Azure's free plan, so it sleeps when idle. The first request after a quiet period can take up to a minute, which is why the client calls `/ping` when the page loads.

Try it in a browser:

- [/ping](https://abdul-health-risk-api-acgydsg0hte7g9aj.westus3-01.azurewebsites.net/ping)
- [/bp-category?systolic=118&diastolic=76](https://abdul-health-risk-api-acgydsg0hte7g9aj.westus3-01.azurewebsites.net/bp-category?systolic=118&diastolic=76)
- [/bmi?feet=5&inches=9&pounds=165](https://abdul-health-risk-api-acgydsg0hte7g9aj.westus3-01.azurewebsites.net/bmi?feet=5&inches=9&pounds=165)
- [/risk-category?age=42&bmi=normal&bp=elevated&diabetes=true](https://abdul-health-risk-api-acgydsg0hte7g9aj.westus3-01.azurewebsites.net/risk-category?age=42&bmi=normal&bp=elevated&diabetes=true)

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

- Blood pressure: `normal`, `elevated`, `stage 1`, `stage 2`, `crisis`
- BMI: `underweight`, `normal`, `overweight`, `obese`
- Risk: `low risk`, `moderate risk`, `high risk`, `uninsurable`

## Validation ranges

| Input | Allowed |
|-------|---------|
| age | whole number 18 to 120 |
| feet / inches / pounds | 3 to 8 / 0 to 11 / 50 to 700 |
| systolic / diastolic | 70 to 240 / 40 to 140, and systolic must be higher than diastolic |
| bmi, bp (for `/risk-category`) | one of the category values above |

## Risk points

| Factor | Points |
|--------|--------|
| Age under 30 / under 45 / under 60 / 60+ | 0 / 10 / 20 / 30 |
| BMI normal / overweight / obese | 0 / 30 / 75 |
| Blood pressure normal / elevated / stage 1 / stage 2 / crisis | 0 / 15 / 30 / 75 / 100 |
| Family history: diabetes, cancer, Alzheimer's | 10 each |

Total score: up to 20 is low risk, up to 50 moderate risk, up to 75 high risk, and above 75 uninsurable.

## Decisions the assignment didn't spell out

- BMI is rounded to 1 decimal before choosing a category.
- BMI below 18.5 is `underweight` and scores 0 points, the same as normal.
- BMI of 30.0 or higher is `obese` (75 points), including 35 and above.
- Each family disease adds 10 points, and they add up.
- Hypertensive crisis is checked first (systolic above 180 and/or diastolic above 120).

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
npm test           # runs all tests (Node 18+)
```

## Hosting and CI/CD

- Hosted on **Azure App Service** (Linux, Node 22 LTS, Free plan) in resource group `rg-health-risk`.
- Connected to this repo's `main` branch through **Deployment Center**. Every push to `main` triggers a GitHub Action (see the **Actions** tab) that installs dependencies, runs `npm test`, and deploys only if the tests pass.
- CORS is controlled by the `ALLOWED_ORIGINS` environment variable in Azure (**Settings > Environment variables**). It is set to the client site, `https://lemon-bay-09f25771e.6.azurestaticapps.net`, with no trailing slash. If it is not set, any origin is allowed.
- Every request and response is logged to the console. Watch them live in Azure under **Monitoring > Log stream**.

## Team

| Role | Name |
|------|------|
| Scrum Master | _add name_ |
| Product Owner | _add name_ |
| Developers | abdulrahman1-lewis, _add teammate_ |

Course: CPSC 44000, Lewis University, Sprint 4.
