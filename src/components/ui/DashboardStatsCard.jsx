export default function DashboardStatsCard({ title, value, icon, variant = "default" }) {
  // Modern color variants with subtle backgrounds and borders
  const variantStyles = {
    default: {
      card: "bg-white border-gray-200 hover:border-gray-300",
      icon: "bg-gray-100 text-gray-600",
      value: "text-gray-900"
    },
    primary: {
      card: "bg-blue-50 border-blue-200 hover:border-blue-300",
      icon: "bg-blue-100 text-blue-600", 
      value: "text-blue-900"
    },
    warning: {
      card: "bg-amber-50 border-amber-200 hover:border-amber-300",
      icon: "bg-amber-100 text-amber-600",
      value: "text-amber-900"
    },
    info: {
      card: "bg-sky-50 border-sky-200 hover:border-sky-300", 
      icon: "bg-sky-100 text-sky-600",
      value: "text-sky-900"
    },
    success: {
      card: "bg-green-50 border-green-200 hover:border-green-300",
      icon: "bg-green-100 text-green-600",
      value: "text-green-900"
    },
    danger: {
      card: "bg-red-50 border-red-200 hover:border-red-300",
      icon: "bg-red-100 text-red-600", 
      value: "text-red-900"
    }
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`
      rounded-lg border p-6 shadow-sm transition-all duration-200 
      hover:shadow-md hover:-translate-y-0.5 h-full
      ${styles.card}
    `}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className={`text-3xl font-bold ${styles.value}`}>
            {value}
          </p>
        </div>
        <div className={`
          flex items-center justify-center w-12 h-12 rounded-full
          ${styles.icon}
        `}>
          <i className={`fa ${icon} text-lg`}></i>
        </div>
      </div>
    </div>
  );
}