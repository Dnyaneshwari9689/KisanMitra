import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import {
  LayoutDashboard, Sprout, TrendingUp, Brain, MapPin, Users, Clock,
  Calculator, Bell, Handshake, User, Store, FileText, Package, BarChart3,
  Settings, LogOut, Menu, X, Search, Tractor, ShoppingCart, ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const farmerNav: NavItem[] = [
  { label: 'Dashboard', path: '/farmer/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'My Produce', path: '/farmer/produce', icon: <Sprout size={18} /> },
  { label: 'Price Discovery', path: '/farmer/price-discovery', icon: <TrendingUp size={18} /> },
  { label: 'AI Prediction', path: '/farmer/ai-prediction', icon: <Brain size={18} /> },
  { label: 'Best Market', path: '/farmer/best-market', icon: <MapPin size={18} /> },
  { label: 'Find Buyers', path: '/farmer/find-buyers', icon: <Users size={18} /> },
  { label: 'Best Time to Sell', path: '/farmer/best-time', icon: <Clock size={18} /> },
  { label: 'Profit Calculator', path: '/farmer/profit-calculator', icon: <Calculator size={18} /> },
  { label: 'Price Alerts', path: '/farmer/alerts', icon: <Bell size={18} /> },
  { label: 'My Offers', path: '/farmer/offers', icon: <Handshake size={18} /> },
  { label: 'Profile', path: '/farmer/profile', icon: <User size={18} /> },
];

const buyerNav: NavItem[] = [
  { label: 'Dashboard', path: '/buyer/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Post Requirement', path: '/buyer/post-requirement', icon: <FileText size={18} /> },
  { label: 'Find Farmers', path: '/buyer/find-farmers', icon: <Tractor size={18} /> },
  { label: 'My Requirements', path: '/buyer/requirements', icon: <Package size={18} /> },
  { label: 'Offers', path: '/buyer/offers', icon: <Handshake size={18} /> },
  { label: 'Transactions', path: '/buyer/transactions', icon: <ShoppingCart size={18} /> },
  { label: 'Profile', path: '/buyer/profile', icon: <User size={18} /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Users', path: '/admin/users', icon: <Users size={18} /> },
  { label: 'Farmers', path: '/admin/farmers', icon: <Tractor size={18} /> },
  { label: 'Buyers', path: '/admin/buyers', icon: <Store size={18} /> },
  { label: 'Produce', path: '/admin/produce', icon: <Sprout size={18} /> },
  { label: 'Markets', path: '/admin/markets', icon: <MapPin size={18} /> },
  { label: 'Market Prices', path: '/admin/market-prices', icon: <TrendingUp size={18} /> },
  { label: 'Transactions', path: '/admin/transactions', icon: <ShoppingCart size={18} /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = profile?.role === 'farmer' ? farmerNav : profile?.role === 'buyer' ? buyerNav : adminNav;
  const roleLabel = profile?.role === 'farmer' ? 'Farmer' : profile?.role === 'buyer' ? 'Buyer' : 'Admin';
  const roleColor = profile?.role === 'farmer' ? 'text-emerald-600' : profile?.role === 'buyer' ? 'text-blue-600' : 'text-amber-600';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - desktop */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sprout size={18} />
            </div>
            <span className="text-lg font-bold text-gray-900">KisanMitra</span>
          </Link>
        </div>

        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center ${roleColor}`}>
              {profile?.role === 'farmer' ? <Tractor size={18} /> : profile?.role === 'buyer' ? <Store size={18} /> : <Settings size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
              <p className={`text-xs ${roleColor}`}>{roleLabel}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {nav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-medium border-r-2 border-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-gray-100">
          <Button variant="outline" size="sm" fullWidth onClick={handleSignOut}>
            <span className="flex items-center justify-center gap-2">
              <LogOut size={16} /> Sign Out
            </span>
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Sprout size={16} />
            </div>
            <span className="text-base font-bold text-gray-900">KisanMitra</span>
          </Link>
          <Link to="/farmer/alerts" className="text-gray-600">
            <Bell size={20} />
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; path?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {item.path ? (
            <Link to={item.path} className="hover:text-emerald-600">{item.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight size={14} />}
        </span>
      ))}
    </nav>
  );
}
