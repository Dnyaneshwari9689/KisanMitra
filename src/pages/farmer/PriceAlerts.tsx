import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Input, Badge, LoadingSpinner, EmptyState, Table, Modal } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { PriceAlert } from '@/types';
import { Bell, Plus, Trash2, CheckCircle } from 'lucide-react';

const CROPS = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Soybean', 'Cotton'];
const MARKETS = ['Nashik', 'Pune', 'Mumbai', 'Ahmednagar', 'Nagpur'];

export function PriceAlerts() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ cropName: '', marketName: '', targetPrice: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAlerts(); }, [profile]);

  async function fetchAlerts() {
    if (!profile) return;
    const { data } = await supabase.from('price_alerts').select('*').eq('farmer_id', profile.id).order('created_at', { ascending: false });
    setAlerts(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    await supabase.from('price_alerts').insert({
      farmer_id: profile.id,
      crop_name: form.cropName,
      market_name: form.marketName,
      target_price: Number(form.targetPrice),
      status: 'active',
    });
    await supabase.from('notifications').insert({
      user_id: profile.id,
      title: 'Price Alert Created',
      message: `Alert set for ${form.cropName} at ₹${form.targetPrice}/kg in ${form.marketName}`,
      type: 'info',
    });
    setSubmitting(false);
    setShowModal(false);
    setForm({ cropName: '', marketName: '', targetPrice: '' });
    fetchAlerts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this alert?')) return;
    await supabase.from('price_alerts').delete().eq('id', id);
    fetchAlerts();
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Price Alerts" subtitle="Get notified when your target price is reached"
        action={<Button onClick={() => setShowModal(true)}><span className="flex items-center gap-2"><Plus size={16} /> Create Alert</span></Button>} />

      {alerts.length > 0 ? (
        <Card>
          <Table
            headers={['Crop', 'Market', 'Target Price', 'Status', 'Created', 'Actions']}
            rows={alerts.map((a) => [
              <span className="font-medium">{a.crop_name}</span>,
              a.market_name ?? 'All Markets',
              `₹${a.target_price}/kg`,
              <Badge variant={a.status === 'active' ? 'green' : a.status === 'triggered' ? 'blue' : 'gray'}>{a.status}</Badge>,
              a.created_at?.slice(0, 10) ?? '-',
              <button onClick={() => handleDelete(a.id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={16} /></button>,
            ])}
          />
        </Card>
      ) : (
        <Card>
          <EmptyState icon={<Bell size={40} />} title="No price alerts" message="Create an alert to get notified when your target price is reached."
            action={<Button onClick={() => setShowModal(true)}><span className="flex items-center gap-2"><Plus size={16} /> Create Alert</span></Button>} />
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Price Alert">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Crop <span className="text-rose-500">*</span></label>
            <select value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })} required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
              <option value="">Select Crop</option>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Market</label>
            <select value={form.marketName} onChange={(e) => setForm({ ...form, marketName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
              <option value="">All Markets</option>
              {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <Input label="Target Price (₹/kg)" type="number" name="targetPrice" value={form.targetPrice} onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} required min={0} placeholder="35" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Alert'}</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
