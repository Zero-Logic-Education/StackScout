import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';
const QUERIES = ['spring', 'react', 'requests', 'django', 'kafka', 'redis'];
const SOURCES = ['pypi', 'npm', 'maven'];

export const options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    http_req_failed: ['rate<0.03'],
    http_req_duration: ['p(95)<800']
  }
};

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export default function () {
  const query = pick(QUERIES);
  const source = pick(SOURCES);
  const page = Math.floor(Math.random() * 10);
  const minHealthScore = 60 + Math.floor(Math.random() * 30);

  const url = `${BASE_URL}/api/v1/libraries/search?query=${query}&source=${source}&minHealthScore=${minHealthScore}&page=${page}&size=20`;
  const response = http.get(url);

  check(response, {
    'search status is 200': (r) => r.status === 200,
    'search response has libraries field': (r) => r.body && r.body.includes('libraries')
  });

  sleep(0.5);
}
