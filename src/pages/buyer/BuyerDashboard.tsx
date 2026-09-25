import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, StatCard, PageHeader, LoadingSpinner, EmptyState, Badge, Table, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { BuyerRequirement, Offer, Transaction } from '@/types';
import { Store, FileText, Handshake, ShoppingCart, Plus, ArrowRight } from 'lucide-react';

export function BuyerDashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [reqRes, offerRes, txRes] = await Promise.all([
        supabase.from('buyer_requirements').select('*').eq('buyer_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('offers').select('*').eq('buyer_id', profile.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('transactions').select('*').eq('buyer_id', profile.id).order('transaction_date', { ascending: false }).limit(5),
      ]);
      setRequirements(reqRes.data ?? []);
      setOffers(offerRes.data ?? []);
      setTransactions(txRes.data ?? []);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  const activeReqs = requirements.filter((r) => r.status === 'active');
  const acceptedDeals = offers.filter((o) => o.status === 'accepted' || o.status === 'completed');

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${profile?.full_name}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Requirements" value={activeReqs.length} sublabel="active" icon={<FileText size={20} />} color="emerald" />
        <StatCard label="Incoming Offers" value={offers.length} sublabel="total" icon={<Handshake size={20} />} color="blue" />
        <StatCard label="Accepted Deals" value={acceptedDeals.length} sublabel="deals" icon={<Store size={20} />} color="amber" />
        <StatCard label="Transactions" value={transactions.length} sublabel="completed" icon={<ShoppingCart size={20} />} color="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="My Requirements" icon={<FileText size={18} />} action={<Link to="/buyer/post-requirement"><span className="text-xs text-emerald-600 font-medium">Post New</span></Link>} />
          <CardBody>
            {requirements.length > 0 ? (
              <div className="space-y-3">
                {requirements.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{req.crop_name} — {req.quantity_required} kg</p>
                      <p className="text-xs text-gray-500">₹{req.offered_price}/kg · {req.quality_required} grade</p>
                    </div>
                    <Badge variant={req.status === 'active' ? 'green' : 'gray'}>{req.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<FileText size={32} />} title="No requirements posted" message="Post a requirement to start receiving offers from farmers."
                action={<Link to="/buyer/post-requirement"><Button size="sm"><span className="flex items-center gap-1"><Plus size={14} /> Post Requirement</span></Button></Link>} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent Offers" icon={<Handshake size={18} />} action={<Link to="/buyer/offers"><span className="text-xs text-emerald-600 font-medium">View all</span></Link>} />
          <CardBody>
            {offers.length > 0 ? (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{offer.crop_name} — {offer.quantity} kg @ ₹{offer.proposed_price}/kg</p>
                      <p className="text-xs text-gray-500">{offer.message ?? ''}</p>
                    </div>
                    <Badge variant={offer.status === 'accepted' ? 'green' : offer.status === 'rejected' ? 'red' : offer.status === 'completed' ? 'blue' : 'amber'}>{offer.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Handshake size={32} />} title="No offers received" />
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent Transactions" icon={<ShoppingCart size={18} />} />
        <CardBody>
          {transactions.length > 0 ? (
            <Table
              headers={['Crop', 'Quantity', 'Price', 'Total', 'Date', 'Status']}
              rows={transactions.map((tx) => [
                <span className="font-medium">{tx.crop_name}</span>,
                `${tx.quantity} kg`,
                `₹${tx.final_price}/kg`,
                `₹${tx.total_amount.toLocaleString('en-IN')}`,
                tx.transaction_date?.slice(0, 10) ?? '-',
                <Badge variant="blue">{tx.status}</Badge>,
              ])}
            />
          ) : (
            <EmptyState icon={<ShoppingCart size={32} />} title="No transactions yet" />
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
