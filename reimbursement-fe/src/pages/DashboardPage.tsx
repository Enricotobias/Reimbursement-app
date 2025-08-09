import React from 'react';
import { useAuth } from '../context/AuthContext';
import CreateReimbursementForm from '../components/CreateReimbursementForm';
import ApprovalQueue from '../components/ApprovalQueue';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const renderContentByRole = () => {
    if (!user) return <p>Loading user data...</p>;

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
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <div>
          <h1>Dashboard Reimbursement</h1>
          <p>Login sebagai: <strong>{user?.email}</strong> (Peran: {user?.role})</p>
        </div>
        <button onClick={() => { if(window.confirm('Anda yakin ingin logout?')) logout(); }} style={{ padding: '8px 16px' }}>
          Logout
        </button>
      </header>
      <main style={{ marginTop: '20px' }}>
        {renderContentByRole()}
      </main>
    </div>
  );
};

export default DashboardPage;