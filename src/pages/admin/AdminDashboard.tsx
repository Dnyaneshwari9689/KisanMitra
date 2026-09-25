import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, StatCard, PageHeader, LoadingSpinner, Table, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Users, Tractor, Store, Sprout, ShoppingCart, TrendingUp, Handshake } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ farmers: 0, buyers: 0, produce: 0, requirements: 0, offers: 0, transactions: 0 });
  const [produceByCrop, setProduceByCrop] = useState<{ name: string; count: number }[]>([]);
  const [priceTrend, setPriceTrend] = useState<{ date: string; price: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [farmers, buyers, produce, reqs, offers, txs, produceData, priceData] = await Promise.all([
        supabase.from('farmers').select('id', { count: 'exact', head: true }),
        supabase.from('buyers').select('id', { count: 'exact', head: true }),
        supabase.from('produce_listings').select('id', { count: 'exact', head: true }),
        supabase.from('buyer_requirements').select('id', { count: 'exact', head: true }),
        supabase.from('offers').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('produce_listings').select('crop_name'),
        supabase.from('market_prices').select('modal_price, price_date').eq('crop_name', 'Tomato').order('price_date', { ascending: true }).limit(30),
      ]);

      setStats({
        farmers: farmers.count ?? 0,
        buyers: buyers.count ?? 0,
        produce: produce.count ?? 0,
        requirements: reqs.count ?? 0,
        offers: offers.count ?? 0,
        transactions: txs.count ?? 0,
      });

      const cropCounts: Record<string, number> = {};
      (produceData.data ?? []).forEach((p) => { cropCounts[p.crop_name] = (cropCounts[p.crop_name] ?? 0) + 1; });
      setProduceByCrop(Object.entries(cropCounts).map(([name, count]) => ({ name, count })));

      setPriceTrend((priceData.data ?? []).map((p) => ({ date: p.price_date.slice(5), price: p.modal_price })));
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  const pieColors = ['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#6b7280'];

  return (
    <DashboardLayout>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and statistics" />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label="Farmers" value={stats.farmers} icon={<Tractor size={20} />} color="emerald" />
        <StatCard label="Buyers" value={stats.buyers} icon={<Store size={20} />} color="blue" />
        <StatCard label="Produce" value={stats.produce} icon={<Sprout size={20} />} color="amber" />
        <StatCard label="Requirements" value={stats.requirements} icon={<Handshake size={20} />} color="rose" />
        <StatCard label="Offers" value={stats.offers} icon={<TrendingUp size={20} />} color="gray" />
        <StatCard label="Transactions" value={stats.transactions} icon={<ShoppingCart size={20} />} color="emerald" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Produce by Crop" icon={<Sprout size={18} />} />
          <CardBody>
            {produceByCrop.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={produceByCrop} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {produceByCrop.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-gray-500 py-10">No produce data</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Tomato Price Trend" subtitle="Last 30 days" icon={<TrendingUp size={18} />} />
          <CardBody>
            {priceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={priceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-gray-500 py-10">No price data</p>}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
