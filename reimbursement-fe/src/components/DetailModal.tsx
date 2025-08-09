// src/components/DetailModal.tsx

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './ModalStyles.css'; // CSS untuk modal
import type { Reimbursement } from '../types';

interface ReimbursementDetail extends Reimbursement {
    user_name: string;
    details: Array<{
        id: number;
        date: string;
        location: string;
        description: string;
        qty: number;
        amount: string;
    }>;
}

interface Props {
    reimbursementId: number | null;
    onClose: () => void;
}

const DetailModal = ({ reimbursementId, onClose }: Props) => {
    const [reimbursement, setReimbursement] = useState<ReimbursementDetail | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (reimbursementId) {
            setLoading(true);
            apiService.getReimbursementById(reimbursementId)
                .then(response => {
                    setReimbursement(response.data);
                })
                .catch(err => console.error("Gagal mengambil detail:", err))
                .finally(() => setLoading(false));
        }
    }, [reimbursementId]);

    if (!reimbursementId) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Detail Pengajuan #{reimbursementId}</h2>
                    <button onClick={onClose} className="btn-close">&times;</button>
                </div>
                <div className="modal-body">
                    {loading && <p>Memuat detail...</p>}
                    {reimbursement && (
                        <>
                            <p><strong>Nama Pengaju:</strong> {reimbursement.user_name}</p>
                            <p><strong>Tanggal Pengajuan:</strong> {reimbursement.reimbursement_date}</p>
                            <p><strong>Status:</strong> {reimbursement.status}</p>
                            <hr />
                            <h4>Rincian Item:</h4>
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Tanggal</th>
                                        <th>Lokasi/Deskripsi</th>
                                        <th>Qty</th>
                                        <th>Nominal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reimbursement.details.map(detail => (
                                        <tr key={detail.id}>
                                            <td>{detail.date}</td>
                                            <td><strong>{detail.location}</strong><br />{detail.description}</td>
                                            <td>{detail.qty}</td>
                                            <td>Rp {Number(detail.amount).toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <h3 className="total-amount">Total: Rp {Number(reimbursement.total_amount).toLocaleString('id-ID')}</h3>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailModal;