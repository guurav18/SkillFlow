const assert = require('assert');
const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  return { status: response.status, data };
}

async function runTests() {
  console.log('🚀 Starting Phase 1 Backend API Integration Tests...\n');

  try {
    // 1. Health check
    console.log('1️⃣ Testing /api/health');
    const health = await request('/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.platform, 'WorkFlow AI');
    console.log('   ✅ Health check passed.');

    // 2. Client Login
    console.log('\n2️⃣ Testing Client Login');
    const clientLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'client@workflowai.com',
        password: 'password123',
      }),
    });
    assert.strictEqual(clientLogin.status, 200);
    assert.strictEqual(clientLogin.data.user.role, 'client');
    const clientToken = clientLogin.data.token;
    console.log('   ✅ Client logged in successfully.');

    // 3. Freelancer Login
    console.log('\n3️⃣ Testing Freelancer Login');
    const freelancerLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'freelancer@workflowai.com',
        password: 'password123',
      }),
    });
    assert.strictEqual(freelancerLogin.status, 200);
    assert.strictEqual(freelancerLogin.data.user.role, 'freelancer');
    const freelancerToken = freelancerLogin.data.token;
    console.log('   ✅ Freelancer logged in successfully.');

    // 4. Admin Login
    console.log('\n4️⃣ Testing Admin Login');
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@workflowai.com',
        password: 'password123',
      }),
    });
    assert.strictEqual(adminLogin.status, 200);
    assert.strictEqual(adminLogin.data.user.role, 'admin');
    const adminToken = adminLogin.data.token;
    console.log('   ✅ Admin logged in successfully.');

    // 5. Auth /me endpoint
    console.log('\n5️⃣ Testing /api/auth/me');
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data.user.email, 'client@workflowai.com');
    console.log('   ✅ /api/auth/me token verification passed.');

    // 6. Client Creates Project
    console.log('\n6️⃣ Testing Client Creates Project');
    const newProjectRes = await request('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Next.js AI Integration Test Project',
        description: 'Comprehensive test project requiring full stack skills and clean architecture.',
        category: 'AI & Machine Learning',
        skills: ['Next.js', 'Node.js', 'Python', 'OpenAI'],
        budget: 4500,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
      }),
    });
    assert.strictEqual(newProjectRes.status, 201);
    const createdProject = newProjectRes.data.project;
    assert.strictEqual(createdProject.status, 'open');
    console.log(`   ✅ Project created: ID ${createdProject._id}`);

    // 7. Role check: Freelancer cannot create project
    console.log('\n7️⃣ Testing Role Guard (Freelancer cannot create project)');
    const failCreateRes = await request('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        title: 'Unauthorized Project',
        description: 'Should fail',
        budget: 1000,
        deadline: new Date().toISOString(),
        skills: ['React'],
      }),
    });
    assert.strictEqual(failCreateRes.status, 403);
    console.log('   ✅ Role restriction verified (403 Forbidden).');

    // 8. Freelancer Browses Projects & Searches
    console.log('\n8️⃣ Testing Freelancer Browses & Searches Projects');
    const searchRes = await request('/api/projects?search=Integration');
    assert.strictEqual(searchRes.status, 200);
    assert(searchRes.data.projects.length >= 1);
    console.log(`   ✅ Project search returned ${searchRes.data.projects.length} matching project(s).`);

    // 9. Freelancer Applies to Project
    console.log('\n9️⃣ Testing Freelancer Applies to Project');
    const applyRes = await request(`/api/projects/${createdProject._id}/apply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        proposal: 'I have extensive experience with Next.js and AI APIs. Ready to start immediately!',
        bidAmount: 4200,
        estimatedDays: 14,
      }),
    });
    assert.strictEqual(applyRes.status, 201);
    const applicationId = applyRes.data.application._id;
    console.log('   ✅ Application submitted successfully.');

    // 10. Duplicate Application Prevention
    console.log('\n🔟 Testing Duplicate Application Prevention');
    const dupApplyRes = await request(`/api/projects/${createdProject._id}/apply`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        proposal: 'Duplicate application attempt.',
        bidAmount: 4000,
      }),
    });
    assert.strictEqual(dupApplyRes.status, 400);
    console.log('   ✅ Duplicate application blocked successfully (400 Bad Request).');

    // 11. Client Views Applications for Project
    console.log('\n1️⃣1️⃣ Testing Client Views Applications');
    const appsRes = await request(`/api/projects/${createdProject._id}/applications`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert.strictEqual(appsRes.status, 200);
    assert.strictEqual(appsRes.data.applications.length, 1);
    assert.strictEqual(appsRes.data.applications[0].freelancer.email, 'freelancer@workflowai.com');
    console.log('   ✅ Client retrieved application list.');

    // 12. Client Hires Freelancer
    console.log('\n1️⃣2️⃣ Testing Client Hires Freelancer');
    const hireRes = await request(`/api/projects/${createdProject._id}/hire`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        applicationId: applicationId,
      }),
    });
    assert.strictEqual(hireRes.status, 200);
    assert.strictEqual(hireRes.data.project.status, 'assigned');
    assert.strictEqual(hireRes.data.acceptedApplication.status, 'accepted');
    console.log('   ✅ Freelancer hired! Project status set to assigned, application accepted.');

    // 13. Freelancer checks My Projects (should now include assigned project)
    console.log('\n1️⃣3️⃣ Testing Freelancer My Projects (Assigned/Hired Projects)');
    const myProjectsRes = await request('/api/projects/my', {
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });
    assert.strictEqual(myProjectsRes.status, 200);
    const hiredProject = myProjectsRes.data.projects.find((p) => p._id === createdProject._id);
    assert(hiredProject, 'Assigned project must be in Freelancer My Projects');
    console.log('   ✅ Freelancer sees assigned project in My Projects.');

    // 14. Admin Statistics
    console.log('\n1️⃣4️⃣ Testing Admin Dashboard Statistics');
    const adminStats = await request('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminStats.status, 200);
    assert(adminStats.data.stats.totalUsers >= 3);
    assert(adminStats.data.stats.totalProjects >= 4);
    assert(adminStats.data.stats.assignedProjects >= 1);
    console.log('   ✅ Admin stats verified successfully.');

    console.log('\n🎉 ALL PHASE 1 BACKEND API TESTS PASSED SUCCESSFULLY! 🚀\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failure:', err);
    process.exit(1);
  }
}

runTests();
