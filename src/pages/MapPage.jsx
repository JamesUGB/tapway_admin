// src/pages/MapPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertCircle, RefreshCw, MapPin, Clock, User, Navigation, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/common/alert';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/card';
import Sidebar from '@/components/common/Sidebar';
import Navbar from '@/components/common/Navbar';
import { useEmergencies } from '@/hooks/useEmergencies';
import { formatDateTime, formatCitizenInfo, formatLocation } from '@/utils/format';

// Fix default icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom emergency icons based on status
const createEmergencyIcon = (status, type) => {
  const color = getStatusColor(status);
  const emoji = getEmergencyEmoji(type);
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        position: relative;
      ">
        ${emoji}
        ${status === 'pending' ? `
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            background: #ef4444;
            border: 2px solid white;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      </style>
    `,
    className: 'emergency-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const getEmergencyEmoji = (type) => {
  const typeMap = {
    'fire': '🔥',
    'medical': '🚑',
    'accident': '🚗',
    'crime': '🚨',
    'flood': '🌊',
    'earthquake': '🌍',
    'other': '⚠️',
  };
  return typeMap[type?.toLowerCase()] || '🚨';
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#ef4444'; // Red - urgent
    case 'in-progress':
      return '#f59e0b'; // Amber - active
    case 'resolved':
      return '#10b981'; // Green - completed
    case 'cancelled':
      return '#6b7280'; // Gray - inactive
    default:
      return '#dc2626'; // Dark red for unknown
  }
};

const getStatusBadge = (status) => {
  const variants = {
    'pending': 'destructive',
    'in-progress': 'default',
    'resolved': 'secondary',
    'cancelled': 'outline',
  };
  
  return (
    <Badge variant={variants[status] || 'default'} className="capitalize">
      {status}
    </Badge>
  );
};

// Default center for Bogo City, Cebu
const defaultPosition = [11.0521, 124.0050];

export default function MapPage() {
  const { emergencies, loading, error, refreshAll } = useEmergencies();
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Filter emergencies that have valid coordinates
  const emergenciesWithLocation = useMemo(() => {
    return emergencies.filter(emg => 
      emg.location?.coordinates?.lat && 
      emg.location?.coordinates?.lng
    );
  }, [emergencies]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: emergencies.length,
      pending: emergencies.filter(e => e.status === 'pending').length,
      inProgress: emergencies.filter(e => e.status === 'in-progress').length,
      resolved: emergencies.filter(e => e.status === 'resolved').length,
    };
  }, [emergencies]);

  // Update map center if we have emergencies with locations
  useEffect(() => {
    if (emergenciesWithLocation.length > 0) {
      const firstEmergency = emergenciesWithLocation[0];
      setMapCenter([
        firstEmergency.location.coordinates.lat,
        firstEmergency.location.coordinates.lng
      ]);
    }
  }, [emergenciesWithLocation]);

  const handleRefresh = () => {
    if (typeof refreshAll === 'function') {
      refreshAll();
      setLastRefresh(new Date());
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof refreshAll === 'function') {
        refreshAll();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshAll]);

  if (loading && emergencies.length === 0) {
    return (
      <div
        className="d-flex"
        style={{
          minHeight: '100vh',
          overflow: 'hidden',
          backgroundColor: '#f8f8f8ff',
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
          <main className="d-flex align-items-center justify-content-center flex-grow-1">
            <div className="d-flex flex-column align-items-center gap-3">
              <RefreshCw className="animate-spin" style={{ width: '2rem', height: '2rem', color: '#0d6efd' }} />
              <p style={{ fontSize: '0.875rem', color: '#6c757d' }}>Loading emergency data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && emergencies.length === 0) {
    return (
      <div
        className="d-flex"
        style={{
          minHeight: '100vh',
          overflow: 'hidden',
          backgroundColor: '#f8f8f8ff',
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
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <div className="font-semibold">Error loading emergencies</div>
                <div className="mt-1 text-sm">{error}</div>
                <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-3">
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex"
      style={{
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f8f8f8ff',
      }}
    >
      {/* Sidebar */}
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
        {/* Navbar */}
        <div style={{ flexShrink: 0 }}>
          <Navbar />
        </div>

        {/* Page content */}
        <main className="container-fluid p-4">
          {/* Header with stats */}
          <div className="mb-4">
            {/* <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
                  Emergency Map
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#6c757d', margin: 0 }}>
                  Real-time emergency locations and status
                </p>
              </div>
              <Button 
                onClick={handleRefresh}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`me-2 ${loading ? 'animate-spin' : ''}`} style={{ width: '1rem', height: '1rem' }} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div> */}

            {/* Stats Cards */}
            <div className="row g-3">
              <div className="col-md-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d', margin: 0 }}>Total</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{stats.total}</p>
                      </div>
                      <MapPin style={{ width: '2rem', height: '2rem', color: '#6c757d', opacity: 0.5 }} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-md-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d', margin: 0 }}>Pending</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>{stats.pending}</p>
                      </div>
                      <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#ef4444', opacity: 0.5 }} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-md-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d', margin: 0 }}>In Progress</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706', margin: 0 }}>{stats.inProgress}</p>
                      </div>
                      <Navigation style={{ width: '2rem', height: '2rem', color: '#f59e0b', opacity: 0.5 }} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-md-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d', margin: 0 }}>Resolved</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669', margin: 0 }}>{stats.resolved}</p>
                      </div>
                      <Clock style={{ width: '2rem', height: '2rem', color: '#10b981', opacity: 0.5 }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <Card style={{ overflow: 'hidden' }}>
            <CardContent className="p-0" style={{ height: 'calc(100vh - 220px)', position: 'relative' }}>
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Display emergency markers */}
                {emergenciesWithLocation.map((emergency) => {
                  const position = [
                    emergency.location.coordinates.lat,
                    emergency.location.coordinates.lng
                  ];
                  
                  return (
                    <Marker
                      key={emergency.id}
                      position={position}
                      icon={createEmergencyIcon(emergency.status, emergency.type)}
                    >
                      <Popup className="emergency-popup">
                        <div style={{ minWidth: '280px', padding: '0.5rem' }}>
                          <div className="d-flex justify-content-between align-items-start mb-3 pb-2 border-bottom">
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                Emergency ID
                              </div>
                              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600 }}>
                                {emergency.id?.slice(-8)}
                              </div>
                            </div>
                            {getStatusBadge(emergency.status)}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d', marginBottom: '0.25rem' }}>
                                Type
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ fontSize: '1.125rem' }}>
                                  {getEmergencyEmoji(emergency.type)}
                                </span>
                                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                  {emergency.type || 'Unknown'}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d' }}>
                                <User style={{ width: '0.75rem', height: '0.75rem' }} />
                                <span>Reported by</span>
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                {formatCitizenInfo(emergency)}
                              </div>
                            </div>
                            
                            <div>
                              <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d' }}>
                                <MapPin style={{ width: '0.75rem', height: '0.75rem' }} />
                                <span>Location</span>
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                {formatLocation(emergency.location)}
                              </div>
                              {emergency.location?.landmark && (
                                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.25rem' }}>
                                  Near: {emergency.location.landmark}
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <div className="d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d' }}>
                                <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                                <span>Reported</span>
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                {formatDateTime(emergency.createdAt)}
                              </div>
                            </div>
                            
                            {emergency.description && (
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d', marginBottom: '0.25rem' }}>
                                  Description
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                  {emergency.description}
                                </div>
                              </div>
                            )}
                            
                            {emergency.responders && emergency.responders.length > 0 && (
                              <div className="pt-2 border-top">
                                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6c757d' }}>
                                  {emergency.responders.length} responder(s) assigned
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
              
              {/* Legend */}
              <Card style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle style={{ fontSize: '0.875rem', fontWeight: 600 }}>Status Legend</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                      <span style={{ fontSize: '0.75rem' }}>Pending</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                      <span style={{ fontSize: '0.75rem' }}>In Progress</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                      <span style={{ fontSize: '0.75rem' }}>Resolved</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', backgroundColor: '#6b7280' }}></div>
                      <span style={{ fontSize: '0.75rem' }}>Cancelled</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Last refresh indicator */}
              <div style={{ position: 'absolute', top: '1rem', left: '5rem', zIndex: 1000 }}>
                <Card style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <CardContent className="p-2 px-3">
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                      <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                      <span>Updated: {lastRefresh.toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}