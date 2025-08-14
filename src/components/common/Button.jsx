export default function Button({ children, className, disabled, ...props }) {
  return (
    <button
      className={`btn ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}