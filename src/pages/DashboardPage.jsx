// src/pages/DashboardPage.jsx
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { DashboardStats } from '@/components/ui/DashboardStats';
import { TimePeriodToggle } from '@/components/ui/TimePeriodToggle';
import { ResolvedEmergenciesTable } from '@/components/ui/ResolvedEmergenciesTable';
import { TeamPerformanceChart } from '@/components/ui/TeamPerformanceChart';
import { GreetingCard } from '@/components/ui/GreetingCard'; // Add this import
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTimePeriodFilter } from '@/hooks/useTimePeriodFilter';
import { EMERGENCY_STATUS } from '@/constants/emergencyStatus';

export default function DashboardPage() {
  const { userData } = useAuth();
  const { 
    emergencies, 
    stats, 
    teamStats, 
    loading, 
    error 
  } = useDashboardData();

  const {
    timePeriod,
    setTimePeriod,
    filteredEmergencies,
    timePeriodInfo
  } = useTimePeriodFilter(emergencies);

  // Memoize the response time calculation
  const calculateResponseTime = useCallback((emergency) => {
    if (!emergency.createdAt || (!emergency.resolvedAt && emergency.status !== EMERGENCY_STATUS.RESOLVED)) {
      return 'N/A';
    }
    
    try {
      const created = emergency.createdAt?.toDate ? 
        emergency.createdAt.toDate() : 
        new Date(emergency.createdAt);
      
      const resolved = emergency.resolvedAt?.toDate ? 
        emergency.resolvedAt.toDate() : 
        new Date(emergency.resolvedAt || emergency.updatedAt);
      
      const diffMs = resolved - created;
      
      if (diffMs < 0) return 'N/A';
      
      const diffMins = Math.round(diffMs / (1000 * 60));
      
      if (diffMins < 60) return `${diffMins}m`;
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return `${hours}h ${minutes}m`;
    } catch (error) {
      return 'N/A';
    }
  }, []);

  return (
    <div 
      className="d-flex" 
      style={{ 
        minHeight: '100vh', 
        overflow: 'hidden', 
        backgroundColor: '#f8f8f8ff' 
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>
      
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <Navbar />
        </div>
        
        <main className="container-fluid p-4">
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-5">
              <LoadingSpinner />
              <p className="mt-2 text-muted">Loading dashboard data...</p>
            </div>
          ) : (
            <div className="row">
              {/* LEFT COLUMN */}
              <div className="col-lg-8">
                {/* Add Greeting Card here */}
                <GreetingCard userName={userData?.firstName || userData?.displayName} />
                
                <DashboardStats stats={stats} />

                <div className="row">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-white border-0 d-flex justify-content-between align-items-start">
                        <div className="d-flex flex-column">
                          <h5 className="mb-1">Recent Resolved Emergencies</h5>
                          <small className="text-muted mt-1">
                            {timePeriodInfo}
                          </small>
                        </div>
                        <TimePeriodToggle 
                          timePeriod={timePeriod} 
                          setTimePeriod={setTimePeriod} 
                        />
                      </div>
                      <div className="card-body p-0">
                        <ResolvedEmergenciesTable 
                          emergencies={filteredEmergencies}
                          timePeriodInfo={timePeriodInfo}
                          calculateResponseTime={calculateResponseTime}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="col-lg-4">
                <TeamPerformanceChart teamStats={teamStats} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}