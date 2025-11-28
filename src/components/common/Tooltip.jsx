// src/components/common/Tooltip.jsx
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import React from 'react';

const StableTooltip = React.forwardRef(({ 
  children, 
  content, 
  maxWidth = "200px", 
  placement = "top",
  ...props 
}, ref) => {
  if (!content) return children || null;

  return (
    <OverlayTrigger
      placement={placement}
      overlay={
        <Tooltip 
          style={{ 
            position: 'fixed',
            zIndex: 1060 
          }}
        >
          {content}
        </Tooltip>
      }
      popperConfig={{
        strategy: "fixed",
        modifiers: [
          {
            name: "preventOverflow",
            options: {
              boundary: "viewport",
              padding: 8,
            },
          },
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
          {
            name: "computeStyles",
            options: {
              adaptive: false,
              gpuAcceleration: false,
            },
          },
        ],
      }}
    >
      <div
        ref={ref}
        className="text-truncate"
        style={{ 
          maxWidth, 
          cursor: "help",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: 'inline-block'
        }}
        {...props}
      >
        {children || content}
      </div>
    </OverlayTrigger>
  );
});

export default StableTooltip;