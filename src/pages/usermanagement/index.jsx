// src/pages/usermanagement/index.jsx
import { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import MemberManagement from './MemberManagement';
import TeamManagement from './TeamManagement';
import RolesStatus from './RolesStatus';

export default function UserManagementPage() {
  const location = useLocation();
  
  // Get the current tab from the URL
  const getCurrentTab = () => {
    if (location.pathname.includes('/members')) return 'members';
    if (location.pathname.includes('/teams')) return 'teams';
    if (location.pathname.includes('/roles')) return 'roles';
    return 'members'; // default
  };

  const [activeTab, setActiveTab] = useState(getCurrentTab());

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div 
  className="d-flex" 
  style={{ 
    minHeight: '100vh', 
    overflow: 'hidden', 
    backgroundColor: '#f8f8f8ff' 
  }}
>

      {/* Sidebar (fixed left) */}
      <div style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Navbar at top of main area */}
        <div style={{ flexShrink: 0 }}>
          <Navbar />
        </div>

        {/* Page content */}
        <main className="container-fluid p-4">
          {/* Tab Content */}
          <div className="tab-content">
            <Routes>
              <Route path="members" element={<MemberManagement />} />
              <Route path="teams" element={<TeamManagement />} />
              <Route path="roles" element={<RolesStatus />} />
              <Route path="/" element={<Navigate to="members" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}