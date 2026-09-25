import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Badge, LoadingSpinner, EmptyState, Table, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { BuyerRequirement } from '@/types';
import { Package, Trash2 } from 'lucide-react';

export function BuyerRequirements() {
  const { profile } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequirements(); }, [profile]);

  async function fetchRequirements() {
    if (!profile) return;
    const { data } = await supabase.from('buyer_requirements').select('*').eq('buyer_id', profile.id).order('created_at', { ascending: false });
    setRequirements(data ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this requirement?')) return;
    await supabase.from('buyer_requirements').delete().eq('id', id);
    fetchRequirements();
  }

  async function toggleStatus(req: BuyerRequirement) {
    const newStatus = req.status === 'active' ? 'closed' : 'active';
    await supabase.from('buyer_requirements').update({ status: newStatus }).eq('id', req.id);
    fetchRequirements();
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="My Requirements" subtitle="Manage your crop requirements" />

      {requirements.length > 0 ? (
        <Card>
          <Table
            headers={['Crop', 'Quantity', 'Grade', 'Offered Price', 'Location', 'Delivery Date', 'Status', 'Actions']}
            rows={requirements.map((req) => [
              <span className="font-medium">{req.crop_name}</span>,
              `${req.quantity_required} kg`,
              `Grade ${req.quality_required}`,
              `₹${req.offered_price}/kg`,
              req.location ?? '-',
              req.delivery_date ?? '-',
              <Badge variant={req.status === 'active' ? 'green' : 'gray'}>{req.status}</Badge>,
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(req)} className="text-amber-500 hover:text-amber-700 text-xs">{req.status === 'active' ? 'Close' : 'Reopen'}</button>
                <button onClick={() => handleDelete(req.id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={16} /></button>
              </div>,
            ])}
          />
        </Card>
      ) : (
        <Card><EmptyState icon={<Package size={40} />} title="No requirements posted" message="Post a requirement to start receiving offers from farmers." /></Card>
      )}
    </DashboardLayout>
  );
}
