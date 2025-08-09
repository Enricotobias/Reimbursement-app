// src/pages/HistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import type { Reimbursement } from '../types';
import '../components/TableStyles.css'; // Kita pakai ulang gaya tabelnya

const HistoryPage = () => {
  const [history, setHistory] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getReimbursements();
        
        // --- PERBAIKAN DI SINI ---
        // Cek array dari dalam properti 'data'
        if (Array.isArray(response.data.data)) {
          const filtered = response.data.data.filter(
            (item: Reimbursement) => item.status === 'completed' || item.status === 'rejected'
          );
          setHistory(filtered);
        } else {
            setError('Gagal memproses data dari server.');
        }
      } catch (err) {
        setError('Gagal memuat data riwayat.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
}, []);

  if (loading) return <p>Memuat data riwayat...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="table-container">
      <h2 className="table-title">Riwayat Pengajuan</h2>
      {history.length === 0 ? (
        <p>Belum ada riwayat pengajuan.</p>
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
                <td className={`status-${item.status}`}>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoryPage;