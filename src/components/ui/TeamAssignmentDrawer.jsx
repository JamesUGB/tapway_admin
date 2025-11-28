// src/components/ui/TeamAssignmentDrawer.jsx
import { useState, useEffect } from 'react';
import { Button, ListGroup, Badge, Spinner, Form, Alert } from 'react-bootstrap';
import { getAvailableTeams, assignTeamToEmergency } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import Drawer from '../common/Drawer';

export default function TeamAssignmentDrawer({ 
  show, 
  onHide, 
  emergency, 
  onTeamAssigned 
}) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const { userData } = useAuth();

  useEffect(() => {
    if (show && emergency) {
      loadAvailableTeams();
      setError(null);
      setSelectedTeam(null);
    }
  }, [show, emergency]);

  const loadAvailableTeams = async () => {
    setLoading(true);
    try {
      const availableTeams = await getAvailableTeams(emergency.department);
      setTeams(availableTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
      setError('Failed to load available teams');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTeam) return;
    
    setAssigning(true);
    setError(null);
    
    try {
      // Assign team using the firestore service
      await assignTeamToEmergency(emergency.id, selectedTeam, userData.id);
      
      // Notify parent component
      if (onTeamAssigned) {
        onTeamAssigned(emergency.id, selectedTeam);
      }
      
      onHide();
    } catch (error) {
      console.error('Error assigning team:', error);
      setError('Failed to assign team. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  return (
    <Drawer
      show={show}
      onHide={onHide}
      title="Assign Team to Emergency"
      size="lg"
      backdropOpacity={0.3}
    >
      {/* Emergency Details */}
      <div className="mb-4 p-3 bg-light rounded">
        <h6 className="mb-2">Emergency Details:</h6>
        <div className="small">
          <div><strong>ID:</strong> {emergency?.id?.substring(0, 8)}...</div>
          <div><strong>Department:</strong> {emergency?.department}</div>
          <div><strong>Type:</strong> {emergency?.emergencyType}</div>
          <div><strong>Location:</strong> {emergency?.location?.address?.formatted}</div>
          <div><strong>Status:</strong> <Badge bg="warning">Pending</Badge></div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {/* Team Selection */}
      <div className="mb-3">
        <h6 className="mb-2">Select Team:</h6>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <div className="mt-2 text-muted">Loading available teams...</div>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-4 text-muted">
            No available teams for {emergency?.department} department
          </div>
        ) : (
          <ListGroup>
            {teams.map(team => (
              <ListGroup.Item
                key={team.id}
                action
                active={selectedTeam?.id === team.id}
                onClick={() => handleTeamSelect(team)}
                className="d-flex justify-content-between align-items-start"
              >
              <div className="flex-grow-1">
                <div className="fw-bold mb-1">{team.teamName || team.name}</div>
                <div className="small text-muted mb-1">
                  <strong>Members:</strong> {team.members?.map(m => m.name).join(', ') || 
                                            team.memberIds?.length + ' members' || 
                                            'No members assigned'}
                </div>
                <div className="small">
                  <Badge 
                    bg={team.status === 'active' ? 'warning' : 'success'} 
                    className="me-2"
                  >
                    {team.status || 'available'}
                  </Badge>
                  <Badge bg="secondary">
                    {team.activeEmergencies?.length || 0} active emergencies
                  </Badge>
                </div>
              </div>
                {selectedTeam?.id === team.id && (
                  <div className="ms-2 text-primary">
                    ✓
                  </div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-top pt-3 mt-3">
        <div className="d-flex gap-2 justify-content-end">
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            disabled={assigning}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssign}
            disabled={!selectedTeam || assigning}
          >
            {assigning ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Assigning...
              </>
            ) : (
              'Assign Selected Team'
            )}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}