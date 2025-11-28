import React, { useEffect } from 'react';

/**
 * Enhanced Minimalist Drawer Component
 * A slide-in drawer with clean design and improved functionality
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether the drawer is visible
 * @param {function} props.onHide - Function to call when drawer is closed
 * @param {string|ReactNode} props.title - Title of the drawer (can be string or custom component)
 * @param {ReactNode} props.children - Content of the drawer
 * @param {string} props.size - Width: 'sm' (320px) | 'md' (480px) | 'lg' (600px) | 'xl' (800px)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 * @param {boolean} props.backdrop - Whether to show backdrop (default: true)
 * @param {boolean} props.keyboard - Close on ESC key (default: true)
 * @param {number} props.backdropOpacity - Backdrop opacity 0-1 (default: 0.4)
 * @param {boolean} props.customHeader - Use custom header component (default: false)
 * @param {ReactNode} props.footer - Optional footer content
 */
export default function Drawer({
  show,
  onHide,
  title,
  children,
  size = 'md',
  className = '',
  style = {},
  backdrop = true,
  keyboard = true,
  backdropOpacity = 0.4,
  customHeader = false,
  footer = null,
  ...props
}) {
  // Handle ESC key press and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keyboard && e.key === 'Escape' && show) {
        onHide();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [show, keyboard, onHide]);

  const handleBackdropClick = (e) => {
    if (backdrop && e.target === e.currentTarget) {
      onHide();
    }
  };

  // Size mappings for drawer width
  const sizeMap = {
    sm: '320px',
    md: '480px',
    lg: '600px',
    xl: '800px'
  };

  const drawerWidth = sizeMap[size] || sizeMap.md;

  return (
    <>
      {/* Backdrop */}
      {backdrop && (
        <div
          className={`drawer-backdrop ${show ? 'show' : ''}`}
          style={{
            opacity: show ? backdropOpacity : 0,
            visibility: show ? 'visible' : 'hidden',
          }}
          onClick={handleBackdropClick}
        />
      )}

      {/* Drawer */}
      <div
        className={`slide-drawer ${show ? 'show' : ''} ${className}`}
        style={{
          width: drawerWidth,
          transform: show ? 'translateX(0)' : 'translateX(100%)',
          ...style,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
        {...props}
      >
        {/* Header */}
        {title && (
          <div className={`drawer-header ${customHeader ? 'custom-header' : ''}`}>
            {customHeader ? (
              <div className="drawer-header-custom">
                {title}
              </div>
            ) : (
              <>
                <h5 className="drawer-title" id="drawer-title">{title}</h5>
                <button
                  type="button"
                  className="drawer-close"
                  onClick={onHide}
                  aria-label="Close drawer"
                  title="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        )}

        {/* Body with scrollable content */}
        <div className="drawer-body">
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="drawer-footer">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        /* Backdrop */
        .drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.3);
          z-index: 1040;
          transition: opacity 0.25s ease-in-out, visibility 0.25s ease-in-out;
          backdrop-filter: blur(2px);
        }

        /* Drawer Container */
        .slide-drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          background: #ffffff;
          box-shadow: -2px 0 24px rgba(0, 0, 0, 0.12);
          z-index: 1050;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        /* Header Styles */
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e8eaed;
          flex-shrink: 0;
          background: #ffffff;
          min-height: 64px;
        }

        .drawer-header.custom-header {
          padding: 16px 24px;
          flex-direction: column;
          align-items: stretch;
        }

        .drawer-header-custom {
          width: 100%;
        }

        .drawer-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          letter-spacing: -0.01em;
        }

        /* Close Button */
        .drawer-close {
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .drawer-close:hover {
          color: #1f2937;
          background-color: #f3f4f6;
        }

        .drawer-close:active {
          background-color: #e5e7eb;
        }

        .drawer-close:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Body */
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px;
          background: #ffffff;
        }

        /* Footer */
        .drawer-footer {
          padding: 16px 24px;
          border-top: 1px solid #e8eaed;
          background: #f9fafb;
          flex-shrink: 0;
        }

        /* Custom scrollbar */
        .drawer-body::-webkit-scrollbar {
          width: 8px;
        }

        .drawer-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .drawer-body::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        .drawer-body::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Animation states */
        .slide-drawer.show {
          transform: translateX(0);
        }

        .drawer-backdrop.show {
          opacity: var(--backdrop-opacity, 0.4);
        }

        /* Focus styles */
        .slide-drawer:focus {
          outline: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .slide-drawer {
            width: 90vw !important;
            max-width: 480px;
          }
          
          .drawer-header {
            padding: 16px 20px;
            min-height: 56px;
          }
          
          .drawer-body {
            padding: 20px;
          }
          
          .drawer-footer {
            padding: 12px 20px;
          }
          
          .drawer-title {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .slide-drawer {
            width: 100vw !important;
            max-width: none;
          }
          
          .drawer-header {
            padding: 14px 16px;
          }
          
          .drawer-body {
            padding: 16px;
          }
          
          .drawer-footer {
            padding: 12px 16px;
          }
        }

        /* Print styles */
        @media print {
          .drawer-backdrop,
          .slide-drawer {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

// Default props
Drawer.defaultProps = {
  size: 'md',
  backdrop: true,
  keyboard: true,
  backdropOpacity: 0.4,
  customHeader: false,
  footer: null,
};