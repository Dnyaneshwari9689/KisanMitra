import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Input, Badge, LoadingSpinner } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Farmer } from '@/types';
import { User, Save } from 'lucide-react';

export function FarmerProfile() {
  const { profile, refreshProfile } = useAuth();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const { data } = await supabase.from('farmers').select('*').eq('user_id', profile.id).maybeSingle();
      setFarmer(data as Farmer | null);
      if (data) {
        setForm({
          full_name: data.full_name ?? '',
          mobile: data.mobile ?? '',
          email: data.email ?? '',
          village: data.village ?? '',
          district: data.district ?? '',
          state: data.state ?? '',
          pincode: data.pincode ?? '',
        });
      }
      setLoading(false);
    })();
  }, [profile]);

  const set = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [name]: e.target.value });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !farmer) return;
    setSaving(true);
    await supabase.from('farmers').update({
      full_name: form.full_name,
      mobile: form.mobile,
      email: form.email,
      village: form.village,
      district: form.district,
      state: form.state,
      pincode: form.pincode,
    }).eq('id', farmer.id);

    await supabase.from('profiles').update({ full_name: form.full_name, mobile: form.mobile }).eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Profile" subtitle="Manage your farmer profile" />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardBody className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <User size={36} />
            </div>
            <p className="text-lg font-bold text-gray-900">{profile?.full_name}</p>
            <Badge variant="green">Farmer</Badge>
            <p className="text-xs text-gray-500 mt-3">{profile?.email}</p>
            <p className="text-xs text-gray-500 mt-1">{form.mobile}</p>
            {form.village && <p className="text-xs text-gray-500 mt-1">{form.village}, {form.district}, {form.state}</p>}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Edit Profile" icon={<User size={18} />} />
          <CardBody>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" name="fullName" value={form.full_name ?? ''} onChange={set('full_name')} />
                <Input label="Mobile" name="mobile" type="tel" value={form.mobile ?? ''} onChange={set('mobile')} />
              </div>
              <Input label="Email" name="email" type="email" value={form.email ?? ''} onChange={set('email')} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Village" name="village" value={form.village ?? ''} onChange={set('village')} />
                <Input label="District" name="district" value={form.district ?? ''} onChange={set('district')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="State" name="state" value={form.state ?? ''} onChange={set('state')} />
                <Input label="Pincode" name="pincode" value={form.pincode ?? ''} onChange={set('pincode')} />
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
