// src/components/common/CustomToggle.jsx
import React from "react";

const CustomToggle = React.forwardRef(({ children, onClick, disabled }, ref) => (
  <button
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      if (!disabled) onClick?.(e);
    }}
    disabled={disabled}
    className="btn"
    style={{
      fontSize: "1rem",
      lineHeight: "1",
      minWidth: "auto",
      padding: "6px 10px",
      borderRadius: "6px",
      border: "1px solid transparent",
      backgroundColor: "transparent",
      color: disabled ? "#9ca3af" : "#6b7280", // muted gray
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      opacity: disabled ? 0.6 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.target.style.backgroundColor = "#f3f4f6"; // light gray bg
        e.target.style.color = "#374151"; // darker text
        e.target.style.borderColor = "#e5e7eb"; // subtle border
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.target.style.backgroundColor = "transparent";
        e.target.style.color = "#6b7280";
        e.target.style.borderColor = "transparent";
      }
    }}
    onFocus={(e) => {
      if (!disabled) {
        e.target.style.outline = "1px solid #3b82f6"; // blue ring
        e.target.style.outlineOffset = "2px";
      }
    }}
    onBlur={(e) => {
      e.target.style.outline = "none";
    }}
  >
    {children}
  </button>
));

CustomToggle.displayName = "CustomToggle";

export default CustomToggle;
