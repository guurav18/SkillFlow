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

async function runWorkflowTests() {
  console.log('🚀 Starting Task Review & Approval Workflow Automated Tests...\n');

  try {
    // 1. Authenticate Client & Freelancer
    console.log('1️⃣ Authenticating Client and Freelancer');
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

    // 2. Get assigned project
    console.log('\n2️⃣ Finding Assigned Project');
    const myProjectsRes = await request('/api/projects/my', {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const assignedProj = myProjectsRes.data.projects.find((p) => p.status === 'assigned');
    assert(assignedProj, 'Need an assigned project for testing');
    const projectId = assignedProj._id;
    console.log(`   ✅ Using project: "${assignedProj.title}" (ID: ${projectId})`);

    // 3. Client creates task
    console.log('\n3️⃣ Client Creates Task in Workspace');
    const createTaskRes = await request(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Build Secure User Profile Upload Component',
        description: 'Implement drag-and-drop avatar upload with crop functionality.',
        priority: 'high',
        status: 'todo',
      }),
    });
    assert.strictEqual(createTaskRes.status, 201);
    const task = createTaskRes.data.task;
    console.log(`   ✅ Task created: "${task.title}" (ID: ${task._id})`);

    // 4. Freelancer moves task to IN_PROGRESS
    console.log('\n4️⃣ Freelancer Moves Task to IN_PROGRESS');
    const inProgRes = await request(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    assert.strictEqual(inProgRes.status, 200);
    assert.strictEqual(inProgRes.data.task.status, 'in_progress');
    console.log('   ✅ Task status is now in_progress.');

    // 5. Backend Enforcement: Freelancer CANNOT mark task DONE directly
    console.log('\n5️⃣ Backend Guard: Freelancer attempts to set status DONE directly');
    const illegalDoneRes = await request(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({ status: 'done' }),
    });
    assert.strictEqual(illegalDoneRes.status, 403);
    console.log('   ✅ Backend blocked freelancer direct DONE transition (403 Forbidden).');

    // 6. Freelancer Submits Task for Review
    console.log('\n6️⃣ Freelancer Submits Task for Review');
    const submitReviewRes = await request(`/api/tasks/${task._id}/submit-review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });
    assert.strictEqual(submitReviewRes.status, 200);
    assert.strictEqual(submitReviewRes.data.task.status, 'review');
    assert(submitReviewRes.data.task.submittedForReviewAt);
    console.log('   ✅ Task submitted for review. Status is now "review".');

    // 7. Client Checks Global Workflow (Awaiting Review)
    console.log('\n7️⃣ Client Checks Global Workflow (Pending Action Count)');
    const clientWorkflow1 = await request('/api/tasks/workflow', {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert.strictEqual(clientWorkflow1.status, 200);
    assert(clientWorkflow1.data.pendingActionCount >= 1, 'Client should have at least 1 pending review action');
    console.log(`   ✅ Client sees ${clientWorkflow1.data.pendingActionCount} task(s) awaiting review.`);

    // 8. Client Requests Changes with Comments
    console.log('\n8️⃣ Client Requests Changes with Feedback Comment');
    const requestChangesRes = await request(`/api/tasks/${task._id}/request-changes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        reviewComment: 'Please add image compression before upload and handle SVG formats.',
      }),
    });
    assert.strictEqual(requestChangesRes.status, 200);
    assert.strictEqual(requestChangesRes.data.task.status, 'in_progress');
    assert.strictEqual(requestChangesRes.data.task.changesRequested, true);
    assert.strictEqual(
      requestChangesRes.data.task.reviewComment,
      'Please add image compression before upload and handle SVG formats.'
    );
    console.log('   ✅ Changes requested. Task moved back to in_progress with comment saved.');

    // 9. Freelancer Checks Global Workflow (Changes Requested)
    console.log('\n9️⃣ Freelancer Checks Global Workflow (Changes Requested)');
    const freelancerWorkflow = await request('/api/tasks/workflow', {
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });
    assert.strictEqual(freelancerWorkflow.status, 200);
    assert(freelancerWorkflow.data.pendingActionCount >= 1, 'Freelancer should have pending changes action');
    const foundTask = freelancerWorkflow.data.tasks.find((t) => t._id === task._id);
    assert(foundTask.changesRequested, 'Task must flag changesRequested as true');
    console.log('   ✅ Freelancer sees changes requested alert in global workflow.');

    // 10. Freelancer Resubmits for Review
    console.log('\n🔟 Freelancer Resubmits Task for Review');
    const resubmitRes = await request(`/api/tasks/${task._id}/submit-review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });
    assert.strictEqual(resubmitRes.status, 200);
    assert.strictEqual(resubmitRes.data.task.status, 'review');
    assert.strictEqual(resubmitRes.data.task.changesRequested, false);
    console.log('   ✅ Task resubmitted for review.');

    // 11. Client Approves Task
    console.log('\n1️⃣1️⃣ Client Approves Task');
    const approveRes = await request(`/api/tasks/${task._id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.data.task.status, 'done');
    assert(approveRes.data.task.approvedBy);
    assert(approveRes.data.task.approvedAt);
    console.log('   ✅ Task officially approved and marked as DONE by client.');

    console.log('\n🎉 ALL TASK REVIEW & APPROVAL WORKFLOW TESTS PASSED SUCCESSFULLY! 🚀\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Workflow test failure:', err);
    process.exit(1);
  }
}

runWorkflowTests();
