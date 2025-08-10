// src/pages/HistoryPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/apiService';
import type { Reimbursement } from '../types';
import DashboardLayout from '../layouts/DashboardLayout';
import DetailModal from '../components/DetailModal';
import '../components/TableStyles.css';

// Definisi tipe dan fungsi helper
type HistoryItem = Reimbursement & { [key: string]: any; };

const DEFAULT_STEPS = ['direct_superior', 'finance_spv', 'finance_manager', 'director'];

const toNumber = (v: any): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const cleaned = v.replace(/[^\d.-]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const getApprovalList = (row: any) => 
  row.approvals || row.approval_logs || row.approvalHistory || row.history || row.logs || [];

const normalizeApprovalEntry = (x: any) => ({
  role: x.role || x.level || x.approver_role || '',
  status: x.status || x.approval_status || 'pending',
  date: x.date || x.approved_at || x.created_at || null
});

const toRoleMap = (entries: any[]) => {
  const map: Record<string, any> = {};
  entries.forEach(entry => {
    const normalized = normalizeApprovalEntry(entry);
    if (normalized.role) {
      map[normalized.role] = normalized;
    }
  });
  return map;
};

const HistoryPage: React.FC = () => {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); 
      setErr(null);
      try {
        // Gunakan parameter history=true untuk mengambil semua riwayat
        const res = await apiService.getReimbursements(true);
        const arr = Array.isArray(res?.data?.data) ? res.data.data
                  : Array.isArray(res?.data) ? res.data
                  : [];
        setRows(arr as HistoryItem[]);
      } catch (e: any) {
        setErr(e?.message || 'Gagal memuat riwayat');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const data = useMemo(() => rows, [rows]);

  const renderStatusChip = (status?: string) => {
    const statusClass = status === 'completed' ? 'approved' 
                      : status === 'rejected' ? 'rejected' 
                      : 'pending';
    
    const statusText = status === 'completed' ? 'Selesai'
                     : status === 'rejected' ? 'Ditolak'
                     : status === 'pending' ? 'Menunggu'
                     : status || 'Tidak diketahui';

    return (
      <span className={`chip chip--${statusClass}`}>
        {statusText}
      </span>
    );
  };
  
  const renderProgress = (row: HistoryItem) => {
    // Ambil daftar approval dari database (jika ada)
    const approvalEntries = getApprovalList(row);
    const roleMap = toRoleMap(approvalEntries);
    
    // Tentukan status untuk setiap step berdasarkan status pengajuan
    const getStepStatus = (step: string, index: number) => {
      // Jika ada data approval dari database, gunakan itu
      if (roleMap[step]) {
        return roleMap[step].status === 'approved' ? 'approved' : 'rejected';
      }
      
      // Jika tidak ada data approval, tentukan berdasarkan status pengajuan dan urutan
      const status = row.status;
      
      if (status === 'rejected') {
        // Jika ditolak, semua step sebelumnya approved, yang sekarang rejected
        if (status === 'pending' && index === 0) return 'rejected';
        if (status === 'approved_superior' && index === 1) return 'rejected';
        if (status === 'approved_spv' && index === 2) return 'rejected';
        if (status === 'approved_manager' && index === 3) return 'rejected';
        return index < getCurrentStepIndex(status) ? 'approved' : 'waiting';
      } else if (status === 'completed') {
        return 'approved'; // Semua step approved
      } else {
        // Untuk status pending, approved_superior, approved_spv, approved_manager
        const currentIndex = getCurrentStepIndex(status);
        if (index < currentIndex) return 'approved';
        if (index === currentIndex) return 'waiting';
        return 'waiting';
      }
    };
    
    const getCurrentStepIndex = (status: string) => {
      switch (status) {
        case 'pending': return 0;
        case 'approved_superior': return 1;
        case 'approved_spv': return 2;
        case 'approved_manager': return 3;
        case 'completed': return 4;
        default: return 0;
      }
    };

    return (
      <div className="progress-line">
        {DEFAULT_STEPS.map((step, index) => {
          const stepStatus = getStepStatus(step, index);
          const stepName = getStepDisplayName(step);
          
          return (
            <React.Fragment key={step}>
              <div className={`progress-chip progress-chip--${stepStatus}`}>
                <span className="dot"></span>
                {stepName}
              </div>
              {index < DEFAULT_STEPS.length - 1 && (
                <div className="connector"></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const getStepDisplayName = (step: string) => {
    switch (step) {
      case 'direct_superior': return 'Direct Superior';
      case 'finance_spv': return 'Finance SPV';
      case 'finance_manager': return 'Finance Manager';
      case 'director': return 'Director';
      default: return step;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Riwayat Pengajuan</h1>
        <p style={{ marginTop: 0, color: '#6c757d' }}>
          Lihat progres persetujuan tiap jabatan untuk setiap pengajuan.
        </p>
      </div>

      <div className="content-card">
        {loading && <div className="loading">Memuat…</div>}
        {err && <div className="error" style={{ color: 'red' }}>{err}</div>}

        {!loading && !err && (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status Akhir</th>
                  <th style={{ minWidth: '350px' }}>Progress Approval</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => {
                  const tanggal = r.reimbursement_date || r.created_at || '-';
                  const total = toNumber(r.total_amount);
                  return (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{tanggal ? new Date(tanggal).toISOString().slice(0, 10) : '-'}</td>
                      <td>Rp {total.toLocaleString('id-ID')}</td>
                      <td>{renderStatusChip(r.status)}</td>
                      <td>{renderProgress(r)}</td>
                      <td className="action-buttons">
                        <button
                          type="button"
                          className="btn-detail"
                          onClick={() => setSelectedId(Number(r.id))}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>
                      Belum ada riwayat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <DetailModal
              reimbursementId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;