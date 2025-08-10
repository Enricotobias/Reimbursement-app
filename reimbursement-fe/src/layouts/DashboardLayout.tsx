// src/components/DashboardLayout.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import '../pages/DashboardPage.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>ReimburseApp</h3>
        </div>
        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/history" 
            className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
          >
            Riwayat
          </Link>
        </nav>  
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div className="user-info">
            <span>{user?.email} (<strong>{user?.role}</strong>)</span>
            <button 
              className="btn-logout" 
              onClick={() => { 
                if(window.confirm('Anda yakin ingin logout?')) logout(); 
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;