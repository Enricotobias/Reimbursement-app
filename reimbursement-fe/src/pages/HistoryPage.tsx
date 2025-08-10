// src/pages/HistoryPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/apiService';
import type { Reimbursement } from '../types';
import DashboardLayout from '../layouts/DashboardLayout'; // <-- 1. Impor Layout
import DetailModal from '../components/DetailModal';
import '../components/TableStyles.css';
// import './HistoryPage.css'; // <-- 2. Impor CSS baru untuk progress bar

// Definisi tipe dan fungsi helper (TETAP SAMA)
type HistoryItem = Reimbursement & { [key: string]: any; };
const DEFAULT_STEPS = ['direct_superior', 'finance_spv', 'finance_manager', 'director'];
const toNumber = (v: any) => { /* ... (kode helper Anda) ... */ };
const getApprovalList = (row: any) => row.approvals || row.approval_logs || row.approvalHistory || row.history || row.logs || [];
const normalizeApprovalEntry = (x: any) => { /* ... (kode helper Anda) ... */ };
const toRoleMap = (entries: any[]) => { /* ... (kode helper Anda) ... */ };


const HistoryPage: React.FC = () => {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await apiService.getReimbursements();
        // Logika pengambilan data Anda sudah bagus
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
    // ... (kode renderStatusChip Anda) ...
  };
  
  const renderProgress = (row: HistoryItem) => {
    // ... (kode renderProgress Anda) ...
  };
  
  // ⬇⬇⬇ KONTEN INTI DIBUNGKUS OLEH LAYOUT ⬇⬇⬇
  return (
    <DashboardLayout title="Riwayat Pengajuan">
      <p style={{ marginTop: 0, color: '#6c757d' }}>
        Lihat progres persetujuan tiap jabatan untuk setiap pengajuan.
      </p>

      {loading && <div>Memuat…</div>}
      {err && <div style={{ color: 'red' }}>{err}</div>}

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
                    <td>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</td>
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
    </DashboardLayout>
  );
};

export default HistoryPage;