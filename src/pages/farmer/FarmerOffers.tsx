import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Badge, LoadingSpinner, EmptyState, Modal, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Offer } from '@/types';
import { Handshake, Check, X, Clock, MessageSquare } from 'lucide-react';

export function FarmerOffers() {
  const { profile } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ actualPrice: '', quantitySold: '', marketName: '' });

  useEffect(() => { fetchOffers(); }, [profile]);

  async function fetchOffers() {
    if (!profile) return;
    const { data } = await supabase.from('offers').select('*').eq('farmer_id', profile.id).order('created_at', { ascending: false });
    setOffers(data ?? []);
    setLoading(false);
  }

  async function updateOfferStatus(id: string, status: string) {
    await supabase.from('offers').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (status === 'accepted') {
      await supabase.from('notifications').insert({
        user_id: profile?.id,
        title: 'Offer Accepted',
        message: 'Your offer has been accepted by the buyer. Complete the transaction to finalize.',
        type: 'success',
      });
    }
    fetchOffers();
  }

  async function completeTransaction(offer: Offer) {
    const { data: tx } = await supabase.from('transactions').insert({
      offer_id: offer.id,
      farmer_id: offer.farmer_id,
      buyer_id: offer.buyer_id,
      crop_name: offer.crop_name,
      quantity: offer.quantity,
      final_price: offer.proposed_price,
      total_amount: offer.quantity * offer.proposed_price,
      status: 'completed',
    }).select().single();

    await supabase.from('offers').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', offer.id);
    await supabase.from('produce_listings').update({ status: 'sold' }).eq('id', offer.produce_id);

    if (tx) {
      setSelectedOffer(offer);
      setFeedbackForm({ actualPrice: String(offer.proposed_price), quantitySold: String(offer.quantity), marketName: '' });
      setShowModal(true);
    }
    fetchOffers();
  }

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !selectedOffer) return;
    await supabase.from('farmer_feedback').insert({
      farmer_id: profile.id,
      crop_name: selectedOffer.crop_name,
      predicted_price: selectedOffer.proposed_price,
      actual_price: Number(feedbackForm.actualPrice),
      quantity_sold: Number(feedbackForm.quantitySold),
      market_name: feedbackForm.marketName,
    });
    setShowModal(false);
    setFeedbackForm({ actualPrice: '', quantitySold: '', marketName: '' });
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="My Offers" subtitle="Track and manage your offers to buyers" />

      {offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardBody>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Handshake size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{offer.crop_name} — {offer.quantity} kg @ ₹{offer.proposed_price}/kg</p>
                      <p className="text-xs text-gray-500">{offer.message ?? 'No message'}</p>
                      {offer.counter_price && <p className="text-xs text-amber-600 mt-1">Counter offer: ₹{offer.counter_price}/kg</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={offer.status === 'accepted' ? 'green' : offer.status === 'rejected' ? 'red' : offer.status === 'completed' ? 'blue' : offer.status === 'negotiating' ? 'amber' : 'gray'}>
                      {offer.status}
                    </Badge>
                    <div className="flex gap-1">
                      {offer.status === 'pending' && (
                        <Button size="sm" variant="ghost" onClick={() => updateOfferStatus(offer.id, 'rejected')}><X size={16} className="text-rose-500" /></Button>
                      )}
                      {offer.status === 'accepted' && (
                        <Button size="sm" onClick={() => completeTransaction(offer)}><span className="flex items-center gap-1"><Check size={14} /> Complete</span></Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card><EmptyState icon={<Handshake size={40} />} title="No offers yet" message="Send offers to buyers from the Find Buyers page." /></Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Sale Feedback">
        <form onSubmit={submitFeedback} className="space-y-4">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm font-medium text-emerald-700">Transaction Completed!</p>
            <p className="text-xs text-emerald-600 mt-1">Please record your actual selling price for ML model improvement.</p>
          </div>
          <Input label="Actual Selling Price (₹/kg)" type="number" name="actualPrice" value={feedbackForm.actualPrice} onChange={(e) => setFeedbackForm({ ...feedbackForm, actualPrice: e.target.value })} required min={0} />
          <Input label="Quantity Sold (kg)" type="number" name="quantitySold" value={feedbackForm.quantitySold} onChange={(e) => setFeedbackForm({ ...feedbackForm, quantitySold: e.target.value })} required min={0} />
          <Input label="Market Name" name="marketName" value={feedbackForm.marketName} onChange={(e) => setFeedbackForm({ ...feedbackForm, marketName: e.target.value })} placeholder="Nashik" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>Skip</Button>
            <Button type="submit">Submit Feedback</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
