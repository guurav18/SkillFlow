import api from './api';

export const freelancerService = {
  /**
   * Fetch paginated list of freelancers with filters
   * @param {Object} params - { search, skill, minRate, maxRate, sort, page, limit }
   */
  async getFreelancers(params = {}) {
    const response = await api.get('/freelancers', { params });
    return response.data;
  },

  /**
   * Fetch single freelancer's full public profile with completed projects & reviews
   * @param {string} id - Freelancer User ID
   */
  async getFreelancerById(id) {
    const response = await api.get(`/freelancers/${id}`);
    return response.data;
  },

  /**
   * Submit client review for a freelancer
   * @param {string} id - Freelancer User ID
   * @param {Object} reviewData - { rating, qualityRating, communicationRating, deadlineRating, comment, projectId }
   */
  async submitReview(id, reviewData) {
    const response = await api.post(`/freelancers/${id}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Invite freelancer to an open client project
   * @param {string} id - Freelancer User ID
   * @param {Object} inviteData - { projectId, message }
   */
  async inviteFreelancer(id, inviteData) {
    const response = await api.post(`/freelancers/${id}/invite`, inviteData);
    return response.data;
  },
};
