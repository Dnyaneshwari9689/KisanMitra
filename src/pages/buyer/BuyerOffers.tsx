import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Badge, LoadingSpinner, EmptyState, Modal, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Offer } from '@/types';
import { Handshake, Check, X, MessageSquare } from 'lucide-react';

export function BuyerOffers() {
  const { profile } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [counterOffer, setCounterOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchOffers(); }, [profile]);

  async function fetchOffers() {
    if (!profile) return;
    const { data } = await supabase.from('offers').select('*').eq('buyer_id', profile.id).order('created_at', { ascending: false });
    setOffers(data ?? []);
    setLoading(false);
  }

  async function updateStatus(offer: Offer, status: string) {
    await supabase.from('offers').update({ status, updated_at: new Date().toISOString() }).eq('id', offer.id);
    await supabase.from('notifications').insert({
      user_id: offer.farmer_id,
      title: `Offer ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your offer for ${offer.crop_name} has been ${status} by the buyer.`,
      type: status === 'accepted' ? 'success' : 'info',
    });
    fetchOffers();
  }

  async function sendCounter(e: React.FormEvent) {
    e.preventDefault();
    if (!counterOffer) return;
    setSubmitting(true);
    await supabase.from('offers').update({ status: 'negotiating', counter_price: Number(counterPrice), updated_at: new Date().toISOString() }).eq('id', counterOffer.id);
    await supabase.from('notifications').insert({
      user_id: counterOffer.farmer_id,
      title: 'Counter Offer',
      message: `Buyer countered your offer with ₹${counterPrice}/kg for ${counterOffer.crop_name}.`,
      type: 'info',
    });
    setSubmitting(false);
    setCounterOffer(null);
    setCounterPrice('');
    fetchOffers();
  }

  async function completeTransaction(offer: Offer) {
    await supabase.from('transactions').insert({
      offer_id: offer.id,
      farmer_id: offer.farmer_id,
      buyer_id: offer.buyer_id,
      crop_name: offer.crop_name,
      quantity: offer.quantity,
      final_price: offer.proposed_price,
      total_amount: offer.quantity * offer.proposed_price,
      status: 'completed',
    });
    await supabase.from('offers').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', offer.id);
    fetchOffers();
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Offers" subtitle="Review and respond to farmer offers" />

      {offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Handshake size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{offer.crop_name} — {offer.quantity} kg @ ₹{offer.proposed_price}/kg</p>
                      <p className="text-xs text-gray-500">{offer.message ?? 'No message'}</p>
                      {offer.counter_price && <p className="text-xs text-amber-600 mt-1">Counter: ₹{offer.counter_price}/kg</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={offer.status === 'accepted' ? 'green' : offer.status === 'rejected' ? 'red' : offer.status === 'completed' ? 'blue' : offer.status === 'negotiating' ? 'amber' : 'gray'}>
                      {offer.status}
                    </Badge>
                    {offer.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => updateStatus(offer, 'accepted')}><span className="flex items-center gap-1"><Check size={14} /> Accept</span></Button>
                        <Button size="sm" variant="outline" onClick={() => { setCounterOffer(offer); setCounterPrice(String(offer.proposed_price)); }}><MessageSquare size={14} /></Button>
                        <Button size="sm" variant="danger" onClick={() => updateStatus(offer, 'rejected')}><X size={14} /></Button>
                      </div>
                    )}
                    {offer.status === 'negotiating' && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => updateStatus(offer, 'accepted')}><span className="flex items-center gap-1"><Check size={14} /> Accept</span></Button>
                        <Button size="sm" variant="danger" onClick={() => updateStatus(offer, 'rejected')}><X size={14} /></Button>
                      </div>
                    )}
                    {offer.status === 'accepted' && (
                      <Button size="sm" onClick={() => completeTransaction(offer)}>Complete Transaction</Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card><EmptyState icon={<Handshake size={40} />} title="No offers received" message="Post requirements to receive offers from farmers." /></Card>
      )}

      <Modal open={!!counterOffer} onClose={() => setCounterOffer(null)} title="Counter Offer">
        {counterOffer && (
          <form onSubmit={sendCounter} className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-900">{counterOffer.crop_name} — {counterOffer.quantity} kg</p>
              <p className="text-xs text-gray-500">Original offer: ₹{counterOffer.proposed_price}/kg</p>
            </div>
            <Input label="Counter Price (₹/kg)" type="number" name="counterPrice" value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} required min={0} />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCounterOffer(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send Counter Offer'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
