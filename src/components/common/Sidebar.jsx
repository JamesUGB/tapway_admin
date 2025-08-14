import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';
import { ROLES, isAdminRole, isResponderRole } from '../../constants/roles';
import { DEPARTMENTS } from '../../constants/departments';

export default function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const userRole = currentUser?.role;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getDepartment = () => {
    if (userRole?.includes('fire')) return DEPARTMENTS.FIRE;
    if (userRole?.includes('police')) return DEPARTMENTS.POLICE;
    if (userRole?.includes('paramedic')) return DEPARTMENTS.PARAMEDIC;
    return null;
  };

  const department = getDepartment();

  const getUserName = () => {
    if (currentUser?.name) {
      return currentUser.name;
    }
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      section: 'main',
      title: 'Main Menu',
      items: [
        { path: ROUTES.DASHBOARD, icon: 'fa-tachometer', label: 'Dashboard', show: true },
        { path: ROUTES.EMERGENCIES, icon: 'fa-exclamation-triangle', label: 'Emergencies', show: true },
        { path: ROUTES.USERS, icon: 'fa-users', label: 'User Management', show: isAdminRole(userRole) },
        { 
          path: `${ROUTES.EMERGENCIES}?department=${department}`, 
          icon: 'fa-filter', 
          label: 'My Department', 
          show: isResponderRole(userRole) && department,
          isActive: location.search.includes(department || '')
        },
      { path: ROUTES.MAP, icon: 'fa-map-marker', label: 'Map', show: true }, // ✅ Add this line
    ]
    },
    {
      section: 'reports',
      title: 'Reports & Analytics',
      items: [
        { path: ROUTES.REPORTS, icon: 'fa-file-text', label: 'Reports', show: isAdminRole(userRole) }
      ]
    },
    {
      section: 'others',
      title: 'Others',
      items: [
        { path: ROUTES.SETTINGS, icon: 'fa-cog', label: 'Settings', show: true }
      ]
    }
  ];

  const isItemActive = (item) => {
    if (item.isActive !== undefined) return item.isActive;
    return location.pathname === item.path;
  };

  return (
    <div 
      className="sidebar d-flex flex-column" 
      style={{ 
        height: '100vh', 
        width: isCollapsed ? '70px' : '280px',
        backgroundColor: '#f8f9fa', 
        borderRight: '1px solid #dee2e6',
        transition: 'width 0.3s ease'
      }}
    >
      
      {/* Brand Identity */}
      <div className="brand-section p-3 border-bottom position-relative" style={{ backgroundColor: 'white' }}>
        <div className="d-flex align-items-center">
          {/* Temporary Logo */}
          <div 
            className="logo-placeholder d-flex align-items-center justify-content-center"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#007bff',
              borderRadius: '8px',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            T
          </div>
          
          {!isCollapsed && (
            <h4 className="brand-name mb-0 ms-3" style={{ 
              color: '#2c3e50', 
              fontWeight: '600',
              fontSize: '24px',
              whiteSpace: 'nowrap',
              opacity: isCollapsed ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}>
              Tapway
            </h4>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="btn btn-link position-absolute"
          style={{
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6c757d',
            fontSize: '16px',
            padding: '4px 8px',
            border: 'none',
            background: 'none'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i className={`fa ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="nav-menu flex-grow-1 p-3" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((section, sectionIndex) => {
          const visibleItems = section.items.filter(item => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.section} className="menu-section mb-4">
              {!isCollapsed && (
                <h6 
                  className="menu-header text-uppercase text-muted mb-3" 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    opacity: isCollapsed ? 0 : 1,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {section.title}
                </h6>
              )}
              
              <ul className="nav flex-column">
                {visibleItems.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item mb-1">
                    <Link 
                      to={item.path} 
                      className={`nav-link d-flex align-items-center ${isItemActive(item) ? 'active' : ''}`}
                      style={{
                        borderRadius: '6px',
                        padding: isCollapsed ? '10px' : '10px 12px',
                        color: isItemActive(item) ? '#007bff' : '#6c757d',
                        backgroundColor: isItemActive(item) ? '#e3f2fd' : 'transparent',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: isItemActive(item) ? '500' : '400',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                      title={isCollapsed ? item.label : ''}
                    >
                      <i 
                        className={`fa ${item.icon}`} 
                        style={{ 
                          width: '16px', 
                          fontSize: '16px',
                          marginRight: isCollapsed ? '0' : '12px',
                          textAlign: 'center'
                        }}
                      ></i>
                      
                      {!isCollapsed && (
                        <span style={{
                          opacity: isCollapsed ? 0 : 1,
                          transition: 'opacity 0.3s ease',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.label}
                        </span>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div 
                          className="position-absolute bg-dark text-white px-2 py-1 rounded"
                          style={{
                            left: '60px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            zIndex: 1000,
                            opacity: 0,
                            pointerEvents: 'none',
                            transition: 'opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '1'}
                          onMouseLeave={(e) => e.target.style.opacity = '0'}
                        >
                          {item.label}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* User Info Footer */}
      {currentUser && (
        <div className="user-footer p-3 border-top" style={{ backgroundColor: 'white' }}>
          <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center' : ''}`}>
            {/* User Avatar */}
            <div 
              className="user-avatar d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#007bff',
                borderRadius: '50%',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                flexShrink: 0,
                marginRight: isCollapsed ? '0' : '12px'
              }}
              title={isCollapsed ? `${getUserName()} - Online` : ''}
            >
              {getUserInitials()}
            </div>
            
            {/* User Details */}
            {!isCollapsed && (
              <div className="user-details flex-grow-1" style={{
                opacity: isCollapsed ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}>
                <div className="user-name fw-medium text-dark" style={{ 
                  fontSize: '14px',
                  lineHeight: '1.2',
                  marginBottom: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {getUserName()}
                </div>
                <div className="d-flex align-items-center">
                  <div 
                    className="status-dot me-2" 
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#28a745',
                      borderRadius: '50%'
                    }}
                  ></div>
                  <span className="status-text text-muted" style={{ fontSize: '12px' }}>
                    Online
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}