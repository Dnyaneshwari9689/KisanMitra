import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Badge, LoadingSpinner, EmptyState, Table, Button, Modal } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { BuyerRequirement, ProduceListing, Farmer } from '@/types';
import { Tractor, MapPin, Check, X, Send } from 'lucide-react';

export function FindFarmers() {
  const { profile } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedProduce, setSelectedProduce] = useState<ProduceListing | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const [reqRes, produceRes, farmerRes] = await Promise.all([
        supabase.from('buyer_requirements').select('*').eq('buyer_id', profile.id).eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('produce_listings').select('*').eq('status', 'active'),
        supabase.from('farmers').select('*'),
      ]);
      setRequirements(reqRes.data ?? []);
      setProduce(produceRes.data ?? []);
      setFarmers(farmerRes.data ?? []);
      if (reqRes.data && reqRes.data.length > 0) setSelectedReq(reqRes.data[0].id);
      setLoading(false);
    })();
  }, [profile]);

  const matchingProduce = produce.filter((p) => {
    if (!selectedReq) return false;
    const req = requirements.find((r) => r.id === selectedReq);
    if (!req) return false;
    return p.crop_name === req.crop_name && p.quality_grade === req.quality_required;
  });

  function openOfferModal(item: ProduceListing) {
    setSelectedProduce(item);
    const req = requirements.find((r) => r.id === selectedReq);
    setOfferPrice(String(req?.offered_price ?? item.min_expected_price));
    setShowOfferModal(true);
  }

  async function sendOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !selectedProduce) return;
    setSending(true);
    const req = requirements.find((r) => r.id === selectedReq);
    await supabase.from('offers').insert({
      farmer_id: selectedProduce.farmer_id,
      buyer_id: profile.id,
      produce_id: selectedProduce.id,
      requirement_id: selectedReq || null,
      crop_name: selectedProduce.crop_name,
      quantity: Math.min(selectedProduce.quantity, req?.quantity_required ?? selectedProduce.quantity),
      proposed_price: Number(offerPrice),
      message: `Buyer offer: ₹${offerPrice}/kg for your ${selectedProduce.crop_name}`,
      status: 'pending',
    });
    await supabase.from('notifications').insert({
      user_id: selectedProduce.farmer_id,
      title: 'New Buyer Offer',
      message: `A buyer offered ₹${offerPrice}/kg for your ${selectedProduce.crop_name}`,
      type: 'info',
    });
    setSending(false);
    setShowOfferModal(false);
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Find Farmers" subtitle="Browse matching produce from farmers" />

      {requirements.length === 0 ? (
        <Card><EmptyState icon={<Tractor size={40} />} title="No active requirements" message="Post a requirement first to find matching farmers." /></Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardBody>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Requirement</label>
              <select value={selectedReq} onChange={(e) => setSelectedReq(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                {requirements.map((r) => <option key={r.id} value={r.id}>{r.crop_name} — {r.quantity_required} kg @ ₹{r.offered_price}/kg (Grade {r.quality_required})</option>)}
              </select>
            </CardBody>
          </Card>

          {matchingProduce.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingProduce.map((item) => {
                const farmer = farmers.find((f) => f.user_id === item.farmer_id);
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Tractor size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.crop_name}</p>
                            <p className="text-xs text-gray-500">{item.quantity} {item.unit} · Grade {item.quality_grade}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Farmer</span>
                          <span className="font-medium text-gray-900">{farmer?.full_name ?? 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Location</span>
                          <span className="font-medium text-gray-900">{item.location ?? farmer?.village ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Min Price</span>
                          <span className="font-medium text-gray-900">₹{item.min_expected_price}/{item.unit}</span>
                        </div>
                      </div>
                      <Button size="sm" fullWidth onClick={() => openOfferModal(item)}>
                        <span className="flex items-center justify-center gap-1.5"><Send size={14} /> Send Offer</span>
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card><EmptyState icon={<Tractor size={40} />} title="No matching farmers" message="No produce matches your selected requirement. Try a different requirement." /></Card>
          )}
        </>
      )}

      <Modal open={showOfferModal} onClose={() => setShowOfferModal(false)} title="Send Offer to Farmer">
        {selectedProduce && (
          <form onSubmit={sendOffer} className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-900">{selectedProduce.crop_name} — {selectedProduce.quantity} {selectedProduce.unit}</p>
              <p className="text-xs text-gray-500">Min expected: ₹{selectedProduce.min_expected_price}/{selectedProduce.unit} · Grade {selectedProduce.quality_grade}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Offer Price (₹/kg)</label>
              <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} required min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowOfferModal(false)}>Cancel</Button>
              <Button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send Offer'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
