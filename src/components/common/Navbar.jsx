// src/components/common/Navbar.jsx
import { useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; 
import { logout } from '../../services/auth';
import { isAdminRole } from '../../constants/roles';
import { ROUTES } from '../../constants/routes';

// Reusable PageTitle component
const PageTitle = ({ title }) => (
  <div className="navbar-brand me-auto d-flex align-items-center">
    <h5 className="mb-0 fw-medium" style={{ 
      color: '#2c3e50',
      fontSize: '20px',
      letterSpacing: '-0.25px'
    }}>
      {title}
    </h5>
  </div>
);

// Reusable IconButton component
const IconButton = ({ icon, badgeCount, badgeVariant = 'primary', onClick, title }) => (
  <button 
    className="btn position-relative d-flex align-items-center justify-content-center"
    onClick={onClick}
    style={{ 
      border: 'none',
      background: 'none',
      color: '#6c757d',
      padding: '8px',
      borderRadius: '8px',
      width: '40px',
      height: '40px',
      transition: 'all 0.2s ease',
      marginLeft: '8px'
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.color = '#6c757d';
    }}
  >
    {icon}
    {badgeCount > 0 && (
      <span 
        className={`position-absolute badge rounded-pill`}
        style={{ 
          top: '6px',
          right: '6px',
          backgroundColor: badgeVariant === 'danger' ? '#dc3545' : '#007bff',
          color: 'white',
          fontSize: '10px',
          fontWeight: '600',
          minWidth: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0',
          lineHeight: '1'
        }}
      >
        {badgeCount > 99 ? '99+' : badgeCount}
        <span className="visually-hidden">unread {title.toLowerCase()}</span>
      </span>
    )}
  </button>
);

// SVG Icons as components - Enhanced with better styling
const MessageIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    fill="currentColor" 
    viewBox="0 0 16 16"
    style={{ transition: 'all 0.2s ease' }}
  >
    <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
  </svg>
);

const NotificationIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    width="18" 
    height="18" 
    fill="currentColor" 
    viewBox="0 0 16 16"
    style={{ transition: 'all 0.2s ease' }}
  >
    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
  </svg>
);

export default function Navbar() {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  const handleMessageClick = () => {
    console.log('Messages clicked');
  };

  const handleSearchClick = () => {
    console.log('Search clicked');
  };

  const showAdminLinks = isAdminRole(userRole);

  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Exact matches first
    if (path === ROUTES.DASHBOARD) return 'Dashboard';
    if (path === ROUTES.EMERGENCIES) return 'Emergencies';
    if (path === ROUTES.REPORTS) return 'Reports';
    if (path === ROUTES.SETTINGS) return 'Settings';
    if (path === ROUTES.MAP) return 'Emergency Map';
    
    // User Management routes - show full path
    if (path.startsWith(ROUTES.USER_MANAGEMENT)) {
      if (path.includes('/member')) return 'User Management / Members';
      if (path.includes('/team')) return 'User Management / Teams';
      if (path.includes('/roles')) return 'User Management / Roles & Status';
      return 'User Management';
    }
    
    // Fallback - extract from path
    const pathParts = path.split('/').filter(part => part);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
    
    return 'Tapway Admin';
  };

  const pageTitle = getPageTitle();

  return (
    <nav 
      className="navbar navbar-expand-lg" 
      style={{ 
        height: "72px", 
        paddingTop: "0", 
        paddingBottom: "0",
        backgroundColor: 'white',
        // borderBottom: '1px solid #dee2e6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <div className="container-fluid" style={{ paddingLeft: '24px', paddingRight: '30px' }}>
        {/* Page Title on the left */}
        <PageTitle title={pageTitle} />
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Right Side - Action Icons */}
          <div className="d-flex align-items-center ms-auto">
            {currentUser && (
              <>
                
                {/* Messages */}
                <IconButton
                  icon={<MessageIcon />}
                  badgeCount={5}
                  badgeVariant="primary"
                  onClick={handleMessageClick}
                  title="Messages"
                />
                
                {/* Notifications */}
                <IconButton
                  icon={<NotificationIcon />}
                  badgeCount={3}
                  badgeVariant="danger"
                  onClick={handleNotificationClick}
                  title="Notifications"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}