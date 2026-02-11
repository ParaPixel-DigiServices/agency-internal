-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- ParaPixel Admin Dashboard
-- =====================================================
-- 
-- This file contains all RLS policies to secure database tables.
-- Run these commands in Supabase SQL Editor after creating tables.
--
-- Security Model:
-- - Only authenticated users with @parapixel.net emails can access data
-- - All CRUD operations require valid authentication
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- CLIENTS TABLE POLICIES
-- =====================================================

-- Policy: Allow authenticated @parapixel.net users to SELECT clients
CREATE POLICY "Allow parapixel users to view clients"
  ON clients
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

-- Policy: Allow authenticated @parapixel.net users to INSERT clients
CREATE POLICY "Allow parapixel users to insert clients"
  ON clients
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

-- Policy: Allow authenticated @parapixel.net users to UPDATE clients
CREATE POLICY "Allow parapixel users to update clients"
  ON clients
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

-- Policy: Allow authenticated @parapixel.net users to DELETE clients
CREATE POLICY "Allow parapixel users to delete clients"
  ON clients
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );


-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Allow parapixel users to view projects"
  ON projects
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to insert projects"
  ON projects
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to update projects"
  ON projects
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to delete projects"
  ON projects
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );


-- =====================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Allow parapixel users to view payments"
  ON payments
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to insert payments"
  ON payments
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to update payments"
  ON payments
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to delete payments"
  ON payments
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );


-- =====================================================
-- EXPENSES TABLE POLICIES
-- =====================================================

CREATE POLICY "Allow parapixel users to view expenses"
  ON expenses
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to insert expenses"
  ON expenses
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to update expenses"
  ON expenses
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to delete expenses"
  ON expenses
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );


-- =====================================================
-- INVOICES TABLE POLICIES
-- =====================================================

CREATE POLICY "Allow parapixel users to view invoices"
  ON invoices
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to insert invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to update invoices"
  ON invoices
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to delete invoices"
  ON invoices
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );


-- =====================================================
-- INVOICE_ITEMS TABLE POLICIES
-- =====================================================

CREATE POLICY "Allow parapixel users to view invoice items"
  ON invoice_items
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to insert invoice items"
  ON invoice_items
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to update invoice items"
  ON invoice_items
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );

CREATE POLICY "Allow parapixel users to delete invoice items"
  ON invoice_items
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' LIKE '%@parapixel.net'
  );


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify RLS is enabled:
--
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';
--
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';
-- =====================================================
