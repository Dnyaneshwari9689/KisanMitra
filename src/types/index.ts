export type UserRole = 'farmer' | 'buyer' | 'admin';

export type BuyerType = 'Wholesaler' | 'Retailer' | 'Processor' | 'Exporter' | 'FPO' | 'Other';

export type CropCategory = 'Vegetables' | 'Fruits' | 'Cereals' | 'Pulses' | 'Spices' | 'Oilseeds' | 'Other';

export type QualityGrade = 'A' | 'B' | 'C';

export type DemandLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export type OfferStatus = 'pending' | 'negotiating' | 'accepted' | 'rejected' | 'completed';

export type ProduceStatus = 'active' | 'sold' | 'inactive';

export type AlertStatus = 'active' | 'triggered' | 'disabled';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  mobile?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Farmer {
  id: string;
  user_id: string;
  full_name: string;
  mobile: string;
  email?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  created_at?: string;
}

export interface Buyer {
  id: string;
  user_id: string;
  business_name: string;
  owner_name: string;
  mobile: string;
  email?: string;
  business_location?: string;
  buyer_type: BuyerType;
  verified?: boolean;
  created_at?: string;
}

export interface Crop {
  id: string;
  name: string;
  category: CropCategory;
  unit: string;
  image_url?: string;
}

export interface Market {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  commission_rate: number;
}

export interface MarketPrice {
  id: string;
  crop_name: string;
  market_name: string;
  state: string;
  district: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_qty: number;
  demand_level: DemandLevel;
  price_date: string;
}

export interface ProduceListing {
  id: string;
  farmer_id: string;
  crop_name: string;
  crop_category: string;
  quantity: number;
  unit: string;
  quality_grade: QualityGrade;
  harvest_date?: string;
  location?: string;
  min_expected_price: number;
  available_from?: string;
  image_url?: string;
  status: ProduceStatus;
  created_at?: string;
}

export interface PricePrediction {
  id?: string;
  produce_id?: string;
  crop_name: string;
  market_name?: string;
  current_price: number;
  predicted_3day: number;
  predicted_7day: number;
  predicted_15day: number;
  confidence: number;
  recommendation: string;
  is_mock: boolean;
  created_at?: string;
}

export interface BuyerRequirement {
  id: string;
  buyer_id: string;
  crop_name: string;
  quantity_required: number;
  quality_required: string;
  offered_price: number;
  location?: string;
  delivery_date?: string;
  description?: string;
  status: string;
  created_at?: string;
}

export interface Offer {
  id: string;
  farmer_id: string;
  buyer_id: string;
  produce_id?: string;
  requirement_id?: string;
  crop_name: string;
  quantity: number;
  proposed_price: number;
  message?: string;
  status: OfferStatus;
  counter_price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  offer_id?: string;
  farmer_id: string;
  buyer_id: string;
  crop_name: string;
  quantity: number;
  final_price: number;
  total_amount: number;
  market_name?: string;
  status: string;
  transaction_date?: string;
}

export interface TransportQuote {
  id?: string;
  farmer_id?: string;
  source_location: string;
  destination: string;
  quantity: number;
  vehicle_type: string;
  distance_km: number;
  transport_cost: number;
  cost_per_kg: number;
  estimated_delivery_hours?: number;
}

export interface PriceAlert {
  id: string;
  farmer_id: string;
  crop_name: string;
  market_name?: string;
  target_price: number;
  status: AlertStatus;
  created_at?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  is_read: boolean;
  created_at?: string;
}

export interface FarmerFeedback {
  id?: string;
  farmer_id?: string;
  transaction_id?: string;
  crop_name: string;
  predicted_price?: number;
  actual_price: number;
  quantity_sold: number;
  market_name?: string;
  buyer_name?: string;
  sale_date?: string;
}

export interface MarketRecommendation {
  market_name: string;
  state: string;
  district: string;
  current_price: number;
  predicted_price: number;
  distance_km: number;
  transport_cost: number;
  commission_rate: number;
  commission_cost: number;
  gross_revenue: number;
  net_revenue: number;
  demand_level: string;
  score: number;
  rank: number;
}

export interface BuyerMatch {
  buyer_id: string;
  business_name: string;
  buyer_type: string;
  crop_name: string;
  required_quantity: number;
  offered_price: number;
  location: string;
  distance_km: number;
  match_percentage: number;
  verified: boolean;
  requirement_id: string;
}
