// src/components/common/HorizontalScrollGrid.jsx
import React from 'react';

const HorizontalScrollGrid = ({ 
  children, 
  gap = 16,
  minCardWidth = '60%',
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`horizontal-scroll-grid ${className}`}
      style={{ 
        display: 'flex',
        overflowX: 'auto',
        gap: `${gap}px`,
        padding: '8px 4px 16px 4px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#c1c1c1 #f5f5f5',
        cursor: 'grab',
        userSelect: 'none'
      }}
      onMouseDown={(e) => {
        const element = e.currentTarget;
        let isDown = true;
        let startX = e.pageX - element.offsetLeft;
        let scrollLeft = element.scrollLeft;

        const mouseMoveHandler = (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - element.offsetLeft;
          const walk = (x - startX) * 2;
          element.scrollLeft = scrollLeft - walk;
        };

        const mouseUpHandler = () => {
          isDown = false;
          element.style.cursor = 'grab';
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
        };

        element.style.cursor = 'grabbing';
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      }}
      {...props}
    >
      {React.Children.map(children, (child, index) => 
        React.isValidElement(child) ? (
          <div
            style={{
              flex: `0 0 ${minCardWidth}`,
              minWidth: 0 // Important for flexbox shrinking
            }}
          >
            {React.cloneElement(child, {
              style: {
                ...child.props.style,
                height: '100%',
                marginBottom: 0
              }
            })}
          </div>
        ) : child
      )}
      
      {/* Add some extra space at the end for better scrolling */}
      <div style={{ flex: '0 0 16px' }}></div>
    </div>
  );
};

export default HorizontalScrollGrid;