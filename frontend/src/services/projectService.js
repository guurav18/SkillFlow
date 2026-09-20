import api from './api';

export const projectService = {
  async getProjects(params = {}) {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  async getProjectById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  async getMyProjects() {
    const response = await api.get('/projects/my');
    return response.data;
  },

  async hireFreelancer(projectId, payload) {
    const response = await api.post(`/projects/${projectId}/hire`, payload);
    return response.data;
  },
};
