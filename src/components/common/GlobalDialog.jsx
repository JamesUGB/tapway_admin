import { Modal, Button } from "react-bootstrap";
import { X } from "lucide-react";
import { getEmergencyColor } from '@/constants/emergencyColors';

/**
 * GlobalDialog - A reusable confirmation/alert dialog with shadcn/ui styling
 * Enhanced to support emergency color coding
 *
 * @param {boolean} show - Whether the dialog is visible
 * @param {function} onHide - Function to call when the dialog is closed
 * @param {string} title - Title of the dialog
 * @param {string} description - Optional description text below title
 * @param {ReactNode|string} body - Content of the dialog body
 * @param {Array} actions - Array of button configs { label, variant, onClick, disabled }
 * @param {string} emergencyType - Type of emergency for color coding (medical, police, fire)
 * @param {boolean} showCloseButton - Whether to show the close button
 * @param {string} size - Size of the dialog (sm, md, lg, xl)
 */
export default function GlobalDialog({
  show,
  onHide,
  title,
  description,
  body,
  actions = [],
  emergencyType = null,
  showCloseButton = true,
  size = 'md'
}) {
  const emergencyColor = emergencyType ? getEmergencyColor(emergencyType) : null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      dialogClassName="global-dialog"
      contentClassName="border-0 shadow"
      style={{
        '--bs-modal-border-radius': '12px',
        '--bs-modal-padding': '1.5rem'
      }}
    >
      <div 
        className="position-relative p-4"
        style={emergencyColor ? {
          borderLeft: `6px solid ${emergencyColor.primary}`,
          borderTop: `2px solid ${emergencyColor.light}`
        } : {}}
      >
        {/* Custom Close Button - shadcn style */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onHide}
            className="position-absolute top-0 end-0 m-4 p-0 bg-transparent border-0"
            style={{
              width: '20px',
              height: '20px',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            aria-label="Close"
          >
            <X size={20} className="text-muted" />
          </button>
        )}

        {/* Title Section */}
        {title && (
          <div className="mb-2">
            <h2 
              className="m-0 fw-semibold"
              style={{ 
                fontSize: '1.125rem',
                lineHeight: '1.75rem',
                letterSpacing: '-0.01em',
                color: '#09090b'
              }}
            >
              {title}
            </h2>
            {description && (
              <p 
                className="mt-2 mb-0"
                style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                  color: '#71717a'
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Body Content */}
        {body && (
          <div 
            className={`${title || description ? 'mt-4' : ''}`}
            style={{
              fontSize: '0.875rem',
              lineHeight: '1.5rem',
              color: '#3f3f46'
            }}
          >
            {body}
          </div>
        )}

        {/* Actions Footer */}
        {actions.length > 0 && (
          <div className="d-flex justify-content-end gap-2 mt-4 pt-2">
            {actions.map((action, index) => {
              // Map variants to shadcn-style buttons
              const getButtonStyles = (variant) => {
                const baseStyles = {
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  height: '36px',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  border: 'none'
                };

                // Use emergency color for primary actions if emergencyType is provided
                if (emergencyColor && variant === 'primary') {
                  return {
                    ...baseStyles,
                    backgroundColor: emergencyColor.primary,
                    color: '#fafafa'
                  };
                }

                switch (variant) {
                  case 'primary':
                  case 'danger':
                    return {
                      ...baseStyles,
                      backgroundColor: variant === 'danger' ? '#ef4444' : '#18181b',
                      color: '#fafafa'
                    };
                  case 'secondary':
                  case 'outline-secondary':
                    return {
                      ...baseStyles,
                      backgroundColor: 'transparent',
                      color: '#09090b',
                      border: '1px solid #e4e4e7'
                    };
                  default:
                    return {
                      ...baseStyles,
                      backgroundColor: 'transparent',
                      color: '#09090b',
                      border: '1px solid #e4e4e7'
                    };
                }
              };

              const getHoverColor = (variant) => {
                if (emergencyColor && variant === 'primary') {
                  return emergencyColor.dark;
                }
                switch (variant) {
                  case 'danger': return '#dc2626';
                  case 'primary': return '#27272a';
                  default: return '#f4f4f5';
                }
              };

              return (
                <Button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="d-inline-flex align-items-center justify-content-center"
                  style={getButtonStyles(action.variant)}
                  onMouseEnter={(e) => {
                    if (!action.disabled) {
                      const hoverColor = getHoverColor(action.variant);
                      e.currentTarget.style.backgroundColor = hoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!action.disabled) {
                      const originalStyles = getButtonStyles(action.variant);
                      e.currentTarget.style.backgroundColor = originalStyles.backgroundColor;
                    }
                  }}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}