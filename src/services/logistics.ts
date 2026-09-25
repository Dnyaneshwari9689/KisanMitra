import type { TransportQuote } from '@/types';

/**
 * Logistics / Transportation Service
 * Currently uses mock distance calculation (Haversine formula with mock coordinates).
 * To connect a real maps/distance API (Google Maps, OSRM, etc.):
 *   1. Set VITE_MAPS_API_URL in .env
 *   2. Replace calculateDistance with a real API call
 */

const MAPS_API_URL = import.meta.env.VITE_MAPS_API_URL as string | undefined;

// Mock coordinates for known locations
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Ahmednagar: { lat: 19.0992, lng: 74.739 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  // Common villages/areas
  Niphad: { lat: 20.073, lng: 73.993 },
  Sinnar: { lat: 19.837, lng: 74.0 },
  Igatpuri: { lat: 19.7, lng: 73.56 },
  Malegaon: { lat: 20.55, lng: 74.53 },
  Kalwan: { lat: 20.38, lng: 74.06 },
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateDistance(source: string, destination: string): number {
  const srcCoords = LOCATION_COORDS[source];
  const destCoords = LOCATION_COORDS[destination];

  if (srcCoords && destCoords) {
    return haversineDistance(srcCoords.lat, srcCoords.lng, destCoords.lat, destCoords.lng);
  }

  // If coordinates not found, return a mock distance based on string hash
  const hash = (source + destination).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return 30 + (hash % 150);
}

// Vehicle types with rate per km and capacity
const VEHICLE_RATES: Record<string, { ratePerKm: number; capacity: number; speed: number }> = {
  'Mini Truck (Pickup)': { ratePerKm: 12, capacity: 1000, speed: 40 },
  'Small Truck (3-wheeler)': { ratePerKm: 18, capacity: 1500, speed: 35 },
  'Medium Truck (6-wheeler)': { ratePerKm: 28, capacity: 5000, speed: 45 },
  'Large Truck (10-wheeler)': { ratePerKm: 45, capacity: 10000, speed: 50 },
  'Tractor Trailer': { ratePerKm: 15, capacity: 2000, speed: 25 },
};

export function getVehicleTypes(): string[] {
  return Object.keys(VEHICLE_RATES);
}

export function calculateTransportCost(
  source: string,
  destination: string,
  quantity: number,
  vehicleType: string,
): TransportQuote {
  const distance = calculateDistance(source, destination);
  const vehicle = VEHICLE_RATES[vehicleType] ?? VEHICLE_RATES['Medium Truck (6-wheeler)'];

  // Round trip cost (vehicle goes to market and returns)
  const transportCost = Math.round(distance * 2 * vehicle.ratePerKm);
  const costPerKg = Math.round((transportCost / Math.max(quantity, 1)) * 100) / 100;
  const estimatedDeliveryHours = Math.round((distance / vehicle.speed) * 10) / 10;

  return {
    source_location: source,
    destination,
    quantity,
    vehicle_type: vehicleType,
    distance_km: distance,
    transport_cost: transportCost,
    cost_per_kg: costPerKg,
    estimated_delivery_hours: estimatedDeliveryHours,
  };
}

export function calculateProfit(
  quantity: number,
  sellingPrice: number,
  transportCost: number,
  commission: number,
  storageCost: number,
  otherExpenses: number,
): {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitPerKg: number;
  breakdown: { label: string; amount: number; type: 'revenue' | 'expense' }[];
} {
  const totalRevenue = Math.round(sellingPrice * quantity * 100) / 100;
  const commissionCost = Math.round(totalRevenue * (commission / 100) * 100) / 100;
  const totalExpenses = Math.round((transportCost + commissionCost + storageCost + otherExpenses) * 100) / 100;
  const netProfit = Math.round((totalRevenue - totalExpenses) * 100) / 100;
  const profitPerKg = Math.round((netProfit / quantity) * 100) / 100;

  const breakdown = [
    { label: 'Gross Revenue', amount: totalRevenue, type: 'revenue' as const },
    { label: 'Transportation Cost', amount: -transportCost, type: 'expense' as const },
    { label: 'Commission', amount: -commissionCost, type: 'expense' as const },
    { label: 'Storage Cost', amount: -storageCost, type: 'expense' as const },
    { label: 'Other Expenses', amount: -otherExpenses, type: 'expense' as const },
  ];

  return { totalRevenue, totalExpenses, netProfit, profitPerKg, breakdown };
}
