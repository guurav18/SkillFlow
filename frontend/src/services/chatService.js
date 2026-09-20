import api from './api';

export const chatService = {
  async getProjectMessages(projectId) {
    const response = await api.get(`/projects/${projectId}/messages`);
    return response.data;
  },

  async sendMessage(projectId, content) {
    const response = await api.post(`/projects/${projectId}/messages`, { content });
    return response.data;
  },
};
