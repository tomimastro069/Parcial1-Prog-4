interface BadgeProps {
  children: React.ReactNode;
  variant?: 'alergeno' | 'sinstock' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  className?: string;
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  alergeno: 'bg-orange-100 text-orange-700 border border-orange-200',
  sinstock: 'bg-red-100 text-red-700 border border-red-200',
  success: 'bg-green-100 text-green-700 border border-green-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  danger: 'bg-red-100 text-red-700 border border-red-200',
  info: 'bg-blue-100 text-blue-700 border border-blue-200',
  gray: 'bg-gray-100 text-gray-600 border border-gray-200',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
