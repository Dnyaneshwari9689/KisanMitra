import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Input, Badge, LoadingSpinner } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Buyer } from '@/types';
import { Store, Save, CheckCircle } from 'lucide-react';

export function BuyerProfile() {
  const { profile, refreshProfile } = useAuth();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const { data } = await supabase.from('buyers').select('*').eq('user_id', profile.id).maybeSingle();
      setBuyer(data as Buyer | null);
      if (data) {
        setForm({
          business_name: data.business_name ?? '',
          owner_name: data.owner_name ?? '',
          mobile: data.mobile ?? '',
          email: data.email ?? '',
          business_location: data.business_location ?? '',
          buyer_type: data.buyer_type ?? 'Wholesaler',
        });
      }
      setLoading(false);
    })();
  }, [profile]);

  const set = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [name]: e.target.value });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !buyer) return;
    setSaving(true);
    await supabase.from('buyers').update({
      business_name: form.business_name,
      owner_name: form.owner_name,
      mobile: form.mobile,
      email: form.email,
      business_location: form.business_location,
    }).eq('id', buyer.id);
    await supabase.from('profiles').update({ full_name: form.owner_name, mobile: form.mobile }).eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Profile" subtitle="Manage your buyer profile" />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardBody className="text-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Store size={36} />
            </div>
            <p className="text-lg font-bold text-gray-900">{form.business_name || profile?.full_name}</p>
            <Badge variant="blue">{form.buyer_type || 'Buyer'}</Badge>
            {buyer?.verified && <div className="mt-2"><Badge variant="green"><span className="flex items-center gap-1"><CheckCircle size={10} /> Verified</span></Badge></div>}
            <p className="text-xs text-gray-500 mt-3">{profile?.email}</p>
            <p className="text-xs text-gray-500 mt-1">{form.mobile}</p>
            <p className="text-xs text-gray-500 mt-1">{form.business_location}</p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Edit Profile" icon={<Store size={18} />} />
          <CardBody>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Business Name" name="businessName" value={form.business_name ?? ''} onChange={set('business_name')} />
                <Input label="Owner Name" name="ownerName" value={form.owner_name ?? ''} onChange={set('owner_name')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Mobile" name="mobile" type="tel" value={form.mobile ?? ''} onChange={set('mobile')} />
                <Input label="Email" name="email" type="email" value={form.email ?? ''} onChange={set('email')} />
              </div>
              <Input label="Business Location" name="businessLocation" value={form.business_location ?? ''} onChange={set('business_location')} />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Buyer Type</label>
                <select value={form.buyer_type ?? 'Wholesaler'} onChange={set('buyer_type')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  {['Wholesaler', 'Retailer', 'Processor', 'Exporter', 'FPO', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saving}><span className="flex items-center gap-2"><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</span></Button>
                {saved && <span className="text-sm text-emerald-600">Profile saved!</span>}
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
