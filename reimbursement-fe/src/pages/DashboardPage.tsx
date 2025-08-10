// src/pages/DashboardPage.tsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import CreateReimbursementForm from '../components/CreateReimbursementForm';
import ApprovalQueue from '../components/ApprovalQueue';
import DashboardLayout from '../layouts/DashboardLayout';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();

  const renderContentByRole = () => {
    if (!user) return <p>Memuat data pengguna...</p>;

    switch (user.role) {
      case 'staff':
        return <CreateReimbursementForm />;
      case 'direct_superior':
        return <ApprovalQueue title="Menunggu Persetujuan Superior" status="pending" canCheck />;
      case 'finance_spv':
        return <ApprovalQueue title="Menunggu Pengecekan Finance SPV" status="approved_superior" canCheck />;
      case 'finance_manager':
        return <ApprovalQueue title="Menunggu Approval Finance Manager" status="approved_spv" canApprove />;
      case 'director':
        return <ApprovalQueue title="Menunggu Approval Direktur" status="approved_manager" canApprove />;
      default:
        return <p>Peran tidak dikenali. Hubungi administrator.</p>;
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="content-card">
        {renderContentByRole()}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;