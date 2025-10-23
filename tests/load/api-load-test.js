import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
    http_req_failed: ['rate<0.05'],   // Error rate must be below 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test API endpoints
  
  // Test letters API
  let response = http.get(`${BASE_URL}/api/letters`);
  check(response, {
    'letters API responds': (r) => r.status === 200,
    'letters API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  });

  sleep(0.5);

  // Test user profile API
  response = http.get(`${BASE_URL}/api/user/profile`);
  check(response, {
    'profile API responds': (r) => r.status === 200 || r.status === 401,
  });

  sleep(0.5);

  // Test search API
  response = http.get(`${BASE_URL}/api/search?query=test`);
  check(response, {
    'search API responds': (r) => r.status === 200,
    'search API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  });

  sleep(0.5);

  // Test projects API
  response = http.get(`${BASE_URL}/api/projects`);
  check(response, {
    'projects API responds': (r) => r.status === 200,
    'projects API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  });

  sleep(0.5);

  // Test donations API
  response = http.get(`${BASE_URL}/api/donations`);
  check(response, {
    'donations API responds': (r) => r.status === 200 || r.status === 401,
  });

  sleep(0.5);

  // Test admin stats API (should return 401 for non-admin users)
  response = http.get(`${BASE_URL}/api/admin/stats`);
  check(response, {
    'admin stats API responds': (r) => r.status === 401, // Should be unauthorized
  });

  sleep(0.5);

  // Test WebSocket connection (if available)
  // Note: k6 doesn't have native WebSocket support, but we can test the endpoint
  response = http.get(`${BASE_URL}/api/socket`);
  check(response, {
    'socket endpoint responds': (r) => r.status === 200 || r.status === 404,
  });

  sleep(1);
}
