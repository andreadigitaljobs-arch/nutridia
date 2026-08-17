-- Grant table-level permissions to the authenticated role
-- Without these, RLS policies alone cause 403 errors

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA nutridia TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA nutridia TO authenticated;

-- Also grant to anon for public tables (foods, food_categories)
GRANT SELECT ON nutridia.foods TO anon;
GRANT SELECT ON nutridia.food_categories TO anon;
GRANT SELECT ON nutridia.meal_types TO anon;
