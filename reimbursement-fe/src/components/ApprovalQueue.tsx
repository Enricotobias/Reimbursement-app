import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

// Tambahkan tipe ini di src/types/index.ts jika belum ada
// export interface Reimbursement {
//   id: number;
//   user_id: number;
//   reimbursement_date: string;
//   total_amount: string;
//   status: string;
//   // tambahkan properti lain jika perlu ditampilkan
// }

// Tambahkan tipe ini di src/types/index.ts jika belum ada
// export interface Reimbursement {
//   id: number;
//   user_id: number;
//   reimbursement_date: string;
//   total_amount: string;
//   status: string;
//   // tambahkan properti lain jika perlu ditampilkan
// }
import type { Reimbursement } from '../types'; // Asumsikan tipe sudah ada
 // Asumsikan tipe sudah ada

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getReimbursements();
      // Filter data di frontend berdasarkan status yang dibutuhkan
      const filteredData = response.data.filter((item: Reimbursement) => item.status === status);
      setReimbursements(filteredData);
    } catch (err) {
      setError('Gagal memuat data pengajuan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]); // Jalankan ulang fetch jika prop status berubah

  const handleProcess = async (id: number, action: 'approve' | 'reject') => {
    if (!window.confirm(`Anda yakin ingin ${action} pengajuan ini?`)) return;
    
    try {
      await apiService.processApproval(id, action);
      // Hapus item dari daftar agar UI update secara instan
      setReimbursements(prev => prev.filter(item => item.id !== id));
      alert(`Pengajuan berhasil di-${action}.`);
    } catch (err) {
      alert(`Gagal memproses pengajuan.`);
      console.error(err);
    }
  };

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>{title}</h3>
      {reimbursements.length === 0 ? (
        <p>Tidak ada pengajuan yang perlu diproses.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid black' }}>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Total Nominal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reimbursements.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{item.id}</td>
                <td>{item.reimbursement_date}</td>
                <td>Rp {Number(item.total_amount).toLocaleString('id-ID')}</td>
                <td>
                  {canCheck && <button onClick={() => handleProcess(item.id, 'approve')}>Check</button>}
                  {canApprove && (
                    <>
                      <button onClick={() => handleProcess(item.id, 'approve')} style={{ marginRight: '5px' }}>Approve</button>
                      <button onClick={() => handleProcess(item.id, 'reject')} style={{ backgroundColor: '#ffdddd' }}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApprovalQueue;