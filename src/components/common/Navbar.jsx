import useAuth from '../../hooks/useAuth'; 
import { logout } from '../../services/auth';
import { isAdminRole } from '../../constants/roles';

export default function Navbar() {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Add search functionality here
    const searchTerm = e.target.search.value;
    console.log('Searching for:', searchTerm);
  };

  const handleNotificationClick = () => {
    // Add notification functionality here
    console.log('Notifications clicked');
  };

  const showAdminLinks = isAdminRole(userRole);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Search Bar - Center */}
          <div className="mx-auto" style={{ maxWidth: '400px', width: '100%' }}>
            <form className="d-flex" onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  className="form-control"
                  type="search"
                  name="search"
                  placeholder="Search..."
                  aria-label="Search"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white'
                  }}
                />
                <button 
                  className="btn btn-outline-light" 
                  type="submit"
                  style={{ borderLeft: 'none' }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    fill="currentColor" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - User Info, Notifications, and Logout */}
          <div className="d-flex align-items-center">
            {currentUser && (
              <>
                <span className="navbar-text me-3 d-none d-md-inline">
                  {/* {currentUser.email} */}
                </span>
                
                {/* Notification Icon */}
                <button 
                  className="btn btn-link text-light me-2 position-relative p-2"
                  onClick={handleNotificationClick}
                  style={{ 
                    border: 'none',
                    textDecoration: 'none'
                  }}
                  title="Notifications"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    fill="currentColor" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                  </svg>
                  {/* Notification badge */}
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                    3
                    <span className="visually-hidden">unread notifications</span>
                  </span>
                </button>

                {/* Logout Icon */}
                <button 
                  className="btn btn-link text-light p-2" 
                  onClick={handleLogout}
                  style={{ 
                    border: 'none',
                    textDecoration: 'none'
                  }}
                  title="Logout"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    fill="currentColor" 
                    viewBox="0 0 16 16"
                  >
                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}