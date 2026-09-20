import api from './api';

export const milestoneService = {
  async getProjectMilestones(projectId) {
    const response = await api.get(`/projects/${projectId}/milestones`);
    return response.data;
  },

  async createMilestone(projectId, milestoneData) {
    const response = await api.post(`/projects/${projectId}/milestones`, milestoneData);
    return response.data;
  },

  async updateMilestone(milestoneId, updates) {
    const response = await api.put(`/milestones/${milestoneId}`, updates);
    return response.data;
  },

  async deleteMilestone(milestoneId) {
    const response = await api.delete(`/milestones/${milestoneId}`);
    return response.data;
  },
};
