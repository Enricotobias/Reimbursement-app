import axios from 'axios';

// Buat instance axios dengan URL dasar dari API backend Anda
const apiClient = axios.create({
  baseURL: 'http://localhost/reimbursement-app/public/api', // Sesuaikan port jika berbeda
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
  processApproval: (id, action) => { // action bisa 'approve' atau 'reject'
    return apiClient.post(`/reimbursements/${id}/approve`, { action });
  },
};