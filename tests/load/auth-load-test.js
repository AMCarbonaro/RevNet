import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test authentication endpoints
  let response = http.get(`${BASE_URL}/auth/signin`);
  check(response, {
    'signin page loads': (r) => r.status === 200,
    'signin page has correct content': (r) => r.body.includes('Sign In'),
  });

  sleep(1);

  // Test demo sign in
  response = http.post(`${BASE_URL}/api/auth/signin`, {
    email: 'demo@revolutionnetwork.com',
    password: 'demo123'
  });
  check(response, {
    'demo signin works': (r) => r.status === 200 || r.status === 302,
  });

  sleep(1);

  // Test dashboard access
  response = http.get(`${BASE_URL}/dashboard`);
  check(response, {
    'dashboard loads': (r) => r.status === 200,
    'dashboard has correct content': (r) => r.body.includes('Dashboard'),
  });

  sleep(1);

  // Test letters endpoint
  response = http.get(`${BASE_URL}/letters`);
  check(response, {
    'letters page loads': (r) => r.status === 200,
    'letters page has correct content': (r) => r.body.includes('Letters'),
  });

  sleep(1);

  // Test projects endpoint
  response = http.get(`${BASE_URL}/projects`);
  check(response, {
    'projects page loads': (r) => r.status === 200,
    'projects page has correct content': (r) => r.body.includes('Projects'),
  });

  sleep(1);
}
