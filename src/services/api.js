/**
 * @fileoverview API Service for Subg App
 * 
 * This service handles all HTTP requests to the backend API.
 * It includes methods for authentication, quizzes, subscriptions,
 * payments, user management, and admin operations.
 * 
 * @author Subg Development Team
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/env';

// Try to import NetInfo, fallback to mock if not available
let NetInfo;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (error) {
  console.warn('NetInfo not available in API service, using mock implementation:', error.message);
  NetInfo = require('./NetInfoMock').default;
}
// Env-based API URL with sensible dev/prod fallbacks
// Allow building without Node types
const API_BASE_URL = API_URL;

/**
 * API Service class for handling all HTTP requests to the backend
 * @class ApiService
 */
class ApiService {
  /**
   * @param {string} baseURL - The base URL for API requests
   */
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Private method to handle all HTTP requests
   * @param {string} endpoint - The API endpoint to call
   * @param {Object} options - Request options including method, headers, body
   * @returns {Promise<any>} The response data
   */
  async request(endpoint, options = {}) {
    // Check network connectivity before making request
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const networkError = new Error('No internet connection. Please check your network settings.');
      networkError.isNetworkError = true;
      networkError.isOffline = true;
      throw networkError;
    }

    if (netInfo.isConnected && netInfo.isInternetReachable === false) {
      const networkError = new Error('Connected but internet is not accessible. Please check your connection.');
      networkError.isNetworkError = true;
      networkError.isLimitedConnection = true;
      throw networkError;
    }

    const url = `${this.baseURL}${endpoint}`;
    const token = await AsyncStorage.getItem('token');

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      // Add timeout to prevent hanging requests - longer timeout for profile requests
      const controller = new AbortController();
      const isProfileRequest = endpoint.includes('/profile') || endpoint.includes('/student/profile');
      const timeoutDuration = isProfileRequest ? 15000 : 10000; // 15s for profile, 10s for others
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error();
        error.response = { status: response.status, data };
        error.message = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.response) {
        throw error;
      }

      if (error.name === 'AbortError') {
        const abortError = new Error('Request timeout. Please check your connection and try again.');
        abortError.name = 'AbortError';
        abortError.isTimeout = true;
        throw abortError;
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to connect to server. Please check your internet connection.');
        networkError.isNetworkError = true;
        throw networkError;
      }

      if (!error.message) {
        error.message = 'An unexpected error occurred. Please try again.';
      }

      throw error;
    }
  }

  // ===== AUTH ENDPOINTS =====
  /**
   * Login user with credentials
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.identifier - Email or username
   * @param {string} credentials.password - User password
   * @returns {Promise<any>} Login response
   */
  async login(credentials) {
    console.log('API Login Request:', { endpoint: '/api/auth/login', credentials: { ...credentials, password: '[HIDDEN]' } });
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<any>} Registration response
   */
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Google authentication
   * @param {Object} googleData - Google auth data
   * @returns {Promise<any>} Auth response
   */
  async googleAuth(googleData) {
    return this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<any>} Update response
   */
  async updateProfile(profileData) {
    return this.request('/api/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Send forgot password email
   * @param {string} email - User email
   * @returns {Promise<any>} Response
   */
  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Reset password with token
   * @param {Object} data - Reset password data
   * @returns {Promise<any>} Response
   */
  async resetPassword(data) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===== STUDENT ENDPOINTS =====
  async getProfile() {
    return this.request('/api/student/profile');
  }

  /**
   * Get quiz leaderboard
   * @param {string} quizId - Quiz ID
   * @returns {Promise<any>} Leaderboard data
   */
  async getQuizLeaderboard(quizId) {
    return this.request(`/api/student/leaderboard/quiz/${quizId}`);
  }

  // ===== QUIZ ENDPOINTS =====
  async getCategories() {
    return this.request('/api/student/categories');
  }

  /**
   * Get subcategories for a category
   * @param {string} categoryId - Category ID
   * @returns {Promise<any>} Subcategories data
   */
  async getSubcategories(categoryId) {
    return this.request(`/api/student/subcategories?category=${categoryId}`);
  }

  async getSubCategories(categoryId) {
    return this.request(`/api/student/subcategories?category=${categoryId}`);
  }

  async getCategoryQuizzes(categoryId) {
    return this.request(`/api/student/quizzes?category=${categoryId}`);
  }

  /**
   * Get quiz by ID
   * @param {string} id - Quiz ID
   * @returns {Promise<any>} Quiz data
   */
  async getQuizById(id) {
    return this.request(`/api/student/quizzes/${id}`);
  }

  /**
   * Submit quiz answers
   * @param {string} quizId - Quiz ID
   * @param {Object} answers - Quiz answers
   * @returns {Promise<any>} Submission response
   */
  async submitQuiz(quizId, answers) {
    return this.request(`/api/student/quizzes/${quizId}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  /**
   * Get quiz result
   * @param {string} quizId - Quiz ID
   * @returns {Promise<any>} Quiz result
   */
  async getQuizResult(quizId) {
    return this.request(`/api/student/quizzes/${quizId}/result`);
  }

  // ===== LEVEL-BASED QUIZ ENDPOINTS =====
  async getHomePageData() {
    return this.request('/api/student/homepage-data');
  }

  /**
   * Get level-based quizzes
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Quizzes data
   */
  async getLevelQuizzes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/levels/quizzes?${queryString}`);
  }

  async getAllLevels() {
    return this.request('/api/levels/all-with-quiz-count');
  }

  /**
   * Get level-based quizzes for student
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Quizzes data
   */
  async getLevelBasedQuizzes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/student/quizzes/level-based?${queryString}`);
  }

  /**
   * Get quiz history
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Quiz history
   */
  async getQuizHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/levels/history?${queryString}`);
  }

  // ===== SEARCH ENDPOINTS =====
  /**
   * Search all content
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results limit
   * @returns {Promise<any>} Search results
   */
  async searchAll({ query = '', page = 1, limit = 12 } = {}) {
    const searchQuery = new URLSearchParams({ query, page: page.toString(), limit: limit.toString() }).toString();
    return this.request(`/api/search?${searchQuery}`);
  }

  // ===== SUBSCRIPTION ENDPOINTS =====
  /**
   * Get subscription status
   * @param {string} userId - User ID
   * @returns {Promise<any>} Subscription status
   */
  async getSubscriptionStatus(userId) {
    return this.request(`/api/subscription/status/${userId}`);
  }

  /**
   * Get subscription transactions
   * @param {string} userId - User ID
   * @returns {Promise<any>} Transaction data
   */
  async getSubscriptionTransactions(userId) {
    return this.request(`/api/subscription/transactions/${userId}`);
  }

  /**
   * Get user payment transactions
   * @param {Object} filters - Filter parameters
   * @returns {Promise<any>} Transaction data
   */
  async getUserPaymentTransactions(filters = {}) {
    const queryParams = {};
    
    if (filters.month) queryParams.month = filters.month;
    if (filters.year) queryParams.year = filters.year;
    if (filters.type) queryParams.type = filters.type;
    if (filters.status) queryParams.status = filters.status;
    if (filters.limit) queryParams.limit = filters.limit;
    if (filters.page) queryParams.page = filters.page;
    
    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = `/api/subscription/payment-transactions${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getTransactionFilterOptions() {
    return this.request('/api/subscription/transaction-filters');
  }

  // ===== PAYU PAYMENT ENDPOINTS =====
  /**
   * Create PayU subscription order
   * @param {Object} orderData - Order data
   * @returns {Promise<any>} Order response
   */
  async createPayuSubscriptionOrder(orderData) {
    return this.request('/api/subscription/create-payu-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Verify PayU subscription
   * @param {Object} verificationData - Verification data
   * @returns {Promise<any>} Verification response
   */
  async verifyPayuSubscription(verificationData) {
    return this.request('/api/subscription/verify-payu', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  // ===== BANK DETAILS ENDPOINTS =====
  /**
   * Save bank details
   * @param {Object} bankData - Bank details data
   * @returns {Promise<any>} Save response
   */
  async saveBankDetails(bankData) {
    return this.request('/api/bank-details', {
      method: 'POST',
      body: JSON.stringify(bankData),
    });
  }

  async getBankDetails() {
    return this.request('/api/bank-details/my-details');
  }

  // ===== PUBLIC ENDPOINTS =====
  async getPublicCategories() {
    return this.request('/api/public/categories');
  }

  /**
   * Get public top performers
   * @param {number} limit - Number of results
   * @returns {Promise<any>} Top performers data
   */
  async getPublicTopPerformers(limit = 10) {
    const queryString = new URLSearchParams({ limit: limit.toString() }).toString();
    return this.request(`/api/public/top-performers?${queryString}`);
  }

  /**
   * Get monthly top performers
   * @param {number} limit - Number of results
   * @param {string} userId - Optional user ID
   * @returns {Promise<any>} Monthly top performers
   */
  async getPublicTopPerformersMonthly(limit = 10, userId) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (userId) params.append('userId', userId);
    return this.request(`/api/public/top-performers-monthly?${params}`);
  }

  /**
   * Get monthly leaderboard
   * @param {number} limit - Number of results
   * @returns {Promise<any>} Leaderboard data
   */
  async getPublicMonthlyLeaderboard(limit = 3) {
    const queryString = new URLSearchParams({ limit: limit.toString() }).toString();
    return this.request(`/api/public/monthly-leaderboard?${queryString}`);
  }

  async getPublicLandingStats() {
    return this.request('/api/public/landing-stats');
  }

  async getPublicLevels() {
    return this.request('/api/public/levels');
  }

  async getPublicCategoriesEnhanced() {
    return this.request('/api/public/categories-enhanced');
  }

  async getPublicLandingTopPerformers(limit = 10) {
    const queryString = new URLSearchParams({ limit: limit.toString() }).toString();
    return this.request(`/api/public/landing-top-performers?${queryString}`);
  }

  // ===== MONTHLY WINNERS ENDPOINTS =====
  /**
   * Get monthly winners
   * @param {string} monthYear - Optional month/year
   * @returns {Promise<any>} Monthly winners data
   */
  async getMonthlyWinners(monthYear) {
    const endpoint = monthYear 
      ? `/api/monthly-winners/month/${monthYear}`
      : '/api/monthly-winners/current';
    return this.request(endpoint);
  }

  async getRecentMonthlyWinners(limit = 12, monthYear) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (monthYear) {
      params.append('monthYear', monthYear);
    }
    const queryString = params.toString();
    return this.request(`/api/monthly-winners/recent?${queryString}`);
  }

  async getMonthlyWinnersStats() {
    return this.request('/api/monthly-winners/stats');
  }

  async getUserWinningHistory(userId) {
    return this.request(`/api/monthly-winners/user/${userId}/history`);
  }

  // ===== PRO USER QUESTIONS =====
  async createUserQuestion(payload) {
    return this.request('/api/userQuestions/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getCurrentMonthQuestionCount() {
    // Backend route is '/api/userQuestions/monthly-count'
    // previous path 'current-month-count' accidentally matched the '/userQuestions/:id' route
    // resulting in Invalid id errors. Use the correct endpoint.
    return this.request('/api/userQuestions/monthly-count');
  }

  async getCurrentDayQuestionCount() {
    return this.request('/api/userQuestions/daily-count');
  }

  async getMyUserQuestions(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/userQuestions/mine/list?${queryString}`);
  }

  async getPublicUserQuestions(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/userQuestions/public/list?${queryString}`);
  }

  async answerUserQuestion(id, selectedOptionIndex) {
    return this.request(`/api/userQuestions/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ selectedOptionIndex })
    });
  }

  async likeUserQuestion(id) {
    return this.request(`/api/userQuestions/${id}/like`, {
      method: 'POST'
    });
  }

  async shareUserQuestion(id) {
    return this.request(`/api/userQuestions/${id}/share`, {
      method: 'POST'
    });
  }

  async incrementUserQuestionView(id) {
    return this.request(`/api/userQuestions/${id}/view`, { method: 'POST' });
  }

  async getUserQuestionById(id) {
    return this.request(`/api/userQuestions/${id}`);
  }

  // ===== PRO USER WALLET =====
  async getUserWallet(userId) {
    return this.request(`/api/userWallet/${userId}`);
  }

  // ===== PRO WITHDRAW REQUESTS =====
  async createWithdrawRequest(payload) {
    return this.request('/api/withdrawRequests/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ===== ARTICLES ENDPOINTS =====
  async getPublishedArticles(params) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/public/articles?${queryString}`);
  }

  async getFeaturedArticles(limit = 5) {
    const queryString = new URLSearchParams({ limit: limit.toString() }).toString();
    return this.request(`/api/public/articles/featured?${queryString}`);
  }

  async getArticleById(id) {
    return this.request(`/api/public/articles/${id}`);
  }

  async getArticleCategories() {
    return this.request('/api/public/articles/categories');
  }

  async getArticlesByCategory(categoryId, params) {
    const queryString = new URLSearchParams({ category: categoryId, ...params }).toString();
    return this.request(`/api/public/articles?${queryString}`);
  }

  async getArticleTags() {
    return this.request('/api/public/articles/tags');
  }

  async getArticlesByTag(tag, params) {
    const queryString = new URLSearchParams({ tag, ...params }).toString();
    return this.request(`/api/public/articles?${queryString}`);
  }

  async likeArticle(id) {
    return this.request(`/api/public/articles/${id}/like`, {
      method: 'POST',
    });
  }

  async shareArticle(id) {
    return this.request(`/api/public/articles/${id}/share`, {
      method: 'POST',
    });
  }

  async incrementArticleView(id) {
    return this.request(`/api/public/articles/${id}/view`, {
      method: 'POST',
    });
  }

  // ===== CONTACT ENDPOINTS =====
  async submitContactForm(contactData) {
    return this.request('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // ===== LANDING PAGE ENDPOINTS =====
  async getLandingPageData() {
    return this.request('/api/public/landing-data');
  }

  async getHowItWorksData() {
    return this.request('/api/public/how-it-works');
  }

  async getAboutUsData() {
    return this.request('/api/public/about-us');
  }

  // ===== PAYMENT SUCCESS/FAILURE =====
  async verifyPaymentSuccess(paymentData) {
    return this.request('/api/subscription/verify-payment-success', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPaymentFailure(paymentData) {
    return this.request('/api/subscription/verify-payment-failure', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // ===== STUDENT NOTIFICATIONS =====
  async getStudentNotifications() {
    return this.request('/api/student/notifications');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/student/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/api/student/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async clearAllNotifications() {
    return this.request('/api/student/notifications/clear-all', { method: 'DELETE' });
  }

  // ===== ANALYTICS ENDPOINTS =====
  async getAnalyticsDashboard() {
    return this.request('/api/analytics/dashboard');
  }

  async getUserAnalytics(params) {
    return this.request('/api/analytics/user', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getQuizAnalytics(params) {
    return this.request('/api/analytics/quiz', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getFinancialAnalytics(params) {
    return this.request('/api/analytics/financial', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getPerformanceAnalytics(params) {
    return this.request('/api/analytics/performance', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getMonthlyProgressAnalytics(month) {
    const endpoint = month ? `/api/analytics/monthly-progress/${month}` : '/api/analytics/monthly-progress';
    return this.request(endpoint);
  }

  async getIndividualUserAnalytics(userId, params) {
    return this.request(`/api/analytics/user/${userId}`, {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  // ===== ADMIN ENDPOINTS =====
  async getAdminStats() {
    return this.request('/api/admin/stats');
  }

  async adminGetUserWallets(params) {
    return this.request('/api/admin/user-wallets', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getAdminCategories(params) {
    return this.request('/api/admin/categories', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async createCategory(categoryData) {
    return this.request('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminSubcategories(params) {
    return this.request('/api/admin/subcategories', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async createSubcategory(subcategoryData) {
    return this.request('/api/admin/subcategories', {
      method: 'POST',
      body: JSON.stringify(subcategoryData),
    });
  }

  async updateSubcategory(id, subcategoryData) {
    return this.request(`/api/admin/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subcategoryData),
    });
  }

  async deleteSubcategory(id) {
    return this.request(`/api/admin/subcategories/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminQuizzes(params) {
    return this.request('/api/admin/quizzes', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getAdminAllQuizzes(params) {
    return this.request('/api/admin/quizzes/all', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async createQuiz(quizData) {
    return this.request('/api/admin/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async updateQuiz(id, quizData) {
    return this.request(`/api/admin/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(id) {
    return this.request(`/api/admin/quizzes/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminQuestions(params) {
    return this.request('/api/admin/questions', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async createQuestion(questionData) {
    return this.request('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(id, questionData) {
    return this.request(`/api/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(id) {
    return this.request(`/api/admin/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminStudents(params) {
    return this.request('/api/admin/students', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async updateStudent(id, studentData) {
    return this.request(`/api/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id) {
    return this.request(`/api/admin/students/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminContacts(params) {
    return this.request('/api/admin/contacts', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async deleteContact(id) {
    return this.request(`/api/admin/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async assignBadge(studentId, badge) {
    return this.request(`/api/admin/students/${studentId}/badge`, {
      method: 'POST',
      body: JSON.stringify({ badge }),
    });
  }

  async getAdminBankDetails(params) {
    return this.request('/api/admin/bank-details', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getAdminPaymentTransactions(params) {
    return this.request('/api/admin/payment-transactions', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getAdminTransactionSummary(params) {
    return this.request('/api/admin/transaction-summary', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getAdminTransactionFilterOptions() {
    return this.request('/api/admin/transaction-filter-options');
  }

  async getAdminSubscriptions(params) {
    return this.request('/api/admin/subscriptions', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getAdminSubscriptionSummary(params) {
    return this.request('/api/admin/subscription-summary', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getAdminSubscriptionFilterOptions() {
    return this.request('/api/admin/subscription-filter-options');
  }

  async getAdminArticles(params) {
    return this.request('/api/admin/articles', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async getAdminArticle(id) {
    return this.request(`/api/admin/articles/${id}`);
  }

  async createArticle(articleData) {
    return this.request('/api/admin/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  }

  async updateArticle(id, articleData) {
    return this.request(`/api/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
    });
  }

  async deleteArticle(id) {
    return this.request(`/api/admin/articles/${id}`, {
      method: 'DELETE',
    });
  }

  async publishArticle(id) {
    return this.request(`/api/admin/articles/${id}/publish`, {
      method: 'POST',
    });
  }

  async unpublishArticle(id) {
    return this.request(`/api/admin/articles/${id}/unpublish`, {
      method: 'POST',
    });
  }

  async toggleFeatured(id) {
    return this.request(`/api/admin/articles/${id}/toggle-featured`, {
      method: 'POST',
    });
  }

  async togglePinned(id) {
    return this.request(`/api/admin/articles/${id}/toggle-pinned`, {
      method: 'POST',
    });
  }

  async getArticleStats() {
    return this.request('/api/admin/articles/stats');
  }

  async searchArticles(query, params) {
    return this.request('/api/articles/search', {
      method: 'GET',
      body: JSON.stringify({ query, ...params }),
    });
  }

  async incrementArticleViews(id) {
    return this.request(`/api/articles/${id}/views`, {
      method: 'POST',
    });
  }

  async incrementArticleLikes(id) {
    return this.request(`/api/articles/${id}/likes`, {
      method: 'POST',
    });
  }

  async adminGetUserQuestions(params) {
    return this.request('/api/admin/user-questions', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async adminUpdateUserQuestionStatus(id, status) {
    return this.request(`/api/admin/user-questions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async adminGetWithdrawRequests(params) {
    return this.request('/api/admin/withdraw-requests', {
      method: 'GET',
      body: JSON.stringify(params),
    });
  }

  async adminUpdateWithdrawStatus(id, status) {
    return this.request(`/api/admin/withdraw-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async adminUpdateWithdrawRequestStatus(id, status) {
    return this.request(`/api/admin/withdraw-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

const API = new ApiService();
export default API;
