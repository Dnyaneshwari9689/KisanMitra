import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, LoadingSpinner, Table, Badge, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { MarketPrice } from '@/types';
import { TrendingUp, Search } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

export function PriceDiscovery() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [cropFilter, setCropFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('market_prices').select('*').order('price_date', { ascending: false });
      setPrices(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = prices;
    // Keep only latest date per crop-market combo
    const latestDate = prices.length > 0 ? prices[0].price_date : '';
    result = result.filter((p) => p.price_date === latestDate);
    if (cropFilter) result = result.filter((p) => p.crop_name === cropFilter);
    if (stateFilter) result = result.filter((p) => p.state === stateFilter);
    if (marketFilter) result = result.filter((p) => p.market_name === marketFilter);
    if (search) result = result.filter((p) => p.crop_name.toLowerCase().includes(search.toLowerCase()) || p.market_name.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [prices, cropFilter, stateFilter, marketFilter, search]);

  const crops = [...new Set(prices.map((p) => p.crop_name))];
  const states = [...new Set(prices.map((p) => p.state))];
  const markets = [...new Set(prices.map((p) => p.market_name))];

  // Chart data: historical price for selected crop
  const chartCrop = cropFilter || crops[0] || 'Tomato';
  const historicalData = prices
    .filter((p) => p.crop_name === chartCrop)
    .sort((a, b) => a.price_date.localeCompare(b.price_date))
    .map((p) => ({ date: p.price_date.slice(5), price: p.modal_price, market: p.market_name }));

  // Market comparison data
  const marketComparison = filtered.map((p) => ({ market: p.market_name, price: p.modal_price }));

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Market Price Discovery" subtitle="Live mandi prices across markets" />

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Crop</label>
              <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">All Crops</option>
                {crops.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">State</label>
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">All States</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Market</label>
              <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">All Markets</option>
                {markets.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Crop or market..."
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title={`${chartCrop} — Price Trend`} subtitle="Last 30 days" icon={<TrendingUp size={18} />} />
          <CardBody>
            {historicalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No data" />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Market Comparison" subtitle="Modal price by market" icon={<TrendingUp size={18} />} />
          <CardBody>
            {marketComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={marketComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="market" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="price" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No data" />}
          </CardBody>
        </Card>
      </div>

      {/* Price table */}
      <Card>
        <CardHeader title="Market Prices" subtitle={`${filtered.length} results`} icon={<TrendingUp size={18} />} />
        {filtered.length > 0 ? (
          <Table
            headers={['Crop', 'Market', 'Min', 'Max', 'Modal', 'Arrival', 'Demand', 'Date']}
            rows={filtered.map((p) => [
              <span className="font-medium">{p.crop_name}</span>,
              p.market_name,
              `₹${p.min_price}`,
              `₹${p.max_price}`,
              <span className="font-medium">₹{p.modal_price}</span>,
              `${p.arrival_qty} qt`,
              <Badge variant={p.demand_level === 'High' || p.demand_level === 'Very High' ? 'green' : p.demand_level === 'Medium' ? 'amber' : 'gray'}>{p.demand_level}</Badge>,
              p.price_date,
            ])}
          />
        ) : (
          <EmptyState icon={<TrendingUp size={32} />} title="No prices found" message="Try adjusting your filters" />
        )}
      </Card>
    </DashboardLayout>
  );
}
