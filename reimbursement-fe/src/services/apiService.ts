import axios from 'axios';

// Buat instance axios dengan URL dasar dari API backend Anda
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Sesuaikan dengan port development server CI4
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

// Sekarang definisikan semua fungsi API Anda
export const apiService = {
  login: (email, password) => {
    return apiClient.post('/login', { email, password });
  },
  getReimbursements: () => {
    return apiClient.get('/reimbursements');
  },
  createReimbursement: (data) => {
    return apiClient.post('/reimbursements', data);
  },
  // TAMBAHKAN FUNGSI BARU INI
  getReimbursementById: (id: number) => {
    return apiClient.get(`/reimbursements/${id}`);
  },
  processApproval: (id: number, data: { action: 'approve' | 'reject' }) => {
    return apiClient.post(`/reimbursements/${id}/approve`, data);
  },
  
};