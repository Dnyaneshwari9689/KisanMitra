import type { MarketPrice, MarketRecommendation } from '@/types';

/**
 * Market Recommendation Service
 * Uses TOPSIS-based weighted scoring to recommend the best market.
 * Factors: net revenue (40%), demand (20%), distance (20%), price trend (20%)
 */

export interface MarketComparisonInput {
  cropName: string;
  quantity: number;
  marketPrices: MarketPrice[];
  marketCommissions: Record<string, number>;
  distances: Record<string, number>;
  transportCosts: Record<string, number>;
  predictedPrices?: Record<string, number>;
}

const DEMAND_SCORE: Record<string, number> = {
  Low: 0.25,
  Medium: 0.5,
  High: 0.75,
  'Very High': 1.0,
};

export function calculateMarketRecommendations(input: MarketComparisonInput): MarketRecommendation[] {
  const { quantity, marketPrices, marketCommissions, distances, transportCosts, predictedPrices } = input;

  const recommendations = marketPrices.map((mp) => {
    const marketName = mp.market_name;
    const commissionRate = marketCommissions[marketName] ?? 6.0;
    const distance = distances[marketName] ?? 50;
    const transportCost = transportCosts[marketName] ?? distance * 2 * quantity;
    const predictedPrice = predictedPrices?.[marketName] ?? mp.modal_price;

    const grossRevenue = predictedPrice * quantity;
    const commissionCost = grossRevenue * (commissionRate / 100);
    const netRevenue = grossRevenue - transportCost - commissionCost;

    return {
      market_name: marketName,
      state: mp.state,
      district: mp.district,
      current_price: mp.modal_price,
      predicted_price: predictedPrice,
      distance_km: distance,
      transport_cost: transportCost,
      commission_rate: commissionRate,
      commission_cost: commissionCost,
      gross_revenue: grossRevenue,
      net_revenue: netRevenue,
      demand_level: mp.demand_level,
      score: 0,
      rank: 0,
    };
  });

  // TOPSIS-style scoring
  // Normalize and weight each criterion
  const weights = {
    netRevenue: 0.40,
    demand: 0.20,
    distance: 0.20,
    priceTrend: 0.20,
  };

  // Find max/min for normalization
  const netRevenues = recommendations.map((r) => r.net_revenue);
  const distVals = recommendations.map((r) => r.distance_km);
  const demands = recommendations.map((r) => DEMAND_SCORE[r.demand_level] ?? 0.5);
  const priceTrends = recommendations.map((r) => (r.predicted_price - r.current_price) / r.current_price);

  const maxNetRev = Math.max(...netRevenues, 1);
  const minNetRev = Math.min(...netRevenues, 0);
  const maxDist = Math.max(...distVals, 1);
  const minDist = Math.min(...distVals, 0);
  const maxTrend = Math.max(...priceTrends, 0.01);
  const minTrend = Math.min(...priceTrends, -0.01);

  recommendations.forEach((r, i) => {
    // Normalize (benefit criteria: higher is better; cost criteria: lower is better)
    const netRevScore = maxNetRev === minNetRev ? 1 : (r.net_revenue - minNetRev) / (maxNetRev - minNetRev);
    const distScore = maxDist === minDist ? 1 : 1 - (r.distance_km - minDist) / (maxDist - minDist);
    const demandScore = DEMAND_SCORE[r.demand_level] ?? 0.5;
    const trendScore = maxTrend === minTrend ? 1 : (priceTrends[i] - minTrend) / (maxTrend - minTrend);

    r.score = Math.round(
      (netRevScore * weights.netRevenue + demandScore * weights.demand + distScore * weights.distance + trendScore * weights.priceTrend) * 100,
    );
  });

  // Sort by score descending and assign ranks
  recommendations.sort((a, b) => b.score - a.score);
  recommendations.forEach((r, i) => {
    r.rank = i + 1;
  });

  return recommendations;
}
