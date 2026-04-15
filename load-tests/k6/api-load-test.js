import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8081';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '1m', target: 60 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000']
  }
};

function randomPage() {
  return Math.floor(Math.random() * 5);
}

export default function () {
  const requests = [
    ['GET', `${BASE_URL}/api/v1/health`, null],
    ['GET', `${BASE_URL}/api/v1/ping`, null],
    ['GET', `${BASE_URL}/api/v1/libraries?page=0&size=10`, null],
    ['GET', `${BASE_URL}/api/v1/libraries/healthy?minScore=70`, null],
    ['GET', `${BASE_URL}/api/v1/libraries/search?source=pypi&page=${randomPage()}&size=10`, null],
    ['GET', `${BASE_URL}/api/v1/libraries/stats`, null]
  ];

  const responses = http.batch(requests);

  for (const response of responses) {
    check(response, {
      'status is 2xx': (r) => r.status >= 200 && r.status < 300
    });
  }

  sleep(1);
}
