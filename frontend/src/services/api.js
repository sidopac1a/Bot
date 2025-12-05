import axios from 'axios';
import toast from 'react-hot-toast';

// تحديد API URL بطريقة آمنة وصحيحة
const API_BASE_URL = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : (process.env.NODE_ENV === 'production'
      ? 'https://whatsapp-chatbot-platform.onrender.com'
      : 'http://localhost:5000');

console.log('API Base URL:', API_BASE_URL);

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error);

        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (error.response?.status >= 500) {
          toast.error('خطأ في الخادم. يرجى المحاولة لاحقاً');
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          toast.error('خطأ في الاتصال بالخادم');
        }

        return Promise.reject(error);
      }
    );
  }

  // باقي الدوال كما هي...
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Auth methods
  async login(credentials) {
    return this.client.post('/auth/login', credentials);
  }

  async logout() {
    return this.client.post('/auth/logout');
  }

  async getUser() {
    return this.client.get('/auth/me');
  }

  // Bot methods
  async getBotStatus() {
    return this.client.get('/bot/status');
  }

  async connectBot(type) {
    return this.client.post('/bot/connect', { type });
  }

  async disconnectBot() {
    return this.client.post('/bot/disconnect');
  }

  async switchConnection(type) {
    return this.client.post('/bot/switch', { type });
  }

  async getQRCode() {
    return this.client.get('/bot/qr');
  }

  // Messages methods
  async getMessages(params = {}) {
    return this.client.get('/messages', { params });
  }

  async getMessageStats() {
    return this.client.get('/messages/stats');
  }

  async sendMessage(data) {
    return this.client.post('/messages/send', data);
  }

  async deleteMessage(id) {
    return this.client.delete(`/messages/${id}`);
  }

  // Settings methods
  async getSettings() {
    return this.client.get('/settings');
  }

  async updateSettings(category, settings) {
    return this.client.put('/settings', { category, settings });
  }

  async getAIModels() {
    return this.client.get('/settings/ai-models');
  }

  // Knowledge methods
  async getKnowledge(params = {}) {
    return this.client.get('/knowledge', { params });
  }

  async uploadKnowledgeFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post('/knowledge/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentage);
        }
      },
    });
  }

  async deleteKnowledge(id) {
    return this.client.delete(`/knowledge/${id}`);
  }

  async getKnowledgeStatus(id) {
    return this.client.get(`/knowledge/process/${id}`);
  }

  // Import/Export methods
  async exportSettings() {
    return this.client.get('/export', {
      responseType: 'blob',
    });
  }

  async importSettings(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Generic methods
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
}

export default new ApiService();
