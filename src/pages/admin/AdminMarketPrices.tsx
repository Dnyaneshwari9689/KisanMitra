import { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, LoadingSpinner, EmptyState, Table, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { MarketPrice } from '@/types';
import { TrendingUp } from 'lucide-react';

export function AdminMarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');
  const [marketFilter, setMarketFilter] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('market_prices').select('*').order('price_date', { ascending: false });
      setPrices(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const latestDate = prices.length > 0 ? prices[0].price_date : '';
    let result = prices.filter((p) => p.price_date === latestDate);
    if (cropFilter) result = result.filter((p) => p.crop_name === cropFilter);
    if (marketFilter) result = result.filter((p) => p.market_name === marketFilter);
    return result;
  }, [prices, cropFilter, marketFilter]);

  const crops = [...new Set(prices.map((p) => p.crop_name))];
  const markets = [...new Set(prices.map((p) => p.market_name))];

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Market Prices" subtitle="Latest mandi price data" />

      <Card className="mb-4">
        <CardBody>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Crop</label>
              <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">All Crops</option>
                {crops.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Market</label>
              <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">All Markets</option>
                {markets.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {filtered.length > 0 ? (
        <Card>
          <Table
            headers={['Crop', 'Market', 'Min', 'Max', 'Modal', 'Arrival', 'Demand', 'Date']}
            rows={filtered.map((p) => [
              <span className="font-medium">{p.crop_name}</span>,
              p.market_name,
              `₹${p.min_price}`,
              `₹${p.max_price}`,
              `₹${p.modal_price}`,
              `${p.arrival_qty} qt`,
              <Badge variant={p.demand_level === 'High' || p.demand_level === 'Very High' ? 'green' : p.demand_level === 'Medium' ? 'amber' : 'gray'}>{p.demand_level}</Badge>,
              p.price_date,
            ])}
          />
        </Card>
      ) : (
        <Card><EmptyState icon={<TrendingUp size={40} />} title="No price data" /></Card>
      )}
    </DashboardLayout>
  );
}
