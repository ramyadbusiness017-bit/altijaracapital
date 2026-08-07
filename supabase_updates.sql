-- 1. Add new columns to the existing profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS earnings_withdrawal_permitted BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS capital_withdrawal_permitted BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;

-- 2. Add an 'is_admin' column if it doesn't exist (to protect the /admin route)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- 3. Modify transactions table to support new types (if using an ENUM, otherwise we just insert text)
-- If 'type' is a text column, we don't need to alter it, but we will be inserting types like:
-- 'wallet_deposit', 'wallet_withdraw', 'investment_deposit', 'earnings_withdrawal', 'capital_withdrawal'

-- 4. Update existing test user to be admin (Optional: replace with your actual email)
-- UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@example.com';

-- 5. Add columns for Gas Simulator
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS eth_balance NUMERIC DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS block_gas_fees BOOLEAN DEFAULT false NOT NULL;
