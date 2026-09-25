import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, PageHeader, Badge, LoadingSpinner, EmptyState, Table } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { Farmer } from '@/types';
import { Tractor } from 'lucide-react';

export function AdminFarmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('farmers').select('*').order('created_at', { ascending: false });
      setFarmers(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Farmers" subtitle="All registered farmers" />
      {farmers.length > 0 ? (
        <Card>
          <Table
            headers={['Name', 'Mobile', 'Village', 'District', 'State', 'Pincode', 'Joined']}
            rows={farmers.map((f) => [
              <span className="font-medium">{f.full_name}</span>,
              f.mobile,
              f.village ?? '-',
              f.district ?? '-',
              f.state ?? '-',
              f.pincode ?? '-',
              f.created_at?.slice(0, 10) ?? '-',
            ])}
          />
        </Card>
      ) : (
        <Card><EmptyState icon={<Tractor size={40} />} title="No farmers registered" /></Card>
      )}
    </DashboardLayout>
  );
}
