import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Badge, LoadingSpinner, EmptyState, Table } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { Users } from 'lucide-react';

export function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Users" subtitle="All registered users" />
      {users.length > 0 ? (
        <Card>
          <Table
            headers={['Name', 'Email', 'Role', 'Mobile', 'Joined']}
            rows={users.map((u) => [
              <span className="font-medium">{u.full_name}</span>,
              u.email,
              <Badge variant={u.role === 'farmer' ? 'green' : u.role === 'buyer' ? 'blue' : 'amber'}>{u.role}</Badge>,
              u.mobile ?? '-',
              u.created_at?.slice(0, 10) ?? '-',
            ])}
          />
        </Card>
      ) : (
        <Card><EmptyState icon={<Users size={40} />} title="No users found" /></Card>
      )}
    </DashboardLayout>
  );
}
