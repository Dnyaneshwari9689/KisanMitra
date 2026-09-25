import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, StatCard, PageHeader, LoadingSpinner, EmptyState, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { ProduceListing, Offer, PriceAlert, AppNotification } from '@/types';
import {
  Sprout, TrendingUp, Brain, Users, Bell, Handshake, Plus, ArrowRight, Clock,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export function FarmerDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [marketPrices, setMarketPrices] = useState<{ crop_name: string; modal_price: number; price_date: string }[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [produceRes, offersRes, alertsRes, notifRes, pricesRes] = await Promise.all([
        supabase.from('produce_listings').select('*').eq('farmer_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('offers').select('*').eq('farmer_id', profile.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('price_alerts').select('*').eq('farmer_id', profile.id).eq('status', 'active'),
        supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('market_prices').select('crop_name, modal_price, price_date').eq('crop_name', 'Tomato').order('price_date', { ascending: true }).limit(30),
      ]);

      setProduce(produceRes.data ?? []);
      setOffers(offersRes.data ?? []);
      setAlerts(alertsRes.data ?? []);
      setNotifications(notifRes.data ?? []);
      setMarketPrices(pricesRes.data ?? []);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  const activeProduce = produce.filter((p) => p.status === 'active');
  const avgPrice = marketPrices.length > 0 ? marketPrices[marketPrices.length - 1]?.modal_price : 0;
  const chartData = marketPrices.map((p) => ({ date: p.price_date.slice(5), price: p.modal_price }));

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${profile?.full_name}`} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Current Produce" value={activeProduce.length} sublabel="active listings" icon={<Sprout size={20} />} color="emerald" />
        <StatCard label="Avg Market Price" value={`₹${avgPrice}/kg`} sublabel="Tomato (latest)" icon={<TrendingUp size={20} />} color="blue" />
        <StatCard label="Predicted Price" value={`₹${Math.round(avgPrice * 1.08 * 100) / 100}/kg`} sublabel="7-day forecast" icon={<Brain size={20} />} color="amber" />
        <StatCard label="Potential Buyers" value={offers.length} sublabel="active offers" icon={<Users size={20} />} color="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Price chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Tomato Price Trend" subtitle="Last 30 days — Nashik market" icon={<TrendingUp size={18} />} />
          <CardBody>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No price data available" />
            )}
          </CardBody>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader title="Quick Actions" icon={<ArrowRight size={18} />} />
          <CardBody>
            <div className="space-y-2">
              <Link to="/farmer/produce" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Plus size={18} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Add Produce</p>
                  <p className="text-xs text-gray-500">List a new crop</p>
                </div>
              </Link>
              <Link to="/farmer/ai-prediction" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Brain size={18} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">AI Price Prediction</p>
                  <p className="text-xs text-gray-500">Forecast future prices</p>
                </div>
              </Link>
              <Link to="/farmer/best-market" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><TrendingUp size={18} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Find Best Market</p>
                  <p className="text-xs text-gray-500">Compare markets by net return</p>
                </div>
              </Link>
              <Link to="/farmer/find-buyers" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"><Users size={18} /></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Find Buyers</p>
                  <p className="text-xs text-gray-500">Match with buyers</p>
                </div>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Recent offers */}
        <Card>
          <CardHeader title="Recent Offers" icon={<Handshake size={18} />} action={<Link to="/farmer/offers"><span className="text-xs text-emerald-600 font-medium">View all</span></Link>} />
          <CardBody>
            {offers.length > 0 ? (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{offer.crop_name} — {offer.quantity} kg</p>
                      <p className="text-xs text-gray-500">₹{offer.proposed_price}/kg</p>
                    </div>
                    <Badge variant={offer.status === 'accepted' ? 'green' : offer.status === 'rejected' ? 'red' : offer.status === 'completed' ? 'blue' : 'amber'}>
                      {offer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Handshake size={32} />} title="No offers yet" message="Send offers to buyers from the Find Buyers page" />
            )}
          </CardBody>
        </Card>

        {/* Notifications + Alerts */}
        <Card>
          <CardHeader title="Notifications & Alerts" icon={<Bell size={18} />} />
          <CardBody>
            <div className="space-y-3">
              {alerts.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell size={14} className="text-amber-600" />
                    <p className="text-xs font-medium text-amber-700">Active Price Alerts ({alerts.length})</p>
                  </div>
                  {alerts.slice(0, 2).map((a) => (
                    <p key={a.id} className="text-xs text-amber-600 ml-6">{a.crop_name} — target ₹{a.target_price}/kg at {a.market_name}</p>
                  ))}
                </div>
              )}
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50">
                    <Clock size={14} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon={<Bell size={32} />} title="No notifications" />
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
