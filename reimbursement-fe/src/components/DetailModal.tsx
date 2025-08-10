import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import './ModalStyles.css';
import type { Reimbursement } from '../types';

interface ReimbursementDetail extends Reimbursement {
  user_name: string;
  reimbursement_date?: string | Date;
  total_amount: string | number;
  status?: string;

  // --- Tambahan field bank (opsional) ---
  bank_name?: string;
  account_name?: string;
  account_number?: string;

  // Detail item
  details: Array<{
    id: number;
    date: string;
    location: string;
    description: string;
    qty: number;
    amount: string | number;
  }>;
}

interface DetailModalProps {
  reimbursementId: number | null;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ reimbursementId, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reimbursement, setReimbursement] = useState<ReimbursementDetail | null>(null);

  // Helper: normalisasi angka
  const toNumber = (v: any) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const cleaned = v.replace(/[^\d.-]/g, '');
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  // Fetch detail saat modal dibuka
  useEffect(() => {
    if (!reimbursementId) {
      setReimbursement(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    apiService
      .getReimbursementById(reimbursementId)
      .then((response) => {
        const d = response.data ?? {};

        // --- Normalisasi field bank yang mungkin beda nama ---
        const bank_name =
          d.bank_name ??
          d.bankName ??
          d.bank?.name ??
          d.bank ??
          d.bank_provider ??
          '-';

        const account_name =
          d.account_name ??
          d.accountName ??
          d.bank_account_name ??
          d.account_holder ??
          d.rekening_name ??
          '-';

        const account_number =
          d.account_number ??
          d.accountNumber ??
          d.bank_account_number ??
          d.rekening ??
          d.no_rekening ??
          '-';

        const normalized: ReimbursementDetail = {
          ...(d as ReimbursementDetail),
          bank_name,
          account_name,
          account_number,
          total_amount: d.total_amount ?? d.total ?? 0,
          reimbursement_date: d.reimbursement_date ?? d.created_at ?? d.createdAt,
          status: d.status ?? 'pending',
          user_name: d.user_name ?? d.requester_name ?? d.employee_name ?? '-',
          details:
            Array.isArray(d.details)
              ? d.details.map((it: any) => ({
                  id: it.id,
                  date: it.date ?? it.created_at ?? '',
                  location: it.location ?? it.place ?? '-',
                  description: it.description ?? it.desc ?? '-',
                  qty: it.qty ?? it.quantity ?? 1,
                  amount: it.amount ?? it.price ?? 0,
                }))
              : [],
        };

        setReimbursement(normalized);
      })
      .catch((err) => {
        console.error('Gagal mengambil detail:', err);
        let msg = 'Gagal memuat detail pengajuan';
        if (err?.response?.status === 404) msg = 'Data pengajuan tidak ditemukan';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [reimbursementId]);

  // Body scroll lock ketika modal terbuka
  useEffect(() => {
    if (!reimbursementId) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prev;
    };
  }, [reimbursementId]);

  // Tutup dengan ESC
  useEffect(() => {
    if (!reimbursementId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reimbursementId, onClose]);

  const handleClose = () => {
    setReimbursement(null);
    setError(null);
    onClose();
  };

  if (!reimbursementId) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleClose} aria-hidden="true" />
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-label={`Detail Pengajuan #${reimbursementId}`}
        onClick={handleClose}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Detail Pengajuan #{reimbursementId}</h2>
            <button className="modal-close" onClick={handleClose} aria-label="Tutup">
              ×
            </button>
          </div>

          <div className="modal-body">
            {loading && <div className="loading-container">Memuat…</div>}
            {error && <div className="error-container">{error}</div>}

            {!loading && !error && reimbursement && (
              <>
                <div className="detail-info">
                  <p><span>Nama Pengaju</span><strong>{reimbursement.user_name || '-'}</strong></p>
                  <p>
                    <span>Tanggal Pengajuan</span>
                    <strong>
                      {reimbursement.reimbursement_date
                        ? new Date(reimbursement.reimbursement_date as any).toISOString().slice(0, 10)
                        : '-'}
                    </strong>
                  </p>
                  <p>
                    <span>Status</span>
                    <strong className={`badge badge--${reimbursement.status || 'pending'}`}>
                      {reimbursement.status}
                    </strong>
                  </p>
                  <p>
                    <span>Total</span>
                    <strong>Rp {toNumber(reimbursement.total_amount).toLocaleString('id-ID')}</strong>
                  </p>

                  {/* ======== Tambahan 3 baris info bank ======== */}
                  <p><span>Bank</span><strong>{reimbursement.bank_name || '-'}</strong></p>
                  <p><span>Nama Rekening</span><strong>{reimbursement.account_name || '-'}</strong></p>
                  <p><span>Nomor Rekening</span><strong>{reimbursement.account_number || '-'}</strong></p>
                </div>

                <h3 className="section-title">Rincian Item</h3>
                {reimbursement.details && reimbursement.details.length > 0 ? (
                  <table className="detail-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Lokasi</th>
                        <th>Deskripsi</th>
                        <th>Qty</th>
                        <th>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reimbursement.details.map((d) => (
                        <tr key={d.id}>
                          <td>{d.date}</td>
                          <td>{d.location}</td>
                          <td>{d.description}</td>
                          <td>{d.qty}</td>
                          <td>Rp {toNumber(d.amount).toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Tidak ada rincian item.</p>
                )}

                <h3 className="total-amount">
                  Total: Rp {toNumber(reimbursement.total_amount).toLocaleString('id-ID')}
                </h3>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailModal;
