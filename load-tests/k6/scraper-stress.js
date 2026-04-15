import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

const params = {
  headers: {
    'Content-Type': 'application/json',
    ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {})
  }
};

export const options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<1200'],
    ...(AUTH_TOKEN ? { http_req_failed: ['rate<0.03'] } : {})
  }
};

function allowedStatus(status) {
  if (AUTH_TOKEN) {
    return status >= 200 && status < 300;
  }
  return status === 401 || status === 403;
}

export default function scraperStressTest() {
  const getActiveScrapers = http.get(`${BASE_URL}/api/admin/scrapers/active`, params);

  check(getActiveScrapers, {
    'active scrapers endpoint responds as expected': (r) => allowedStatus(r.status)
  });

  const payload = JSON.stringify({
    source: 'pypi',
    packages: ['requests', 'numpy', 'pandas']
  });

  const queueScan = http.post(
    `${BASE_URL}/api/admin/scrapers/pypi-scraper/scan-packages`,
    payload,
    params
  );

  check(queueScan, {
    'scan-packages endpoint responds as expected': (r) => allowedStatus(r.status) || r.status === 202
  });

  sleep(1);
}
