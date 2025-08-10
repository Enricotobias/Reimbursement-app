import axios from 'axios';

// Buat instance axios dengan URL dasar dari API backend Anda
const apiClient = axios.create({
  baseURL: 'http://localhost/reimbursement-be/public/api', // Sesuaikan dengan path backend Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ini adalah INTERCEPTOR. Kode ini akan berjalan di setiap request
// untuk menambahkan token Authorization secara otomatis.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error secara global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Sekarang definisikan semua fungsi API Anda
export const apiService = {
  login: (email: string, password: string) => {
    return apiClient.post('/login', { email, password });
  },
  getReimbursements: (history: boolean = false) => {
    const params = history ? { history: 'true' } : {};
    return apiClient.get('/reimbursements', { params });
  },
  createReimbursement: (data: any) => {
    return apiClient.post('/reimbursements', data);
  },
  getReimbursementById: (id: number) => {
    return apiClient.get(`/reimbursements/${id}`);
  },
  processApproval: (id: number, data: { action: 'approve' | 'reject' }) => {
    return apiClient.post(`/reimbursements/${id}/approve`, data);
  },
};