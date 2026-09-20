import api from './api';

export const applicationService = {
  async applyToProject(projectId, applicationData) {
    const response = await api.post(`/projects/${projectId}/apply`, applicationData);
    return response.data;
  },

  async getProjectApplications(projectId) {
    const response = await api.get(`/projects/${projectId}/applications`);
    return response.data;
  },

  async getMyApplications() {
    const response = await api.get('/applications/my');
    return response.data;
  },
};
