// src/components/ApprovalQueue.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiService } from '../services/apiService';
import { type Reimbursement } from '../types'; 
import './TableStyles.css';
import DetailModal from './DetailModal';

interface Props {
  title: string;
  status: string;
  canCheck?: boolean;
  canApprove?: boolean;
}

const ApprovalQueue = ({ title, status, canCheck, canApprove }: Props) => {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State baru untuk mengontrol modal
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getReimbursements();
      
      console.log('API Response:', response.data);

      // Cek struktur response yang benar
      let dataArray = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        dataArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else {
        console.error("Backend did not return a valid data array:", response.data);
        setError('Gagal memproses data dari server.');
        return;
      }

      const filteredData = dataArray.filter((item: Reimbursement) => item.status === status);
      setReimbursements(filteredData);

    } catch (err) {
      setError('Gagal memuat data pengajuan.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  const handleProcess = async (id: number, action: 'approve' | 'reject') => {
    try {
      await apiService.processApproval(id, { action });
      // Refresh data setelah approval
      await fetchData();
      alert(`Pengajuan berhasil di-${action === 'approve' ? 'approve' : 'reject'}!`);
    } catch (error) {
      alert('Gagal memproses pengajuan. Silakan coba lagi.');
      console.error('Error processing approval:', error);
    }
  };

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <div className="table-container">
        <h2 className="table-title">{title}</h2>
        {reimbursements.length === 0 ? (
          <p>Tidak ada pengajuan yang perlu diproses saat ini.</p>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal Pengajuan</th>
                <th>Total Nominal</th>
                <th>Status</th>
                <th style={{ width: '250px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reimbursements.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.reimbursement_date}</td>
                  <td>Rp {Number(item.total_amount).toLocaleString('id-ID')}</td>
                  <td>{item.status}</td>
                  <td className="action-buttons">
                    <button className="btn-detail" onClick={() => setSelectedId(item.id)}>Detail</button>
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
      </div>
      
      {/* Render Modal menggunakan Portal agar benar-benar di atas segalanya */}
      {selectedId && createPortal(
        <DetailModal reimbursementId={selectedId} onClose={() => setSelectedId(null)} />,
        document.body
      )}
    </>
  );
};

export default ApprovalQueue;