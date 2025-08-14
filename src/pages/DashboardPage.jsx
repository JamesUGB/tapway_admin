import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import DashboardStatsCard from '@/components/ui/DashboardStatsCard';
import { 
  getEmergencies, 
  getEmergenciesByDepartment,
  getEmergenciesByUser 
} from '@/services/firestore';
import { EMERGENCY_STATUS } from '@/constants/emergencyStatus';

export default function DashboardPage() {
  const { currentUser, isSuperAdmin, isAdmin, isResponder, department } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const countByStatus = (status) => {
    return emergencies.filter(e => e.status === status).length;
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        let data = [];
        
        if (isSuperAdmin) {
          data = await getEmergencies();
        } else if (isAdmin && department) {
          data = await getEmergenciesByDepartment(department);
        } else if (isResponder) {
          data = await getEmergenciesByUser(currentUser.uid);
        } else if (currentUser) {
          data = await getEmergenciesByUser(currentUser.uid);
        }
        
        if (isMounted) {
          setEmergencies(data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching emergencies:', error);
          setError('Failed to load emergencies. You may not have sufficient permissions.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser, isSuperAdmin, isAdmin, isResponder, department]);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <main className="container-fluid p-4">
          {/* <h1 className="mb-4">Dashboard</h1> */}
          
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-3 mb-4">
                <DashboardStatsCard
                  title="Total Emergencies"
                  value={emergencies.length}
                  icon="fa-exclamation-triangle"
                  variant="primary"
                />
              </div>
              <div className="col-md-3 mb-4">
                <DashboardStatsCard
                  title="Pending"
                  value={countByStatus(EMERGENCY_STATUS.PENDING)}
                  icon="fa-clock"
                  variant="warning"
                />
              </div>
              <div className="col-md-3 mb-4">
                <DashboardStatsCard
                  title="Assigned"
                  value={countByStatus(EMERGENCY_STATUS.ASSIGNED)}
                  icon="fa-user-check"
                  variant="info"
                />
              </div>
              <div className="col-md-3 mb-4">
                <DashboardStatsCard
                  title="In Progress"
                  value={countByStatus(EMERGENCY_STATUS.IN_PROGRESS)}
                  icon="fa-spinner"
                  variant="primary"
                />
              </div>
              <div className="col-md-3 mb-4">
                <DashboardStatsCard
                  title="Resolved"
                  value={countByStatus(EMERGENCY_STATUS.RESOLVED)}
                  icon="fa-check-circle"
                  variant="success"
                />
              </div>
              <div className="col-md-3 mb-4">
                <DashboardStatsCard
                  title="Cancelled"
                  value={countByStatus(EMERGENCY_STATUS.CANCELLED)}
                  icon="fa-times-circle"
                  variant="danger"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}