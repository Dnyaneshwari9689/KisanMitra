import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, PageHeader, Badge, LoadingSpinner, EmptyState, Table } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { ProduceListing } from '@/types';
import { Sprout } from 'lucide-react';

export function AdminProduce() {
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('produce_listings').select('*').order('created_at', { ascending: false });
      setProduce(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Produce Listings" subtitle="All farmer produce" />
      {produce.length > 0 ? (
        <Card>
          <Table
            headers={['Crop', 'Category', 'Quantity', 'Grade', 'Min Price', 'Location', 'Status', 'Created']}
            rows={produce.map((p) => [
              <span className="font-medium">{p.crop_name}</span>,
              p.crop_category,
              `${p.quantity} ${p.unit}`,
              `Grade ${p.quality_grade}`,
              `₹${p.min_expected_price}/${p.unit}`,
              p.location ?? '-',
              <Badge variant={p.status === 'active' ? 'green' : p.status === 'sold' ? 'blue' : 'gray'}>{p.status}</Badge>,
              p.created_at?.slice(0, 10) ?? '-',
            ])}
          />
        </Card>
      ) : (
        <Card><EmptyState icon={<Sprout size={40} />} title="No produce listings" /></Card>
      )}
    </DashboardLayout>
  );
}
