import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Brain, MapPin, Users, Calculator, ShieldCheck } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sprout size={24} />
            </div>
            <span className="text-2xl font-bold">KisanMitra</span>
          </Link>

          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Sell Smarter.<br />Earn Better.
          </h2>
          <p className="text-emerald-100 text-sm mb-10 max-w-md">
            AI-Powered Agricultural Market Intelligence — data-driven price prediction, market intelligence, and profit analysis for smarter selling decisions.
          </p>

          <div className="space-y-4">
            {[
              { icon: <Brain size={20} />, label: 'AI Price Prediction', desc: 'Know what your crop will be worth' },
              { icon: <MapPin size={20} />, label: 'Best Market Finder', desc: 'Compare markets by net return, not just price' },
              { icon: <Users size={20} />, label: 'Buyer Matching', desc: 'Find the right buyer for your produce' },
              { icon: <Calculator size={20} />, label: 'Profit Calculator', desc: 'Know your real profit after all costs' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-emerald-200">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-2 text-xs text-emerald-200">
            <ShieldCheck size={16} />
            <span>Bank-grade security with Row Level Security</span>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* KisanMitra logo + name + tagline + welcome */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sprout size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">KisanMitra</h1>
            <p className="text-sm text-emerald-600 font-medium mt-1">AI-Powered Agricultural Market Intelligence</p>
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
          </div>
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sprout size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">KisanMitra</span>
          </Link>
          <h2 className="text-lg font-semibold text-gray-800 mb-1 text-center">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}
