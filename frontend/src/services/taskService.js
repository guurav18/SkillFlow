import api from './api';

export const taskService = {
  async getProjectTasks(projectId, params = {}) {
    const response = await api.get(`/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  async createTask(projectId, taskData) {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  async getTaskById(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  async updateTask(taskId, updates) {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.data;
  },

  async submitForReview(taskId) {
    const response = await api.post(`/tasks/${taskId}/submit-review`);
    return response.data;
  },

  async approveTask(taskId) {
    const response = await api.post(`/tasks/${taskId}/approve`);
    return response.data;
  },

  async requestChanges(taskId, reviewComment) {
    const response = await api.post(`/tasks/${taskId}/request-changes`, { reviewComment });
    return response.data;
  },

  async getGlobalWorkflow() {
    const response = await api.get('/tasks/workflow');
    return response.data;
  },

  // Returns freelancers hired for this specific project (for task assignment dropdown)
  async getProjectFreelancers(projectId) {
    const response = await api.get(`/projects/${projectId}/freelancers`);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },
};
