/*
# AgriLink Demo Data

## Overview
Inserts realistic sample data for the AgriLink platform so it looks fully functional immediately after launch.

## Data Inserted
1. Crops: Tomato, Onion, Potato, Wheat, Soybean, Cotton (with categories)
2. Markets: Nashik, Pune, Mumbai, Ahmednagar, Nagpur (with coordinates and commission rates)
3. Market Prices: 30 days of price data for each crop-market combination
4. Note: User profiles (farmers, buyers) are created during registration via the auth flow.
   The app uses mock data for market prices and predictions where ML APIs are not connected.
*/

-- ============================================================
-- CROPS
-- ============================================================
INSERT INTO crops (name, category, unit) VALUES
  ('Tomato', 'Vegetables', 'kg'),
  ('Onion', 'Vegetables', 'kg'),
  ('Potato', 'Vegetables', 'kg'),
  ('Wheat', 'Cereals', 'quintal'),
  ('Soybean', 'Oilseeds', 'quintal'),
  ('Cotton', 'Oilseeds', 'quintal')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- MARKETS
-- ============================================================
INSERT INTO markets (name, state, district, latitude, longitude, commission_rate) VALUES
  ('Nashik', 'Maharashtra', 'Nashik', 19.9975, 73.7898, 6.0),
  ('Pune', 'Maharashtra', 'Pune', 18.5204, 73.8567, 6.5),
  ('Mumbai', 'Maharashtra', 'Mumbai', 19.0760, 72.8777, 8.0),
  ('Ahmednagar', 'Maharashtra', 'Ahmednagar', 19.0992, 74.7390, 5.5),
  ('Nagpur', 'Maharashtra', 'Nagpur', 21.1458, 79.0882, 6.0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- MARKET PRICES (30 days of historical data)
-- ============================================================
-- Using a DO block to generate 30 days of price data for each crop-market combo
DO $$
DECLARE
  c RECORD;
  m RECORD;
  d INT;
  base_price NUMERIC;
  min_p NUMERIC;
  max_p NUMERIC;
  modal_p NUMERIC;
  arrival NUMERIC;
  demand TEXT;
  price_date DATE;
  variation NUMERIC;
BEGIN
  FOR c IN SELECT name FROM crops LOOP
    FOR m IN SELECT name, state, district FROM markets LOOP
      -- Set base prices per crop
      base_price := CASE c.name
        WHEN 'Tomato' THEN 25
        WHEN 'Onion' THEN 30
        WHEN 'Potato' THEN 20
        WHEN 'Wheat' THEN 2200
        WHEN 'Soybean' THEN 4500
        WHEN 'Cotton' THEN 5800
        ELSE 25
      END;

      FOR d IN 0..29 LOOP
        price_date := CURRENT_DATE - (29 - d);
        -- Add some realistic variation with a sinusoidal pattern + noise
        variation := sin(d * 0.3) * (base_price * 0.08) + (random() - 0.5) * (base_price * 0.05);
        modal_p := ROUND((base_price + variation)::numeric, 2);
        min_p := ROUND((modal_p * 0.85)::numeric, 2);
        max_p := ROUND((modal_p * 1.15)::numeric, 2);
        arrival := ROUND((100 + random() * 500)::numeric, 0);
        demand := CASE WHEN random() > 0.7 THEN 'High' WHEN random() > 0.4 THEN 'Medium' ELSE 'Low' END;

        INSERT INTO market_prices (crop_name, market_name, state, district, min_price, max_price, modal_price, arrival_qty, demand_level, price_date)
        VALUES (c.name, m.name, m.state, m.district, min_p, max_p, modal_p, arrival, demand, price_date);
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
