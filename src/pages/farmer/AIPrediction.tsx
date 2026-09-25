import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Input, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { predictPrice } from '@/services/mlPrediction';
import type { ProduceListing, PricePrediction } from '@/types';
import { Brain, Sparkles, AlertCircle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';

export function AIPrediction() {
  const { profile } = useAuth();
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduce, setSelectedProduce] = useState<string>('');
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [historicalPrices, setHistoricalPrices] = useState<{ date: string; price: number }[]>([]);

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

    // Get latest market price
    const { data: latestPrice } = await supabase
      .from('market_prices')
      .select('modal_price')
      .eq('crop_name', item.crop_name)
      .order('price_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentPrice = latestPrice?.modal_price ?? item.min_expected_price;

    // Get historical prices
    const { data: histData } = await supabase
      .from('market_prices')
      .select('modal_price, price_date')
      .eq('crop_name', item.crop_name)
      .order('price_date', { ascending: true })
      .limit(30);

    const hist = (histData ?? []).map((p) => ({ date: p.price_date.slice(5), price: p.modal_price }));
    setHistoricalPrices(hist);

    const result = await predictPrice({
      crop: item.crop_name,
      currentPrice,
      historicalPrices: hist.map((h) => h.price),
      market: 'Nashik',
      quantity: item.quantity,
      arrivalQty: 250,
      demand: 'Medium',
    });

    setPrediction(result);
    setPredicting(false);
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  // Build chart data: historical + predicted
  const chartData = [
    ...historicalPrices.slice(-15).map((h) => ({ date: h.date, price: h.price, type: 'historical' })),
    ...(prediction ? [
      { date: 'Today', price: prediction.current_price, type: 'current' },
      { date: '+3d', price: prediction.predicted_3day, type: 'predicted' },
      { date: '+7d', price: prediction.predicted_7day, type: 'predicted' },
      { date: '+15d', price: prediction.predicted_15day, type: 'predicted' },
    ] : []),
  ];

  return (
    <DashboardLayout>
      <PageHeader title="AI Price Prediction" subtitle="ML-based price forecasting" />

      {produce.length === 0 ? (
        <Card>
          <EmptyState icon={<Brain size={40} />} title="No produce available" message="Add produce first to get AI price predictions." />
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Produce</label>
                  <select value={selectedProduce} onChange={(e) => setSelectedProduce(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    {produce.map((p) => <option key={p.id} value={p.id}>{p.crop_name} — {p.quantity} {p.unit} (Grade {p.quality_grade})</option>)}
                  </select>
                </div>
                <Button onClick={runPrediction} disabled={predicting}>
                  <span className="flex items-center gap-2"><Sparkles size={16} /> {predicting ? 'Predicting...' : 'Run Prediction'}</span>
                </Button>
              </div>
            </CardBody>
          </Card>

          {prediction && (
            <>
              {prediction.is_mock && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  <AlertCircle size={16} />
                  Demo prediction — using mock data. Connect a real ML API (XGBoost/Random Forest) for production predictions.
                </div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <p className="text-xs text-gray-500">Current Price</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">₹{prediction.current_price}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-blue-500">Predicted (3 days)</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">₹{prediction.predicted_3day}</p>
                  <p className="text-xs mt-0.5">{prediction.predicted_3day > prediction.current_price ? '↑' : '↓'} {Math.abs(((prediction.predicted_3day - prediction.current_price) / prediction.current_price) * 100).toFixed(1)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-emerald-500">Predicted (7 days)</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">₹{prediction.predicted_7day}</p>
                  <p className="text-xs mt-0.5">{prediction.predicted_7day > prediction.current_price ? '↑' : '↓'} {Math.abs(((prediction.predicted_7day - prediction.current_price) / prediction.current_price) * 100).toFixed(1)}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-amber-500">Predicted (15 days)</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">₹{prediction.predicted_15day}</p>
                  <p className="text-xs mt-0.5">{prediction.predicted_15day > prediction.current_price ? '↑' : '↓'} {Math.abs(((prediction.predicted_15day - prediction.current_price) / prediction.current_price) * 100).toFixed(1)}%</p>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader title="Price Prediction Chart" subtitle="Historical → Current → Predicted" icon={<Brain size={18} />} />
                  <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} fill="url(#colorPrice)" />
                        <ReferenceLine x="Today" stroke="#999" strokeDasharray="3 3" label="Today" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Prediction Details" icon={<Sparkles size={18} />} />
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Confidence Level</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${prediction.confidence}%` }} />
                          </div>
                          <span className="text-sm font-bold text-gray-900">{prediction.confidence}%</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <p className="text-xs font-medium text-emerald-700 mb-1">Recommendation</p>
                        <p className="text-sm text-emerald-800">{prediction.recommendation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Model Status</p>
                        <Badge variant={prediction.is_mock ? 'amber' : 'green'}>
                          {prediction.is_mock ? 'Mock Prediction (Demo)' : 'ML Model Prediction'}
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
