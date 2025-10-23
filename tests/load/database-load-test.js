import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 20 },  // Ramp up to 20 users
    { duration: '5m', target: 20 },  // Stay at 20 users
    { duration: '2m', target: 40 },  // Ramp up to 40 users
    { duration: '5m', target: 40 },  // Stay at 40 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test database-heavy operations
  
  // Test creating a project (database write)
  let response = http.post(`${BASE_URL}/api/projects`, JSON.stringify({
    title: `Load Test Project ${Math.random()}`,
    description: 'This is a load test project',
    story: 'Load test story',
    fundingGoal: 10000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Political Campaign',
    tags: ['load-test']
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'project creation responds': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);

  // Test fetching projects with pagination (database read)
  response = http.get(`${BASE_URL}/api/projects?page=1&limit=10`);
  check(response, {
    'projects pagination responds': (r) => r.status === 200,
    'projects pagination returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  });

  sleep(0.5);

  // Test fetching letters (database read)
  response = http.get(`${BASE_URL}/api/letters`);
  check(response, {
    'letters fetch responds': (r) => r.status === 200,
    'letters fetch returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  });

  sleep(0.5);

  // Test completing a letter (database write)
  response = http.post(`${BASE_URL}/api/letters/complete`, JSON.stringify({
    letterId: '1'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'letter completion responds': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);

  // Test user profile update (database write)
  response = http.put(`${BASE_URL}/api/user/profile`, JSON.stringify({
    name: `Load Test User ${Math.random()}`,
    bio: 'Load test bio'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'profile update responds': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);

  // Test search with complex queries (database read)
  response = http.get(`${BASE_URL}/api/search?query=test&type=project&type=letter`);
  check(response, {
    'complex search responds': (r) => r.status === 200,
    'complex search returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  });

  sleep(0.5);

  // Test analytics data (database aggregation)
  response = http.get(`${BASE_URL}/api/analytics/dashboard`);
  check(response, {
    'analytics responds': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);
}
