// src/components/ui/TeamDrawer.jsx
import React, { useState, useEffect } from 'react';
import { Badge, Card, ListGroup, Spinner, Alert, Nav, Button, Form } from 'react-bootstrap';
import { getTeamEmergencies, subscribeToConversationMessages, sendTeamMessage, getEmergencyWithUser } from '@/services/firestore';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime, formatLocation, formatCitizenInfo, formatPhoneNumber } from '@/utils/format';
import { EMERGENCY_STATUS_LABELS, EMERGENCY_STATUS_COLORS } from '@/constants/emergencyStatus';
import Drawer from '@/components/common/Drawer';
import ProfileBadge from '@/components/common/ProfileBadge';

export default function TeamDrawer({ 
  show, 
  onHide, 
  team, 
  members,
  activeTab = 'details', // 'details' or 'messaging'
  conversation = null,
  emergency = null
}) {
  const { currentUser, userData } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [activeKey, setActiveKey] = useState(activeTab);
  const [currentConversation, setCurrentConversation] = useState(conversation);
  const [currentEmergency, setCurrentEmergency] = useState(emergency);
  const messagesEndRef = React.useRef(null);
  const unsubscribeRef = React.useRef(null);

  // Reset state when team changes
  useEffect(() => {
    if (team) {
      setActiveKey(activeTab);
      setCurrentConversation(conversation);
      setCurrentEmergency(emergency);
      setMessages([]);
      setNewMessage('');
      setError(null);
      
      // Load conversation if team has active emergencies but no conversation was passed
      if (team.activeEmergencies?.length > 0 && !conversation && activeTab === 'messaging') {
        loadConversationForTeam();
      }
    }
  }, [team, conversation, emergency, activeTab]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load team emergencies when details tab is active
  useEffect(() => {
    if (show && team && activeKey === 'details') {
      loadTeamEmergencies();
    }
  }, [show, team, activeKey]);

  // Subscribe to messages when messaging tab is active
  useEffect(() => {
    if (activeKey !== 'messaging' || !currentConversation?.id) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    setLoading(true);
    setError(null);

    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    try {
      unsubscribeRef.current = subscribeToConversationMessages(
        currentConversation.id,
        (newMessages) => {
          setMessages(newMessages);
          setLoading(false);
        }
      );
    } catch (err) {
      setError('Failed to load messages: ' + err.message);
      setLoading(false);
      console.error('Error subscribing to messages:', err);
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [currentConversation?.id, activeKey]);

  const loadTeamEmergencies = async () => {
    if (!team) return;
    
    setLoading(true);
    setError(null);
    try {
      const teamEmergencies = await getTeamEmergencies(team.id);
      setEmergencies(teamEmergencies);
    } catch (err) {
      setError('Failed to load team emergencies: ' + err.message);
      console.error('Error loading team emergencies:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationForTeam = async () => {
    if (!team?.activeEmergencies?.length) return;

    try {
      setLoading(true);
      const activeEmergencyId = team.activeEmergencies[0];
      
      // Try to get existing conversation
      const existingConversation = await getEmergencyConversation(activeEmergencyId, team.id);
      
      if (existingConversation) {
        setCurrentConversation(existingConversation);
        // You might need to load emergency data here if not provided
        if (!currentEmergency) {
          const emergencyData = await getEmergencyWithUser(activeEmergencyId);
          setCurrentEmergency(emergencyData);
        }
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation?.id) return;

    setSending(true);
    setError('');

    try {
      const messageData = {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        conversationId: currentConversation.id,
        emergencyId: currentConversation.emergencyId,
        teamId: currentConversation.teamId,
        seen: false
      };

      await sendTeamMessage(currentConversation.id, messageData);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message: ' + err.message);
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (senderId) => senderId === currentUser.uid;

  // Get team leader
  const getTeamLeader = () => {
    if (!team || !team.leaderId || !members || !members.length) return null;
    return members.find(member => member.id === team.leaderId);
  };

  const teamLeader = getTeamLeader();

  // Don't render if no team
  if (!team) {
    return null;
  }

  // Check if messaging tab should be available - FIXED LOGIC
  const hasActiveEmergencies = team.activeEmergencies?.length > 0;
  const shouldShowMessagingTab = hasActiveEmergencies;

  // Handle tab change
  const handleTabSelect = (key) => {
    setActiveKey(key);
    setError(null); // Clear errors when switching tabs
    
    // If switching to messaging tab and no conversation loaded, try to load it
    if (key === 'messaging' && hasActiveEmergencies && !currentConversation) {
      loadConversationForTeam();
    }
  };

  // Custom header with tabs
  const CustomHeader = () => (
    <div className="w-100">
      <Nav variant="tabs" activeKey={activeKey} onSelect={handleTabSelect}>
        <Nav.Item>
          <Nav.Link eventKey="details" className="text-dark">
            {`Team ${team.teamName || team.name || 'Unknown'}`}
          </Nav.Link>
        </Nav.Item>
        {shouldShowMessagingTab && (
          <Nav.Item>
            <Nav.Link eventKey="messaging" className="text-dark">
              Messages
              {messages.filter(m => !m.seen && m.senderId !== currentUser.uid).length > 0 && (
                <Badge bg="danger" className="ms-1">
                  {messages.filter(m => !m.seen && m.senderId !== currentUser.uid).length}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        )}
      </Nav>
    </div>
  );

  return (
    <Drawer
      show={show}
      onHide={onHide}
      title={<CustomHeader />}
      size="lg"
      backdropOpacity={0.3}
      customHeader={true}
    >
      {/* Details Tab Content */}
      {activeKey === 'details' && (
        <>
          {/* Team Leader Section */}
          <Card className="mb-4">
            <Card.Header>
              <h6 className="mb-0">Team Leader</h6>
            </Card.Header>
            <Card.Body>
              {teamLeader ? (
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <strong>{teamLeader.firstName} {teamLeader.lastName}</strong>
                    <div className="text-muted small">{teamLeader.employeeId}</div>
                  </div>
                  <Badge bg="primary">Leader</Badge>
                </div>
              ) : (
                <div className="text-muted">No team leader assigned</div>
              )}
            </Card.Body>
          </Card>

          {/* Active Emergencies Section */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Active Emergencies</h6>
              <Badge bg="danger">{emergencies.filter(e => e.status === 'assigned_in_progress').length}</Badge>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                  <div className="mt-2 text-muted">Loading emergencies...</div>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : emergencies.filter(e => e.status === 'assigned_in_progress').length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fa fa-check-circle fa-2x mb-2 text-success"></i>
                  <div>No active emergencies</div>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {emergencies
                    .filter(emergency => emergency.status === 'assigned_in_progress')
                    .map(emergency => (
                      <ListGroup.Item key={emergency.id} className="px-0">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong className="d-block">Emergency ID: {emergency.id}</strong>
                            <small className="text-muted">
                              Created: {formatDateTime(emergency.createdAt)}
                            </small>
                          </div>
                          <Badge bg={EMERGENCY_STATUS_COLORS[emergency.status]}>
                            {EMERGENCY_STATUS_LABELS[emergency.status]}
                          </Badge>
                        </div>
                        
                        <div className="small">
                          <div><strong>Citizen:</strong> {formatCitizenInfo(emergency)}</div>
                          {emergency.userInfo?.phone && (
                            <div><strong>Phone:</strong> {formatPhoneNumber(emergency.userInfo.phone)}</div>
                          )}
                          <div><strong>Location:</strong> {formatLocation(emergency.location)}</div>
                          {emergency.description && (
                            <div><strong>Description:</strong> {emergency.description}</div>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))
                  }
                </ListGroup>
              )}
            </Card.Body>
          </Card>

          {/* Emergency History Section */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">Emergency History</h6>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : emergencies.filter(e => e.status !== 'assigned_in_progress').length === 0 ? (
                <div className="text-center text-muted py-3">
                  No emergency history
                </div>
              ) : (
                <ListGroup variant="flush">
                  {emergencies
                    .filter(emergency => emergency.status !== 'assigned_in_progress')
                    .map(emergency => (
                      <ListGroup.Item key={emergency.id} className="px-0">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong className="d-block">Emergency ID: {emergency.id.substring(0, 8)}...</strong>
                            <small className="text-muted">
                              {formatDateTime(emergency.createdAt)}
                              {emergency.resolvedAt && ` • Resolved: ${formatDateTime(emergency.resolvedAt)}`}
                            </small>
                          </div>
                          <Badge bg={EMERGENCY_STATUS_COLORS[emergency.status]}>
                            {EMERGENCY_STATUS_LABELS[emergency.status]}
                          </Badge>
                        </div>
                        
                        <div className="small">
                          <div><strong>Citizen:</strong> {formatCitizenInfo(emergency)}</div>
                          <div><strong>Location:</strong> {formatLocation(emergency.location)}</div>
                          <div><strong>Status:</strong> {EMERGENCY_STATUS_LABELS[emergency.status]}</div>
                        </div>
                      </ListGroup.Item>
                    ))
                  }
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Messaging Tab Content */}
      {activeKey === 'messaging' && shouldShowMessagingTab && (
        <>
          {/* Emergency Info Header */}
          {currentEmergency && (
            <div className="bg-light p-3 border-bottom mb-3">
              <div className="small">
                <strong>Emergency:</strong> {currentEmergency.emergencyType || 'Unknown Type'}
              </div>
              <div className="small text-muted">
                Status: <Badge bg={currentEmergency.status === 'assigned_in_progress' ? 'warning' : 'secondary'}>
                  {currentEmergency.status}
                </Badge>
              </div>
              {team && (
                <div className="small text-muted">
                  Team: <Badge bg="outline-primary" text="primary">{team.name}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Messages Area */}
          <div className="messages-area" style={{ 
            overflowY: 'auto', 
            maxHeight: '400px',
            minHeight: '200px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            
            {!currentConversation ? (
              <div className="text-center py-4 text-muted">
                <i className="fa fa-comments fa-2x mb-2"></i>
                <div>No conversation available</div>
                <small>Unable to load messages</small>
              </div>
            ) : loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status" className="me-2" />
                <span>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="fa fa-comments fa-2x mb-2"></i>
                <div>No messages yet</div>
                <small>Start the conversation</small>
              </div>
            ) : (
              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`d-flex mb-3 ${isMyMessage(message.senderId) ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className={`message-bubble p-3 rounded ${
                        isMyMessage(message.senderId)
                          ? 'bg-primary text-white'
                          : 'bg-light text-dark'
                      }`}
                      style={{ maxWidth: '70%' }}
                    >
                      <div className="message-text">{message.text}</div>
                      <div
                        className={`message-time small mt-1 ${
                          isMyMessage(message.senderId) ? 'text-white-50' : 'text-muted'
                        }`}
                      >
                        {formatTime(message.sentAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="message-input-area">
            <Form onSubmit={handleSendMessage}>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending || !currentConversation}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={sending || !newMessage.trim() || !currentConversation}
                  style={{ minWidth: '60px' }}
                >
                  {sending ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <i className="fa fa-paper-plane"></i>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </>
      )}
    </Drawer>
  );
}