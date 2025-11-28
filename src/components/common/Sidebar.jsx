// src/components/common/Sidebar.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';
import { logout } from '../../services/auth';
import { ROLES, isAdminRole, isResponderRole } from '../../constants/roles';
import { DEPARTMENTS, DEPARTMENT_LABELS } from '../../constants/departments';
import { getEmergencyColor } from '../../constants/emergencyColors';

// Import the same emergency services used in EmergencyTable
import { getEmergencies, getEmergenciesRealtime } from '../../services/firestore';
import { EMERGENCY_STATUS } from '../../constants/emergencyStatus';

// Constants for better maintainability
const SIDEBAR_CONFIG = {
  COLLAPSED_WIDTH: 70,
  EXPANDED_WIDTH: 280,
  ANIMATION_DURATION: 300,
  SHAKE_INTERVAL: 30000
};

const COLORS = {
  PRIMARY: '#007bff',
  BACKGROUND: '#fdfdfd',
  TEXT_MUTED: '#6c757d',
  TEXT_DARK: '#2c3e50',
  BORDER: '#dee2e6',
  DANGER: '#dc3545'
};

// Custom hook for emergency notifications
const useEmergencyNotifications = (currentUser, userRole) => {
  const [pendingEmergenciesCount, setPendingEmergenciesCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [emergencyError, setEmergencyError] = useState(null);
  const [isLoadingEmergencies, setIsLoadingEmergencies] = useState(false);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 1000);
  }, []);

  useEffect(() => {
    let unsubscribe = null;

    const setupEmergencyListener = async () => {
      try {
        setIsLoadingEmergencies(true);
        setEmergencyError(null);
        
        // Use the same real-time listener as EmergencyTable
        unsubscribe = getEmergenciesRealtime(
          {
            status: EMERGENCY_STATUS.PENDING,
            limit: 100
          },
          userRole,
          currentUser?.department,
          // onUpdate callback
          (result) => {
            const pendingCount = result.data.length;
            setPendingEmergenciesCount(pendingCount);

            // Trigger shake animation when new pending emergencies appear
            if (pendingCount > 0) {
              triggerShake();
            }
          },
          // onError callback
          (error) => {
            console.error('Error listening to emergencies:', error);
            setEmergencyError('Failed to load emergency data');
          }
        );
      } catch (error) {
        console.error('Failed to setup emergency listener:', error);
        setEmergencyError('Failed to setup emergency listener');
        
        // Fallback: Poll for emergencies if real-time fails
        fetchPendingEmergencies();
      } finally {
        setIsLoadingEmergencies(false);
      }
    };

    // Fallback function for polling
    const fetchPendingEmergencies = async () => {
      try {
        const emergencies = await getEmergencies(userRole, currentUser?.department);
        const pendingCount = emergencies.filter(
          emergency => emergency.status === EMERGENCY_STATUS.PENDING
        ).length;
        setPendingEmergenciesCount(pendingCount);
        
        if (pendingCount > 0) {
          triggerShake();
        }
      } catch (error) {
        console.error('Error fetching emergencies:', error);
        setEmergencyError('Failed to fetch emergencies');
      }
    };

    // Only setup listener for users who should see emergencies
    if (currentUser && (isAdminRole(userRole) || isResponderRole(userRole))) {
      setupEmergencyListener();
    }

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, userRole, triggerShake]);

  // Auto-shake interval for ongoing attention
  useEffect(() => {
    if (pendingEmergenciesCount > 0) {
      const interval = setInterval(() => {
        triggerShake();
      }, SIDEBAR_CONFIG.SHAKE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [pendingEmergenciesCount, triggerShake]);

  return { 
    pendingEmergenciesCount, 
    isShaking, 
    triggerShake,
    emergencyError,
    isLoadingEmergencies
  };
};

// Emergency Notification Component
// Emergency Notification Component - MODIFY THIS
const EmergencyNotification = ({ count, isShaking, isCollapsed, colors }) => {
  if (count === 0) return null;

  if (isCollapsed) {
    return (
      <div 
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          width: '8px',
          height: '8px',
          backgroundColor: colors.DANGER, // Use colors prop
          borderRadius: '50%',
          animation: isShaking ? 'shake 0.5s ease-in-out' : 'none'
        }}
        title={`${count} pending emergency(ies)`}
        aria-label={`${count} pending emergencies`}
      />
    );
  }

  return (
    <span 
      className={`emergency-notification ${isShaking ? 'shaking' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`${count} pending emergencies`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        color: colors.DANGER, // Use colors prop
        borderRadius: '0',
        width: 'auto',
        height: 'auto',
        fontSize: '18px',
        fontWeight: '900',
        marginLeft: '25px',
        animation: isShaking ? 'shake 0.5s ease-in-out' : 'none'
      }}
      title={`${count} pending emergency(ies)`}
    >
      !
    </span>
  );
};

  // Custom hook for department-based colors
  const useDepartmentColors = (userData) => {
    return useMemo(() => {
      if (!userData?.role) return getEmergencyColor('default');
      
      const role = userData.role.toLowerCase();
      if (role.includes('medical')) return getEmergencyColor('medical');
      if (role.includes('police')) return getEmergencyColor('police');
      if (role.includes('fire')) return getEmergencyColor('fire');
      
      return getEmergencyColor('default');
    }, [userData?.role]);
  };

export default function Sidebar() {
  const { currentUser, userData } = useAuth(); // Get userData from useAuth
  const location = useLocation();
  const userRole = userData?.role; // Use role from userData instead of currentUser
  
  // Get department-based colors
  const departmentColors = useDepartmentColors(userData);
  
  // Update your COLORS constant to use dynamic colors
  const DYNAMIC_COLORS = useMemo(() => ({
    PRIMARY: departmentColors.primary,
    LIGHT: departmentColors.light,
    DARK: departmentColors.dark,
    BACKGROUND: '#fdfdfd',
    TEXT_MUTED: '#6c757d',
    TEXT_DARK: '#2c3e50',
    BORDER: '#dee2e6',
    DANGER: '#dc3545'
  }), [departmentColors]);
  
  // Initialize state from localStorage if available
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  // State for expanded submenus - persist in localStorage
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const savedState = localStorage.getItem('sidebarExpandedMenus');
    return savedState ? JSON.parse(savedState) : {};
  });

  // State for dropdown menu when collapsed
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Use the custom hook for emergency notifications
  const { 
    pendingEmergenciesCount, 
    isShaking, 
    emergencyError,
    isLoadingEmergencies 
  } = useEmergencyNotifications(currentUser, userRole);

  // Persist expanded menus state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarExpandedMenus', JSON.stringify(expandedMenus));
  }, [expandedMenus]);
  
  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when sidebar expands
  useEffect(() => {
    if (!isCollapsed) {
      setActiveDropdown(null);
    }
  }, [isCollapsed]);

  // Toggle submenu expansion
  const toggleSubmenu = useCallback((menuKey) => {
    if (isCollapsed) {
      // Handle dropdown for collapsed sidebar
      setActiveDropdown(activeDropdown === menuKey ? null : menuKey);
    } else {
      // Handle regular submenu expansion
      setExpandedMenus(prev => ({
        ...prev,
        [menuKey]: !prev[menuKey]
      }));
    }
  }, [isCollapsed, activeDropdown]);

  const getDepartment = useCallback(() => {
    if (userRole?.includes('fire')) return DEPARTMENTS.BFP;
    if (userRole?.includes('police')) return DEPARTMENTS.PNP;
    if (userRole?.includes('medical')) return DEPARTMENTS.MDDRMO;
    return null;
  }, [userRole]);

  const department = getDepartment();

  // Get user's full name
  const getUserName = useCallback(() => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    if (currentUser?.name) {
      return currentUser.name;
    }
    if (currentUser?.email) {
      const emailName = currentUser.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'User';
  }, [currentUser]);

  // Get user's role display text
  const getUserRoleDisplay = useCallback(() => {
    if (!userRole) return 'User';
    
    // Map roles to display text
    const roleDisplayMap = {
      [ROLES.POLICE_ADMIN]: 'PNP ADMINISTRATOR',
      [ROLES.FIRE_ADMIN]: 'BFP ADMINISTRATOR',
      [ROLES.PARAMEDIC_ADMIN]: 'MDDRMO ADMINISTRATOR',
      [ROLES.POLICE_RESPONDER]: 'PNP RESPONDER',
      [ROLES.FIRE_RESPONDER]: 'BFP RESPONDER',
      [ROLES.PARAMEDIC_RESPONDER]: 'MDDRMO RESPONDER',
      [ROLES.CITIZEN]: 'CITIZEN',
      [ROLES.SUPER_ADMIN]: 'SUPER ADMINISTRATOR'
    };
    
    return roleDisplayMap[userRole] || userRole.replace('_', ' ').toUpperCase();
  }, [userRole]);

  const getUserInitials = useCallback(() => {
    const name = getUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [getUserName]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Add CSS for shake animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(2px); }
        50% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
      .emergency-notification.shaking {
        animation: shake 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const menuItems = useMemo(() => {
    const emergencyNotification = (
      <EmergencyNotification 
        count={pendingEmergenciesCount} 
        isShaking={isShaking}
        isCollapsed={isCollapsed}
        colors={DYNAMIC_COLORS} // PASS DYNAMIC_COLORS as prop
      />
    );

    return [
      {
        section: 'main',
        title: 'Main Menu',
        items: [
          { 
            path: ROUTES.DASHBOARD, 
            icon: 'fa-tachometer', 
            label: 'Dashboard', 
            show: true 
          },
          { 
            path: ROUTES.EMERGENCIES, 
            icon: 'fa-exclamation-triangle', 
            label: 'Emergencies', 
            show: true,
            notification: emergencyNotification
          },
          { 
            path: ROUTES.USER_MANAGEMENT, 
            icon: 'fa-users', 
            label: 'User Management', 
            show: isAdminRole(userRole),
            submenu: [
              { path: `${ROUTES.USER_MANAGEMENT}/members`, label: 'Members' },
              { path: `${ROUTES.USER_MANAGEMENT}/teams`, label: 'Team' },
              { path: `${ROUTES.USER_MANAGEMENT}/roles`, label: 'Roles & Status' },
            ]
          },
          { 
            path: department ? `${ROUTES.EMERGENCIES}?department=${department}` : ROUTES.EMERGENCIES, 
            icon: 'fa-filter', 
            label: 'My Department', 
            show: isResponderRole(userRole) && department,
            isActive: department ? location.search.includes(`department=${department}`) : false
          },
          { 
            path: ROUTES.MAP, 
            icon: 'fa-map-marker', 
            label: 'Map', 
            show: true 
          },
        ]
      },
      {
        section: 'reports',
        title: 'Reports & Analytics',
        items: [
          { 
            path: ROUTES.REPORTS, 
            icon: 'fa-file-text', 
            label: 'Reports', 
            show: isAdminRole(userRole) 
          }
        ]
      },
      {
        section: 'others',
        title: 'Others',
        items: [
          { 
            path: ROUTES.SETTINGS, 
            icon: 'fa-cog', 
            label: 'Settings', 
            show: true 
          }
        ]
      }
    ];
  }, [userRole, department, location.search, pendingEmergenciesCount, isShaking, isCollapsed, DYNAMIC_COLORS]);

  const isItemActive = useCallback((item) => {
    if (item.isActive !== undefined) return item.isActive;
    
    // Check if current path matches item path or any submenu path
    if (item.submenu) {
      return item.submenu.some(subItem => location.pathname === subItem.path);
    }
    
    return location.pathname === item.path;
  }, [location.pathname]);

  const isSubmenuItemActive = useCallback((subItem) => {
    return location.pathname === subItem.path;
  }, [location.pathname]);

  const handleDropdownClick = useCallback((item, event) => {
    if (isCollapsed && item.submenu) {
      event.preventDefault();
      event.stopPropagation();
      toggleSubmenu(item.path);
    }
  }, [isCollapsed, toggleSubmenu]);

  const renderDropdownMenu = useCallback((item, buttonRect) => {
    if (!isCollapsed || !item.submenu || activeDropdown !== item.path) {
      return null;
    }

    return (
      <div
        ref={dropdownRef}
        className="position-fixed"
        style={{
          left: `${buttonRect.right + 16}px`,
          top: `${buttonRect.top - 9}px`,
          zIndex: 1050,
          minWidth: '200px',
          backgroundColor: COLORS.BACKGROUND,
          border: `1px solid ${COLORS.BORDER}`,
          borderRadius: '0px 8px 8px 0px',
          boxShadow: 'none',
          padding: '8px 0',
          maxHeight: '300px',
          overflowY: 'auto'
        }}
        role="menu"
        aria-label={`${item.label} submenu`}
      >
        {/* Dropdown header */}
        <div 
          className="px-3 py-2 border-bottom"
          style={{
            fontSize: '15px',
            fontWeight: '400',
            color: COLORS.TEXT_MUTED,
            letterSpacing: '0.5px',
            backgroundColor: '#ffffffff'
          }}
        >
          {item.label}
        </div>
        
        {/* Dropdown items */}
        {item.submenu.map((subItem, subIndex) => (
          <Link
            key={subIndex}
            to={subItem.path}
            className={`dropdown-item d-flex align-items-center ${isSubmenuItemActive(subItem) ? 'active' : ''}`}
            style={{
              padding: '10px 16px',
              color: isSubmenuItemActive(subItem) ? DYNAMIC_COLORS.PRIMARY : COLORS.TEXT_MUTED,
              backgroundColor: isSubmenuItemActive(subItem) ? '#e3f2fd' : 'transparent',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isSubmenuItemActive(subItem) ? '500' : '400',
              borderRadius: '0',
              transition: 'all 0.2s ease',
              border: 'none'
            }}
            onClick={() => setActiveDropdown(null)}
            onMouseEnter={(e) => {
              if (!isSubmenuItemActive(subItem)) {
                e.target.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmenuItemActive(subItem)) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
            role="menuitem"
          >
            {subItem.icon && (
              <i 
                className={`fa ${subItem.icon}`} 
                style={{ 
                  width: '16px', 
                  fontSize: '14px',
                  marginRight: '12px',
                  textAlign: 'center'
                }}
              />
            )}
            <span>{subItem.label}</span>
          </Link>
        ))}
      </div>
    );
  }, [isCollapsed, activeDropdown, isSubmenuItemActive]);

  return (
    <div 
      className="sidebar d-flex flex-column" 
      style={{ 
        height: '100vh', 
        width: isCollapsed ? SIDEBAR_CONFIG.COLLAPSED_WIDTH : SIDEBAR_CONFIG.EXPANDED_WIDTH,
        backgroundColor: COLORS.BACKGROUND, 
        borderRight: `1px solid ${COLORS.BORDER}`,
        transition: `width ${SIDEBAR_CONFIG.ANIMATION_DURATION}ms ease`,
        position: 'relative'
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      
      {/* Brand Identity */}
      <div className="brand-section p-3 border-bottom position-relative" style={{ backgroundColor: COLORS.BACKGROUND }}>
        <div className="d-flex align-items-center">
          {/* Temporary Logo */}
          <div 
            className="logo-placeholder d-flex align-items-center justify-content-center"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: DYNAMIC_COLORS.PRIMARY,
              borderRadius: '8px',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              flexShrink: 0
            }}
            aria-label="Tapway Logo"
          >
            T
          </div>
          
          {!isCollapsed && (
            <h4 className="brand-name mb-0 ms-3" style={{ 
              color: COLORS.TEXT_DARK, 
              fontWeight: '600',
              fontSize: '24px',
              whiteSpace: 'nowrap',
              opacity: isCollapsed ? 0 : 1,
              transition: `opacity ${SIDEBAR_CONFIG.ANIMATION_DURATION}ms ease`
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
            color: COLORS.TEXT_MUTED,
            fontSize: '16px',
            padding: '4px 8px',
            border: 'none',
            background: 'none'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
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
                    transition: `opacity ${SIDEBAR_CONFIG.ANIMATION_DURATION}ms ease`
                  }}
                >
                  {section.title}
                </h6>
              )}
              
              <ul className="nav flex-column">
                {visibleItems.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item mb-1 position-relative">
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={(e) => {
                            if (isCollapsed) {
                              handleDropdownClick(item, e);
                            } else {
                              toggleSubmenu(item.path);
                            }
                          }}
                          className={`nav-link d-flex align-items-center justify-content-between w-100 ${isItemActive(item) ? 'active' : ''}`}
                          style={{
                            borderRadius: '6px',
                            padding: isCollapsed ? '10px' : '10px 12px',
                            color: isItemActive(item) ? DYNAMIC_COLORS.PRIMARY: COLORS.TEXT_MUTED,
                            backgroundColor: isItemActive(item) ? '#e3f2fd' : 'transparent',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: isItemActive(item) ? '500' : '400',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          title={isCollapsed ? item.label : ''}
                          aria-expanded={!isCollapsed ? expandedMenus[item.path] : undefined}
                          aria-controls={!isCollapsed ? `submenu-${item.path}` : undefined}
                          aria-label={isCollapsed ? item.label : `${item.label} menu`}
                          onMouseEnter={(e) => {
                            if (isCollapsed && item.submenu) {
                              const rect = e.target.getBoundingClientRect();
                              e.target.setAttribute('data-rect', JSON.stringify({
                                top: rect.top,
                                right: rect.right,
                                bottom: rect.bottom,
                                left: rect.left
                              }));
                            }
                          }}
                        >
                          <div className="d-flex align-items-center">
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
                                transition: `opacity ${SIDEBAR_CONFIG.ANIMATION_DURATION}ms ease`,
                                whiteSpace: 'nowrap'
                              }}>
                                {item.label}
                              </span>
                            )}
                          </div>
                          
                          {/* Notification for emergencies in expanded sidebar */}
                          {!isCollapsed && item.notification && item.notification}
                          
                          {!isCollapsed && (
                            <i 
                              className={`fa ${expandedMenus[item.path] ? 'fa-chevron-down' : 'fa-chevron-right'}`}
                              style={{ fontSize: '12px' }}
                            ></i>
                          )}
                        </button>
                        
                        {/* Render dropdown for collapsed sidebar */}
                        {isCollapsed && activeDropdown === item.path && (
                          <div className="position-relative">
                            {renderDropdownMenu(item, (() => {
                              const button = document.querySelector(`button[title="${item.label}"]`);
                              return button ? button.getBoundingClientRect() : { top: 0, right: SIDEBAR_CONFIG.COLLAPSED_WIDTH };
                            })())}
                          </div>
                        )}
                        
                        {/* Regular submenu for expanded sidebar */}
                        {!isCollapsed && expandedMenus[item.path] && (
                          <ul 
                            className="nav flex-column ps-4 mt-1"
                            id={`submenu-${item.path}`}
                            role="menu"
                          >
                            {item.submenu.map((subItem, subIndex) => (
                              <li key={subIndex} className="nav-item mb-1" role="none">
                                <Link 
                                  to={subItem.path} 
                                  className={`nav-link d-flex align-items-center ${isSubmenuItemActive(subItem) ? 'active' : ''}`}
                                  style={{
                                    borderRadius: '6px',
                                    padding: '8px 12px',
                                    color: isSubmenuItemActive(subItem) ? DYNAMIC_COLORS.PRIMARY : COLORS.TEXT_MUTED,
                                    backgroundColor: isSubmenuItemActive(subItem) ? '#e3f2fd' : 'transparent',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: isSubmenuItemActive(subItem) ? '500' : '400',
                                    transition: 'all 0.2s ease'
                                  }}
                                  role="menuitem"
                                >
                                  {subItem.icon && (
                                    <i 
                                      className={`fa ${subItem.icon}`} 
                                      style={{ 
                                        width: '14px', 
                                        fontSize: '14px',
                                        marginRight: '8px',
                                        textAlign: 'center'
                                      }}
                                    />
                                  )}
                                  <span>{subItem.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link 
                        to={item.path} 
                        className={`nav-link d-flex align-items-center ${isItemActive(item) ? 'active' : ''}`}
                        style={{
                          borderRadius: '6px',
                          padding: isCollapsed ? '10px' : '10px 12px',
                          color: isItemActive(item) ? DYNAMIC_COLORS.PRIMARY : COLORS.TEXT_MUTED,
                          backgroundColor: isItemActive(item) ? '#e3f2fd' : 'transparent',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: isItemActive(item) ? '500' : '400',
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                        title={isCollapsed ? item.label : ''}
                        aria-label={item.label}
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
                            transition: `opacity ${SIDEBAR_CONFIG.ANIMATION_DURATION}ms ease`,
                            whiteSpace: 'nowrap'
                          }}>
                            {item.label}
                          </span>
                        )}
                        
                        {/* Notification for emergencies in expanded sidebar */}
                        {!isCollapsed && item.notification && item.notification}
                        
                        {/* Notification for collapsed sidebar (tooltip only) */}
                        {isCollapsed && item.notification && item.notification}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Dropdown Portal - Rendered outside the sidebar for proper positioning */}
      {activeDropdown && isCollapsed && (
        <div style={{ position: 'absolute', top: 0, left: '100%', zIndex: 1050 }}>
          {menuItems.map((section, sectionIdx) => 
            section.items
              .filter(item => item.show && item.submenu && item.path === activeDropdown)
              .map((item, itemIdx) => {
                const button = document.querySelector(`button[title="${item.label}"]`);
                const rect = button ? button.getBoundingClientRect() : { top: 0, right: SIDEBAR_CONFIG.COLLAPSED_WIDTH };
                return (
                  <div key={`dropdown-${sectionIdx}-${itemIdx}`}>
                    {renderDropdownMenu(item, rect)}
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* User Info Footer */}
      {currentUser && (
        <div className="user-footer p-3 border-top" style={{ backgroundColor: COLORS.BACKGROUND }}>
          <div className={`d-flex align-items-center ${isCollapsed ? 'justify-content-center' : 'justify-content-between'}`}>
            <div className="d-flex align-items-center">
              {/* User Avatar */}
              <div 
                className="user-avatar d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: DYNAMIC_COLORS.PRIMARY,
                  borderRadius: '50%',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  flexShrink: 0,
                  marginRight: isCollapsed ? '0' : '12px'
                }}
                title={isCollapsed ? `${getUserName()} - ${getUserRoleDisplay()}` : ''}
                aria-label={`User avatar for ${getUserName()}`}
              >
                {getUserInitials()}
              </div>
              
              {/* User Details */}
              {!isCollapsed && (
                <div className="user-details flex-grow-1" style={{
                  opacity: isCollapsed ? 0 : 1,
                  transition: `opacity ${SIDEBAR_CONFIG.ANIMATION_DURATION}ms ease`
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
                    <span className="role-text text-muted" style={{ 
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {getUserRoleDisplay()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Logout Button - Only visible when sidebar is not collapsed */}
            {!isCollapsed && (
              <button 
                className="btn btn-link text-muted p-1" 
                onClick={handleLogout}
                style={{ 
                  border: 'none',
                  textDecoration: 'none',
                  fontSize: '16px',
                  opacity: 0.7,
                  transition: 'opacity 0.2s ease'
                }}
                title="Logout"
                aria-label="Logout"
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.7'}
              >
                <svg 
                  width="18" 
                  height="18" 
                  fill="currentColor" 
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}