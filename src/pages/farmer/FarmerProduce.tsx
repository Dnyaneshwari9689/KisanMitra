import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Input, Modal, Badge, LoadingSpinner, EmptyState, Table } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { predictPrice } from '@/services/mlPrediction';
import type { ProduceListing } from '@/types';
import { Plus, Sprout, Edit, Trash2 } from 'lucide-react';

const CROP_NAMES = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Soybean', 'Cotton'];
const CROP_CATEGORIES = ['Vegetables', 'Fruits', 'Cereals', 'Pulses', 'Spices', 'Oilseeds', 'Other'];
const UNITS = ['kg', 'quintal'];

export function FarmerProduce() {
  const { profile } = useAuth();
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [name]: e.target.value });
  };

  useEffect(() => {
    fetchProduce();
  }, [profile]);

  async function fetchProduce() {
    if (!profile) return;
    const { data } = await supabase.from('produce_listings').select('*').eq('farmer_id', profile.id).order('created_at', { ascending: false });
    setProduce(data ?? []);
    setLoading(false);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.cropName) e.cropName = 'Crop is required';
    if (!form.cropCategory) e.cropCategory = 'Category is required';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Quantity must be positive';
    if (!form.qualityGrade) e.qualityGrade = 'Grade is required';
    if (!form.minExpectedPrice || Number(form.minExpectedPrice) <= 0) e.minExpectedPrice = 'Price must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !profile) return;
    setSubmitting(true);

    const { data, error } = await supabase.from('produce_listings').insert({
      farmer_id: profile.id,
      crop_name: form.cropName,
      crop_category: form.cropCategory,
      quantity: Number(form.quantity),
      unit: form.unit ?? 'kg',
      quality_grade: form.qualityGrade,
      harvest_date: form.harvestDate || null,
      location: form.location || null,
      min_expected_price: Number(form.minExpectedPrice),
      available_from: form.availableFrom || null,
      image_url: form.imageUrl || null,
      status: 'active',
    }).select().single();

    if (!error && data) {
      // Auto-generate price prediction
      const { data: latestPrice } = await supabase
        .from('market_prices')
        .select('modal_price')
        .eq('crop_name', form.cropName)
        .order('price_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const currentPrice = latestPrice?.modal_price ?? Number(form.minExpectedPrice);
      const prediction = await predictPrice({
        crop: form.cropName,
        currentPrice,
        market: 'Nashik',
      });

      await supabase.from('price_predictions').insert({
        produce_id: data.id,
        crop_name: form.cropName,
        market_name: 'Nashik',
        current_price: currentPrice,
        predicted_3day: prediction.predicted_3day,
        predicted_7day: prediction.predicted_7day,
        predicted_15day: prediction.predicted_15day,
        confidence: prediction.confidence,
        recommendation: prediction.recommendation,
        is_mock: prediction.is_mock,
      });

      // Create notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: 'Produce Added Successfully',
        message: `${form.cropName} (${form.quantity} ${form.unit ?? 'kg'}) has been listed. Price prediction generated.`,
        type: 'success',
      });
    }

    setSubmitting(false);
    setShowModal(false);
    setForm({});
    setErrors({});
    fetchProduce();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this produce listing?')) return;
    await supabase.from('produce_listings').delete().eq('id', id);
    fetchProduce();
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader
        title="My Produce"
        subtitle="Manage your crop listings"
        action={<Button onClick={() => setShowModal(true)}><span className="flex items-center gap-2"><Plus size={16} /> Add Produce</span></Button>}
      />

      {produce.length > 0 ? (
        <Card>
          <Table
            headers={['Crop', 'Category', 'Quantity', 'Grade', 'Min Price', 'Status', 'Actions']}
            rows={produce.map((p) => [
              <span className="font-medium">{p.crop_name}</span>,
              <Badge variant="gray">{p.crop_category}</Badge>,
              `${p.quantity} ${p.unit}`,
              <Badge variant={p.quality_grade === 'A' ? 'green' : p.quality_grade === 'B' ? 'amber' : 'red'}>Grade {p.quality_grade}</Badge>,
              `₹${p.min_expected_price}/${p.unit}`,
              <Badge variant={p.status === 'active' ? 'green' : 'gray'}>{p.status}</Badge>,
              <button onClick={() => handleDelete(p.id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={16} /></button>,
            ])}
          />
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<Sprout size={40} />}
            title="No produce listed yet"
            message="Add your first crop listing to get price predictions, market recommendations, and buyer matches."
            action={<Button onClick={() => setShowModal(true)}><span className="flex items-center gap-2"><Plus size={16} /> Add Produce</span></Button>}
          />
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Produce" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Crop Name" type="select" name="cropName" value={form.cropName ?? ''} onChange={set('cropName')} required error={errors.cropName}
              options={CROP_NAMES.map((c) => ({ label: c, value: c }))} />
            <Input label="Crop Category" type="select" name="cropCategory" value={form.cropCategory ?? ''} onChange={set('cropCategory')} required error={errors.cropCategory}
              options={CROP_CATEGORIES.map((c) => ({ label: c, value: c }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" name="quantity" value={form.quantity ?? ''} onChange={set('quantity')} required error={errors.quantity} placeholder="500" min={0} />
            <Input label="Unit" type="select" name="unit" value={form.unit ?? 'kg'} onChange={set('unit')}
              options={UNITS.map((u) => ({ label: u, value: u }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Quality/Grade <span className="text-rose-500">*</span></label>
              <select name="qualityGrade" value={form.qualityGrade ?? ''} onChange={set('qualityGrade')} required
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.qualityGrade ? 'border-rose-300' : 'border-gray-300'}`}>
                <option value="">Select Grade</option>
                <option value="A">Grade A (Premium)</option>
                <option value="B">Grade B (Standard)</option>
                <option value="C">Grade C (Below Standard)</option>
              </select>
              {errors.qualityGrade && <p className="text-xs text-rose-500 mt-1">{errors.qualityGrade}</p>}
            </div>
            <Input label="Harvest Date" type="date" name="harvestDate" value={form.harvestDate ?? ''} onChange={set('harvestDate')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" name="location" value={form.location ?? ''} onChange={set('location')} placeholder="Niphad, Nashik" />
            <Input label="Min Expected Price" type="number" name="minExpectedPrice" value={form.minExpectedPrice ?? ''} onChange={set('minExpectedPrice')} required error={errors.minExpectedPrice} placeholder="25" min={0} />
          </div>
          <Input label="Available From" type="date" name="availableFrom" value={form.availableFrom ?? ''} onChange={set('availableFrom')} />
          <Input label="Image URL (optional)" name="imageUrl" value={form.imageUrl ?? ''} onChange={set('imageUrl')} placeholder="https://..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Produce'}</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
