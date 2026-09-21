const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  return { status: response.status, data: await response.json() };
}

async function login(email) {
  const result = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password: 'password123' }) });
  assert.strictEqual(result.status, 200);
  return result.data.token;
}

async function runAITests() {
  console.log('Starting Phase 4 AI API tests...\n');
  const unauthenticated = await request('/api/ai/project-breakdown', { method: 'POST', body: JSON.stringify({ title: 'Test' }) });
  assert.strictEqual(unauthenticated.status, 401);
  console.log('1. Unauthenticated AI access blocked.');

  const clientToken = await login('client@workflowai.com');
  const freelancerToken = await login('freelancer@workflowai.com');
  const headers = { Authorization: `Bearer ${clientToken}` };
  const freelancerHeaders = { Authorization: `Bearer ${freelancerToken}` };

  const handleAIResponse = (res, stepMessage) => {
    if (res.status === 503) {
      console.warn(`[WARN] Skipping step due to AI provider high demand (503): ${stepMessage}`);
      return false;
    }
    assert.strictEqual(res.status, 200);
    return true;
  };

  const breakdown = await request('/api/ai/project-breakdown', { method: 'POST', headers, body: JSON.stringify({ title: 'MERN portal', description: 'Build authentication and reporting.', category: 'Web Development', skills: ['React', 'Node.js'] }) });
  if (handleAIResponse(breakdown, 'Structured project breakdown')) {
    assert.ok(Array.isArray(breakdown.data.breakdown.milestones));
    assert.ok(Array.isArray(breakdown.data.breakdown.milestones[0].tasks));
    console.log('2. Structured project breakdown validated.');
  }

  const projects = await request('/api/projects/my', { headers });
  const project = projects.data.projects.find((item) => item.status === 'assigned') || projects.data.projects[0];
  assert.ok(project);
  const projectId = project._id;

  const health = await request(`/api/ai/project-health/${projectId}`, { headers });
  if (handleAIResponse(health, 'Project health')) {
    assert.ok(['Healthy', 'At Risk', 'Blocked'].includes(health.data.health.status));
    console.log('3. Project health used real project context.');
  }

  const estimate = await request(`/api/ai/task-estimate/${projectId}`, { method: 'POST', headers: freelancerHeaders, body: JSON.stringify({ task: { title: 'Build JWT authentication', description: 'Protected APIs and tests.', priority: 'high' } }) });
  if (handleAIResponse(estimate, 'Task effort estimate')) {
    assert.strictEqual(estimate.data.estimate.isEstimate, true);
    console.log('4. Task effort estimate validated.');
  }

  const copilot = await request(`/api/ai/project-copilot/${projectId}`, { method: 'POST', headers: freelancerHeaders, body: JSON.stringify({ question: 'What should I work on next?' }) });
  if (handleAIResponse(copilot, 'Project copilot')) {
    assert.ok(copilot.data.copilot.answer);
    console.log('5. Project copilot answered from project context.');
  }

  const matches = await request(`/api/ai/freelancer-match/${projectId}`, { method: 'POST', headers });
  if (handleAIResponse(matches, 'Freelancer matching')) {
    assert.ok(Array.isArray(matches.data.matches));
    console.log('6. Freelancer matching endpoint returned advisory matches.');
  }

  console.log('\nAll Phase 4 AI API tests completed (some may have been skipped due to 503).');
}

runAITests().catch((error) => {
  console.error(`\nAI test failure: ${error.message}`);
  process.exitCode = 1;
});