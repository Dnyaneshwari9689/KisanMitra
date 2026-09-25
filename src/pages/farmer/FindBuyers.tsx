import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardBody, PageHeader, Button, Badge, LoadingSpinner, EmptyState, Modal, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { matchBuyers } from '@/services/buyerMatching';
import { calculateDistance } from '@/services/logistics';
import type { ProduceListing, BuyerRequirement, Buyer, BuyerMatch } from '@/types';
import { Users, MapPin, CheckCircle, Send, Store } from 'lucide-react';

export function FindBuyers() {
  const { profile } = useAuth();
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduce, setSelectedProduce] = useState('');
  const [matches, setMatches] = useState<BuyerMatch[]>([]);
  const [matching, setMatching] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<BuyerMatch | null>(null);
  const [offerForm, setOfferForm] = useState({ quantity: '', price: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const { data } = await supabase.from('produce_listings').select('*').eq('farmer_id', profile.id).eq('status', 'active').order('created_at', { ascending: false });
      setProduce(data ?? []);
      if (data && data.length > 0) setSelectedProduce(data[0].id);
      setLoading(false);
    })();
  }, [profile]);

  useEffect(() => {
    if (selectedProduce) findMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduce]);

  async function findMatches() {
    const item = produce.find((p) => p.id === selectedProduce);
    if (!item) return;
    setMatching(true);

    const { data: requirements } = await supabase.from('buyer_requirements').select('*').eq('status', 'active').eq('crop_name', item.crop_name);
    const { data: buyers } = await supabase.from('buyers').select('*');

    if (!requirements || !buyers) {
      setMatching(false);
      return;
    }

    const distances: Record<string, number> = {};
    for (const req of requirements) {
      const buyer = buyers.find((b) => b.user_id === req.buyer_id);
      if (buyer?.business_location) {
        distances[req.buyer_id] = calculateDistance(item.location ?? 'Nashik', buyer.business_location);
      } else {
        distances[req.buyer_id] = 50 + Math.random() * 100;
      }
    }

    const result = matchBuyers({
      produce: item,
      buyerRequirements: requirements as BuyerRequirement[],
      buyers: buyers as Buyer[],
      distances,
    });

    setMatches(result);
    setMatching(false);
  }

  function openOfferModal(match: BuyerMatch) {
    setSelectedMatch(match);
    const item = produce.find((p) => p.id === selectedProduce);
    setOfferForm({
      quantity: item ? String(item.quantity) : '',
      price: String(match.offered_price),
      message: `I have ${item?.crop_name ?? ''} Grade ${item?.quality_grade ?? 'A'} available. Interested in selling at your offered price.`,
    });
    setShowOfferModal(true);
  }

  async function sendOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !selectedMatch) return;
    const item = produce.find((p) => p.id === selectedProduce);
    if (!item) return;
    setSending(true);

    await supabase.from('offers').insert({
      farmer_id: profile.id,
      buyer_id: selectedMatch.buyer_id,
      produce_id: item.id,
      requirement_id: selectedMatch.requirement_id,
      crop_name: item.crop_name,
      quantity: Number(offerForm.quantity),
      proposed_price: Number(offerForm.price),
      message: offerForm.message,
      status: 'pending',
    });

    await supabase.from('notifications').insert({
      user_id: selectedMatch.buyer_id,
      title: 'New Offer Received',
      message: `Offer for ${item.crop_name} — ${offerForm.quantity} kg at ₹${offerForm.price}/kg`,
      type: 'info',
    });

    setSending(false);
    setShowOfferModal(false);
    setOfferForm({ quantity: '', price: '', message: '' });
  }

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><LoadingSpinner size={32} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Find Buyers" subtitle="Smart matching with verified buyers" />

      {produce.length === 0 ? (
        <Card><EmptyState icon={<Users size={40} />} title="No produce available" message="Add produce first to find matching buyers." /></Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardBody>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Produce</label>
              <select value={selectedProduce} onChange={(e) => setSelectedProduce(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                {produce.map((p) => <option key={p.id} value={p.id}>{p.crop_name} — {p.quantity} {p.unit} (Grade {p.quality_grade})</option>)}
              </select>
            </CardBody>
          </Card>

          {matching ? (
            <div className="flex justify-center py-20"><LoadingSpinner size={32} /></div>
          ) : matches.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardBody>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Store size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{match.business_name}</p>
                          <p className="text-xs text-gray-500">{match.buyer_type}</p>
                        </div>
                      </div>
                      {match.verified && <Badge variant="green"><span className="flex items-center gap-1"><CheckCircle size={10} /> Verified</span></Badge>}
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Required Crop</span>
                        <span className="font-medium text-gray-900">{match.crop_name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Quantity</span>
                        <span className="font-medium text-gray-900">{match.required_quantity} kg</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Offered Price</span>
                        <span className="font-medium text-gray-900">₹{match.offered_price}/kg</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Location</span>
                        <span className="font-medium text-gray-900">{match.location}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Distance</span>
                        <span className="font-medium text-gray-900">{match.distance_km} km</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 h-2 rounded-full bg-gray-200">
                        <div className={`h-full rounded-full ${match.match_percentage >= 80 ? 'bg-emerald-500' : match.match_percentage >= 60 ? 'bg-amber-500' : 'bg-gray-400'}`} style={{ width: `${match.match_percentage}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 ml-2">{match.match_percentage}%</span>
                    </div>

                    <Button size="sm" fullWidth onClick={() => openOfferModal(match)}>
                      <span className="flex items-center justify-center gap-1.5"><Send size={14} /> Send Offer</span>
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <Card><EmptyState icon={<Users size={40} />} title="No matching buyers found" message="No active buyer requirements for this crop. Try a different produce." /></Card>
          )}
        </>
      )}

      <Modal open={showOfferModal} onClose={() => setShowOfferModal(false)} title="Send Offer">
        {selectedMatch && (
          <form onSubmit={sendOffer} className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-900">{selectedMatch.business_name}</p>
              <p className="text-xs text-gray-500">Offered: ₹{selectedMatch.offered_price}/kg for {selectedMatch.required_quantity} kg</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantity (kg)" type="number" name="quantity" value={offerForm.quantity} onChange={(e) => setOfferForm({ ...offerForm, quantity: e.target.value })} required min={0} />
              <Input label="Proposed Price (₹/kg)" type="number" name="price" value={offerForm.price} onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })} required min={0} />
            </div>
            <Input label="Message" type="textarea" name="message" value={offerForm.message} onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })} />
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
