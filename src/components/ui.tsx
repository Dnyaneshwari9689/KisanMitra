import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon, action }: { title: string; subtitle?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {icon && <div className="text-emerald-600">{icon}</div>}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sublabel, icon, color = 'emerald' }: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'gray';
}) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg border ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}) {
  const variants: Record<string, string> = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  name,
  options,
  min,
  max,
  step,
}: {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  name?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}) {
  const baseClass = `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
    error ? 'border-rose-300' : 'border-gray-300'
  }`;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {type === 'select' && options ? (
        <select
          name={name}
          value={String(value)}
          onChange={onChange}
          required={required}
          className={baseClass}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={String(value)}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={3}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          className={baseClass}
        />
      )}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: 'gray' | 'green' | 'blue' | 'amber' | 'red' }) {
  const variants: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-emerald-600 ${className}`} />;
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-gray-300 mb-3">{icon}</div>}
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {message && <p className="text-xs text-gray-500 mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizes: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((h, i) => (
              <th key={i} className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-gray-900">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
