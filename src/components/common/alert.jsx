// src/components/ui/alert.jsx
import * as React from "react";

const alertVariants = {
  default: "bg-background text-foreground border-border",
  destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
};

const Alert = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={`relative w-full rounded-lg border p-4 ${alertVariants[variant]} ${className}`}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };