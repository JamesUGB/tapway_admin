// src/components/common/PaginationControl.jsx
import React from 'react';
import { createPortal } from 'react-dom'; // ADD THIS IMPORT

const PaginationControl = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  showPageSizeControl = true,
  usePortal = false, // NEW PROP: Option to use portal
  portalTarget = 'pagination-portal' // NEW PROP: Portal target ID
}) => {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      
      if (currentPage <= 4) {
        endPage = 5;
      }
      
      if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
      }
      
      if (startPage > 2) {
        pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageSizeOptions = [10, 20, 50, 100];

  const handlePageSizeChange = (e) => {
    onPageSizeChange(parseInt(e.target.value));
  };

  const customStyles = {
    paginationButton: {
      minWidth: '40px',
      height: '40px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '8px',
      margin: '0 2px',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    activeButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
    },
    hoverButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    disabledButton: {
      opacity: '0.4',
      cursor: 'not-allowed'
    },
    navButton: {
      minWidth: '80px',
      height: '40px',
      border: '1px solid #e5e7eb',
      backgroundColor: 'white',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    },
    select: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: '#374151',
      minWidth: '80px'
    },
    infoText: {
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  // CREATE THE PAGINATION CONTENT
  const PaginationContent = () => (
    <div 
      className="d-flex align-items-center justify-content-between py-4"
      style={{
        position: usePortal ? 'fixed' : 'static',
        bottom: usePortal ? '20px' : 'auto',
        left: usePortal ? '50%' : 'auto',
        transform: usePortal ? 'translateX(-50%)' : 'none',
        backgroundColor: usePortal ? 'white' : 'transparent',
        padding: usePortal ? '15px 20px' : '0',
        borderRadius: usePortal ? '12px' : '0',
        boxShadow: usePortal ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
        zIndex: usePortal ? 9998 : 'auto',
        minWidth: usePortal ? '600px' : 'auto',
        border: usePortal ? '1px solid #e5e7eb' : 'none'
      }}
    >
      {/* Items Info */}
      <div style={customStyles.infoText}>
        {totalItems > 0 
          ? `${startItem}-${endItem} of ${totalItems.toLocaleString()}`
          : 'No items'
        }
      </div>
      
      {/* Pagination Controls */}
      <div className="d-flex align-items-center gap-1">
        {/* Previous Button */}
        <button
          style={{
            ...customStyles.navButton,
            ...(currentPage === 1 ? customStyles.disabledButton : {})
          }}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e5e7eb';
            }
          }}
        >
          Previous
        </button>
        
        {/* Page Numbers */}
        <div className="d-flex align-items-center mx-2">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              style={{
                ...customStyles.paginationButton,
                ...(page === currentPage ? customStyles.activeButton : {}),
                ...(page === '...' ? { cursor: 'default' } : {})
              }}
              disabled={page === '...'}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              onMouseEnter={(e) => {
                if (page !== currentPage && page !== '...') {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== currentPage && page !== '...') {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }
              }}
            >
              {page}
            </button>
          ))}
        </div>
        
        {/* Next Button */}
        <button
          style={{
            ...customStyles.navButton,
            ...(currentPage === totalPages ? customStyles.disabledButton : {})
          }}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#e5e7eb';
            }
          }}
        >
          Next
        </button>
      </div>

      {/* Page Size Control */}
      {showPageSizeControl && (
        <div className="d-flex align-items-center gap-2">
          <span style={customStyles.infoText}>Show</span>
          <select
            style={customStyles.select}
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // RENDER WITH PORTAL OR NORMALLY
  if (usePortal) {
    // Create portal target if it doesn't exist
    let portalElement = document.getElementById(portalTarget);
    if (!portalElement) {
      portalElement = document.createElement('div');
      portalElement.id = portalTarget;
      document.body.appendChild(portalElement);
    }

    return createPortal(<PaginationContent />, portalElement);
  }

  return <PaginationContent />;
};

export default PaginationControl;