import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { FileText, Save } from 'lucide-react';

const CROPS = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Soybean', 'Cotton'];
const GRADES = ['A', 'B', 'C'];

export function PostRequirement() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cropName: '',
    quantityRequired: '',
    qualityRequired: 'A',
    offeredPrice: '',
    location: '',
    deliveryDate: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [name]: e.target.value });

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.cropName) e.cropName = 'Crop is required';
    if (!form.quantityRequired || Number(form.quantityRequired) <= 0) e.quantityRequired = 'Quantity must be positive';
    if (!form.offeredPrice || Number(form.offeredPrice) <= 0) e.offeredPrice = 'Price must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !profile) return;
    setSubmitting(true);

    const { error } = await supabase.from('buyer_requirements').insert({
      buyer_id: profile.id,
      crop_name: form.cropName,
      quantity_required: Number(form.quantityRequired),
      quality_required: form.qualityRequired,
      offered_price: Number(form.offeredPrice),
      location: form.location || null,
      delivery_date: form.deliveryDate || null,
      description: form.description || null,
      status: 'active',
    });

    if (!error) {
      await supabase.from('notifications').insert({
        user_id: profile.id,
        title: 'Requirement Posted',
        message: `${form.cropName} requirement posted. Matching farmers will be shown.`,
        type: 'success',
      });
    }

    setSubmitting(false);
    navigate('/buyer/requirements');
  }

  return (
    <DashboardLayout>
      <PageHeader title="Post Requirement" subtitle="Tell farmers what you need to buy" />

      <Card className="max-w-2xl">
        <CardHeader title="New Requirement" icon={<FileText size={18} />} />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Crop <span className="text-rose-500">*</span></label>
                <select value={form.cropName} onChange={set('cropName')} required
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.cropName ? 'border-rose-300' : 'border-gray-300'}`}>
                  <option value="">Select Crop</option>
                  {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.cropName && <p className="text-xs text-rose-500 mt-1">{errors.cropName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Quality Required</label>
                <select value={form.qualityRequired} onChange={set('qualityRequired')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity Required (kg)" type="number" name="quantityRequired" value={form.quantityRequired} onChange={set('quantityRequired')} required error={errors.quantityRequired} min={0} placeholder="1000" />
              <Input label="Offered Price (₹/kg)" type="number" name="offeredPrice" value={form.offeredPrice} onChange={set('offeredPrice')} required error={errors.offeredPrice} min={0} placeholder="30" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Location" name="location" value={form.location} onChange={set('location')} placeholder="Pune, Maharashtra" />
              <Input label="Required Delivery Date" type="date" name="deliveryDate" value={form.deliveryDate} onChange={set('deliveryDate')} />
            </div>
            <Input label="Description" type="textarea" name="description" value={form.description} onChange={set('description')} placeholder="Additional details about your requirement..." />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/buyer/requirements')}>Cancel</Button>
              <Button type="submit" disabled={submitting}><span className="flex items-center gap-2"><Save size={16} /> {submitting ? 'Posting...' : 'Post Requirement'}</span></Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
