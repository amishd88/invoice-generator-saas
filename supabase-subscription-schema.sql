-- Subscription Schema Extensions
-- This file extends the existing invoice generator schema with subscription management

-- Create user_subscriptions table to track subscription data
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  subscription_id TEXT, -- For future Stripe integration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add index for faster lookups
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Enable RLS on subscriptions table
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create subscription access policies
CREATE POLICY "Users can only see their own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add invoice usage tracking table to count invoices per month for free tier limits
CREATE TABLE invoice_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  invoice_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Add index for faster lookups
CREATE INDEX idx_invoice_usage_user_lookup ON invoice_usage(user_id, month, year);

-- Enable RLS on invoice usage table
ALTER TABLE invoice_usage ENABLE ROW LEVEL SECURITY;

-- Create invoice usage access policies
CREATE POLICY "Users can only see their own invoice usage" ON invoice_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Add function to increment invoice count for the month
CREATE OR REPLACE FUNCTION increment_invoice_count()
RETURNS TRIGGER AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
  user_plan TEXT;
BEGIN
  -- Get current month and year
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Check user's plan
  SELECT plan INTO user_plan
  FROM user_subscriptions
  WHERE user_id = NEW.user_id;
  
  -- Only track for free plan users
  IF user_plan IS NULL OR user_plan = 'free' THEN
    -- Insert or update the invoice count for this month
    INSERT INTO invoice_usage (user_id, month, year, invoice_count)
    VALUES (NEW.user_id, current_month, current_year, 1)
    ON CONFLICT (user_id, month, year)
    DO UPDATE SET 
      invoice_count = invoice_usage.invoice_count + 1,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to invoices table to track invoice usage
CREATE TRIGGER track_invoice_count
AFTER INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION increment_invoice_count();

-- Function to automatically create user subscription record on signup
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to create user subscription on signup
CREATE TRIGGER create_subscription_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_subscription();

-- Add table to track export logs 
-- This will track when users attempt exports and enforce limitations for free tier
CREATE TABLE export_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  format TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_export_logs_user_id ON export_logs(user_id);

-- Enable RLS on export logs table
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

-- Create export logs access policies
CREATE POLICY "Users can only see their own export logs" ON export_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own export logs" ON export_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
