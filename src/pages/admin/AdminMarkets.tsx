import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, PageHeader, LoadingSpinner, EmptyState, Table } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { Market } from '@/types';
import { MapPin } from 'lucide-react';

export function AdminMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('markets').select('*').order('name');
      setMarkets(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Markets" subtitle="Registered mandis" />
      {markets.length > 0 ? (
        <Card>
          <Table
            headers={['Name', 'State', 'District', 'Commission Rate', 'Coordinates']}
            rows={markets.map((m) => [
              <span className="font-medium">{m.name}</span>,
              m.state,
              m.district,
              `${m.commission_rate}%`,
              `${m.latitude}, ${m.longitude}`,
            ])}
          />
        </Card>
      ) : (
        <Card><EmptyState icon={<MapPin size={40} />} title="No markets registered" /></Card>
      )}
    </DashboardLayout>
  );
}
