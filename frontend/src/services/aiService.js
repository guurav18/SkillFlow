import api from './api';

export const aiService = {
  async generateBreakdown(requirement) {
    const response = await api.post('/ai/project-breakdown', requirement);
    return response.data;
  },
  async getMatches(projectId) {
    const response = await api.post(`/ai/freelancer-match/${projectId}`);
    return response.data;
  },
  async estimateTask(projectId, task) {
    const response = await api.post(`/ai/task-estimate/${projectId}`, { task });
    return response.data;
  },
  async getHealth(projectId) {
    const response = await api.get(`/ai/project-health/${projectId}`);
    return response.data;
  },
  async askCopilot(projectId, question) {
    const response = await api.post(`/ai/project-copilot/${projectId}`, { question });
    return response.data;
  },
};