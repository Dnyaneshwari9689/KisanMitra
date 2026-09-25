import type { PricePrediction } from '@/types';

/**
 * ML Price Prediction Service
 *
 * Currently returns mock predictions with realistic patterns.
 * To connect a real ML API (XGBoost/Random Forest/Ensemble):
 *   1. Deploy a Python backend (e.g., FastAPI) with the trained model
 *   2. Set VITE_ML_API_URL in .env
 *   3. Replace the mock logic below with a fetch() call to the API
 *   4. Set is_mock to false when real predictions are used
 *
 * Expected API contract (POST /predict-price):
 *   Request: { crop, current_price, historical_prices: number[], market, quantity, arrival_qty, demand, season, location, weather? }
 *   Response: { predicted_3day, predicted_7day, predicted_15day, confidence }
 */

const ML_API_URL = import.meta.env.VITE_ML_API_URL as string | undefined;

// Seasonal factors by month (0-11)
const SEASONAL_FACTORS = [0.95, 0.96, 0.98, 1.0, 1.05, 1.1, 1.12, 1.08, 1.02, 0.98, 0.96, 0.94];

// Crop-specific volatility (higher = more unpredictable)
const CROP_VOLATILITY: Record<string, number> = {
  Tomato: 0.12,
  Onion: 0.15,
  Potato: 0.08,
  Wheat: 0.05,
  Soybean: 0.07,
  Cotton: 0.06,
};

function getSeasonalFactor(): number {
  return SEASONAL_FACTORS[new Date().getMonth()];
}

function getVolatility(crop: string): number {
  return CROP_VOLATILITY[crop] ?? 0.1;
}

function generateMockPrediction(
  crop: string,
  currentPrice: number,
  arrivalQty: number,
  demand: string,
): { predicted_3day: number; predicted_7day: number; predicted_15day: number; confidence: number; recommendation: string } {
  const volatility = getVolatility(crop);
  const seasonal = getSeasonalFactor();
  const demandMultiplier = demand === 'High' ? 1.03 : demand === 'Very High' ? 1.06 : demand === 'Low' ? 0.97 : 1.0;
  const supplyFactor = arrivalQty > 400 ? 0.97 : arrivalQty < 150 ? 1.04 : 1.0;

  // Simulate trend: slight upward or downward based on factors
  const trendPerDay = (seasonal * demandMultiplier * supplyFactor - 1) * 0.01;
  const noise = () => (Math.random() - 0.5) * volatility * currentPrice * 0.02;

  const predicted3 = currentPrice * (1 + trendPerDay * 3) + noise();
  const predicted7 = currentPrice * (1 + trendPerDay * 7) + noise();
  const predicted15 = currentPrice * (1 + trendPerDay * 15) + noise();

  const confidence = Math.round(70 + Math.random() * 20);

  let recommendation: string;
  if (predicted7 > currentPrice * 1.03) {
    recommendation = 'Wait — prices are expected to rise over the next 7 days.';
  } else if (predicted7 < currentPrice * 0.97) {
    recommendation = 'Sell Now — prices are expected to decline over the next 7 days.';
  } else {
    recommendation = 'Monitor Price — prices are expected to remain stable. Watch for short-term fluctuations.';
  }

  return {
    predicted_3day: Math.round(predicted3 * 100) / 100,
    predicted_7day: Math.round(predicted7 * 100) / 100,
    predicted_15day: Math.round(predicted15 * 100) / 100,
    confidence,
    recommendation,
  };
}

export interface PredictPriceInput {
  crop: string;
  currentPrice: number;
  historicalPrices?: number[];
  market?: string;
  quantity?: number;
  arrivalQty?: number;
  demand?: string;
  season?: string;
  location?: string;
  weather?: { temperature?: number; rainfall?: number };
}

export async function predictPrice(input: PredictPriceInput): Promise<PricePrediction> {
  if (ML_API_URL) {
    try {
      const response = await fetch(`${ML_API_URL}/predict-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: input.crop,
          current_price: input.currentPrice,
          historical_prices: input.historicalPrices ?? [],
          market: input.market,
          quantity: input.quantity,
          arrival_qty: input.arrivalQty,
          demand: input.demand,
          season: input.season,
          location: input.location,
          weather: input.weather,
        }),
      });
      if (!response.ok) throw new Error(`ML API returned ${response.status}`);
      const data = await response.json();
      return {
        crop_name: input.crop,
        market_name: input.market,
        current_price: input.currentPrice,
        predicted_3day: data.predicted_3day,
        predicted_7day: data.predicted_7day,
        predicted_15day: data.predicted_15day,
        confidence: data.confidence,
        recommendation: data.recommendation ?? 'Based on ML model prediction.',
        is_mock: false,
      };
    } catch (err) {
      console.warn('ML API unavailable, falling back to mock prediction:', err);
    }
  }

  // Mock prediction
  const result = generateMockPrediction(
    input.crop,
    input.currentPrice,
    input.arrivalQty ?? 250,
    input.demand ?? 'Medium',
  );

  return {
    crop_name: input.crop,
    market_name: input.market,
    current_price: input.currentPrice,
    predicted_3day: result.predicted_3day,
    predicted_7day: result.predicted_7day,
    predicted_15day: result.predicted_15day,
    confidence: result.confidence,
    recommendation: result.recommendation,
    is_mock: true,
  };
}

/**
 * Quality-based price estimation service
 * Currently returns mock quality-adjusted prices.
 * To connect a real XGBoost model, replace with API call similar to predictPrice.
 */
export interface QualityPriceInput {
  crop: string;
  basePrice: number;
  grade: string;
  size?: string;
  weight?: number;
  moisture?: number;
  defects?: number;
}

export function predictQualityPrice(input: QualityPriceInput): { estimated_price: number; adjustment: number; factors: { factor: string; impact: string }[] } {
  const factors: { factor: string; impact: string }[] = [];
  let multiplier = 1.0;

  // Grade adjustment
  if (input.grade === 'A') {
    multiplier += 0.1;
    factors.push({ factor: 'Grade A Quality', impact: '+10%' });
  } else if (input.grade === 'B') {
    multiplier -= 0.05;
    factors.push({ factor: 'Grade B Quality', impact: '-5%' });
  } else {
    multiplier -= 0.15;
    factors.push({ factor: 'Grade C Quality', impact: '-15%' });
  }

  // Moisture adjustment
  if (input.moisture !== undefined) {
    if (input.moisture < 12) {
      multiplier += 0.02;
      factors.push({ factor: 'Low moisture (good storage)', impact: '+2%' });
    } else if (input.moisture > 18) {
      multiplier -= 0.05;
      factors.push({ factor: 'High moisture (spoilage risk)', impact: '-5%' });
    }
  }

  // Defects adjustment
  if (input.defects !== undefined) {
    if (input.defects < 5) {
      multiplier += 0.03;
      factors.push({ factor: 'Low defects', impact: '+3%' });
    } else if (input.defects > 15) {
      multiplier -= 0.08;
      factors.push({ factor: 'High defects', impact: '-8%' });
    }
  }

  // Size adjustment
  if (input.size === 'Large') {
    multiplier += 0.05;
    factors.push({ factor: 'Large size', impact: '+5%' });
  } else if (input.size === 'Small') {
    multiplier -= 0.03;
    factors.push({ factor: 'Small size', impact: '-3%' });
  }

  const estimated_price = Math.round(input.basePrice * multiplier * 100) / 100;
  const adjustment = Math.round((estimated_price - input.basePrice) * 100) / 100;

  return { estimated_price, adjustment, factors };
}
