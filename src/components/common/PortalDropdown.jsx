// src/components/common/PortalDropdown.jsx
import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const PortalDropdownToggle = React.forwardRef(({ children, onClick, disabled }, ref) => (
  <CustomToggle
    ref={ref}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </CustomToggle>
));

const PortalDropdown = ({ children, show, onClose, targetElement }) => {
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!show) return;

    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (targetElement && !targetElement.contains(event.target)) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show, onClose, targetElement]);

  // Position the dropdown
// Position the dropdown - LEFT ALIGNED VERSION
useEffect(() => {
  if (show && targetElement && menuRef.current) {
    const rect = targetElement.getBoundingClientRect();
    const menu = menuRef.current;
    
    // Calculate left position to align with left edge of target element
    let leftPosition = rect.left + window.scrollX;
    
    // Check if the menu would go off-screen on the right side
    const menuWidth = menu.offsetWidth || 250; // Use actual width or default
    const viewportWidth = window.innerWidth;
    
    // If menu would go off-screen on the right, align to the right edge of target instead
    if (leftPosition + menuWidth > viewportWidth) {
      leftPosition = rect.right + window.scrollX - menuWidth;
    }
    
    menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
    menu.style.left = `${leftPosition}px`;
  }
}, [show, targetElement]);

  if (!show) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        zIndex: 9999,
        minWidth: '150px'
      }}
      className="bg-white border rounded shadow-lg"
    >
      {children}
    </div>,
    document.body
  );
};

export default PortalDropdown;