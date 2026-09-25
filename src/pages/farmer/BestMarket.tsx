import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Badge, LoadingSpinner, EmptyState, Table } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { calculateMarketRecommendations } from '@/services/marketScoring';
import { calculateDistance, calculateTransportCost, getVehicleTypes } from '@/services/logistics';
import { predictPrice } from '@/services/mlPrediction';
import type { ProduceListing, MarketPrice, MarketRecommendation } from '@/types';
import { MapPin, Truck, Award, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function BestMarket() {
  const { profile } = useAuth();
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduce, setSelectedProduce] = useState('');
  const [recommendations, setRecommendations] = useState<MarketRecommendation[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [sourceLocation, setSourceLocation] = useState('Nashik');

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const { data } = await supabase.from('produce_listings').select('*').eq('farmer_id', profile.id).eq('status', 'active').order('created_at', { ascending: false });
      setProduce(data ?? []);
      if (data && data.length > 0) {
        setSelectedProduce(data[0].id);
        if (data[0].location) setSourceLocation(data[0].location);
      }
      setLoading(false);
    })();
  }, [profile]);

  useEffect(() => {
    if (selectedProduce) calculateRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduce, sourceLocation]);

  async function calculateRecommendations() {
    const item = produce.find((p) => p.id === selectedProduce);
    if (!item) return;
    setCalculating(true);

    const { data: prices } = await supabase
      .from('market_prices')
      .select('*')
      .eq('crop_name', item.crop_name)
      .order('price_date', { ascending: false })
      .limit(5);

    if (!prices || prices.length === 0) {
      setCalculating(false);
      return;
    }

    // Get latest price per market
    const latestDate = prices[0].price_date;
    const latestPrices = prices.filter((p) => p.price_date === latestDate);

    const { data: markets } = await supabase.from('markets').select('*');

    const commissions: Record<string, number> = {};
    const distances: Record<string, number> = {};
    const transportCosts: Record<string, number> = {};

    for (const mp of latestPrices) {
      const market = markets?.find((m) => m.name === mp.market_name);
      commissions[mp.market_name] = market?.commission_rate ?? 6;
      const dist = calculateDistance(sourceLocation, mp.market_name);
      distances[mp.market_name] = dist;
      const quote = calculateTransportCost(sourceLocation, mp.market_name, item.quantity, 'Medium Truck (6-wheeler)');
      transportCosts[mp.market_name] = quote.transport_cost;
    }

    // Get predictions per market
    const predictedPrices: Record<string, number> = {};
    for (const mp of latestPrices) {
      const pred = await predictPrice({
        crop: item.crop_name,
        currentPrice: mp.modal_price,
        market: mp.market_name,
      });
      predictedPrices[mp.market_name] = pred.predicted_7day;
    }

    const recs = calculateMarketRecommendations({
      cropName: item.crop_name,
      quantity: item.quantity,
      marketPrices: latestPrices as MarketPrice[],
      marketCommissions: commissions,
      distances,
      transportCosts,
      predictedPrices,
    });

    setRecommendations(recs);
    setCalculating(false);
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  const chartData = recommendations.map((r) => ({
    market: r.market_name,
    netRevenue: r.net_revenue,
    score: r.score,
  }));

  return (
    <DashboardLayout>
      <PageHeader title="Find Best Market" subtitle="TOPSIS-weighted market comparison by net return" />

      {produce.length === 0 ? (
        <Card><EmptyState icon={<MapPin size={40} />} title="No produce available" message="Add produce first to get market recommendations." /></Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardBody>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Produce</label>
                  <select value={selectedProduce} onChange={(e) => setSelectedProduce(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    {produce.map((p) => <option key={p.id} value={p.id}>{p.crop_name} — {p.quantity} {p.unit} (Grade {p.quality_grade})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Source Location</label>
                  <input type="text" value={sourceLocation} onChange={(e) => setSourceLocation(e.target.value)} placeholder="Your village/city"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
              </div>
            </CardBody>
          </Card>

          {calculating ? (
            <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
          ) : recommendations.length > 0 ? (
            <>
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
                <AlertCircle size={16} />
                Recommendations use mock predictions. Scoring: Net Revenue (40%), Demand (20%), Distance (20%), Price Trend (20%).
              </div>

              {recommendations[0] && (
                <Card className="mb-6 bg-emerald-50 border-emerald-200">
                  <CardBody>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <Award size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-medium">BEST MARKET RECOMMENDATION</p>
                        <p className="text-lg font-bold text-gray-900">{recommendations[0].market_name} — Score: {recommendations[0].score}/100</p>
                        <p className="text-xs text-gray-600">Net Revenue: ₹{recommendations[0].net_revenue.toLocaleString('en-IN')} | Distance: {recommendations[0].distance_km} km | Demand: {recommendations[0].demand_level}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader title="Net Revenue by Market" icon={<MapPin size={18} />} />
                  <CardBody>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="market" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="netRevenue" fill="#059669" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader title="Market Scores" icon={<Award size={18} />} />
                  <CardBody>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="market" type="category" tick={{ fontSize: 10 }} width={70} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#0284c7" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardHeader title="Market Comparison Table" subtitle="All factors at a glance" icon={<Truck size={18} />} />
                <Table
                  headers={['Rank', 'Market', 'Price', 'Predicted', 'Distance', 'Transport', 'Commission', 'Gross Rev', 'Net Rev', 'Score']}
                  rows={recommendations.map((r) => [
                    <span className="font-bold text-emerald-600">#{r.rank}</span>,
                    <span className="font-medium">{r.market_name}</span>,
                    `₹${r.current_price}`,
                    `₹${r.predicted_price}`,
                    `${r.distance_km} km`,
                    `₹${r.transport_cost.toLocaleString('en-IN')}`,
                    `₹${r.commission_cost.toLocaleString('en-IN')}`,
                    `₹${r.gross_revenue.toLocaleString('en-IN')}`,
                    <span className="font-medium">₹{r.net_revenue.toLocaleString('en-IN')}</span>,
                    <Badge variant={r.rank === 1 ? 'green' : r.rank === 2 ? 'blue' : 'gray'}>{r.score}</Badge>,
                  ])}
                />
              </Card>
            </>
          ) : (
            <Card><EmptyState icon={<MapPin size={40} />} title="No market data available" message="Try selecting a different produce or location." /></Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
