import api from './api';

export const businessService = {
  async getAnalytics(role) {
    const response = await api.get(`/analytics/${role}`);
    return response.data;
  },
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },
  async markNotificationRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  async markAllNotificationsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  async getInvoices() {
    const response = await api.get('/invoices');
    return response.data;
  },
  async getProjectPayments(projectId) {
    const response = await api.get(`/payments/project/${projectId}`);
    return response.data;
  },
  async createPaymentOrder(projectId, milestoneId) {
    const response = await api.post('/payments/create-order', { projectId, milestoneId });
    return response.data;
  },
  async verifyPayment(payload) {
    const response = await api.post('/payments/verify', payload);
    return response.data;
  },
};