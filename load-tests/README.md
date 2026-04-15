# Load Testing

This directory contains baseline k6 scripts for week 13 (performance testing).

## Prerequisites

- k6 installed locally
- StackScout backend running (default: `http://localhost:8081`)

Install k6:

- macOS (Homebrew): `brew install k6`
- Linux (Debian/Ubuntu): `sudo gpg -k && sudo apt-get update && sudo apt-get install -y k6`
- Docs: https://grafana.com/docs/k6/latest/set-up/install-k6/

## Test Scenarios

- `k6/api-load-test.js`: mixed API load profile up to 100 VUs for 5 minutes
- `k6/search-stress.js`: sustained search endpoint stress (100 VUs for 5 minutes)
- `k6/scraper-stress.js`: scraper/admin endpoint stress (supports optional `AUTH_TOKEN`)

## Run Commands

From repository root:

```bash
npm run load:api
npm run load:search
npm run load:scraper
```

Override base URL:

```bash
BASE_URL=http://localhost:8081 npm run load:api
```

Run scraper stress with admin JWT token:

```bash
BASE_URL=http://localhost:8081 AUTH_TOKEN=<jwt_token> npm run load:scraper
```

## Reporting Template

Capture these metrics for your report:

- Throughput (RPS)
- p50/p95 response times
- Error rate
- Notes on bottlenecks and recommendations

Suggested report file: `load-tests/report.md`.
