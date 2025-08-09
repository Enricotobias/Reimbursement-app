// src/components/ApprovalQueue.tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { type Reimbursement } from '../types'; 
import './TableStyles.css';
import DetailModal from './DetailModal'; // <-- Impor modal

// ... (Interface Props tetap sama)

const ApprovalQueue = ({ title, status, canCheck, canApprove }: Props) => {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State baru untuk mengontrol modal
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ... (fungsi fetchData tetap sama)
const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getReimbursements();

      // --- PERBAIKAN DI SINI ---
      // Cek array dari dalam properti 'data'
      if (Array.isArray(response.data.data)) {
        const filteredData = response.data.data.filter((item: Reimbursement) => item.status === status);
        setReimbursements(filteredData);
      } else {
        console.error("Backend did not return a valid data array:", response.data);
        setError('Gagal memproses data dari server.');
      }

    } catch (err) {
      setError('Gagal memuat data pengajuan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
};
  // ... (fungsi handleProcess tetap sama)

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="table-container">
      <h2 className="table-title">{title}</h2>
      {reimbursements.length === 0 ? (
        <p>Tidak ada pengajuan yang perlu diproses saat ini.</p>
      ) : (
        <table className="modern-table">
          <thead>
            <tr>
              {/* ... th lainnya ... */}
              <th>Total Nominal</th>
              <th style={{ width: '250px' }}>Aksi</th> {/* Lebarkan kolom Aksi */}
            </tr>
          </thead>
          <tbody>
            {reimbursements.map(item => (
              <tr key={item.id}>
                {/* ... td lainnya ... */}
                <td>Rp {Number(item.total_amount).toLocaleString('id-ID')}</td>
                <td className="action-buttons">
                  <button className="btn-detail" onClick={() => setSelectedId(item.id)}>Detail</button> {/* Tombol Detail */}
                  {canCheck && <button className="btn-check" onClick={() => handleProcess(item.id, 'approve')}>Check</button>}
                  {canApprove && (
                    <>
                      <button className="btn-approve" onClick={() => handleProcess(item.id, 'approve')}>Approve</button>
                      <button className="btn-reject" onClick={() => handleProcess(item.id, 'reject')}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Render Modal di sini */}
      <DetailModal reimbursementId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};

export default ApprovalQueue;