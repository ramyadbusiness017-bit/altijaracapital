-- support_tickets table creation
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Open' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own tickets
CREATE POLICY "Users can insert their own support tickets" 
ON support_tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own tickets
CREATE POLICY "Users can view their own support tickets" 
ON support_tickets FOR SELECT 
USING (auth.uid() = user_id);

-- Admin users (if applicable) can view all tickets
-- (We use the existing 'is_admin' column on profiles)
CREATE POLICY "Admins can view all tickets" 
ON support_tickets FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);
