import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, PageHeader, Badge, LoadingSpinner, EmptyState, Table } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { Buyer } from '@/types';
import { Store } from 'lucide-react';

export function AdminBuyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('buyers').select('*').order('created_at', { ascending: false });
      setBuyers(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Buyers" subtitle="All registered buyers" />
      {buyers.length > 0 ? (
        <Card>
          <Table
            headers={['Business', 'Owner', 'Type', 'Mobile', 'Location', 'Verified', 'Joined']}
            rows={buyers.map((b) => [
              <span className="font-medium">{b.business_name}</span>,
              b.owner_name,
              <Badge variant="blue">{b.buyer_type}</Badge>,
              b.mobile,
              b.business_location ?? '-',
              b.verified ? <Badge variant="green">Yes</Badge> : <Badge variant="gray">No</Badge>,
              b.created_at?.slice(0, 10) ?? '-',
            ])}
          />
        </Card>
      ) : (
        <Card><EmptyState icon={<Store size={40} />} title="No buyers registered" /></Card>
      )}
    </DashboardLayout>
  );
}
