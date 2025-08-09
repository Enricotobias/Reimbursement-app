// src/pages/DashboardPage.tsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import CreateReimbursementForm from '../components/CreateReimbursementForm';
import ApprovalQueue from '../components/ApprovalQueue';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();

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
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>ReimburseApp</h3>
        </div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-link active"> {/* Gunakan /dashboard */}
           Dashboard
          </a>
          <a href="/history" className="nav-link"> {/* Gunakan /history */}
           Riwayat
          </a>
            {/* Link Profil sudah dihapus */}
        </nav>  
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div className="user-info">
            <span>{user?.email} (<strong>{user?.role}</strong>)</span>
            <button className="btn-logout" onClick={() => { if(window.confirm('Anda yakin ingin logout?')) logout(); }}>
              Logout
            </button>
          </div>
        </header>
        <main className="page-content">
          <div className="page-header">
            <h1>Dashboard</h1>
          </div>
          <div className="content-card">
            {renderContentByRole()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;