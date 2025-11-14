-- ============================================
-- ADMIN MIGRATION - STEP 1
-- Run this FIRST and commit before running step 2
-- ============================================
-- 
-- PostgreSQL requires enum values to be committed before they can be used.
-- This file adds the 'admin' value to the user_role enum.
-- After running this, COMMIT the transaction, then run admin_migration_step2.sql
-- ============================================

-- Add 'admin' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Verify the enum value was added (optional check)
-- SELECT unnest(enum_range(NULL::user_role));

