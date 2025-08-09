import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import type { Reimbursement } from '../types';

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
      
      // DEBUG: Log response untuk troubleshooting
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Type of response.data:', typeof response.data);
      
      // Handle berbagai format response
      let dataArray: Reimbursement[] = [];
      
      if (response.data && typeof response.data === 'object') {
        // Jika response.data adalah object dengan property 'data'
        if (response.data.data && Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        }
        // Jika response.data langsung array
        else if (Array.isArray(response.data)) {
          dataArray = response.data;
        }
        // Jika ada property lain yang berisi array
        else if (response.data.reimbursements && Array.isArray(response.data.reimbursements)) {
          dataArray = response.data.reimbursements;
        }
        else {
          console.error('Unexpected response format:', response.data);
          setError('Format data tidak sesuai yang diharapkan');
          return;
        }
      } else {
        console.error('Response data is not object or array:', response.data);
        setError('Format response tidak valid');
        return;
      }
      
      // Filter data berdasarkan status
      const filteredData = dataArray.filter((item: Reimbursement) => item.status === status);
      console.log('Filtered data for status', status, ':', filteredData);
      
      setReimbursements(filteredData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        setError('Sesi telah habis. Silakan login ulang.');
      } else if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat data ini.');
      } else {
        setError('Gagal memuat data pengajuan: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  const handleProcess = async (id: number, action: 'approve' | 'reject') => {
    if (!window.confirm(`Anda yakin ingin ${action} pengajuan ini?`)) return;
    
    try {
      await apiService.processApproval(id, action);
      setReimbursements(prev => prev.filter(item => item.id !== id));
      alert(`Pengajuan berhasil di-${action}.`);
    } catch (err: any) {
      console.error('Process error:', err);
      alert(`Gagal memproses pengajuan: ${err.response?.data?.message || err.message}`);
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
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {reimbursements.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{item.id}</td>
                <td>{item.reimbursement_date}</td>
                <td>Rp {Number(item.total_amount).toLocaleString('id-ID')}</td>
                <td>{item.status}</td>
                <td>
                  {canCheck && (
                    <button onClick={() => handleProcess(item.id, 'approve')}>
                      Check
                    </button>
                  )}
                  {canApprove && (
                    <>
                      <button 
                        onClick={() => handleProcess(item.id, 'approve')} 
                        style={{ marginRight: '5px' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleProcess(item.id, 'reject')} 
                        style={{ backgroundColor: '#ffdddd' }}
                      >
                        Reject
                      </button>
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