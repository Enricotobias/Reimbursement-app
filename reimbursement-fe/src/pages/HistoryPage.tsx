// src/pages/HistoryPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/apiService';
import type { Reimbursement } from '../types';
import '../components/TableStyles.css';
import './DashboardPage.css';
import DetailModal from '../components/DetailModal';

type HistoryItem = Reimbursement & {
  created_at?: string;
  approvals?: any[];
  approval_logs?: any[];
  approvalHistory?: any[];
  history?: any[];
  logs?: any[];
  [key: string]: any;
};

const DEFAULT_STEPS = ['direct_superior', 'finance_spv', 'finance_manager', 'director'];

const toNumber = (v: any) => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};
const getApprovalList = (row: any) =>
  row.approvals || row.approval_logs || row.approvalHistory || row.history || row.logs || undefined;

const normalizeApprovalEntry = (x: any) => {
  const role =
    x?.role?.toLowerCase?.() ??
    x?.position?.toLowerCase?.() ??
    x?.level?.toLowerCase?.() ??
    x?.title?.toLowerCase?.() ??
    '';
  const rawStatus =
    x?.status ??
    x?.state ??
    x?.approval_status ??
    (x?.is_approved === true ? 'approved' : x?.is_approved === false ? 'rejected' : 'waiting');
  const status = String(rawStatus || 'waiting').toLowerCase();
  const by = x?.by ?? x?.approved_by ?? x?.user_name ?? x?.username ?? x?.approver_name ?? null;
  const at = x?.at ?? x?.date ?? x?.approved_at ?? x?.updated_at ?? x?.created_at ?? null;
  return { role, status, by, at };
};
const toRoleMap = (entries: any[]) => {
  const rank = (s: string) => (s === 'approved' ? 3 : s === 'rejected' ? 2 : s === 'skipped' ? 1 : 0);
  const m = new Map<string, { role: string; status: string; by?: string | null; at?: any }>();
  entries.forEach((e) => {
    const n = normalizeApprovalEntry(e);
    if (!n.role) return;
    const prev = m.get(n.role);
    if (!prev || rank(n.status) > rank(prev.status)) m.set(n.role, n);
  });
  return m;
};

const HistoryPage: React.FC = () => {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await apiService.getReimbursements();
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

  const stepsOrder = DEFAULT_STEPS;
  const data = useMemo(() => rows, [rows]);

  const renderStatusChip = (status?: string) => {
    const s = (status || '').toLowerCase();
    const cls = s === 'approved' ? 'chip chip--approved'
              : s === 'rejected' ? 'chip chip--rejected'
              : 'chip chip--pending';
    return <span className={cls}>{status ?? '-'}</span>;
  };

  const renderProgress = (row: HistoryItem) => {
    const approvals = getApprovalList(row);
    const map = approvals && approvals.length ? toRoleMap(approvals) : new Map();

    return (
      <div className="progress-line">
        {stepsOrder.map((role, idx) => {
          const entry: any = map.get(role) || { role, status: 'waiting' };
          const label =
            role === 'direct_superior' ? 'Direct Superior' :
            role === 'finance_spv'     ? 'Finance SPV'     :
            role === 'finance_manager' ? 'Finance Manager' :
            role === 'director'        ? 'Director'        : role;

          const s = String(entry.status || 'waiting').toLowerCase();
          const cls = s === 'approved' ? 'progress-chip progress-chip--approved'
                   : s === 'rejected' ? 'progress-chip progress-chip--rejected'
                   : s === 'skipped'  ? 'progress-chip progress-chip--skipped'
                   : 'progress-chip progress-chip--waiting';

          const tooltip =
            s === 'approved' || s === 'rejected'
              ? `${label}: ${s}${entry.by ? ` by ${entry.by}` : ''}${entry.at ? ` @ ${new Date(entry.at).toISOString().slice(0,10)}` : ''}`
              : `${label}: ${s}`;

          return (
            <React.Fragment key={role}>
              <span className={cls} title={tooltip}>
                <i aria-hidden className="dot" />
                {label}
              </span>
              {idx < stepsOrder.length - 1 && <span className="connector" aria-hidden />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ⬇⬇⬇ HANYA KONTEN. Sidebar/topbar dirender oleh layout global ⬇⬇⬇
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Riwayat Pengajuan</h1>
        <p className="muted">Lihat progres persetujuan tiap jabatan untuk setiap pengajuan.</p>
      </div>

      <div className="content-card">
        {loading && <div className="loading">Memuat…</div>}
        {err && <div className="error">{err}</div>}

        {!loading && !err && (
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tanggal</th>
                  <th>Total</th>
                  <th>Status Akhir</th>
                  <th>Progress Approval</th>
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
                      <td>{total.toLocaleString('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 })}</td>
                      <td>{renderStatusChip(r.status)}</td>
                      <td>{renderProgress(r)}</td>
                      <td className="action-buttons">
                        <button
                          type="button"
                          className="btn-detail"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedId(Number(r.id)); setOpen(true); }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center muted p-4">Belum ada riwayat.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <DetailModal
              reimbursementId={open ? selectedId : null}
              onClose={() => setOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
