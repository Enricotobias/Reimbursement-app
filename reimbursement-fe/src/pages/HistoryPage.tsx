// src/pages/HistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import type { Reimbursement } from '../types';
import '../components/TableStyles.css';
import './DashboardPage.css'; // Import gaya yang sama dengan dashboard

const HistoryPage = () => {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getReimbursements();
        
        console.log('History API Response:', response.data);
        
        // Cek struktur response yang benar
        let dataArray = [];
        if (response.data.data && Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          dataArray = response.data;
        } else {
          setError('Gagal memproses data dari server.');
          return;
        }
        
        // Filter hanya data yang sudah completed atau rejected
        const filtered = dataArray.filter(
          (item: Reimbursement) => item.status === 'completed' || item.status === 'rejected'
        );
        setHistory(filtered);
      } catch (err) {
        setError('Gagal memuat data riwayat.');
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const renderContent = () => {
    if (loading) return <p>Memuat data riwayat...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
      <div className="table-container">
        <h2 className="table-title">Riwayat Pengajuan</h2>
        {history.length === 0 ? (
          <p>Belum ada riwayat pengajuan yang selesai.</p>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal Pengajuan</th>
                <th>Total Nominal</th>
                <th>Status Akhir</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.reimbursement_date}</td>
                  <td>Rp {Number(item.total_amount).toLocaleString('id-ID')}</td>
                  <td className={`status-${item.status}`}>
                    {item.status === 'completed' ? 'Selesai' : 'Ditolak'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>ReimburseApp</h3>
        </div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-link">
            Dashboard
          </a>
          <a href="/history" className="nav-link active">
            Riwayat
          </a>
        </nav>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div className="user-info">
            <span>{user?.email} (<strong>{user?.role}</strong>)</span>
            <button className="btn-logout" onClick={() => { if(window.confirm('Anda yakin ingin logout?')) logout(); }}>
              Logout
            </button>
          </div>
        </header>
        <main className="page-content">
          <div className="page-header">
            <h1>Riwayat Pengajuan</h1>
          </div>
          <div className="content-card">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;