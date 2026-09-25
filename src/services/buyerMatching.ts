import type { BuyerRequirement, Buyer, BuyerMatch, ProduceListing } from '@/types';

/**
 * Buyer Matching Service
 * Content-based recommendation: scores buyers against farmer's produce
 * Factors: crop match (35%), price match (25%), quality match (15%), location/distance (15%), quantity match (10%)
 */

export interface BuyerMatchInput {
  produce: ProduceListing;
  buyerRequirements: BuyerRequirement[];
  buyers: Buyer[];
  distances: Record<string, number>;
}

export function matchBuyers(input: BuyerMatchInput): BuyerMatch[] {
  const { produce, buyerRequirements, buyers, distances } = input;
  const matches: BuyerMatch[] = [];

  for (const req of buyerRequirements) {
    if (req.status !== 'active') continue;
    if (req.crop_name.toLowerCase() !== produce.crop_name.toLowerCase()) continue;

    const buyer = buyers.find((b) => b.user_id === req.buyer_id);
    if (!buyer) continue;

    // 1. Crop match (35%) - exact match required, already filtered
    const cropScore = 1.0;

    // 2. Price match (25%) - how close is offered price to farmer's minimum
    const priceRatio = req.offered_price / produce.min_expected_price;
    const priceScore = Math.min(priceRatio, 1.5) / 1.5;

    // 3. Quality match (15%)
    const qualityScore = req.quality_required === produce.quality_grade ? 1.0 : req.quality_required === 'A' && produce.quality_grade === 'B' ? 0.6 : 0.8;

    // 4. Location/distance (15%)
    const distance = distances[req.buyer_id] ?? 100;
    const locationScore = Math.max(0, 1 - distance / 300);

    // 5. Quantity match (10%)
    const quantityRatio = Math.min(req.quantity_required, produce.quantity) / Math.max(req.quantity_required, produce.quantity);
    const quantityScore = quantityRatio;

    const matchPercentage = Math.round(
      (cropScore * 0.35 + priceScore * 0.25 + qualityScore * 0.15 + locationScore * 0.15 + quantityScore * 0.10) * 100,
    );

    matches.push({
      buyer_id: buyer.user_id,
      business_name: buyer.business_name,
      buyer_type: buyer.buyer_type,
      crop_name: req.crop_name,
      required_quantity: req.quantity_required,
      offered_price: req.offered_price,
      location: buyer.business_location ?? req.location ?? 'N/A',
      distance_km: distance,
      match_percentage: Math.min(matchPercentage, 99),
      verified: buyer.verified ?? false,
      requirement_id: req.id,
    });
  }

  matches.sort((a, b) => b.match_percentage - a.match_percentage);
  return matches;
}
