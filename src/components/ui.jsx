import { X } from 'lucide-react';

export const Card = ({ className = '', children, ...rest }) => <div className={`card ${className}`} {...rest}>{children}</div>;

const tones = {
  slate: 'bg-slate-100 text-slate-700', blue: 'bg-sky-100 text-royal', green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700', amber: 'bg-amber-100 text-amber-700',
};
export const Badge = ({ tone = 'slate', children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
);
export const DifficultyBadge = ({ level }) => (
  <Badge tone={{ Beginner: 'green', Intermediate: 'blue', Advanced: 'amber' }[level]}>{level}</Badge>
);

const variants = { primary: 'btn-primary', outline: 'btn-outline', danger: 'btn-danger' };
export const Button = ({ variant = 'primary', icon: Icon, children, className = '', ...rest }) => (
  <button className={`btn ${variants[variant]} ${className}`} {...rest}>
    {Icon && <Icon size={16} />}{children}
  </button>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 className="text-xl font-bold">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    <div className="flex flex-wrap gap-2">{actions}</div>
  </div>
);

export const Empty = ({ icon: Icon, title, text, action }) => (
  <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
    {Icon && <Icon size={36} className="text-slate-300" />}
    <div className="font-semibold">{title}</div>
    <p className="max-w-md text-sm text-slate-500">{text}</p>
    {action}
  </Card>
);

export const MockBanner = ({ children }) => (
  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
    <strong>Simulated frontend demonstration data.</strong> {children}
  </div>
);

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" onClick={onClose}>
      <div className={`card max-h-[90vh] w-full overflow-y-auto ${wide ? 'max-w-3xl' : 'max-w-md'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export const StatusDot = ({ on, danger }) => (
  <span className={`inline-block h-3 w-3 rounded-full ${on ? (danger ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-green-500 shadow-[0_0_8px_#22c55e]') : 'bg-slate-300'}`} />
);
