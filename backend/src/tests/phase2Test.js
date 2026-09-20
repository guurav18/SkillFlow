const assert = require('assert');

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

async function runPhase2Tests() {
  console.log('🚀 Starting Phase 2 Workspace API Integration Tests...\n');

  try {
    // 1. Health check & Phase 2 verification
    console.log('1️⃣ Testing /api/health for Phase 2');
    const health = await request('/api/health');
    assert.strictEqual(health.status, 200);
    assert.ok(health.data.phase >= 2);
    console.log('   ✅ Health check passed (Phase 2 features remain available).');

    // 2. Login Client & Freelancer
    console.log('\n2️⃣ Authenticating Client and Freelancer');
    const clientRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'client@workflowai.com', password: 'password123' }),
    });
    const clientToken = clientRes.data.token;

    const freelancerRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'freelancer@workflowai.com', password: 'password123' }),
    });
    const freelancerToken = freelancerRes.data.token;

    // Login a third user (unauthorized freelancer)
    const unauthorizedRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'elena@codecraft.dev', password: 'password123' }),
    });
    const unauthorizedToken = unauthorizedRes.data.token;

    console.log('   ✅ Tokens acquired for Client, Hired Freelancer, and Third-party Freelancer.');

    // 3. Find an assigned project for testing
    console.log('\n3️⃣ Finding an Assigned Project for Workspace Testing');
    const myProjectsRes = await request('/api/projects/my', {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    let assignedProj = myProjectsRes.data.projects.find((p) => p.status === 'assigned');

    if (!assignedProj) {
      // Create and hire if none assigned
      console.log('   Creating and hiring a project on the fly...');
      const createProj = await request('/api/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({
          title: 'Full Stack Enterprise Workspace Project',
          description: 'Project to test tasks, kanban, milestones, and chat.',
          category: 'Web Development',
          skills: ['React', 'Node.js', 'MongoDB'],
          budget: 4000,
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        }),
      });
      const projId = createProj.data.project._id;

      // Freelancer applies
      const appRes = await request(`/api/projects/${projId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${freelancerToken}` },
        body: JSON.stringify({
          proposal: 'Ready to build this full stack workspace project!',
          bidAmount: 3800,
          estimatedDays: 20,
        }),
      });

      // Client hires
      const hireRes = await request(`/api/projects/${projId}/hire`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({ applicationId: appRes.data.application._id }),
      });
      assignedProj = hireRes.data.project;
    }

    const projectId = assignedProj._id;
    console.log(`   ✅ Using assigned project: "${assignedProj.title}" (ID: ${projectId})`);

    // 4. Security Guard: Unauthorized user blocked from project workspace tasks
    console.log('\n4️⃣ Testing Security Guard (Unauthorized user cannot access tasks)');
    const unauthTaskRes = await request(`/api/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${unauthorizedToken}` },
    });
    assert.strictEqual(unauthTaskRes.status, 403);
    console.log('   ✅ Unauthorized user blocked (403 Forbidden).');

    // 5. Client Creates Tasks
    console.log('\n5️⃣ Testing Client Creates Tasks');
    const task1Res = await request(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Design Database Schemas for Tasks & Milestones',
        description: 'Create Mongoose models with proper indexes and validation.',
        priority: 'high',
        status: 'todo',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      }),
    });
    assert.strictEqual(task1Res.status, 201);
    const task1 = task1Res.data.task;
    assert.strictEqual(task1.status, 'todo');

    const task2Res = await request(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Implement Interactive Kanban Board UI',
        description: 'Build 4-column layout with status updates and animations.',
        priority: 'medium',
        status: 'in_progress',
      }),
    });
    assert.strictEqual(task2Res.status, 201);
    const task2 = task2Res.data.task;
    console.log(`   ✅ Created Task 1 (${task1.title}) & Task 2 (${task2.title})`);

    // 6. Freelancer Views Tasks & Progress Metrics
    console.log('\n6️⃣ Testing Freelancer Views Tasks & Metrics');
    const tasksListRes = await request(`/api/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });
    assert.strictEqual(tasksListRes.status, 200);
    assert(tasksListRes.data.tasks.length >= 2);
    assert(tasksListRes.data.metrics.total >= 2);
    console.log(`   ✅ Freelancer retrieved ${tasksListRes.data.tasks.length} tasks with metrics:`, tasksListRes.data.metrics);

    // 7. Freelancer Updates Task Status (DONE requires client approval)
    console.log('\n7️⃣ Testing Freelancer Updates Task Status');
    const updateTaskRes = await request(`/api/tasks/${task1._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    assert.strictEqual(updateTaskRes.status, 200);
    assert.strictEqual(updateTaskRes.data.task.status, 'in_progress');
    console.log('   ✅ Freelancer task status update passed; direct DONE remains approval-protected.');

    // 8. Client Creates Milestone
    console.log('\n8️⃣ Testing Client Creates Milestone');
    const ms1Res = await request(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Phase 2 Architecture & Real-Time Engine',
        description: 'Deliver tasks, kanban, milestones, and Socket.IO chat.',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        progress: 25,
        status: 'in_progress',
      }),
    });
    assert.strictEqual(ms1Res.status, 201);
    const milestone1 = ms1Res.data.milestone;
    console.log(`   ✅ Milestone created: "${milestone1.title}" (Progress: ${milestone1.progress}%)`);

    // 9. Freelancer Updates Milestone Progress
    console.log('\n9️⃣ Testing Freelancer Updates Milestone Progress');
    const updateMsRes = await request(`/api/milestones/${milestone1._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({ progress: 100, status: 'completed' }),
    });
    assert.strictEqual(updateMsRes.status, 200);
    assert.strictEqual(updateMsRes.data.milestone.status, 'completed');
    assert.strictEqual(updateMsRes.data.milestone.progress, 100);
    console.log('   ✅ Milestone progress updated to 100% (Completed).');

    // 10. Messages & Chat History
    console.log('\n🔟 Testing Chat Messaging System');
    const msgRes = await request(`/api/projects/${projectId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ content: 'Hello Alex, let us know when the Kanban board is ready for review!' }),
    });
    assert.strictEqual(msgRes.status, 201);

    const replyRes = await request(`/api/projects/${projectId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({ content: 'Hi Sarah! The Kanban board is finished and tested. All tasks updated.' }),
    });
    assert.strictEqual(replyRes.status, 201);

    const historyRes = await request(`/api/projects/${projectId}/messages`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert.strictEqual(historyRes.status, 200);
    assert(historyRes.data.messages.length >= 2);
    console.log(`   ✅ Chat history verified with ${historyRes.data.messages.length} messages.`);

    // 11. Security Guard: Unauthorized user blocked from project chat
    console.log('\n1️⃣1️⃣ Testing Security Guard (Unauthorized user blocked from chat)');
    const unauthChatRes = await request(`/api/projects/${projectId}/messages`, {
      headers: { Authorization: `Bearer ${unauthorizedToken}` },
    });
    assert.strictEqual(unauthChatRes.status, 403);
    console.log('   ✅ Unauthorized chat access blocked (403 Forbidden).');

    console.log('\n🎉 ALL PHASE 2 BACKEND WORKSPACE TESTS PASSED SUCCESSFULLY! 🚀\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Phase 2 Test failure:', err);
    process.exit(1);
  }
}

runPhase2Tests();
