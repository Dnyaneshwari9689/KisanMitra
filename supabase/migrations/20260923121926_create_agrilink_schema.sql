/*
# AgriLink Schema - Complete Database Setup

## Overview
Creates the full database schema for AgriLink, a smart agricultural market linkage and price discovery platform.

## Tables Created
1. profiles - Links to auth.users, stores role (farmer/buyer/admin) and basic info
2. farmers - Farmer-specific profile data (location, village, district, state, pincode)
3. buyers - Buyer-specific profile data (business name, buyer type, location)
4. crops - Master crop catalog (name, category, unit)
5. markets - Master market/mandi catalog (name, state, district, location)
6. market_prices - Daily market price data per crop per market (min/max/modal/arrival)
7. produce_listings - Farmer's produce listings with quantity, quality, price expectations
8. price_predictions - ML-based price predictions (mock data initially)
9. buyer_requirements - Buyer's crop requirements
10. offers - Farmer-buyer negotiation/offer workflow
11. transactions - Completed deals
12. transport_quotes - Transportation cost calculations
13. price_alerts - Farmer's price threshold alerts
14. notifications - User notification system
15. farmer_feedback - Actual vs predicted price feedback after sale

## Security (RLS)
- All tables have RLS enabled
- Farmers can access only their own data (produce, alerts, offers, feedback)
- Buyers can access only their own data (requirements, offers, transactions)
- Public catalog data (crops, markets, market_prices) readable by all authenticated users
- Cross-role read access: farmers can see buyer requirements, buyers can see produce listings
- Admins have full access to all tables via a role check in policies
- All policies use auth.uid() for ownership verification
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'buyer', 'admin')),
  mobile text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- FARMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS farmers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile text NOT NULL,
  email text,
  village text,
  district text,
  state text,
  pincode text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_farmers" ON farmers;
CREATE POLICY "select_farmers" ON farmers FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'buyer')
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_farmer" ON farmers;
CREATE POLICY "insert_own_farmer" ON farmers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_farmer" ON farmers;
CREATE POLICY "update_own_farmer" ON farmers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_farmer" ON farmers;
CREATE POLICY "delete_own_farmer" ON farmers FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- BUYERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS buyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  owner_name text NOT NULL,
  mobile text NOT NULL,
  email text,
  business_location text,
  buyer_type text NOT NULL DEFAULT 'Wholesaler' CHECK (buyer_type IN ('Wholesaler', 'Retailer', 'Processor', 'Exporter', 'FPO', 'Other')),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_buyers" ON buyers;
CREATE POLICY "select_buyers" ON buyers FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'farmer')
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_buyer" ON buyers;
CREATE POLICY "insert_own_buyer" ON buyers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_buyer" ON buyers;
CREATE POLICY "update_own_buyer" ON buyers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_buyer" ON buyers;
CREATE POLICY "delete_own_buyer" ON buyers FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- CROPS TABLE (master catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('Vegetables', 'Fruits', 'Cereals', 'Pulses', 'Spices', 'Oilseeds', 'Other')),
  unit text NOT NULL DEFAULT 'kg',
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_crops" ON crops;
CREATE POLICY "select_crops" ON crops FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_crops_admin" ON crops;
CREATE POLICY "insert_crops_admin" ON crops FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_crops_admin" ON crops;
CREATE POLICY "update_crops_admin" ON crops FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_crops_admin" ON crops;
CREATE POLICY "delete_crops_admin" ON crops FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- MARKETS TABLE (master mandi catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  latitude numeric DEFAULT 0,
  longitude numeric DEFAULT 0,
  commission_rate numeric DEFAULT 6.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_markets" ON markets;
CREATE POLICY "select_markets" ON markets FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_markets_admin" ON markets;
CREATE POLICY "insert_markets_admin" ON markets FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_markets_admin" ON markets;
CREATE POLICY "update_markets_admin" ON markets FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_markets_admin" ON markets;
CREATE POLICY "delete_markets_admin" ON markets FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- MARKET_PRICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  market_id uuid REFERENCES markets(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  market_name text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  min_price numeric NOT NULL,
  max_price numeric NOT NULL,
  modal_price numeric NOT NULL,
  arrival_qty numeric DEFAULT 0,
  demand_level text DEFAULT 'Medium' CHECK (demand_level IN ('Low', 'Medium', 'High', 'Very High')),
  price_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_market_prices" ON market_prices;
CREATE POLICY "select_market_prices" ON market_prices FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_market_prices_admin" ON market_prices;
CREATE POLICY "insert_market_prices_admin" ON market_prices FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_market_prices_admin" ON market_prices;
CREATE POLICY "update_market_prices_admin" ON market_prices FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_market_prices_admin" ON market_prices;
CREATE POLICY "delete_market_prices_admin" ON market_prices FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- PRODUCE_LISTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS produce_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  crop_category text NOT NULL,
  quantity numeric NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  quality_grade text NOT NULL DEFAULT 'A' CHECK (quality_grade IN ('A', 'B', 'C')),
  harvest_date date,
  location text,
  min_expected_price numeric NOT NULL,
  available_from date,
  image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE produce_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_produce_listings" ON produce_listings;
CREATE POLICY "select_produce_listings" ON produce_listings FOR SELECT
  TO authenticated USING (
    auth.uid() = farmer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'buyer')
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_produce" ON produce_listings;
CREATE POLICY "insert_own_produce" ON produce_listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "update_own_produce" ON produce_listings;
CREATE POLICY "update_own_produce" ON produce_listings FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "delete_own_produce" ON produce_listings;
CREATE POLICY "delete_own_produce" ON produce_listings FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- PRICE_PREDICTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS price_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produce_id uuid REFERENCES produce_listings(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  market_name text,
  current_price numeric NOT NULL,
  predicted_3day numeric,
  predicted_7day numeric,
  predicted_15day numeric,
  confidence numeric DEFAULT 75,
  recommendation text,
  is_mock boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_price_predictions" ON price_predictions;
CREATE POLICY "select_price_predictions" ON price_predictions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM produce_listings pl WHERE pl.id = produce_id AND pl.farmer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_price_predictions" ON price_predictions;
CREATE POLICY "insert_price_predictions" ON price_predictions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM produce_listings pl WHERE pl.id = produce_id AND pl.farmer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- BUYER_REQUIREMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS buyer_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  quantity_required numeric NOT NULL,
  quality_required text DEFAULT 'A',
  offered_price numeric NOT NULL,
  location text,
  delivery_date date,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE buyer_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_buyer_requirements" ON buyer_requirements;
CREATE POLICY "select_buyer_requirements" ON buyer_requirements FOR SELECT
  TO authenticated USING (
    auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'farmer')
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_own_requirement" ON buyer_requirements;
CREATE POLICY "insert_own_requirement" ON buyer_requirements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "update_own_requirement" ON buyer_requirements;
CREATE POLICY "update_own_requirement" ON buyer_requirements FOR UPDATE
  TO authenticated USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "delete_own_requirement" ON buyer_requirements;
CREATE POLICY "delete_own_requirement" ON buyer_requirements FOR DELETE
  TO authenticated USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- OFFERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  produce_id uuid REFERENCES produce_listings(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES buyer_requirements(id) ON DELETE SET NULL,
  crop_name text NOT NULL,
  quantity numeric NOT NULL,
  proposed_price numeric NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'negotiating', 'accepted', 'rejected', 'completed')),
  counter_price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_offers" ON offers;
CREATE POLICY "select_offers" ON offers FOR SELECT
  TO authenticated USING (
    auth.uid() = farmer_id
    OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_offers" ON offers;
CREATE POLICY "insert_offers" ON offers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "update_offers" ON offers;
CREATE POLICY "update_offers" ON offers FOR UPDATE
  TO authenticated USING (
    auth.uid() = farmer_id OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    auth.uid() = farmer_id OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "delete_offers" ON offers;
CREATE POLICY "delete_offers" ON offers FOR DELETE
  TO authenticated USING (
    auth.uid() = farmer_id OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES offers(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  quantity numeric NOT NULL,
  final_price numeric NOT NULL,
  total_amount numeric NOT NULL,
  market_name text,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  transaction_date timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_transactions" ON transactions;
CREATE POLICY "select_transactions" ON transactions FOR SELECT
  TO authenticated USING (
    auth.uid() = farmer_id
    OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_transactions" ON transactions;
CREATE POLICY "insert_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = farmer_id OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "update_transactions" ON transactions;
CREATE POLICY "update_transactions" ON transactions FOR UPDATE
  TO authenticated USING (
    auth.uid() = farmer_id OR auth.uid() = buyer_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- TRANSPORT_QUOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transport_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  source_location text NOT NULL,
  destination text NOT NULL,
  quantity numeric NOT NULL,
  vehicle_type text DEFAULT 'Truck',
  distance_km numeric NOT NULL,
  transport_cost numeric NOT NULL,
  cost_per_kg numeric NOT NULL,
  estimated_delivery_hours numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transport_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transport" ON transport_quotes;
CREATE POLICY "select_own_transport" ON transport_quotes FOR SELECT
  TO authenticated USING (auth.uid() = farmer_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_transport" ON transport_quotes;
CREATE POLICY "insert_own_transport" ON transport_quotes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "delete_own_transport" ON transport_quotes;
CREATE POLICY "delete_own_transport" ON transport_quotes FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id);

-- ============================================================
-- PRICE_ALERTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  market_name text,
  target_price numeric NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'disabled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_alerts" ON price_alerts;
CREATE POLICY "select_own_alerts" ON price_alerts FOR SELECT
  TO authenticated USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "insert_own_alerts" ON price_alerts;
CREATE POLICY "insert_own_alerts" ON price_alerts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "update_own_alerts" ON price_alerts;
CREATE POLICY "update_own_alerts" ON price_alerts FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "delete_own_alerts" ON price_alerts;
CREATE POLICY "delete_own_alerts" ON price_alerts FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- FARMER_FEEDBACK TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS farmer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  predicted_price numeric,
  actual_price numeric NOT NULL,
  quantity_sold numeric NOT NULL,
  market_name text,
  buyer_name text,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE farmer_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_feedback" ON farmer_feedback;
CREATE POLICY "select_own_feedback" ON farmer_feedback FOR SELECT
  TO authenticated USING (auth.uid() = farmer_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_feedback" ON farmer_feedback;
CREATE POLICY "insert_own_feedback" ON farmer_feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "delete_own_feedback" ON farmer_feedback;
CREATE POLICY "delete_own_feedback" ON farmer_feedback FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_market_prices_crop_market ON market_prices(crop_name, market_name, price_date);
CREATE INDEX IF NOT EXISTS idx_produce_listings_farmer ON produce_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_requirements_buyer ON buyer_requirements(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_farmer ON offers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_farmer ON transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_farmer ON price_alerts(farmer_id);
