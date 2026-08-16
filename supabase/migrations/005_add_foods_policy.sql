-- Migration 005: Allow authenticated users to INSERT custom foods
-- This enables users to add ingredients that don't exist in the catalog

CREATE POLICY "Authenticated users can insert foods"
  ON nutridia.foods FOR INSERT TO authenticated
  WITH CHECK (true);
