import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardRedirect } from '@/pages/DashboardRedirect';
import { FarmerDashboard } from '@/pages/farmer/FarmerDashboard';
import { FarmerProduce } from '@/pages/farmer/FarmerProduce';
import { PriceDiscovery } from '@/pages/farmer/PriceDiscovery';
import { AIPrediction } from '@/pages/farmer/AIPrediction';
import { BestMarket } from '@/pages/farmer/BestMarket';
import { FindBuyers } from '@/pages/farmer/FindBuyers';
import { BestTimeToSell } from '@/pages/farmer/BestTimeToSell';
import { ProfitCalculator } from '@/pages/farmer/ProfitCalculator';
import { PriceAlerts } from '@/pages/farmer/PriceAlerts';
import { FarmerOffers } from '@/pages/farmer/FarmerOffers';
import { FarmerProfile } from '@/pages/farmer/FarmerProfile';
import { BuyerDashboard } from '@/pages/buyer/BuyerDashboard';
import { PostRequirement } from '@/pages/buyer/PostRequirement';
import { FindFarmers } from '@/pages/buyer/FindFarmers';
import { BuyerRequirements } from '@/pages/buyer/BuyerRequirements';
import { BuyerOffers } from '@/pages/buyer/BuyerOffers';
import { BuyerTransactions } from '@/pages/buyer/BuyerTransactions';
import { BuyerProfile } from '@/pages/buyer/BuyerProfile';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminFarmers } from '@/pages/admin/AdminFarmers';
import { AdminBuyers } from '@/pages/admin/AdminBuyers';
import { AdminProduce } from '@/pages/admin/AdminProduce';
import { AdminMarkets } from '@/pages/admin/AdminMarkets';
import { AdminMarketPrices } from '@/pages/admin/AdminMarketPrices';
import { AdminTransactions } from '@/pages/admin/AdminTransactions';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { LoadingSpinner } from '@/components/ui';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size={32} /></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size={32} /></div>;
  if (!allowedRoles.includes(profile.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['farmer', 'buyer', 'admin']}>
          <DashboardRedirect />
        </ProtectedRoute>
      } />

      {/* Farmer routes */}
      <Route path="/farmer/dashboard" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
      <Route path="/farmer/produce" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerProduce /></ProtectedRoute>} />
      <Route path="/farmer/price-discovery" element={<ProtectedRoute allowedRoles={['farmer']}><PriceDiscovery /></ProtectedRoute>} />
      <Route path="/farmer/ai-prediction" element={<ProtectedRoute allowedRoles={['farmer']}><AIPrediction /></ProtectedRoute>} />
      <Route path="/farmer/best-market" element={<ProtectedRoute allowedRoles={['farmer']}><BestMarket /></ProtectedRoute>} />
      <Route path="/farmer/find-buyers" element={<ProtectedRoute allowedRoles={['farmer']}><FindBuyers /></ProtectedRoute>} />
      <Route path="/farmer/best-time" element={<ProtectedRoute allowedRoles={['farmer']}><BestTimeToSell /></ProtectedRoute>} />
      <Route path="/farmer/profit-calculator" element={<ProtectedRoute allowedRoles={['farmer']}><ProfitCalculator /></ProtectedRoute>} />
      <Route path="/farmer/alerts" element={<ProtectedRoute allowedRoles={['farmer']}><PriceAlerts /></ProtectedRoute>} />
      <Route path="/farmer/offers" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerOffers /></ProtectedRoute>} />
      <Route path="/farmer/profile" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerProfile /></ProtectedRoute>} />

      {/* Buyer routes */}
      <Route path="/buyer/dashboard" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
      <Route path="/buyer/post-requirement" element={<ProtectedRoute allowedRoles={['buyer']}><PostRequirement /></ProtectedRoute>} />
      <Route path="/buyer/find-farmers" element={<ProtectedRoute allowedRoles={['buyer']}><FindFarmers /></ProtectedRoute>} />
      <Route path="/buyer/requirements" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerRequirements /></ProtectedRoute>} />
      <Route path="/buyer/offers" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerOffers /></ProtectedRoute>} />
      <Route path="/buyer/transactions" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerTransactions /></ProtectedRoute>} />
      <Route path="/buyer/profile" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerProfile /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/farmers" element={<ProtectedRoute allowedRoles={['admin']}><AdminFarmers /></ProtectedRoute>} />
      <Route path="/admin/buyers" element={<ProtectedRoute allowedRoles={['admin']}><AdminBuyers /></ProtectedRoute>} />
      <Route path="/admin/produce" element={<ProtectedRoute allowedRoles={['admin']}><AdminProduce /></ProtectedRoute>} />
      <Route path="/admin/markets" element={<ProtectedRoute allowedRoles={['admin']}><AdminMarkets /></ProtectedRoute>} />
      <Route path="/admin/market-prices" element={<ProtectedRoute allowedRoles={['admin']}><AdminMarketPrices /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { WelcomeDialog } from '@/components/WelcomeDialog';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <WelcomeDialog />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
