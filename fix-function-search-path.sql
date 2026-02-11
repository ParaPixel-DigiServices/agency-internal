-- =====================================================
-- FIX FUNCTION SEARCH_PATH SECURITY ISSUES
-- ParaPixel Admin Dashboard
-- =====================================================
-- 
-- This file fixes the "role mutable search_path" warnings
-- by explicitly setting search_path on all functions.
--
-- Security Issue:
-- Functions without explicit search_path can be exploited
-- via search_path injection attacks.
--
-- Run these commands in Supabase SQL Editor.
-- =====================================================

-- Fix: create_payment_on_invoice_paid function
ALTER FUNCTION public.create_payment_on_invoice_paid() 
  SET search_path = public, pg_temp;

-- Fix: prevent_client_delete_if_used function
ALTER FUNCTION public.prevent_client_delete_if_used() 
  SET search_path = public, pg_temp;

-- Fix: prevent_project_delete_if_used function
ALTER FUNCTION public.prevent_project_delete_if_used() 
  SET search_path = public, pg_temp;

-- Fix: update_timestamp function
ALTER FUNCTION public.update_timestamp() 
  SET search_path = public, pg_temp;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify the search_path is now set:
--
-- SELECT 
--   p.proname as function_name,
--   pg_get_function_identity_arguments(p.oid) as arguments,
--   p.prosecdef as security_definer,
--   array_to_string(p.proconfig, ', ') as config_settings
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--   AND p.proname IN (
--     'create_payment_on_invoice_paid',
--     'prevent_client_delete_if_used', 
--     'prevent_project_delete_if_used',
--     'update_timestamp'
--   );
-- =====================================================
