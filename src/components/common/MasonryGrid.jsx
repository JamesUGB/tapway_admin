// src/components/common/MasonryGrid.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

const MasonryGrid = ({ 
  children, 
  columns = 3, 
  gap = 16,
  breakpoints = {
    0: 1,      // Mobile portrait
    576: 1,    // Mobile landscape
    768: 2,    // Tablet portrait
    992: 3,    // Tablet landscape / small desktop
    1200: 4,   // Desktop
    1400: 4    // Large desktop
  },
  className = '',
  autoResize = true,
  animationDelay = 50,
  minColumnWidth = 280, // Minimum width for each column (important for cards)
  ...props 
}) => {
  const containerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const rafRef = useRef(null);
  const [columnCount, setColumnCount] = useState(columns);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Calculate responsive columns with minimum width constraint
  const calculateColumns = useCallback((width) => {
    // First, get breakpoint-based columns
    const breakpointValues = Object.keys(breakpoints)
      .map(key => ({ width: parseInt(key), columns: breakpoints[key] }))
      .sort((a, b) => b.width - a.width);

    let targetColumns = breakpoints[0] || 1;
    for (const breakpoint of breakpointValues) {
      if (width >= breakpoint.width) {
        targetColumns = breakpoint.columns;
        break;
      }
    }

    // Ensure columns don't make cards too narrow
    const maxColumnsForWidth = Math.floor(width / minColumnWidth) || 1;
    return Math.min(targetColumns, maxColumnsForWidth);
  }, [breakpoints, minColumnWidth]);

  // Optimized resize handler with RAF
  const handleResize = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        const newColumnCount = calculateColumns(width);
        if (newColumnCount !== columnCount) {
          setColumnCount(newColumnCount);
        }
      }
    });
  }, [calculateColumns, columnCount]);

  // Initialize and setup resize observer
  useEffect(() => {
    if (!containerRef.current || !autoResize) return;

    // Initial calculation with slight delay to ensure proper measurement
    const initTimer = setTimeout(() => {
      handleResize();
      setIsLoaded(true);
    }, 10);

    // Use ResizeObserver for optimal performance
    if ('ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          for (const entry of entries) {
            const width = entry.contentRect.width;
            setContainerWidth(width);
            const newColumnCount = calculateColumns(width);
            if (newColumnCount !== columnCount) {
              setColumnCount(newColumnCount);
            }
          }
        });
      });
      
      resizeObserverRef.current.observe(containerRef.current);
    } else {
      // Fallback to window resize with debounce
      window.addEventListener('resize', handleResize);
    }

    return () => {
      clearTimeout(initTimer);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [handleResize, autoResize, calculateColumns, columnCount]);

  // Improved column distribution algorithm
  const organizeColumns = useCallback(() => {
    const columns = Array.from({ length: columnCount }, () => []);
    const columnHeights = Array(columnCount).fill(0);
    
    React.Children.forEach(children, (child, index) => {
      if (React.isValidElement(child)) {
        // Find the shortest column for better balance
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
        
        // Estimate height (you can pass height as prop for more accuracy)
        const estimatedHeight = child.props.height || 1;
        columnHeights[shortestColumnIndex] += estimatedHeight;
        
        columns[shortestColumnIndex].push(React.cloneElement(child, {
          key: `${shortestColumnIndex}-${index}`,
          style: {
            ...child.props.style,
            animationDelay: `${index * animationDelay}ms`,
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            width: '100%', // Ensure cards fill column width
            boxSizing: 'border-box'
          }
        }));
      }
    });
    
    return columns;
  }, [children, columnCount, isLoaded, animationDelay]);

  // Calculate column width with proper gap consideration
  const columnWidth = containerWidth > 0 && columnCount > 0
    ? `${(containerWidth - (gap * (columnCount - 1))) / columnCount}px`
    : `${100 / columnCount}%`;

  return (
    <div 
      ref={containerRef}
      className={`masonry-grid ${className}`}
      style={{ 
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: `${gap}px`,
        width: '100%',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease',
        minHeight: isLoaded ? 'auto' : '200px',
        position: 'relative'
      }}
      {...props}
    >
      {organizeColumns().map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="masonry-column"
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            width: columnWidth,
            gap: `${gap}px`,
            minHeight: '0',
            flex: '0 0 auto' // Prevent flex from changing column width
          }}
        >
          {column}
        </div>
      ))}
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div 
          className="position-absolute top-50 start-50 translate-middle"
          style={{ zIndex: 10 }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;