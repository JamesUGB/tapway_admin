// src/components/ui/GreetingCard.jsx
import { useMemo } from 'react';
import { getGreeting, getMotivationalMessage, getFormattedDate } from '@/utils/greetingHelpers';

export function GreetingCard({ userName }) {
  const greeting = getGreeting();
  const formattedDate = getFormattedDate();
  
  // Use useMemo to prevent the message from changing on re-renders
  const motivationalMessage = useMemo(() => getMotivationalMessage(), []);

  return (
    <div className="mb-4">
      <div className="d-flex flex-column">
        {/* Date above greeting */}
        <p className="text-muted mb-1 fs-6">
          {formattedDate}
        </p>
        
        {/* Greeting in black */}
        <h2 className="h3 mb-2 text-dark fw-bold">
          {greeting}, {userName || 'User'}!
        </h2>
        
        {/* Motivational message */}
        <p className="text-muted mb-0 fs-6">
          {motivationalMessage}
        </p>
      </div>
    </div>
  );
}