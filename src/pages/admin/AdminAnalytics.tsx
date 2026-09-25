import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, LoadingSpinner } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [priceByMarket, setPriceByMarket] = useState<{ market: string; price: number }[]>([]);
  const [demandByMarket, setDemandByMarket] = useState<{ name: string; value: number }[]>([]);
  const [priceVolatility, setPriceVolatility] = useState<{ crop: string; volatility: number }[]>([]);
  const [arrivalTrend, setArrivalTrend] = useState<{ date: string; arrival: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: prices } = await supabase.from('market_prices').select('*').order('price_date', { ascending: false });

      if (prices && prices.length > 0) {
        const latestDate = prices[0].price_date;
        const latest = prices.filter((p) => p.price_date === latestDate);

        // Price by market (Tomato)
        const tomatoPrices = latest.filter((p) => p.crop_name === 'Tomato');
        setPriceByMarket(tomatoPrices.map((p) => ({ market: p.market_name, price: p.modal_price })));

        // Demand distribution
        const demandCounts: Record<string, number> = {};
        latest.forEach((p) => { demandCounts[p.demand_level] = (demandCounts[p.demand_level] ?? 0) + 1; });
        setDemandByMarket(Object.entries(demandCounts).map(([name, value]) => ({ name, value })));

        // Price volatility by crop (std dev of last 30 days)
        const crops = [...new Set(prices.map((p) => p.crop_name))];
        const volData: { crop: string; volatility: number }[] = [];
        for (const crop of crops) {
          const cropPrices = prices.filter((p) => p.crop_name === crop).map((p) => p.modal_price);
          if (cropPrices.length > 1) {
            const mean = cropPrices.reduce((a, b) => a + b, 0) / cropPrices.length;
            const variance = cropPrices.reduce((a, b) => a + (b - mean) ** 2, 0) / cropPrices.length;
            volData.push({ crop, volatility: Math.round(Math.sqrt(variance) * 100) / 100 });
          }
        }
        setPriceVolatility(volData);

        // Arrival trend (Tomato, Nashik)
        const arrivals = prices
          .filter((p) => p.crop_name === 'Tomato' && p.market_name === 'Nashik')
          .sort((a, b) => a.price_date.localeCompare(b.price_date))
          .slice(-15)
          .map((p) => ({ date: p.price_date.slice(5), arrival: p.arrival_qty }));
        setArrivalTrend(arrivals);
      }

      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  const pieColors = ['#059669', '#0284c7', '#d97706', '#dc2626'];

  return (
    <DashboardLayout>
      <PageHeader title="Market Analytics" subtitle="Price trends, demand, and volatility" />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Tomato Price by Market" icon={<BarChart3 size={18} />} />
          <CardBody>
            {priceByMarket.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priceByMarket}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="market" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="price" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-gray-500 py-10">No data</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Demand Distribution" icon={<TrendingUp size={18} />} />
          <CardBody>
            {demandByMarket.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={demandByMarket} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {demandByMarket.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-gray-500 py-10">No data</p>}
          </CardBody>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Price Volatility by Crop" subtitle="Standard deviation (₹)" icon={<BarChart3 size={18} />} />
          <CardBody>
            {priceVolatility.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priceVolatility}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="crop" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="volatility" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-gray-500 py-10">No data</p>}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Market Arrivals Trend" subtitle="Tomato — Nashik (last 15 days)" icon={<TrendingUp size={18} />} />
          <CardBody>
            {arrivalTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={arrivalTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="arrival" stroke="#0284c7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-sm text-gray-500 py-10">No data</p>}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
