import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Badge, LoadingSpinner, EmptyState, Table } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Transaction } from '@/types';
import { ShoppingCart } from 'lucide-react';

export function BuyerTransactions() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const { data } = await supabase.from('transactions').select('*').eq('buyer_id', profile.id).order('transaction_date', { ascending: false });
      setTransactions(data ?? []);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  const totalValue = transactions.reduce((sum, tx) => sum + tx.total_amount, 0);

  return (
    <DashboardLayout>
      <PageHeader title="Transactions" subtitle="Your completed deals" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Total Transactions</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{transactions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-xl font-bold text-gray-900 mt-1">₹{totalValue.toLocaleString('en-IN')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{transactions.filter((t) => t.status === 'completed').length}</p>
        </Card>
      </div>

      {transactions.length > 0 ? (
        <Card>
          <CardHeader title="Transaction History" icon={<ShoppingCart size={18} />} />
          <Table
            headers={['Crop', 'Quantity', 'Price', 'Total Amount', 'Market', 'Date', 'Status']}
            rows={transactions.map((tx) => [
              <span className="font-medium">{tx.crop_name}</span>,
              `${tx.quantity} kg`,
              `₹${tx.final_price}/kg`,
              `₹${tx.total_amount.toLocaleString('en-IN')}`,
              tx.market_name ?? '-',
              tx.transaction_date?.slice(0, 10) ?? '-',
              <Badge variant={tx.status === 'completed' ? 'green' : 'gray'}>{tx.status}</Badge>,
            ])}
          />
        </Card>
      ) : (
        <Card><EmptyState icon={<ShoppingCart size={40} />} title="No transactions yet" message="Accept offers and complete deals to see them here." /></Card>
      )}
    </DashboardLayout>
  );
}
