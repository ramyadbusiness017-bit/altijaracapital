-- 1. Upgrade Profiles Table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS capital_balance NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS earnings_balance NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS investment_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_yield_calculation TIMESTAMPTZ;

-- 2. Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal_earnings', 'withdrawal_capital', 'referral_bonus')),
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  gas_fee_deducted NUMERIC DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transactions
CREATE POLICY "Users can view their own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions (e.g. submitting a deposit/withdrawal request)
CREATE POLICY "Users can insert their own transactions" 
ON transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);
