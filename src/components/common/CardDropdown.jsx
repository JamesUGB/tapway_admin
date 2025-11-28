// src/components/common/CardDropdown.jsx (Enhanced version)
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import CustomToggle from './CustomToggle';

const CardDropdown = ({ children, disabled, placement = 'bottom-end' }) => {
  const [show, setShow] = useState(false);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);

  const handleToggle = () => {
    if (!disabled) setShow(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          toggleRef.current && !toggleRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  // Position dropdown
  useEffect(() => {
    if (show && toggleRef.current && menuRef.current) {
      const toggleRect = toggleRef.current.getBoundingClientRect();
      const menu = menuRef.current;
      
      let top, right;
      
      switch (placement) {
        case 'bottom-start':
          top = toggleRect.bottom + window.scrollY + 4;
          right = window.innerWidth - toggleRect.left - window.scrollX;
          break;
        case 'bottom-end':
        default:
          top = toggleRect.bottom + window.scrollY + 4;
          right = window.innerWidth - toggleRect.right - window.scrollX;
          break;
      }

      menu.style.top = `${top}px`;
      menu.style.right = `${right}px`;
    }
  }, [show, placement]);

  return (
    <div className="card-dropdown-container">
      <CustomToggle
        ref={toggleRef}
        onClick={handleToggle}
        disabled={disabled}
      >
      <span style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: "0.4" }}>
        <span>•</span>
        <span>•</span>
        <span>•</span>
      </span>

      </CustomToggle>

      {show && createPortal(
        <div
          ref={menuRef}
          className="card-dropdown-menu"
          style={{
            position: 'absolute',
            zIndex: 1000,
            minWidth: '160px',
            background: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '4px 0',
          }}
        >
          {React.Children.map(children, (child, index) => 
            React.cloneElement(child, {
              className: `${child.props.className || ''} card-dropdown-item`,
              style: {
                ...child.props.style,
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                fontSize: '14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                ...child.props.style
              },
              onClick: (e) => {
                if (!disabled) {
                  child.props.onClick?.(e);
                  setShow(false);
                }
              },
              onMouseEnter: (e) => {
                if (!disabled) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              },
              onMouseLeave: (e) => {
                e.target.style.backgroundColor = 'transparent';
              }
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CardDropdown;