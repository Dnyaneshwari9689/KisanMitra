import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { predictPrice } from '@/services/mlPrediction';
import type { ProduceListing, PricePrediction } from '@/types';
import { Clock, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function BestTimeToSell() {
  const { profile } = useAuth();
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduce, setSelectedProduce] = useState('');
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [historical, setHistorical] = useState<{ date: string; price: number }[]>([]);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const { data } = await supabase.from('produce_listings').select('*').eq('farmer_id', profile.id).eq('status', 'active').order('created_at', { ascending: false });
      setProduce(data ?? []);
      if (data && data.length > 0) setSelectedProduce(data[0].id);
      setLoading(false);
    })();
  }, [profile]);

  useEffect(() => {
    if (selectedProduce) runPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduce]);

  async function runPrediction() {
    const item = produce.find((p) => p.id === selectedProduce);
    if (!item) return;
    setPredicting(true);

    const { data: latestPrice } = await supabase.from('market_prices').select('modal_price').eq('crop_name', item.crop_name).order('price_date', { ascending: false }).limit(1).maybeSingle();
    const currentPrice = latestPrice?.modal_price ?? item.min_expected_price;

    const { data: histData } = await supabase.from('market_prices').select('modal_price, price_date').eq('crop_name', item.crop_name).order('price_date', { ascending: true }).limit(15);
    setHistorical((histData ?? []).map((p) => ({ date: p.price_date.slice(5), price: p.modal_price })));

    const result = await predictPrice({ crop: item.crop_name, currentPrice, market: 'Nashik' });
    setPrediction(result);
    setPredicting(false);
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  const chartData = [
    ...historical.map((h) => ({ date: h.date, price: h.price, type: 'historical' })),
    ...(prediction ? [
      { date: 'Today', price: prediction.current_price, type: 'current' },
      { date: '+3d', price: prediction.predicted_3day, type: 'predicted' },
      { date: '+7d', price: prediction.predicted_7day, type: 'predicted' },
      { date: '+15d', price: prediction.predicted_15day, type: 'predicted' },
    ] : []),
  ];

  const recommendationType = prediction
    ? prediction.predicted_7day > prediction.current_price * 1.03
      ? { label: 'Wait', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: <TrendingUp size={28} /> }
      : prediction.predicted_7day < prediction.current_price * 0.97
      ? { label: 'Sell Now', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <Clock size={28} /> }
      : { label: 'Monitor Price', color: 'bg-blue-50 border-blue-200 text-blue-700', icon: <Minus size={28} /> }
    : null;

  return (
    <DashboardLayout>
      <PageHeader title="Best Time to Sell" subtitle="AI-based timing recommendation" />

      {produce.length === 0 ? (
        <Card><EmptyState icon={<Clock size={40} />} title="No produce available" message="Add produce first to get timing recommendations." /></Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardBody>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Produce</label>
              <select value={selectedProduce} onChange={(e) => setSelectedProduce(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                {produce.map((p) => <option key={p.id} value={p.id}>{p.crop_name} — {p.quantity} {p.unit} (Grade {p.quality_grade})</option>)}
              </select>
            </CardBody>
          </Card>

          {predicting ? (
            <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
          ) : prediction && recommendationType ? (
            <>
              {prediction.is_mock && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  <AlertCircle size={16} />
                  Demo prediction — using mock data. Not a guaranteed outcome.
                </div>
              )}

              <div className={`p-5 rounded-xl border-2 mb-6 ${recommendationType.color}`}>
                <div className="flex items-center gap-4">
                  {recommendationType.icon}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide">Recommendation</p>
                    <p className="text-2xl font-bold">{recommendationType.label}</p>
                    <p className="text-sm mt-1">{prediction.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <p className="text-xs text-gray-500">Current Price</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">₹{prediction.current_price}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-blue-500">3-Day Forecast</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">₹{prediction.predicted_3day}</p>
                  <p className="text-xs mt-0.5">{prediction.predicted_3day > prediction.current_price ? <TrendingUp size={12} className="inline" /> : <TrendingDown size={12} className="inline" />} {Math.abs(((prediction.predicted_3day - prediction.current_price) / prediction.current_price) * 100).toFixed(1)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-emerald-500">7-Day Forecast</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">₹{prediction.predicted_7day}</p>
                  <p className="text-xs mt-0.5">{prediction.predicted_7day > prediction.current_price ? <TrendingUp size={12} className="inline" /> : <TrendingDown size={12} className="inline" />} {Math.abs(((prediction.predicted_7day - prediction.current_price) / prediction.current_price) * 100).toFixed(1)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-amber-500">15-Day Forecast</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">₹{prediction.predicted_15day}</p>
                  <p className="text-xs mt-0.5">{prediction.predicted_15day > prediction.current_price ? <TrendingUp size={12} className="inline" /> : <TrendingDown size={12} className="inline" />} {Math.abs(((prediction.predicted_15day - prediction.current_price) / prediction.current_price) * 100).toFixed(1)}%</p>
                </Card>
              </div>

              <Card>
                <CardHeader title="Price Trend & Forecast" subtitle="Historical → Predicted" icon={<TrendingUp size={18} />} />
                <CardBody>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} dot={false} />
                      <ReferenceLine x="Today" stroke="#999" strokeDasharray="3 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>

              <p className="text-xs text-gray-400 mt-4 text-center">Predictions are based on mock data and are not guaranteed outcomes. Use as guidance only.</p>
            </>
          ) : null}
        </>
      )}
    </DashboardLayout>
  );
}
